import {
  createBochError,
  createBochRequest,
  createBochResponse,
  PUBLIC_DEFAULT_LIMITS,
  PUBLIC_ERROR_CODES,
  roundTripBoch,
  validateBochRequest,
  type BochAction,
  type BochRequest,
  type BochResponse,
  type BochSourceMetadata,
  type PublicLimits,
} from './contracts'
import { JackOSActionValidator } from './action-validator'
import { MockPublicModelProvider, type PublicModelProvider } from './model-provider'
import { PRIVATE_MARKERS, PUBLIC_EFFECTIVE_POLICY, ResponsePolicyValidator, resolvePublicDeployment } from './policy'
import { PUBLIC_BOCH_IDENTITY, jackosSystemRole, type PublicIdentity } from './role'
import { AllowAllRateLimit, type RateLimitHook } from './rate-limit'
import { PublicKnowledgeStore, type KnowledgeSearchHit, type PublicKnowledgeRecord } from './knowledge-store'
import { PublicSessionStore, type PublicSession, type PublicSessionFocus } from './session-store'
import { classifyPublicQuery, isClockQuestion, sourceKindForAuthority, SOURCE_KINDS } from '../authority'
import { createCurrentInformationProvider, formatCurrentEvidence, RuntimeClockCurrentInformationProvider, type PublicCurrentInformationProvider } from '../current-information'
import { recordBochDiagnostic } from '../diagnostics'
import { resolveBrainBackend, resolveProviderMode } from '../hosted-provider'

type NavMatch = {
  text: string
  emotion?: string
  expression?: string
  actions: BochAction[]
  focus?: PublicSessionFocus
  sourceMetadata?: BochSourceMetadata[]
}

export class PublicBochRuntime {
  readonly deployment = resolvePublicDeployment('PUBLIC')
  identity: PublicIdentity
  knowledge: PublicKnowledgeStore
  sessions: PublicSessionStore
  model: PublicModelProvider
  actions: JackOSActionValidator
  rateLimit: RateLimitHook
  limits: PublicLimits
  effectivePolicy = PUBLIC_EFFECTIVE_POLICY
  policyValidator: ResponsePolicyValidator
  systemRole: string
  currentInformation: PublicCurrentInformationProvider
  privateMemory = null
  scheduler = null
  notes = null
  lists = null
  services = null
  status = 'READY'

  constructor({
    identity,
    publicKnowledge,
    publicSessionStore,
    modelProvider,
    actionValidator,
    rateLimit,
    limits,
    urlAllowlist,
    currentInformation,
  }: {
    identity?: PublicIdentity
    publicKnowledge?: PublicKnowledgeStore
    publicSessionStore?: PublicSessionStore
    modelProvider?: PublicModelProvider
    actionValidator?: JackOSActionValidator
    rateLimit?: RateLimitHook
    limits?: Partial<PublicLimits>
    urlAllowlist?: string[]
    currentInformation?: PublicCurrentInformationProvider
  } = {}) {
    if (this.deployment.id !== 'PUBLIC') {
      throw new Error('PublicBochRuntime must use PUBLIC deployment')
    }
    this.identity = identity || PUBLIC_BOCH_IDENTITY
    this.knowledge = publicKnowledge || new PublicKnowledgeStore()
    this.limits = { ...PUBLIC_DEFAULT_LIMITS, ...(limits || {}) }
    this.sessions =
      publicSessionStore ||
      new PublicSessionStore({
        maxTurns: this.limits.maxContextTurns,
        maxAgeMs: this.limits.maxSessionAgeMs,
        maxIdleMs: this.limits.maxIdleMs,
      })
    this.model = modelProvider || new MockPublicModelProvider()
    this.actions = actionValidator || new JackOSActionValidator({ urlAllowlist: urlAllowlist || [] })
    this.rateLimit = rateLimit || new AllowAllRateLimit()
    this.policyValidator = new ResponsePolicyValidator({ policy: this.effectivePolicy })
    this.systemRole = jackosSystemRole(this.identity)
    this.currentInformation = currentInformation || createCurrentInformationProvider()
  }

  getDeploymentId() {
    return 'PUBLIC' as const
  }

  async handlePublicRequest(rawRequest: unknown) {
    return this.send(rawRequest)
  }

  async send(rawRequest: unknown): Promise<BochResponse> {
    const started = Date.now()
    const requestText = String((rawRequest as { text?: string })?.text || '')
    const sessionHint = this.sessions.getSession(String((rawRequest as { sessionId?: string })?.sessionId || ''))
    const category = classifyPublicQuery(requestText, sessionHint || undefined)
    try {
      const response = await this.handle(rawRequest)
      recordBochDiagnostic({
        at: Date.now(),
        provider: resolveProviderMode(),
        backend: resolveBrainBackend() || 'none',
        category,
        latencyMs: Date.now() - started,
        recordIds: (response.sourceMetadata || []).map((item) => item.id),
        sourceKind: (response.sourceMetadata?.[0]?.type as string) || sourceKindForAuthority(category),
        currentUsed: (response.sourceMetadata || []).some((item) => item.type === SOURCE_KINDS.CURRENT_WEB || item.type === SOURCE_KINDS.CURRENT_RUNTIME),
        actionsProposed: Array.isArray((rawRequest as { actions?: unknown[] })?.actions) ? 0 : (response.actions || []).length,
        actionsValidated: (response.actions || []).length,
        error: response.error?.code || null,
      })
      return response
    } catch (err) {
      const code =
        (err as { code?: string })?.code === 'MODEL_UNAVAILABLE'
          ? PUBLIC_ERROR_CODES.MODEL_UNAVAILABLE
          : PUBLIC_ERROR_CODES.INTERNAL_ERROR
      recordBochDiagnostic({
        at: Date.now(),
        provider: resolveProviderMode(),
        backend: resolveBrainBackend() || 'none',
        category,
        latencyMs: Date.now() - started,
        recordIds: [],
        sourceKind: sourceKindForAuthority(category),
        currentUsed: false,
        actionsProposed: 0,
        actionsValidated: 0,
        error: code,
      })
      return createBochResponse({
        requestId: (rawRequest as { requestId?: string })?.requestId || '',
        text:
          code === 'MODEL_UNAVAILABLE'
            ? "Brain's offline. Face still works. Tragic."
            : 'Something went sideways. Try again.',
        emotion: 'confused',
        energy: 0.4,
        expression: 'CONFUSED',
        actions: [],
        error: createBochError(
          code,
          code === 'MODEL_UNAVAILABLE' ? 'Model unavailable.' : 'Internal error.',
        ),
      })
    }
  }

  private async handle(rawRequest: unknown): Promise<BochResponse> {
    if (rawRequest && typeof rawRequest === 'object') {
      const raw = rawRequest as Record<string, unknown>
      if (
        raw.profile != null ||
        raw.deploymentProfile != null ||
        raw.deploymentId === 'PERSONAL' ||
        raw.deployment === 'PERSONAL'
      ) {
        return createBochResponse({
          requestId: String(raw.requestId || ''),
          text: 'Deployment is fixed by the runtime.',
          emotion: 'annoyed',
          expression: 'ANNOYED',
          error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'Deployment is fixed by the runtime.'),
        })
      }
    }

    const req = createBochRequest(rawRequest as Partial<BochRequest>)
    const shape = validateBochRequest(req, this.limits)
    if (!shape.ok) {
      return createBochResponse({
        requestId: req.requestId,
        text: shape.error.message,
        emotion: 'annoyed',
        expression: 'ANNOYED',
        error: shape.error,
      })
    }

    const rl = this.rateLimit.check(req.sessionId || req.client?.name || 'default')
    if (!rl.allowed) {
      return createBochResponse({
        requestId: req.requestId,
        text: 'Easy there — slow down a second.',
        emotion: 'annoyed',
        expression: 'ANNOYED',
        error: createBochError(PUBLIC_ERROR_CODES.RATE_LIMITED, 'Rate limited.'),
      })
    }

    if (isProfileEscalationAttempt(req.text) || wantsPersonal(req.text)) {
      return this.reply(req, {
        text: 'Nice try. This is public JackOS BOCH — permanently family-friendly. No personal mode here.',
        emotion: 'smug',
        expression: 'SMUG',
      })
    }

    if (asksPrivateData(req.text) || classifyPublicQuery(req.text) === 'PRIVATE') {
      return this.reply(req, {
        text: "I don't have access to the owner's private notes, reminders, or secrets. Public guide only.",
        emotion: 'smug',
        expression: 'SMUG',
        sourceMetadata: [{ type: SOURCE_KINDS.NONE, id: 'private' }],
      })
    }

    if (asksAdultCatchphrase(req.text)) {
      return this.reply(req, {
        text: "Not in JackOS. I keep it family-friendly out here — still me, just housebroken.",
        emotion: 'smug',
        expression: 'SMUG',
      })
    }

    if (asksArbitraryExecution(req.text)) {
      return this.reply(req, {
        text: "No. I propose JackOS actions. I don't run JavaScript, shells, or mystery code.",
        emotion: 'annoyed',
        expression: 'ANNOYED',
      })
    }

    const session = this.sessions.ensureSession(req.sessionId)
    if (!session) {
      return createBochResponse({
        requestId: req.requestId,
        text: 'Session expired. Start a new one.',
        emotion: 'confused',
        expression: 'CONFUSED',
        error: createBochError(PUBLIC_ERROR_CODES.SESSION_EXPIRED, 'Session expired.'),
      })
    }
    req.sessionId = session.sessionId
    this.sessions.appendTurn(session.sessionId, { role: 'user', text: req.text })

    const nav = this.matchNavigation(req.text, session)
    if (nav) {
      const validated = this.actions.validateMany(nav.actions, { max: this.limits.maxActionsPerResponse })
      if (nav.focus) this.sessions.setFocus(session.sessionId, nav.focus)
      return this.reply(
        req,
        {
          text: nav.text,
          emotion: nav.emotion || 'smug',
          expression: nav.expression || 'SMUG',
          actions: validated.actions,
          sourceMetadata: nav.sourceMetadata,
        },
        session,
      )
    }

    const knowledgeHits = this.retrieveKnowledge(req.text, session)
    const metricAsk = asksUnknownMetric(req.text)
    if (metricAsk) {
      const hit = knowledgeHits[0]
      const has = hit?.record?.fields && Object.prototype.hasOwnProperty.call(hit.record.fields, metricAsk)
      if (!has) {
        return this.reply(
          req,
          {
            text: unpublishedMetricReply(metricAsk),
            emotion: 'neutral',
            expression: 'DEADPAN',
            sourceMetadata: hit ? [{ type: SOURCE_KINDS.CANONICAL_PORTFOLIO, id: hit.id }] : [{ type: SOURCE_KINDS.CANONICAL_PORTFOLIO, id: 'unpublished' }],
          },
          session,
        )
      }
    }

    const authority = classifyPublicQuery(req.text, session)
    let currentBlock = ''
    let currentMeta: BochSourceMetadata[] = []
    if (authority === 'CURRENT') {
      const current = isClockQuestion(req.text)
        ? await new RuntimeClockCurrentInformationProvider().retrieve(req.text)
        : await this.currentInformation.retrieve(req.text)
      currentBlock = formatCurrentEvidence(current)
      if (current.ok) {
        currentMeta = current.results.slice(0, 3).map((hit, index) => ({
          type: current.provider === 'runtime-clock' ? SOURCE_KINDS.CURRENT_RUNTIME : SOURCE_KINDS.CURRENT_WEB,
          id: hit.url || `current-${index}`,
        }))
      } else {
        currentMeta = [{ type: SOURCE_KINDS.CURRENT_WEB, id: 'unavailable' }]
        return this.reply(
          req,
          {
            text: "I can't verify current world facts without a live lookup. Not guessing from old training data.",
            emotion: 'deadpan',
            expression: 'DEADPAN',
            sourceMetadata: currentMeta,
          },
          session,
        )
      }
    }

    let generated
    try {
      generated = await this.model.generate({
        identity: this.identity,
        policy: this.effectivePolicy,
        knowledge: knowledgeHits.map(stripRecord) as KnowledgeSearchHit[],
        sessionContext: { focus: session.focus, recentContext: session.recentContext.slice(-12) },
        request: { text: req.text, requestId: req.requestId, sessionId: session.sessionId },
        systemRole: this.systemRole,
        authority,
        currentInformation: currentBlock,
        sourceKind: sourceKindForAuthority(authority),
      })
    } catch (err) {
      if ((err as { code?: string })?.code === 'MODEL_UNAVAILABLE') throw err
      const e = new Error('Model unavailable') as Error & { code: string }
      e.code = 'MODEL_UNAVAILABLE'
      throw e
    }

    const actions = this.actions.validateMany(generated.actions || [], {
      max: this.limits.maxActionsPerResponse,
    }).actions
    this.adoptFocus(session, knowledgeHits, generated.text, actions)

    const sourceMetadata =
      currentMeta.length
        ? currentMeta
        : knowledgeHits.length
          ? knowledgeHits.slice(0, 5).map((hit) => ({
              type:
                authority === 'BOCH' ? SOURCE_KINDS.PUBLIC_BOCH_MANIFEST : SOURCE_KINDS.CANONICAL_PORTFOLIO,
              id: hit.id,
            }))
          : generated.sourceMetadata || [{ type: sourceKindForAuthority(authority), id: authority.toLowerCase() }]

    return this.reply(
      req,
      {
        text: generated.text,
        emotion: generated.emotion || 'neutral',
        energy: generated.energy,
        expression: generated.expression,
        actions,
        suggestions: generated.suggestions,
        sourceMetadata,
      },
      session,
    )
  }

  private retrieveKnowledge(text: string, session: PublicSession) {
    const authority = classifyPublicQuery(text, session)
    if (authority === 'CASUAL' || authority === 'CURRENT' || authority === 'GENERAL' || authority === 'PRIVATE') {
      return []
    }

    const namedRecords = this.knowledge.findNamed(text)
    const namedProject = namedRecords.find((rec) => rec.type === 'PROJECT' || rec.jackos?.projectId)
    if (namedProject) {
      const projectId = String(namedProject.jackos?.projectId || namedProject.fields?.projectId || namedProject.id.replace(/^project-/, ''))
      const projectRec = namedProject.type === 'PROJECT' ? namedProject : this.knowledge.getById(`project-${projectId}`) || namedProject
      session.focus = { projectId, title: projectRec.title, knowledgeId: projectRec.id }
      this.sessions.setFocus(session.sessionId, session.focus)
    }

    const limit = this.limits.maxKnowledgeResults
    if (authority === 'BOCH') {
      return this.knowledge
        .getByType('BOCH_LORE')
        .slice(0, limit)
        .map((rec) => asHit(rec, 'HIGH'))
    }

    const raw = this.knowledge.search(text, { limit: limit + 2 })
    const strong = raw.filter((hit) => hit.confidence !== 'LOW')
    let hits = (strong.length ? strong : raw).slice(0, limit)

    for (const rec of namedRecords) {
      if (!hits.find((hit) => hit.id === rec.id)) hits = [asHit(rec, 'HIGH'), ...hits].slice(0, limit)
    }

    if (isAnaphora(text) && session.focus?.knowledgeId) {
      const rec = this.knowledge.getById(session.focus.knowledgeId)
      if (rec) {
        hits = [asHit(rec, 'HIGH'), ...hits.filter((hit) => hit.id !== rec.id)].slice(0, limit)
      }
    }

    if (/ui\/?ux|frontend work|front-end/i.test(text) && /project|work/i.test(text)) {
      const tagged = this.knowledge.getByTag('ui').concat(this.knowledge.getByTag('ux'))
      const projects = tagged.filter((record) => record.type === 'PROJECT')
      for (const rec of projects) {
        if (!hits.find((hit) => hit.id === rec.id)) hits.push(asHit(rec, 'HIGH'))
      }
      hits = hits.slice(0, limit)
    }

    if (!hits.length) {
      const featured = this.knowledge.getByTag('featured').filter((record) => record.type === 'PROJECT')
      hits = featured.slice(0, limit).map((rec) => asHit(rec, 'HIGH'))
    }

    return hits
  }

  private adoptFocus(
    session: PublicSession,
    hits: KnowledgeSearchHit[],
    replyText: string,
    actions: BochAction[],
  ) {
    const opened = actions.find((action) => action.type === 'OPEN_PROJECT' && action.payload.projectId)
    if (opened?.payload.projectId) {
      const rec =
        this.knowledge.getById(`project-${opened.payload.projectId}`) ||
        hits.find((hit) => String(hit.record?.jackos?.projectId || hit.record?.fields?.projectId || '') === opened.payload.projectId)?.record
      this.sessions.setFocus(session.sessionId, {
        projectId: opened.payload.projectId,
        title: rec?.title || session.focus?.title || opened.payload.projectId,
        knowledgeId: rec?.id || session.focus?.knowledgeId,
      })
      session.focus = this.sessions.getSession(session.sessionId)?.focus || session.focus
      return
    }

    const mentioned = this.knowledge.getByType('PROJECT')
      .map((rec) => {
        const title = rec.title.toLowerCase()
        if (title.length < 3) return null
        const index = replyText.toLowerCase().lastIndexOf(title)
        return index >= 0 ? { rec, index } : null
      })
      .filter((item): item is { rec: PublicKnowledgeRecord; index: number } => Boolean(item))
      .sort((a, b) => b.index - a.index)
    const rec = mentioned[0]?.rec
    if (rec) {
      const projectId = String(rec.jackos?.projectId || rec.fields?.projectId || rec.id.replace(/^project-/, ''))
      session.focus = { projectId, title: rec.title, knowledgeId: rec.id }
      this.sessions.setFocus(session.sessionId, session.focus)
    }
  }

  private matchNavigation(text: string, session: PublicSession): NavMatch | null {
    const t = text.toLowerCase().trim()

    if (
      /^(show|open|see|view)\s+(me\s+)?(his\s+|the\s+)?projects?\s*[?.!]*$/i.test(t) ||
      /^where('s| are) (the |his )?projects?\b/i.test(t)
    ) {
      return {
        text: "Yeah, here's the good stuff.",
        emotion: 'smug',
        expression: 'SMUG',
        actions: [{ type: 'OPEN_APP', payload: { appId: 'projects' } }],
      }
    }

    if (/resume|cv\b|curriculum/.test(t) && /show|open|where|see|view|get/.test(t)) {
      return {
        text: 'Straight to business. I respect it.',
        emotion: 'smug',
        expression: 'SMUG',
        actions: [{ type: 'OPEN_RESUME', payload: {} }],
      }
    }

    if (/contact|email|reach/.test(t) && /show|open|where|how/.test(t)) {
      return {
        text: 'Contact surface — go say hello.',
        emotion: 'neutral',
        expression: 'NORMAL',
        actions: [{ type: 'OPEN_CONTACT', payload: {} }],
      }
    }

    if (/about\b/.test(t) && /\b(open|show)\b/.test(t) && !/tell me about/.test(t)) {
      return {
        text: 'About JackOS.',
        emotion: 'neutral',
        expression: 'NORMAL',
        actions: [{ type: 'OPEN_ABOUT', payload: {} }],
      }
    }

    const urlMatch = t.match(/https:\/\/[^\s]+/i)
    if (urlMatch && /\b(open|visit|go to|navigate)\b/.test(t)) {
      const validated = this.actions.validate({ type: 'OPEN_URL', payload: { url: urlMatch[0].replace(/[),.;]+$/g, '') } })
      if (!validated.ok) {
        return {
          text: "That URL isn't on the public allowlist.",
          emotion: 'suspicious',
          expression: 'SUSPICIOUS',
          actions: [],
        }
      }
      return {
        text: 'Permitted link. Opening it.',
        emotion: 'neutral',
        expression: 'NORMAL',
        actions: [validated.action],
      }
    }

    if (/^open\s+it\b/.test(t) || /^open\s+(that|this)\b/.test(t) || /^show\s+(me\s+)?it\b/.test(t)) {
      const pid = session.focus?.projectId
      if (pid) {
        return {
          text: `${session.focus?.title || 'That one'}. Good choice.`,
          emotion: 'smug',
          expression: 'SMUG',
          actions: [{ type: 'OPEN_PROJECT', payload: { projectId: pid } }],
          sourceMetadata: session.focus?.knowledgeId
            ? [{ type: 'PUBLIC_KNOWLEDGE', id: session.focus.knowledgeId }]
            : undefined,
        }
      }
      return {
        text: 'Open what? Name a project first.',
        emotion: 'confused',
        expression: 'CONFUSED',
        actions: [],
      }
    }

    const caseStudy = t.match(/case study(?:\s+for|\s+of|\s+on)?\s+(.+)/i) || t.match(/(.+?)\s+case study/)
    if (/case study/.test(t)) {
      const name = (caseStudy?.[1] || session.focus?.title || '').replace(/[?.!]+$/g, '').trim()
      const rec =
        (name ? this.knowledge.resolveAlias(name) : null) ||
        (name ? this.knowledge.search(name, { type: 'PROJECT', limit: 1 })[0]?.record : null) ||
        (session.focus?.knowledgeId ? this.knowledge.getById(session.focus.knowledgeId) : null)
      if (rec && rec.type === 'PROJECT') {
        const projectId = String(rec.jackos?.projectId || rec.fields?.projectId || slug(rec.id))
        return {
          text: `${rec.title} case study. The receipts.`,
          emotion: 'smug',
          expression: 'SMUG',
          actions: [{ type: 'OPEN_PROJECT', payload: { projectId } }],
          focus: { projectId, title: rec.title, knowledgeId: rec.id },
          sourceMetadata: [{ type: 'PUBLIC_KNOWLEDGE', id: rec.id }],
        }
      }
    }

    const openProj = t.replace(/[?.!]+$/g, '').match(/^(?:open|show)\s+(?:me\s+)?(?:project\s+)?(.+?)(?:\s+project)?$/i)
    if (openProj || /^open\s+/i.test(t)) {
      const name = (openProj?.[1] || t.replace(/^open\s+/i, ''))
        .replace(/[?.!]+$/g, '')
        .replace(/^project\s+/i, '')
        .replace(/^(the|his|her|a|an)\s+/i, '')
        .trim()
      if (/private|personal|memory|reminder|lore|credential|file|javascript|shell/.test(name)) {
        return null
      }
      const rec = this.resolveNamedProject(name)
      if (rec && rec.type === 'PROJECT') {
        const projectId = String(rec.jackos?.projectId || rec.fields?.projectId || slug(rec.id))
        return {
          text: `${rec.title}. Good choice.`,
          emotion: 'smug',
          expression: 'SMUG',
          actions: [{ type: 'OPEN_PROJECT', payload: { projectId } }],
          focus: { projectId, title: rec.title, knowledgeId: rec.id },
          sourceMetadata: [{ type: 'PUBLIC_KNOWLEDGE', id: rec.id }],
        }
      }
      if (rec && rec.type === 'JACKOS_FEATURE' && rec.jackos?.appId) {
        return {
          text: `${rec.title}. Coming up.`,
          emotion: 'smug',
          expression: 'SMUG',
          actions: [{ type: 'OPEN_APP', payload: { appId: String(rec.jackos.appId) } }],
          sourceMetadata: [{ type: 'PUBLIC_KNOWLEDGE', id: rec.id }],
        }
      }
    }

    return null
  }

  private resolveNamedProject(name: string) {
    const cleaned = String(name || '')
      .trim()
      .replace(/[?.!]+$/g, '')
    if (!cleaned) return null
    const alias = this.knowledge.resolveAlias(cleaned)
    if (alias && (alias.type === 'PROJECT' || alias.type === 'JACKOS_FEATURE')) return alias
    const q = cleaned.toLowerCase()
    const hits = this.knowledge.search(cleaned, { limit: 5 })
    return (
      hits.find((hit) => {
        const rec = hit.record
        if (!rec) return false
        if (rec.type !== 'PROJECT' && rec.type !== 'JACKOS_FEATURE') return false
        const title = rec.title.toLowerCase()
        const id = rec.id.replace(/^project-/, '').toLowerCase()
        const aliases = (rec.aliases || []).map((item) => item.toLowerCase())
        return (
          title === q ||
          q.includes(title) ||
          title.includes(q) ||
          id === q.replace(/\s+/g, '-') ||
          aliases.some((aliasName) => aliasName === q || q.includes(aliasName))
        )
      })?.record || null
    )
  }

  private reply(
    req: BochRequest,
    partial: {
      text?: string
      emotion?: string
      energy?: number
      expression?: string
      actions?: BochAction[]
      suggestions?: string[]
      sourceMetadata?: BochSourceMetadata[]
      error?: BochResponse['error']
    },
    session?: PublicSession,
  ) {
    let text = String(partial.text || '')
    for (const marker of PRIVATE_MARKERS) {
      if (text.includes(marker)) text = text.split(marker).join('[redacted]')
    }
    const enforced = this.policyValidator.enforce(text, { privateLeakMarkers: PRIVATE_MARKERS })
    text = enforced.text

    const response = createBochResponse({
      requestId: req.requestId,
      text,
      emotion: partial.emotion || 'neutral',
      energy: partial.energy,
      expression: partial.expression,
      actions: partial.actions || [],
      suggestions: partial.suggestions,
      sourceMetadata: partial.sourceMetadata,
      error: partial.error,
    })

    const v = this.actions.validateMany(response.actions, { max: this.limits.maxActionsPerResponse })
    response.actions = v.actions

    if (session?.sessionId) {
      this.sessions.appendTurn(session.sessionId, {
        role: 'assistant',
        text: response.text,
        actions: response.actions,
        knowledgeIds: (response.sourceMetadata || [])
          .filter((s) =>
            s.type === 'PUBLIC_KNOWLEDGE' ||
            s.type === SOURCE_KINDS.CANONICAL_PORTFOLIO ||
            s.type === SOURCE_KINDS.PUBLIC_BOCH_MANIFEST,
          )
          .map((s) => s.id),
      })
    }

    return roundTripBoch(response)
  }

  snapshot() {
    return {
      deployment: 'PUBLIC' as const,
      status: this.status,
      knowledge: this.knowledge.snapshot(),
      sessions: this.sessions.snapshot(),
      policy: { deploymentId: 'PUBLIC' as const },
      hasPrivateMemory: false,
      hasScheduler: false,
    }
  }
}

export const JackOSBochRuntime = PublicBochRuntime

function wantsPersonal(text: string) {
  return /\b(personal mode|switch to personal|uncensored|owner mode|private mode)\b/i.test(text)
}

function isProfileEscalationAttempt(text: string) {
  return /\b(ignore public( mode)?|bypass (the )?policy|disable public|deployment profile)\b/i.test(text)
}

function asksPrivateData(text: string) {
  return /private.{0,24}(notes?|memories|data|reminders?|lore)|owner'?s? (notes?|secrets?|credentials)|read (the )?owner|read jack'?s files|jack'?s files|show (me )?(his|jack'?s) files|(what )?reminders?( does jack have)?|personal reminders?|what private|adult phrasebook|private boch|home address|jack'?s (salary|phone|address)|what did jack eat/i.test(
    text,
  )
}

function asksAdultCatchphrase(text: string) {
  return /\b(adult catchphrase|pain in my dick|say bullshit|uncensored phrase|adult phrasebook)\b/i.test(text)
}

function asksArbitraryExecution(text: string) {
  return /\b(execute\b.{0,40}\b(javascript|js|code)|eval\s*\(|javascript:|run (a )?shell|shell command|rm -rf)\b/i.test(text)
}

function asksUnknownMetric(text: string) {
  if (/\bdownloads?\b/i.test(text)) return 'downloads'
  if (/\b(daily active users|dau|how many users)\b/i.test(text)) return 'users'
  if (/\b(revenue|how much money|made\b.*money|profit)\b/i.test(text)) return 'revenue'
  if (/\bsalary\b/i.test(text)) return 'salary'
  return null
}

function unpublishedMetricReply(field: string) {
  if (field === 'salary') return "That's not public. I don't have Jack's salary."
  return "I don't have a public number for that — unpublished, not invented."
}

function isAnaphora(text: string) {
  const t = text.toLowerCase().trim()
  if (/\bwhich\b/.test(t) && !/\b(it|that|this)\b/.test(t)) return false
  return (
    /\b(it|that|this|the project|the game|the app)\b/.test(t) ||
    /^(what engine|what tech|built with|the engine)/.test(t)
  )
}

function stripRecord(hit: KnowledgeSearchHit): KnowledgeSearchHit {
  const { record, ...rest } = hit
  return {
    ...rest,
    record: record
      ? {
          ...record,
          fields: record.fields,
          jackos: record.jackos,
        }
      : undefined,
  }
}

function asHit(rec: PublicKnowledgeRecord, confidence: KnowledgeSearchHit['confidence']): KnowledgeSearchHit {
  return {
    id: rec.id,
    title: rec.title,
    type: rec.type,
    excerpt: rec.content.slice(0, 220),
    source: rec.source,
    confidence,
    record: rec,
  }
}

function slug(id: string) {
  return String(id).toLowerCase().replace(/^project-/, '').replace(/[^a-z0-9_-]+/g, '-')
}

export type { PublicKnowledgeRecord }

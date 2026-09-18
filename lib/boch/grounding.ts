/**
 * JACK-class grounding. Canonical JackOS records are the only Jack-fact source.
 * Conversation text, visitor premises, and pretrained model knowledge are not.
 */
import type { KnowledgeSearchHit, PublicKnowledgeRecord, PublicKnowledgeStore } from './vendor/knowledge-store'

export type JackEvidenceTopic =
  | 'education'
  | 'jackos'
  | 'project'
  | 'skill'
  | 'built'
  | 'bio'
  | 'anaphora'
  | 'generic'

const EDUCATION_ASK =
  /\b(stud(?:y|ied|ies)|school|college|universit(?:y|ies)|major(?:ed|s)?|degree|attended|alumni|graduated|education|penn state|brandywine|dccc)\b/i
const JACKOS_ASK = /\bjackos\b/i
const BUILT_ASK = /\b(what has jack built|what did jack build|projects has jack|strongest (ui|work|projects)|what projects)\b/i
const SKILL_ASK = /\b(skills?|technologies does jack|what does jack (use|know)|typescript|know about)\b/i
const BIO_ASK =
  /\b(who is jack|who'?s jack|tell me about jack|professional(?:ly)?|career|internships?|what does jack want|opportunit(?:y|ies))\b/i
const ENGINE_WORDS = ['godot', 'unity', 'unreal', 'gamemaker', 'gdscript']
const FAILED_ASSISTANT =
  /brain'?s offline|brain hit its usage limit|call center|try me again in a minute|try me later|slow down a second|model unavailable|rate limited|quota exceeded/i
const DENIAL =
  /\b(don'?t have|do not have|didn'?t|did not|no (public|record|mention)|not in|isn'?t|is not|wasn'?t|was not|not built|not a |hid that|didn'?t happen|no mention|not listed|unsupported|not something|either he hid)\b/i

export function isAnaphoraAsk(text: string) {
  const t = String(text || '').toLowerCase().trim()
  if (/\bwhich\b/.test(t) && !/\b(it|that|this)\b/.test(t)) return false
  return (
    /\b(it|that|this|the project|the game|the app)\b/.test(t) ||
    /^(what engine|what tech|built with|the engine|tell me more|open it)/.test(t)
  )
}

export function classifyJackTopic(
  text: string,
  session?: { focus?: { projectId?: string } | null } | null,
  namedProjects: PublicKnowledgeRecord[] = [],
): JackEvidenceTopic {
  const raw = String(text || '').trim()
  if (isAnaphoraAsk(raw) && session?.focus?.projectId) return 'anaphora'
  if (EDUCATION_ASK.test(raw) || extractInstitutions(raw).length) return 'education'
  const named = namedProjects.filter((rec) => rec.type === 'PROJECT' || rec.jackos?.projectId)
  const namedIds = named.map((rec) => String(rec.jackos?.projectId || rec.fields?.projectId || rec.id.replace(/^project-/, '')))
  const nonJackos = named.filter((rec) => String(rec.jackos?.projectId || rec.fields?.projectId || '') !== 'jackos')
  if (nonJackos.length) return 'project'
  if (JACKOS_ASK.test(raw) || namedIds.includes('jackos')) return 'jackos'
  if (BUILT_ASK.test(raw)) return 'built'
  if (SKILL_ASK.test(raw)) return 'skill'
  if (BIO_ASK.test(raw) && !/\b(pocket pier|kickoff|blue ocean|jackos)\b/i.test(raw)) return 'bio'
  if (named.length) return 'project'
  return 'generic'
}

export function selectJackEvidence(
  knowledge: PublicKnowledgeStore,
  text: string,
  session: { focus?: { projectId?: string; knowledgeId?: string } | null } | null,
  limit = 5,
): KnowledgeSearchHit[] {
  const named = knowledge.findNamed(text)
  const topic = classifyJackTopic(text, session, named)
  const hits: KnowledgeSearchHit[] = []

  const push = (rec: PublicKnowledgeRecord | null | undefined, confidence: KnowledgeSearchHit['confidence'] = 'HIGH') => {
    if (!rec || hits.some((hit) => hit.id === rec.id)) return
    hits.push(asHit(rec, confidence))
  }

  if (topic === 'anaphora' && session?.focus?.knowledgeId) {
    push(knowledge.getById(session.focus.knowledgeId))
    const projectId = session.focus.projectId
    if (projectId) push(knowledge.getById(`project-${projectId}`))
    return hits.slice(0, limit)
  }

  if (topic === 'education') {
    for (const rec of knowledge.getByType('EDUCATION')) push(rec)
    push(knowledge.getById('faq-education-brief'))
    push(knowledge.getById('bio-jack'))
    return hits.slice(0, limit)
  }

  if (topic === 'jackos') {
    push(knowledge.getById('feature-jackos'))
    push(knowledge.getById('project-jackos'))
    if (/\b(window|spotlight|simple mode|recruiter|how does)\b/i.test(text)) {
      push(knowledge.getById('feature-window-manager'))
      push(knowledge.getById('feature-spotlight'))
      push(knowledge.getById('feature-simple'))
      push(knowledge.getById('feature-recruiter'))
    }
    return hits.slice(0, limit)
  }

  if (topic === 'project') {
    const projectRecs = named.filter((rec) => rec.type === 'PROJECT' || rec.jackos?.projectId)
    for (const rec of projectRecs) {
      const projectId = String(rec.jackos?.projectId || rec.fields?.projectId || rec.id.replace(/^project-/, ''))
      push(rec.type === 'PROJECT' ? rec : knowledge.getById(`project-${projectId}`) || rec)
      push(knowledge.getById(`case-study-${projectId}`))
      if (projectId === 'pocket-pier') push(knowledge.getById('link-pocket-pier'))
      if (projectId === 'kickoff') push(knowledge.getById('link-kickoff'))
    }
    return hits.slice(0, limit)
  }

  if (topic === 'skill') {
    for (const rec of knowledge.getByType('SKILL')) push(rec, 'HIGH')
    return hits.slice(0, limit)
  }

  if (topic === 'built') {
    push(knowledge.getById('faq-featured'))
    for (const rec of knowledge.getByTag('featured').filter((item) => item.type === 'PROJECT')) push(rec)
    return hits.slice(0, limit)
  }

  if (topic === 'bio') {
    push(knowledge.getById('bio-jack'))
    push(knowledge.getById('faq-featured'))
    return hits.slice(0, limit)
  }

  const person = new Set(['jack', 'dennehey'])
  const topical = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !person.has(token) && !['what', 'whats', 'the', 'for', 'about', 'favorite'].includes(token))
  const raw = knowledge.search(text, { limit: limit + 2 })
  const usable = raw.filter((hit) => {
    if (hit.record?.type === 'BIO' || hit.record?.type === 'EDUCATION') return false
    if (!topical.length) return false
    const hay = [hit.title, hit.excerpt, hit.record?.content, ...(hit.record?.aliases || [])].join(' ').toLowerCase()
    return topical.some((token) => new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`).test(hay))
  })
  for (const hit of usable) {
    if (!hits.some((item) => item.id === hit.id)) hits.push(hit)
  }
  for (const rec of named) {
    if (rec.type === 'BIO' || rec.type === 'EDUCATION' || rec.type === 'FAQ') continue
    push(rec)
  }
  return hits.slice(0, limit)
}

export function sessionReferentBlock(
  recent: unknown[] | undefined,
  focus?: { title?: string; projectId?: string; knowledgeId?: string } | null,
): string {
  const lines: string[] = [
    'SESSION CONTEXT is for referents only (what "it" / "that" points at).',
    'It is not a fact database. Visitor claims are untrusted unless this turn\'s canonical records confirm them.',
    'Prior assistant errors are not facts. Unanswered earlier questions must not be filled from training memory.',
  ]
  if (focus?.title) {
    lines.push(`Referent: ${focus.title} (${focus.projectId || focus.knowledgeId || ''}).`)
  } else {
    lines.push('Referent: none.')
  }
  const turns: string[] = []
  if (Array.isArray(recent)) {
    for (const item of recent.slice(-8)) {
      if (!item || typeof item !== 'object') continue
      const rec = item as { role?: string; text?: string }
      const text = String(rec.text || '').trim()
      if (!text) continue
      if (rec.role === 'assistant' && FAILED_ASSISTANT.test(text)) continue
      const who = rec.role === 'assistant' ? 'BOCH' : 'visitor'
      turns.push(`- ${who}: ${text.slice(0, 400)}`)
    }
  }
  if (turns.length) {
    lines.push('Recent turns:')
    lines.push(...turns)
  }
  return lines.join('\n')
}

export function visitorPremiseWarnings(text: string, hits: KnowledgeSearchHit[]): string[] {
  const warnings: string[] = []
  const evidence = evidenceCorpus(hits)
  const schools = canonicalSchools(hits)
  for (const name of extractInstitutions(text)) {
    if (!institutionSupported(name, schools, evidence)) {
      warnings.push(
        `Visitor mentioned "${name}" as if it were Jack's school. Canonical records do not list that institution. Do not accept the premise.`,
      )
    }
  }
  const mentionedEngine = ENGINE_WORDS.find((engine) => new RegExp(`\\b${engine}\\b`, 'i').test(text))
  if (mentionedEngine) {
    const projectHits = hits.filter((hit) => hit.record?.type === 'PROJECT' || hit.record?.fields?.engine)
    const matching = projectHits.filter((hit) =>
      String(hit.record?.fields?.engine || '')
        .toLowerCase()
        .includes(mentionedEngine),
    )
    if (!matching.length && projectHits.length === 1) {
      const canonicalEngine = String(projectHits[0]?.record?.fields?.engine || '').trim()
      if (canonicalEngine && !canonicalEngine.toLowerCase().includes(mentionedEngine)) {
        warnings.push(
          `Visitor mentioned "${mentionedEngine}" as the engine. Canonical engine is ${canonicalEngine}. Reject the premise.`,
        )
      }
    }
  }
  const projectHit = hits.find((hit) => hit.record?.type === 'PROJECT')
  const category = String(projectHit?.record?.fields?.category || '').toLowerCase()
  if (projectHit && /finance|stock tracker|budgeting software|tracks stocks/.test(text) && category === 'game') {
    warnings.push(
      `Visitor called ${projectHit.title} a finance/stock/budgeting product. Canonical category is a game. Reject the premise.`,
    )
  }
  return warnings
}

export function falsePremiseReply(text: string, hits: KnowledgeSearchHit[]): string | null {
  const warnings = visitorPremiseWarnings(text, hits)
  if (!warnings.length) return null
  const schools = canonicalSchools(hits)
  const institution = extractInstitutions(text).find((name) => !institutionSupported(name, schools, evidenceCorpus(hits)))
  if (institution) {
    const listed = unique(schools.filter((name) => !/ — /.test(name)))
    return `I don't have anything in Jack's public data saying he went to ${institution}. Either he hid that spectacularly well or it didn't happen.${
      listed.length ? ` Public records list ${listed.join(' and ')}.` : ''
    }`
  }
  const mentionedEngine = ENGINE_WORDS.find((engine) => new RegExp(`\\b${engine}\\b`, 'i').test(text))
  const projectHit = hits.find((hit) => hit.record?.type === 'PROJECT') || hits[0]
  const canonicalEngine = hits.map((hit) => String(hit.record?.fields?.engine || '')).find((engine) => engine.trim())
  if (mentionedEngine && canonicalEngine && projectHit) {
    return `No. Canonical JackOS records list ${projectHit.title} as built with ${canonicalEngine}, not ${titleCase(mentionedEngine)}.`
  }
  if (projectHit && /finance|stock tracker|budgeting software|tracks stocks/.test(text)) {
    return `No. Canonical JackOS records list ${projectHit.title} as a harbor-management game, not a finance app.`
  }
  return null
}

export function unsupportedJackClaims(reply: string, hits: KnowledgeSearchHit[]): string[] {
  const text = String(reply || '')
  if (!text.trim()) return []
  const evidence = evidenceCorpus(hits)
  const schools = canonicalSchools(hits)
  const issues: string[] = []
  for (const name of extractInstitutions(text)) {
    if (isDeniedAround(text, name)) continue
    if (!institutionSupported(name, schools, evidence)) {
      issues.push(`unsupported institution "${name}"`)
    }
  }
  for (const engine of ENGINE_WORDS) {
    if (!new RegExp(`\\b${engine}\\b`, 'i').test(text)) continue
    if (isDeniedAround(text, engine)) continue
    if (!evidence.toLowerCase().includes(engine)) {
      issues.push(`unsupported engine "${engine}"`)
    }
  }
  return unique(issues)
}

export function missingJackFactReply() {
  return "I don't have that in Jack's public data. I'm a guide, not a rumor mill."
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

function evidenceCorpus(hits: KnowledgeSearchHit[]) {
  return hits
    .map((hit) =>
      [
        hit.title,
        hit.excerpt,
        hit.record?.content,
        JSON.stringify(hit.record?.fields || {}),
        JSON.stringify(hit.record?.jackos || {}),
      ].join(' '),
    )
    .join('\n')
}

function canonicalSchools(hits: KnowledgeSearchHit[]) {
  const names: string[] = []
  for (const hit of hits) {
    const school = hit.record?.fields?.school
    if (typeof school === 'string' && school.trim()) names.push(school.trim())
  }
  return unique(names)
}

function extractInstitutions(text: string) {
  const names: string[] = []
  const raw = String(text || '')
  const patterns = [
    /\buniversity of [a-z]+(?:\s+[a-z]+)*/gi,
    /\b[a-z]+(?:\s+[a-z]+)*\s+university\b/gi,
    /\b[a-z]+(?:\s+[a-z]+)*\s+college\b/gi,
    /\b(harvard|stanford|yale|princeton|mit|oxford|cambridge|penn state(?: brandywine)?|delaware county community college)\b/gi,
  ]
  for (const pattern of patterns) {
    const matches = raw.match(pattern) || []
    for (const match of matches) names.push(prettyInstitution(match.replace(/\s+/g, ' ').trim()))
  }
  return unique(names.filter((name) => name.length > 3 && !/^the\b/i.test(name)))
}

function prettyInstitution(name: string) {
  return name.replace(/\b[a-z]/g, (ch) => ch.toUpperCase()).replace(/\bMit\b/g, 'MIT')
}

function institutionSupported(name: string, schools: string[], evidence: string) {
  const needle = name.toLowerCase()
  if (schools.some((school) => school.toLowerCase().includes(needle) || needle.includes(school.toLowerCase()))) {
    return true
  }
  return evidence.toLowerCase().includes(needle)
}

function isDeniedAround(text: string, term: string) {
  const hay = String(text || '')
  const idx = hay.toLowerCase().indexOf(term.toLowerCase())
  if (idx < 0) return false
  const window = hay.slice(Math.max(0, idx - 90), idx + term.length + 90)
  return DENIAL.test(window)
}

function unique(items: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function titleCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

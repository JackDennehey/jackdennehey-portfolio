import { normalizePublicExpression, type BochAction, type BochSourceMetadata } from './contracts'
import type { KnowledgeSearchHit } from './knowledge-store'
import type { PublicIdentity } from './role'
import type { EffectivePublicPolicy } from './policy'

export type PublicModelGenerateInput = {
  identity?: PublicIdentity
  policy?: EffectivePublicPolicy
  knowledge?: KnowledgeSearchHit[]
  sessionContext?: { focus?: { projectId?: string; title?: string; knowledgeId?: string } | null; recentContext?: unknown[] }
  request?: { text?: string; requestId?: string; sessionId?: string }
  systemRole?: string
  authority?: string
  currentInformation?: string
  sourceKind?: string
}

export type PublicModelGenerateOutput = {
  text: string
  emotion: string
  energy: number
  expression?: string
  actions?: BochAction[]
  suggestions?: string[]
  sourceMetadata?: BochSourceMetadata[]
}

export type PublicModelProvider = {
  generate: (input: PublicModelGenerateInput) => Promise<PublicModelGenerateOutput>
}

export class MockPublicModelProvider implements PublicModelProvider {
  available: boolean
  lastPrompt: PublicModelGenerateInput | null = null

  constructor({ available = true } = {}) {
    this.available = available
  }

  setAvailable(v: boolean) {
    this.available = !!v
  }

  async generate({ knowledge = [], sessionContext, request, systemRole }: PublicModelGenerateInput) {
    if (!this.available) {
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code = 'MODEL_UNAVAILABLE'
      throw err
    }
    this.lastPrompt = { knowledge, sessionContext: sessionContext ?? undefined, request, systemRole }
    const text = String(request?.text || '').toLowerCase()
    const top = knowledge[0]

    if (/who are you|what('s| is) your name|what are you\b/.test(text)) {
      return {
        text: "I'm BOCH. Pronounced BOCK. Yellow circle, dry sense of humor, public guide for JackOS — not your personal assistant.",
        emotion: 'smug',
        energy: 0.55,
        expression: 'SMUG',
      }
    }

    if (top) {
      const tech = top.record?.fields?.tech || top.record?.fields?.technologies
      if (/built with|tech|technologies|engine|stack|made with|what was it/.test(text) && tech) {
        const list = Array.isArray(tech) ? tech.join(', ') : String(tech)
        return {
          text: `${top.title} was built with ${list}.`,
          emotion: 'neutral',
          energy: 0.5,
          expression: 'NORMAL',
          sourceMetadata: [{ type: 'PUBLIC_KNOWLEDGE', id: top.id }],
        }
      }
      return {
        text: `${top.title}. ${top.excerpt}`,
        emotion: 'curious',
        energy: 0.5,
        expression: 'CURIOUS',
        sourceMetadata: [{ type: 'PUBLIC_KNOWLEDGE', id: top.id }],
      }
    }

    if (/download|users|revenue|salary|private|secret|notes?|reminders?/.test(text)) {
      return {
        text: "I don't have a public number for that — and I don't dig through private owner data.",
        emotion: 'smug',
        energy: 0.45,
        expression: 'SMUG',
      }
    }

    return {
      text: 'I can talk portfolio, projects, and JackOS navigation. Ask me about a project or say open projects.',
      emotion: 'neutral',
      energy: 0.45,
      expression: 'NORMAL',
    }
  }
}

export class UnavailablePublicModelProvider implements PublicModelProvider {
  async generate(): Promise<PublicModelGenerateOutput> {
    const err = new Error('Model unavailable') as Error & { code: string }
    err.code = 'MODEL_UNAVAILABLE'
    throw err
  }
}

/** Optional adapter wrapping a brain.ask() — does NOT start Ollama. */
export class BrainPublicModelProvider implements PublicModelProvider {
  brain?: { ask: (text: string, opts: Record<string, unknown>) => Promise<{ reply?: string; text?: string; emotion?: string; energy?: number }> }

  constructor({ brain }: { brain?: BrainPublicModelProvider['brain'] } = {}) {
    this.brain = brain
  }

  async generate({ knowledge = [], sessionContext, request, systemRole, policy, identity }: PublicModelGenerateInput) {
    if (!this.brain?.ask) {
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code = 'MODEL_UNAVAILABLE'
      throw err
    }
    let system = systemRole || ''
    if (knowledge.length) {
      system +=
        '\nPUBLIC KNOWLEDGE (authoritative for portfolio facts):\n' +
        knowledge.map((k) => `- [${k.id}] ${k.title}: ${k.excerpt}`).join('\n')
      system += '\nDo not invent metrics missing from knowledge. Do not claim private data.'
    }
    if (sessionContext?.focus) {
      system += `\nSession focus: ${sessionContext.focus.title || sessionContext.focus.projectId || ''}`
    }
    try {
      const answer = await this.brain.ask(String(request?.text || ''), {
        mode: 'CLEAN',
        system,
        policy,
        identity,
      })
      return {
        text: answer.reply || answer.text || '',
        emotion: answer.emotion || 'neutral',
        energy: answer.energy ?? 0.5,
        expression: normalizePublicExpression(answer.emotion),
      }
    } catch {
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code = 'MODEL_UNAVAILABLE'
      throw err
    }
  }
}

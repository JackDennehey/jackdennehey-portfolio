/**
 * Shared PUBLIC brain turn: personality + authority + evidence → model → BochResponse fields.
 * Providers supply only the chat transport. Runtime still validates actions.
 */
import { parseBrainResponse } from './emotions'
import { authorityPromptBlock, knowledgePromptBlock, publicSystemPrompt } from './personality'
import { SOURCE_KINDS } from './authority'
import { normalizePublicExpression } from './vendor/contracts'
import type { KnowledgeSearchHit } from './vendor/knowledge-store'
import type { PublicModelGenerateInput, PublicModelGenerateOutput } from './vendor/model-provider'

export type PublicChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export type PublicChatFn = (system: string, messages: PublicChatMessage[], temperature: number) => Promise<string>

export async function generatePublicCompletion(
  input: PublicModelGenerateInput,
  chat: PublicChatFn,
): Promise<PublicModelGenerateOutput> {
  const knowledge = input.knowledge ?? []
  const knowledgeLines = knowledge.map((hit) => formatHit(hit))
  const focus = input.sessionContext?.focus
  const history = historyFromSession(input.sessionContext?.recentContext)
  const authority = input.authority || 'CASUAL'
  const system = [
    publicSystemPrompt(0.85),
    input.systemRole || '',
    authorityPromptBlock(authority),
    knowledgePromptBlock(authority === 'JACK' || authority === 'BOCH' ? knowledgeLines : []),
    input.currentInformation || '',
    focus?.title
      ? `Session referent: ${focus.title} (${focus.projectId || focus.knowledgeId || ''}).`
      : 'Session referent: none.',
  ]
    .filter(Boolean)
    .join('\n')

  const userText = String(input.request?.text || '').trim()
  const messages: PublicChatMessage[] = [...history, { role: 'user', content: userText }]
  const temperature = authority === 'JACK' || authority === 'CURRENT' ? 0.2 : 0.55
  const raw = await chat(system, messages, temperature)
  const parsed = parseBrainResponse(raw)
  const sourceType =
    authority === 'JACK'
      ? SOURCE_KINDS.CANONICAL_PORTFOLIO
      : authority === 'BOCH'
        ? SOURCE_KINDS.PUBLIC_BOCH_MANIFEST
        : authority === 'CURRENT'
          ? SOURCE_KINDS.CURRENT_WEB
          : authority === 'GENERAL'
            ? SOURCE_KINDS.GENERAL_MODEL
            : SOURCE_KINDS.NONE
  return {
    text: parsed.reply,
    emotion: parsed.emotion,
    energy: parsed.energy,
    expression: normalizePublicExpression(parsed.emotion),
    actions: parsed.actions,
    sourceMetadata: knowledge.slice(0, 5).map((hit) => ({ type: sourceType, id: hit.id })),
  }
}

function formatHit(hit: KnowledgeSearchHit) {
  const projectId = hit.record?.jackos?.projectId || hit.record?.fields?.projectId
  const appId = hit.record?.jackos?.appId
  const tech = hit.record?.fields?.tech || hit.record?.fields?.technologies
  const engine = hit.record?.fields?.engine
  const category = hit.record?.fields?.category || hit.record?.type
  const extras = [
    `kind=${String(category)}`,
    projectId ? `projectId=${String(projectId)}` : '',
    appId ? `appId=${String(appId)}` : '',
    engine ? `engine=${String(engine)}` : '',
    tech ? `tech=${Array.isArray(tech) ? tech.join(', ') : String(tech)}` : '',
  ]
    .filter(Boolean)
    .join('; ')
  const body = (hit.record?.content || hit.excerpt || '').slice(0, 900)
  return `- [${hit.id}] ${hit.title} (${hit.type}; ${extras}): ${body}`
}

function historyFromSession(recent: unknown[] | undefined): PublicChatMessage[] {
  if (!Array.isArray(recent)) return []
  const turns: PublicChatMessage[] = []
  for (const item of recent.slice(-12)) {
    if (!item || typeof item !== 'object') continue
    const rec = item as { role?: string; text?: string }
    const role = rec.role === 'assistant' ? 'assistant' : rec.role === 'user' ? 'user' : null
    const text = String(rec.text || '').trim()
    if (!role || !text) continue
    turns.push({ role, content: text.slice(0, 900) })
  }
  return turns.slice(-8)
}

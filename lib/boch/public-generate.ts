/**
 * Shared PUBLIC brain turn: personality + authority + evidence → model → BochResponse fields.
 * Providers supply only the chat transport. Runtime still validates actions.
 */
import { parseBrainResponse } from './emotions'
import { authorityPromptBlock, knowledgePromptBlock, publicSystemPrompt } from './personality'
import { SOURCE_KINDS } from './authority'
import { missingJackFactReply, sessionReferentBlock, unsupportedJackClaims, visitorPremiseWarnings } from './grounding'
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
  const authority = input.authority || 'CASUAL'
  const premiseNotes = authority === 'JACK' ? visitorPremiseWarnings(String(input.request?.text || ''), knowledge) : []
  const system = [
    publicSystemPrompt(0.85),
    input.systemRole || '',
    authorityPromptBlock(authority),
    knowledgePromptBlock(authority === 'JACK' || authority === 'BOCH' ? knowledgeLines : []),
    premiseNotes.length ? `PREMISE CHECK:\n${premiseNotes.map((note) => `- ${note}`).join('\n')}` : '',
    input.currentInformation || '',
    sessionReferentBlock(input.sessionContext?.recentContext, focus),
  ]
    .filter(Boolean)
    .join('\n')

  const userText = String(input.request?.text || '').trim()
  const messages: PublicChatMessage[] = [{ role: 'user', content: userText }]
  const temperature = authority === 'JACK' || authority === 'CURRENT' ? 0.2 : 0.55
  let raw = await chat(system, messages, temperature)
  let parsed = parseBrainResponse(raw)
  if (authority === 'JACK') {
    const issues = unsupportedJackClaims(parsed.reply, knowledge)
    if (issues.length) {
      raw = await chat(
        `${system}\nREWRITE: Your previous reply invented Jack-specific facts not in the records (${issues.join('; ')}). Rewrite using only this turn's records. If the fact is missing, say you do not have it, in character. Do not keep the invented fact.`,
        messages,
        0.15,
      )
      parsed = parseBrainResponse(raw)
      if (unsupportedJackClaims(parsed.reply, knowledge).length) {
        parsed = { ...parsed, reply: missingJackFactReply() }
      }
    }
  }
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

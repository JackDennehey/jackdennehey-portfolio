/**
 * PUBLIC conversational brain.
 * hosted = Vercel AI Gateway (production). local = workstation Ollama (dev only).
 * Production never uses localhost Ollama. Vercel never uses Jack's Mac.
 */
import { parseBrainResponse } from './emotions'
import { authorityPromptBlock, knowledgePromptBlock, publicSystemPrompt } from './personality'
import { SOURCE_KINDS } from './authority'
import { normalizePublicExpression } from './vendor/contracts'
import type { KnowledgeSearchHit } from './vendor/knowledge-store'
import type { PublicModelGenerateInput, PublicModelGenerateOutput, PublicModelProvider } from './vendor/model-provider'

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export type HostedBrainBackend = 'gateway' | 'ollama'

export function isProductionBochRuntime() {
  return Boolean(process.env.VERCEL) || process.env.BOCH_RUNTIME === 'production'
}

export function resolveProviderMode() {
  const explicit = (process.env.BOCH_PROVIDER || '').toLowerCase()
  if (explicit) return explicit
  return isProductionBochRuntime() ? 'hosted' : 'local'
}

export function hostedBrainAvailable() {
  return Boolean(resolveBrainBackend())
}

export function resolveBrainBackend(): HostedBrainBackend | null {
  const mode = resolveProviderMode()
  if (mode === 'unavailable' || mode === 'mock' || mode === 'grounded') return null
  if (isProductionBochRuntime()) {
    if (mode === 'local') return null
    if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) return 'gateway'
    return null
  }
  if (mode === 'local') {
    if (process.env.BOCH_OLLAMA_HOST === '0') return null
    return 'ollama'
  }
  if (mode === 'hosted') {
    if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) return 'gateway'
    return null
  }
  return null
}

export function hostedBrainLabel() {
  const backend = resolveBrainBackend()
  if (backend === 'gateway') return process.env.BOCH_MODEL || 'anthropic/claude-sonnet-4.6'
  if (backend === 'ollama') return process.env.BOCH_OLLAMA_MODEL || 'qwen2.5:7b'
  return 'unavailable'
}

export class HostedPublicModelProvider implements PublicModelProvider {
  async generate(input: PublicModelGenerateInput): Promise<PublicModelGenerateOutput> {
    const backend = resolveBrainBackend()
    if (!backend) {
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code = 'MODEL_UNAVAILABLE'
      throw err
    }

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
      focus?.title ? `Session referent: ${focus.title} (${focus.projectId || focus.knowledgeId || ''}).` : 'Session referent: none.',
    ]
      .filter(Boolean)
      .join('\n')

    const userText = String(input.request?.text || '').trim()
    const messages: ChatMessage[] = [...history, { role: 'user', content: userText }]
    const temperature = authority === 'JACK' || authority === 'CURRENT' ? 0.2 : 0.55

    let raw: string
    try {
      raw =
        backend === 'gateway'
          ? await gatewayChat(system, messages, temperature)
          : await ollamaChat(system, messages, temperature)
    } catch (error) {
      const err = new Error(error instanceof Error ? error.message : 'Model unavailable') as Error & { code: string }
      err.code = 'MODEL_UNAVAILABLE'
      throw err
    }

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

function historyFromSession(recent: unknown[] | undefined): ChatMessage[] {
  if (!Array.isArray(recent)) return []
  const turns: ChatMessage[] = []
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

async function ollamaChat(system: string, messages: ChatMessage[], temperature = 0.55) {
  const host = (process.env.BOCH_OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '')
  const model = process.env.BOCH_OLLAMA_MODEL || 'qwen2.5:7b'
  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      options: { temperature, num_predict: 280 },
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(Number(process.env.BOCH_MODEL_TIMEOUT_MS) || 45_000),
  })
  if (!response.ok) {
    throw new Error(`Ollama ${response.status}`)
  }
  const data = (await response.json()) as { message?: { content?: string }; response?: string }
  return String(data.message?.content || data.response || '')
}

async function gatewayChat(system: string, messages: ChatMessage[], temperature = 0.5) {
  const key = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!key) throw new Error('AI Gateway credentials missing')
  const models = [
    process.env.BOCH_MODEL || 'anthropic/claude-sonnet-4.6',
    process.env.BOCH_MODEL_FAILOVER || 'google/gemini-3.8-flash',
  ].filter((model, index, list) => list.indexOf(model) === index)
  const maxTokens = Number(process.env.BOCH_MAX_OUTPUT_TOKENS) || 400
  let lastError: Error | null = null
  for (const model of models) {
    try {
      const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, ...messages],
        }),
        signal: AbortSignal.timeout(Number(process.env.BOCH_MODEL_TIMEOUT_MS) || 45_000),
      })
      if (!response.ok) {
        lastError = new Error(`AI Gateway ${response.status}`)
        continue
      }
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
      const content = String(data.choices?.[0]?.message?.content || '')
      if (content) return content
      lastError = new Error('AI Gateway empty completion')
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('AI Gateway failed')
    }
  }
  throw lastError || new Error('AI Gateway failed')
}

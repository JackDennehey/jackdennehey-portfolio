/**
 * PUBLIC conversational brain transports.
 * Production hosted = Gemini API (GEMINI_API_KEY). local = workstation Ollama (dev only).
 * Production never uses localhost Ollama or Vercel AI Gateway billing.
 */
import { credentialsMissingMessage, getGatewayAuthToken, logGatewayFailure } from './gateway-auth'
import { geminiApiKey } from './gemini-provider'
import { publicCodeFromProviderHttp } from './public-failure.mjs'
import { generatePublicCompletion, type PublicChatMessage } from './public-generate'
import { readServerEnv } from './server-env'
import type { PublicModelGenerateInput, PublicModelGenerateOutput, PublicModelProvider } from './vendor/model-provider'

export type HostedBrainBackend = 'gemini' | 'gateway' | 'ollama'

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
    if (geminiApiKey()) return 'gemini'
    return null
  }
  if (mode === 'local') {
    if (process.env.BOCH_OLLAMA_HOST === '0') return null
    return 'ollama'
  }
  if (mode === 'hosted' || mode === 'gemini') {
    if (geminiApiKey()) return 'gemini'
    return null
  }
  if (mode === 'gateway') {
    if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) return 'gateway'
    return null
  }
  if (geminiApiKey()) return 'gemini'
  return null
}

export function hostedBrainLabel() {
  const backend = resolveBrainBackend()
  if (backend === 'gemini') return readServerEnv('BOCH_MODEL') || 'gemini-3.5-flash'
  if (backend === 'gateway') return process.env.BOCH_MODEL || 'anthropic/claude-sonnet-4.6'
  if (backend === 'ollama') return process.env.BOCH_OLLAMA_MODEL || 'qwen2.5:7b'
  return 'unavailable'
}

export class HostedPublicModelProvider implements PublicModelProvider {
  async generate(input: PublicModelGenerateInput): Promise<PublicModelGenerateOutput> {
    const backend = resolveBrainBackend()
    if (!backend || backend === 'gemini') {
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code = 'MODEL_UNAVAILABLE'
      throw err
    }

    try {
      return await generatePublicCompletion(input, backend === 'gateway' ? gatewayChat : ollamaChat)
    } catch (error) {
      const code = (error as { code?: string })?.code
      const err = new Error('Model unavailable') as Error & { code: string }
      err.code =
        code === 'QUOTA_EXCEEDED' ? 'QUOTA_EXCEEDED' : code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'MODEL_UNAVAILABLE'
      throw err
    }
  }
}

async function ollamaChat(system: string, messages: PublicChatMessage[], temperature = 0.55) {
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
    const body = await response.text().catch(() => '')
    const err = new Error('Model unavailable') as Error & { code: string }
    err.code = publicCodeFromProviderHttp(response.status, body)
    throw err
  }
  const data = (await response.json()) as { message?: { content?: string }; response?: string }
  return String(data.message?.content || data.response || '')
}

async function gatewayChat(system: string, messages: PublicChatMessage[], temperature = 0.5) {
  const key = await getGatewayAuthToken()
  if (!key) {
    console.error('[boch] optional AI Gateway credentials missing')
    throw new Error(credentialsMissingMessage())
  }
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
        const body = await response.text().catch(() => '')
        const cls = logGatewayFailure('chat', response.status, model, body)
        const failed = new Error('Model unavailable') as Error & { code: string }
        failed.code = publicCodeFromProviderHttp(response.status, body)
        lastError = failed
        if (cls === 'auth' || cls === 'billing' || failed.code === 'QUOTA_EXCEEDED') break
        continue
      }
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
      const content = String(data.choices?.[0]?.message?.content || '')
      if (content) return content
      lastError = new Error('Model unavailable')
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Model unavailable')
    }
  }
  throw lastError || new Error('Model unavailable')
}

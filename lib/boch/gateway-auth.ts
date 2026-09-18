/**
 * AI Gateway credentials. API key is optional. On Vercel Functions the OIDC
 * token is on the incoming request (`x-vercel-oidc-token`), not a static env var.
 * Call only from a request handler — never at module scope.
 */
import { AsyncLocalStorage } from 'node:async_hooks'

export type GatewayAuthSource = 'api-key' | 'request' | 'context' | 'next-headers' | 'env' | 'missing'

export type GatewayAuthSnapshot = {
  token: string | null
  source: GatewayAuthSource
  vercelHeaders: string[]
}

const gatewayAuthStore = new AsyncLocalStorage<GatewayAuthSnapshot>()

export function runWithGatewayAuth<T>(snapshot: GatewayAuthSnapshot, fn: () => T): T {
  return gatewayAuthStore.run(snapshot, fn)
}

export function gatewayAuthSnapshot(): GatewayAuthSnapshot {
  return gatewayAuthStore.getStore() || { token: null, source: 'missing', vercelHeaders: [] }
}

export async function collectGatewayAuth(request: Request): Promise<GatewayAuthSnapshot> {
  const fromRequest = headerNames(request.headers)
  let fromNext: string[] = []
  let nextToken: string | null = null
  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    fromNext = headerNames(h)
    nextToken = pickOidcHeader(h)
  } catch {
    // Not a Next.js request.
  }

  const vercelHeaders = uniqueSorted([...fromRequest, ...fromNext])
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim() || null
  if (apiKey) return { token: apiKey, source: 'api-key', vercelHeaders }

  const requestToken = pickOidcHeader(request.headers)
  if (requestToken) return { token: requestToken, source: 'request', vercelHeaders }

  const contextToken = readOidcFromVercelContext()
  if (contextToken) return { token: contextToken, source: 'context', vercelHeaders }

  if (nextToken) return { token: nextToken, source: 'next-headers', vercelHeaders }

  const envToken = process.env.VERCEL_OIDC_TOKEN?.trim() || null
  if (envToken) return { token: envToken, source: 'env', vercelHeaders }

  return { token: null, source: 'missing', vercelHeaders }
}

export async function getGatewayAuthToken(): Promise<string | null> {
  const existing = gatewayAuthStore.getStore()
  if (existing?.token) return existing.token
  if (process.env.AI_GATEWAY_API_KEY?.trim()) return process.env.AI_GATEWAY_API_KEY.trim()
  const fromContext = readOidcFromVercelContext()
  if (fromContext) return fromContext
  try {
    const { headers } = await import('next/headers')
    const token = pickOidcHeader(await headers())
    if (token) return token
  } catch {
    // Not a Next.js request.
  }
  return process.env.VERCEL_OIDC_TOKEN?.trim() || null
}

function pickOidcHeader(headers: Headers) {
  return (
    headers.get('x-vercel-oidc-token')?.trim() ||
    headers.get('X-Vercel-Oidc-Token')?.trim() ||
    null
  )
}

function headerNames(headers: Headers) {
  const names: string[] = []
  headers.forEach((_, name) => {
    const lower = name.toLowerCase()
    if (lower.includes('vercel') || lower.includes('oidc')) names.push(lower)
  })
  return names
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort()
}

function readOidcFromVercelContext() {
  try {
    const holder = (globalThis as Record<symbol, { get?: () => { headers?: Record<string, string | undefined> } }>)[
      Symbol.for('@vercel/request-context')
    ]
    const headers = holder?.get?.()?.headers
    const token = headers?.['x-vercel-oidc-token'] || headers?.['X-Vercel-Oidc-Token']
    return token?.trim() || null
  } catch {
    return null
  }
}

export function classifyGatewayFailure(status: number, body: string) {
  const lower = body.toLowerCase()
  if (status === 401) return 'auth'
  if (status === 402) return 'billing'
  if (status === 404) return 'model'
  if (status === 429) return 'rate'
  if (status === 403) {
    if (lower.includes('no_providers_available') || lower.includes('restricted access to this model')) return 'model'
    if (lower.includes('credit') || lower.includes('billing') || lower.includes('payment')) return 'billing'
    return 'auth'
  }
  return 'gateway'
}

export function logGatewayFailure(kind: 'chat' | 'tts', status: number, model: string, body: string) {
  const cls = classifyGatewayFailure(status, body)
  console.error(
    JSON.stringify({
      boch: true,
      kind,
      gatewayStatus: status,
      gatewayClass: cls,
      model,
      body: body.slice(0, 240),
    }),
  )
  return cls
}

export function credentialsMissingMessage() {
  const snap = gatewayAuthSnapshot()
  const hdrs = snap.vercelHeaders.join(',') || 'none'
  return `AI Gateway credentials missing (${snap.source}; vercelHeaders=${hdrs})`
}

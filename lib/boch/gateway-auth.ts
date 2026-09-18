/**
 * AI Gateway credentials. API key is optional. On Vercel Functions the OIDC
 * token is on the incoming request (`x-vercel-oidc-token`), not a static env var.
 * Call only from a request handler — never at module scope.
 */
import { AsyncLocalStorage } from 'node:async_hooks'

const gatewayTokenStore = new AsyncLocalStorage<string>()

export function readGatewayTokenFromRequest(request: Request) {
  return request.headers.get('x-vercel-oidc-token')?.trim() || null
}

export function runWithGatewayAuth<T>(token: string | null | undefined, fn: () => T): T {
  const value = token?.trim()
  if (!value) return fn()
  return gatewayTokenStore.run(value, fn)
}

export async function getGatewayAuthToken(): Promise<string | null> {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim()
  if (apiKey) return apiKey

  const fromRequest = gatewayTokenStore.getStore()?.trim()
  if (fromRequest) return fromRequest

  const fromContext = readOidcFromVercelContext()
  if (fromContext) return fromContext

  try {
    const { headers } = await import('next/headers')
    const token = (await headers()).get('x-vercel-oidc-token')?.trim()
    if (token) return token
  } catch {
    // Not a Next.js request.
  }

  return process.env.VERCEL_OIDC_TOKEN?.trim() || null
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

export function classifyGatewayHttp(status: number) {
  if (status === 401 || status === 403) return 'auth'
  if (status === 402) return 'billing'
  if (status === 404) return 'model'
  if (status === 429) return 'rate'
  return 'gateway'
}

export function logGatewayFailure(kind: 'chat' | 'tts', status: number, model: string, body: string) {
  const cls = classifyGatewayHttp(status)
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

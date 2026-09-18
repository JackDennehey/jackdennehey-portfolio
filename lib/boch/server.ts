import { JackOSActionValidator } from './vendor/action-validator'
import { PublicBochRuntime } from './vendor/runtime'
import { PublicKnowledgeStore } from './vendor/knowledge-store'
import { PublicSessionStore } from './vendor/session-store'
import { CompoundRateLimit, RateLimitPolicy } from './vendor/rate-limit'
import { PUBLIC_BOCH_IDENTITY } from './vendor/role'
import { MockPublicModelProvider, UnavailablePublicModelProvider } from './vendor/model-provider'
import { GroundedPublicModelProvider } from './grounded-provider'
import { GeminiPublicModelProvider } from './gemini-provider'
import {
  HostedPublicModelProvider,
  isProductionBochRuntime,
  resolveBrainBackend,
  resolveProviderMode,
} from './hosted-provider'
import { resolvePublicTtsEngine } from './tts'
import { buildPublicKnowledgeBundle, buildUrlAllowlist } from './knowledge-adapter'
import { DurableKvSessionStore, durableKvConfigured } from './kv-session-store'
import { canPersistVisitorSession } from './session-cookie'
import type { PublicModelProvider } from './vendor/model-provider'

const SESSION_COOKIE = 'jackos-boch-sid'

let runtime: PublicBochRuntime | null = null

function createProvider(): PublicModelProvider {
  const mode = resolveProviderMode()
  if (isProductionBochRuntime() && mode === 'local') return new UnavailablePublicModelProvider()
  if (mode === 'unavailable') return new UnavailablePublicModelProvider()
  if (mode === 'mock') return new MockPublicModelProvider()
  if (mode === 'grounded') return new GroundedPublicModelProvider()
  const backend = resolveBrainBackend()
  if (backend === 'gemini') return new GeminiPublicModelProvider()
  if (backend === 'ollama' || backend === 'gateway') return new HostedPublicModelProvider()
  return new UnavailablePublicModelProvider()
}

function createSessionStore() {
  if (durableKvConfigured()) return new DurableKvSessionStore()
  return new PublicSessionStore()
}

export function getPublicBochRuntime() {
  if (runtime) {
    runtime.sessions.sweep()
    return runtime
  }

  const knowledge = new PublicKnowledgeStore()
  knowledge.importBundle(buildPublicKnowledgeBundle())
  const urlAllowlist = buildUrlAllowlist()

  runtime = new PublicBochRuntime({
    identity: PUBLIC_BOCH_IDENTITY,
    publicKnowledge: knowledge,
    publicSessionStore: createSessionStore(),
    modelProvider: createProvider(),
    actionValidator: new JackOSActionValidator({ urlAllowlist }),
    rateLimit: new CompoundRateLimit(
      new RateLimitPolicy({ maxRequests: 20, windowMs: 60_000 }),
      new RateLimitPolicy({ maxRequests: 180, windowMs: 60_000 }),
    ),
    urlAllowlist,
  })
  return runtime
}

export function resetPublicBochRuntimeForTests() {
  runtime = null
}

export function getBochSessionCookieName() {
  return SESSION_COOKIE
}

export function newVisitorSessionId() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return `sess_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

export function bochPublicHealth() {
  const provider = resolveProviderMode()
  const backend = resolveBrainBackend()
  const production = isProductionBochRuntime()
  const hosted = Boolean(backend === 'gemini' || backend === 'gateway')
  return {
    deployment: 'PUBLIC' as const,
    provider: production ? (hosted ? 'hosted' : 'unavailable') : provider === 'local' ? 'local' : provider,
    voice: resolvePublicTtsEngine() ? 'hosted' : 'fallback',
    sessions: durableKvConfigured() ? 'cookie-or-kv' : canPersistVisitorSession() ? 'cookie' : 'memory',
    production,
  }
}

export function bochSessionCookieOptions(request?: Request) {
  const forwarded = request?.headers.get('x-forwarded-proto')
  const protocol = forwarded || (request ? new URL(request.url).protocol.replace(':', '') : '')
  const secure = protocol === 'https' || process.env.BOCH_COOKIE_SECURE === '1'
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: 60 * 60,
  }
}

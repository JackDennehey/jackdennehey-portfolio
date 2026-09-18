import { cookies } from 'next/headers'
import { createBochRequest, PUBLIC_CONTRACT_VERSION } from '@/lib/boch/vendor/contracts'
import {
  bochPublicHealth,
  bochSessionCookieOptions,
  getBochSessionCookieName,
  getPublicBochRuntime,
  newVisitorSessionId,
} from '@/lib/boch/server'
import { DurableKvSessionStore } from '@/lib/boch/kv-session-store'
import {
  decodeVisitorSession,
  encodeVisitorSession,
  SESSION_CONTEXT_COOKIE,
} from '@/lib/boch/session-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CLIENT = { name: 'jackos', version: '0.1.0' }

async function readOrCreateSessionId(request: Request) {
  const store = await cookies()
  const existing = store.get(getBochSessionCookieName())?.value
  if (existing && /^sess_[a-z0-9]+$/i.test(existing)) return existing
  const created = newVisitorSessionId()
  store.set(getBochSessionCookieName(), created, bochSessionCookieOptions(request))
  return created
}

async function hydrateVisitorSession(sessionId: string) {
  const boch = getPublicBochRuntime()
  if (boch.sessions instanceof DurableKvSessionStore) {
    await boch.sessions.hydrate(sessionId)
  }
  if (boch.sessions.getSession(sessionId)) return
  const store = await cookies()
  const packed = store.get(SESSION_CONTEXT_COOKIE)?.value
  const restored = await decodeVisitorSession(packed, sessionId)
  if (restored) boch.sessions.replaceSession(restored)
}

async function persistVisitorSession(request: Request, sessionId: string) {
  const session = getPublicBochRuntime().sessions.getSession(sessionId)
  if (!session) return
  const packed = await encodeVisitorSession(session)
  if (!packed) return
  const store = await cookies()
  store.set(SESSION_CONTEXT_COOKIE, packed, bochSessionCookieOptions(request))
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      {
        contractVersion: PUBLIC_CONTRACT_VERSION,
        requestId: '',
        text: 'Invalid request.',
        emotion: 'annoyed',
        energy: 0.4,
        expression: 'ANNOYED',
        actions: [],
        error: { code: 'INVALID_REQUEST', message: 'Invalid JSON.' },
      },
      { status: 400 },
    )
  }

  const rec = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  if (rec.profile != null || rec.deploymentProfile != null || rec.deployment === 'PERSONAL' || rec.deploymentId === 'PERSONAL') {
    return Response.json(
      {
        contractVersion: PUBLIC_CONTRACT_VERSION,
        requestId: String(rec.requestId || ''),
        text: 'Deployment is fixed by the runtime.',
        emotion: 'annoyed',
        energy: 0.4,
        expression: 'ANNOYED',
        actions: [],
        error: { code: 'INVALID_REQUEST', message: 'Deployment is fixed by the runtime.' },
      },
      { status: 400 },
    )
  }
  const sessionId = await readOrCreateSessionId(request)
  await hydrateVisitorSession(sessionId)
  const bochRequest = createBochRequest({
    contractVersion: Number(rec.contractVersion ?? PUBLIC_CONTRACT_VERSION),
    requestId: String(rec.requestId || ''),
    sessionId,
    text: String(rec.text || ''),
    timestamp: Number(rec.timestamp || Date.now()),
    client: CLIENT,
  })

  const response = await getPublicBochRuntime().send(bochRequest)
  await persistVisitorSession(request, sessionId)
  return Response.json(response)
}

export async function GET() {
  const snapshot = getPublicBochRuntime().snapshot()
  const health = bochPublicHealth()
  return Response.json({
    deployment: snapshot.deployment,
    status: snapshot.status,
    hasPrivateMemory: snapshot.hasPrivateMemory,
    hasScheduler: snapshot.hasScheduler,
    provider: health.provider,
    voice: health.voice,
    sessions: health.sessions,
  })
}

import { cookies } from 'next/headers'
import {
  bochSessionCookieOptions,
  getBochSessionCookieName,
  getPublicBochRuntime,
  newVisitorSessionId,
} from '@/lib/boch/server'
import { SESSION_CONTEXT_COOKIE } from '@/lib/boch/session-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const store = await cookies()
  const previous = store.get(getBochSessionCookieName())?.value
  if (previous) getPublicBochRuntime().sessions.clearSession(previous)
  const next = newVisitorSessionId()
  store.set(getBochSessionCookieName(), next, bochSessionCookieOptions(request))
  store.set(SESSION_CONTEXT_COOKIE, '', { ...bochSessionCookieOptions(request), maxAge: 0 })
  return Response.json({ ok: true, sessionId: 'rotated' })
}

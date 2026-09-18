import { cookies } from 'next/headers'
import {
  bochSessionCookieOptions,
  getBochSessionCookieName,
  getPublicBochRuntime,
  newVisitorSessionId,
} from '@/lib/boch/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** PUBLIC JackOS speech is Fenrir in the browser. This route no longer synthesizes. */

export async function POST(request: Request) {
  const store = await cookies()
  let sessionId = store.get(getBochSessionCookieName())?.value
  if (!sessionId || !/^sess_[a-z0-9]+$/i.test(sessionId)) {
    sessionId = newVisitorSessionId()
    store.set(getBochSessionCookieName(), sessionId, bochSessionCookieOptions(request))
  }
  getPublicBochRuntime().rateLimit.check(`speak:${sessionId}`)
  return Response.json(
    { error: 'CLIENT_VOICE', message: 'BOCH speaks in the browser.' },
    { status: 410 },
  )
}

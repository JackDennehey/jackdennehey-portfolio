import { cookies } from 'next/headers'
import {
  bochSessionCookieOptions,
  getBochSessionCookieName,
  getPublicBochRuntime,
  newVisitorSessionId,
} from '@/lib/boch/server'
import { synthesizePublicSpeech } from '@/lib/boch/tts'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'INVALID_REQUEST' }, { status: 400 })
  }
  const rec = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const text = String(rec.text || rec.spokenText || '').trim()
  if (!text) return Response.json({ error: 'INVALID_REQUEST' }, { status: 400 })
  if (text.length > 1000) return Response.json({ error: 'INVALID_REQUEST' }, { status: 400 })

  const store = await cookies()
  let sessionId = store.get(getBochSessionCookieName())?.value
  if (!sessionId || !/^sess_[a-z0-9]+$/i.test(sessionId)) {
    sessionId = newVisitorSessionId()
    store.set(getBochSessionCookieName(), sessionId, bochSessionCookieOptions(request))
  }

  const limited = getPublicBochRuntime().rateLimit.check(`speak:${sessionId}`)
  if (!limited.allowed) {
    return Response.json({ error: 'RATE_LIMITED' }, { status: 429 })
  }

  try {
    const spoken = await synthesizePublicSpeech(
      text,
      String(rec.emotion || 'neutral'),
      Number(rec.energy) || 0.5,
    )
    if (!spoken) {
      return Response.json({ error: 'VOICE_UNAVAILABLE' }, { status: 503 })
    }
    return new Response(Buffer.from(spoken.audio), {
      status: 200,
      headers: {
        'Content-Type': spoken.contentType,
        'Cache-Control': 'no-store',
        'X-BOCH-Voice': spoken.engine,
      },
    })
  } catch {
    return Response.json({ error: 'VOICE_UNAVAILABLE' }, { status: 503 })
  }
}

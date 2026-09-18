/** Compact signed visitor session cookie. Durable across serverless instances without Personal memory. */

import type { PublicSession, PublicSessionFocus, PublicSessionTurn } from './vendor/session-store'

export const SESSION_CONTEXT_COOKIE = 'jackos-boch-ctx'

type CompactTurn = { r: 'u' | 'a'; x: string; k?: string[] }
type CompactSession = {
  v: 1
  sid: string
  c: number
  u: number
  f: PublicSessionFocus | null
  t: CompactTurn[]
}

export function sessionSecret() {
  return process.env.BOCH_SESSION_SECRET || process.env.GUESTBOOK_FINGERPRINT_SECRET || ''
}

export function canPersistVisitorSession() {
  return Boolean(sessionSecret())
}

export async function encodeVisitorSession(session: PublicSession): Promise<string | null> {
  const secret = sessionSecret()
  if (!secret) return null
  const compact: CompactSession = {
    v: 1,
    sid: session.sessionId,
    c: session.createdAt,
    u: session.updatedAt,
    f: session.focus,
    t: session.recentContext.slice(-12).map((turn) => ({
      r: turn.role === 'assistant' ? 'a' : 'u',
      x: String(turn.text || '').slice(0, 700),
      k: turn.knowledgeIds?.slice(0, 4),
    })),
  }
  const body = Buffer.from(JSON.stringify(compact), 'utf8').toString('base64url')
  const sig = await sign(body, secret)
  const packed = `${sig}.${body}`
  return packed.length > 3500 ? null : packed
}

export async function decodeVisitorSession(raw: string | undefined, sessionId: string): Promise<PublicSession | null> {
  const secret = sessionSecret()
  if (!secret || !raw) return null
  const dot = raw.indexOf('.')
  if (dot < 10) return null
  const sig = raw.slice(0, dot)
  const body = raw.slice(dot + 1)
  const expected = await sign(body, secret)
  if (!timingSafeEqual(sig, expected)) return null
  try {
    const compact = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as CompactSession
    if (compact.v !== 1 || compact.sid !== sessionId) return null
    const recentContext: PublicSessionTurn[] = (compact.t || []).map((turn) => ({
      role: turn.r === 'a' ? 'assistant' : 'user',
      text: String(turn.x || '').slice(0, 2000),
      at: compact.u,
      knowledgeIds: Array.isArray(turn.k) ? turn.k.slice(0, 5) : [],
      actions: [],
    }))
    return {
      sessionId: compact.sid,
      createdAt: Number(compact.c) || Date.now(),
      updatedAt: Number(compact.u) || Date.now(),
      recentContext,
      focus: compact.f || null,
    }
  } catch {
    return null
  }
}

async function sign(body: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return Buffer.from(mac).toString('base64url')
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

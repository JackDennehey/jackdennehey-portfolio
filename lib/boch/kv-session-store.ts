/** Optional Upstash/Vercel KV session adapter. Used when REST credentials exist. */

import { PublicSessionStore, type PublicSession } from './vendor/session-store'

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

export function durableKvConfigured() {
  return Boolean(kvConfig())
}

export class DurableKvSessionStore extends PublicSessionStore {
  override appendTurn(
    sessionId: string,
    turn: { role?: string; text?: string; knowledgeIds?: string[]; actions?: unknown[]; focus?: PublicSession['focus'] },
  ) {
    const result = super.appendTurn(sessionId, {
      ...turn,
      focus: turn.focus ?? undefined,
    })
    if (result.ok) void persist(result.session)
    return result
  }

  override setFocus(sessionId: string, focus: PublicSession['focus']) {
    const result = super.setFocus(sessionId, focus)
    const session = super.getSession(sessionId)
    if (result.ok && session) void persist(session)
    return result
  }

  override clearSession(sessionId: string) {
    const result = super.clearSession(sessionId)
    void kvDel(`boch:sess:${sessionId}`)
    return result
  }

  async hydrate(sessionId: string) {
    if (super.getSession(sessionId)) return
    const stored = await kvGet(`boch:sess:${sessionId}`)
    if (!stored) return
    try {
      const session = JSON.parse(stored) as PublicSession
      if (session.sessionId !== sessionId) return
      super.replaceSession(session)
    } catch {
      /* ignore corrupt */
    }
  }

  override snapshot() {
    return { ...super.snapshot(), durable: 'kv' as const }
  }
}

async function persist(session: PublicSession) {
  await kvSet(`boch:sess:${session.sessionId}`, JSON.stringify(session), 60 * 60)
}

async function kvGet(key: string) {
  const cfg = kvConfig()
  if (!cfg) return null
  try {
    const response = await fetch(`${cfg.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(2500),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { result?: string | null }
    return data.result || null
  } catch {
    return null
  }
}

async function kvSet(key: string, value: string, ttlSec: number) {
  const cfg = kvConfig()
  if (!cfg) return
  await fetch(`${cfg.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${ttlSec}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}` },
    signal: AbortSignal.timeout(2500),
  }).catch(() => undefined)
}

async function kvDel(key: string) {
  const cfg = kvConfig()
  if (!cfg) return
  await fetch(`${cfg.url}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}` },
    signal: AbortSignal.timeout(2500),
  }).catch(() => undefined)
}

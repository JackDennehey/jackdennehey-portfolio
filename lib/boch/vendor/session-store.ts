export type PublicSessionFocus = {
  projectId?: string
  title?: string
  knowledgeId?: string
}

export type PublicSessionTurn = {
  role: string
  text: string
  at: number
  knowledgeIds: string[]
  actions: unknown[]
}

export type PublicSession = {
  sessionId: string
  createdAt: number
  updatedAt: number
  recentContext: PublicSessionTurn[]
  focus: PublicSessionFocus | null
}

export class PublicSessionStore {
  private _sessions = new Map<string, PublicSession>()
  maxTurns: number
  maxAgeMs: number
  maxIdleMs: number
  nowFn: () => number
  status = 'READY'

  constructor({
    maxTurns = 12,
    maxAgeMs = 60 * 60 * 1000,
    maxIdleMs = 30 * 60 * 1000,
    nowFn = () => Date.now(),
  }: {
    maxTurns?: number
    maxAgeMs?: number
    maxIdleMs?: number
    nowFn?: () => number
  } = {}) {
    this.maxTurns = maxTurns
    this.maxAgeMs = maxAgeMs
    this.maxIdleMs = maxIdleMs
    this.nowFn = nowFn
  }

  createSession(sessionId?: string): PublicSession {
    const id = String(sessionId || `sess_${this.nowFn().toString(36)}_${Math.random().toString(36).slice(2, 8)}`)
    const now = this.nowFn()
    const session: PublicSession = {
      sessionId: id,
      createdAt: now,
      updatedAt: now,
      recentContext: [],
      focus: null,
    }
    this._sessions.set(id, session)
    return clone(session)
  }

  getSession(sessionId: string) {
    const s = this._sessions.get(String(sessionId || ''))
    if (!s) return null
    if (this.expired(s)) {
      this._sessions.delete(s.sessionId)
      return null
    }
    return clone(s)
  }

  ensureSession(sessionId?: string) {
    const existing = sessionId ? this.getSession(sessionId) : null
    if (existing) return existing
    return this.createSession(sessionId || undefined)
  }

  appendTurn(
    sessionId: string,
    turn: { role?: string; text?: string; knowledgeIds?: string[]; actions?: unknown[]; focus?: PublicSessionFocus },
  ) {
    const s = this._sessions.get(String(sessionId || ''))
    if (!s) return { ok: false as const, error: 'SESSION_EXPIRED' }
    if (this.expired(s)) {
      this._sessions.delete(s.sessionId)
      return { ok: false as const, error: 'SESSION_EXPIRED' }
    }
    const entry: PublicSessionTurn = {
      role: String(turn.role || 'user'),
      text: String(turn.text || '').slice(0, 2000),
      at: this.nowFn(),
      knowledgeIds: Array.isArray(turn.knowledgeIds) ? turn.knowledgeIds.slice(0, 5) : [],
      actions: Array.isArray(turn.actions) ? turn.actions.slice(0, 3) : [],
    }
    s.recentContext.push(entry)
    while (s.recentContext.length > this.maxTurns) s.recentContext.shift()
    if (turn.focus) s.focus = { ...turn.focus }
    s.updatedAt = this.nowFn()
    return { ok: true as const, session: clone(s) }
  }

  setFocus(sessionId: string, focus: PublicSessionFocus | null) {
    const s = this._sessions.get(String(sessionId || ''))
    if (!s || this.expired(s)) return { ok: false as const }
    s.focus = focus ? { ...focus } : null
    s.updatedAt = this.nowFn()
    return { ok: true as const }
  }

  replaceSession(session: PublicSession) {
    const now = this.nowFn()
    const next: PublicSession = {
      sessionId: session.sessionId,
      createdAt: session.createdAt || now,
      updatedAt: session.updatedAt || now,
      recentContext: Array.isArray(session.recentContext) ? session.recentContext.slice(-this.maxTurns) : [],
      focus: session.focus || null,
    }
    if (this.expired(next)) return { ok: false as const }
    this._sessions.set(next.sessionId, next)
    return { ok: true as const, session: clone(next) }
  }

  clearSession(sessionId: string) {
    this._sessions.delete(String(sessionId || ''))
    return { ok: true as const }
  }

  expireSession(sessionId: string) {
    return this.clearSession(sessionId)
  }

  sweep() {
    let n = 0
    for (const [id, s] of this._sessions) {
      if (this.expired(s)) {
        this._sessions.delete(id)
        n++
      }
    }
    return n
  }

  private expired(s: PublicSession) {
    const now = this.nowFn()
    if (now - s.createdAt > this.maxAgeMs) return true
    if (now - s.updatedAt > this.maxIdleMs) return true
    return false
  }

  snapshot() {
    return { status: this.status, sessions: this._sessions.size }
  }
}

function clone<T>(s: T): T {
  return JSON.parse(JSON.stringify(s)) as T
}

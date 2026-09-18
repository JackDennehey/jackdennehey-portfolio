export class RateLimitPolicy {
  maxRequests: number
  windowMs: number
  nowFn: () => number
  private _hits = new Map<string, number[]>()

  constructor({
    maxRequests = Number.POSITIVE_INFINITY,
    windowMs = 60000,
    nowFn = () => Date.now(),
  }: {
    maxRequests?: number
    windowMs?: number
    nowFn?: () => number
  } = {}) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.nowFn = nowFn
  }

  check(key = 'default'): { allowed: boolean; retryAfterMs?: number } {
    if (this.maxRequests === Number.POSITIVE_INFINITY) return { allowed: true }
    const now = this.nowFn()
    const k = String(key || 'default')
    let arr = this._hits.get(k) || []
    arr = arr.filter((t) => now - t < this.windowMs)
    if (arr.length >= this.maxRequests) {
      const oldest = arr[0] || now
      this._hits.set(k, arr)
      return { allowed: false, retryAfterMs: Math.max(0, this.windowMs - (now - oldest)) }
    }
    arr.push(now)
    this._hits.set(k, arr)
    return { allowed: true }
  }

  reset(key?: string) {
    if (key == null) this._hits.clear()
    else this._hits.delete(String(key))
  }
}

export class AllowAllRateLimit {
  check() {
    return { allowed: true as const }
  }
  reset() {}
}

export class CompoundRateLimit {
  constructor(
    private session: RateLimitPolicy,
    private global: RateLimitPolicy,
  ) {}

  check(key = 'default') {
    const global = this.global.check('global')
    if (!global.allowed) return global
    return this.session.check(key)
  }

  reset(key?: string) {
    this.session.reset(key)
    if (key == null) this.global.reset()
  }
}

export type RateLimitHook = {
  check: (key?: string) => { allowed: boolean; retryAfterMs?: number }
  reset?: (key?: string) => void
}

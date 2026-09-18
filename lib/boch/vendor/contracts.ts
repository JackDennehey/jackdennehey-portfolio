/** Portable JackOS / PUBLIC BOCH contracts — JSON-serializable only. M6 contractVersion 1. */

export const PUBLIC_CONTRACT_VERSION = 1

export const PUBLIC_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'INVALID_REQUEST',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  KNOWLEDGE_NOT_FOUND: 'KNOWLEDGE_NOT_FOUND',
  ACTION_DENIED: 'ACTION_DENIED',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  UNSUPPORTED_CONTRACT: 'UNSUPPORTED_CONTRACT',
})

export type PublicErrorCode = (typeof PUBLIC_ERROR_CODES)[keyof typeof PUBLIC_ERROR_CODES]

export const PUBLIC_EXPRESSIONS = Object.freeze([
  'NORMAL',
  'HAPPY',
  'SMUG',
  'ANNOYED',
  'ANGRY',
  'SURPRISED',
  'SUSPICIOUS',
  'DEADPAN',
  'THINKING',
  'SLEEP',
  'CURIOUS',
  'CONFUSED',
] as const)

export type PublicExpression = (typeof PUBLIC_EXPRESSIONS)[number]

export const PUBLIC_ACTION_TYPES = Object.freeze([
  'OPEN_APP',
  'OPEN_PROJECT',
  'OPEN_RESUME',
  'OPEN_CONTACT',
  'OPEN_ABOUT',
  'OPEN_URL',
  'FOCUS_WINDOW',
  'SHOW_NOTIFICATION',
] as const)

export type PublicActionType = (typeof PUBLIC_ACTION_TYPES)[number]

export const PUBLIC_DEFAULT_LIMITS = Object.freeze({
  maxMessageLength: 2000,
  maxContextTurns: 12,
  maxActionsPerResponse: 3,
  maxKnowledgeResults: 5,
  maxSessionAgeMs: 60 * 60 * 1000,
  maxIdleMs: 30 * 60 * 1000,
})

export type PublicLimits = typeof PUBLIC_DEFAULT_LIMITS

export type BochClientInfo = {
  name: string
  version: string
}

export type BochRequest = {
  contractVersion: number
  requestId: string
  sessionId: string
  text: string
  timestamp: number
  client: BochClientInfo
  context?: Record<string, unknown>
}

export type BochAction = {
  type: PublicActionType
  payload: Record<string, string>
}

export type PublicModelDiagnosis = {
  sent: boolean
  hasKey: boolean
  status: number | null
  class: string
  model: string
  cause: string
  body: string
}

export type BochError = {
  code: PublicErrorCode
  message: string
}

export type BochSourceMetadata = {
  type: string
  id: string
}

export type BochResponse = {
  contractVersion: number
  requestId: string
  text: string
  spokenText?: string
  emotion: string
  energy: number
  expression: PublicExpression
  actions: BochAction[]
  suggestions?: string[]
  sourceMetadata?: BochSourceMetadata[]
  error?: BochError
}

export function createBochRequest(raw: Partial<BochRequest> = {}): BochRequest {
  return {
    contractVersion: raw.contractVersion == null ? PUBLIC_CONTRACT_VERSION : Number(raw.contractVersion),
    requestId: String(raw.requestId || `req_${Date.now().toString(36)}`),
    sessionId: String(raw.sessionId || ''),
    text: String(raw.text || ''),
    timestamp: Number(raw.timestamp || Date.now()),
    client:
      raw.client && typeof raw.client === 'object'
        ? { name: String(raw.client.name || 'unknown'), version: String(raw.client.version || '0') }
        : { name: 'unknown', version: '0' },
    context: raw.context && typeof raw.context === 'object' ? sanitizeContext(raw.context) : undefined,
  }
}

export function createBochResponse(partial: {
  requestId?: string
  text?: string
  spokenText?: string
  emotion?: string
  energy?: number
  expression?: string
  actions?: unknown[]
  suggestions?: string[]
  sourceMetadata?: BochSourceMetadata[]
  error?: BochError | null
  contractVersion?: number
}): BochResponse {
  const text = String(partial.text || '')
  const out: BochResponse = {
    contractVersion: partial.contractVersion == null ? PUBLIC_CONTRACT_VERSION : Number(partial.contractVersion),
    requestId: String(partial.requestId || ''),
    text,
    spokenText: String(partial.spokenText || spokenForm(text)),
    emotion: String(partial.emotion || 'neutral'),
    energy: clampEnergy(partial.energy),
    expression: normalizePublicExpression(partial.expression || partial.emotion),
    actions: Array.isArray(partial.actions) ? partial.actions.map(sanitizeAction).filter((a): a is BochAction => Boolean(a)) : [],
  }
  if (partial.suggestions) out.suggestions = partial.suggestions.slice(0, 5).map(String)
  if (partial.sourceMetadata) out.sourceMetadata = partial.sourceMetadata
  if (partial.error) out.error = sanitizeError(partial.error)
  return out
}

export function createBochError(code: string, message: string): BochError {
  return sanitizeError({ code, message })
}

export function sanitizeError(
  err: { code?: string; message?: string; diagnosis?: unknown } | null | undefined,
): BochError {
  if (!err || typeof err !== 'object') {
    return { code: PUBLIC_ERROR_CODES.INTERNAL_ERROR, message: 'Something went wrong.' }
  }
  const values = Object.values(PUBLIC_ERROR_CODES)
  const code = values.includes(err.code as PublicErrorCode)
    ? (err.code as PublicErrorCode)
    : PUBLIC_ERROR_CODES.INTERNAL_ERROR
  return {
    code,
    message: String(err.message || 'Something went wrong.').slice(0, 240),
  }
}

function sanitizeAction(a: unknown): BochAction | null {
  if (!a || typeof a !== 'object') return null
  const rec = a as { type?: string; payload?: Record<string, unknown> }
  const type = String(rec.type || '')
  if (!(PUBLIC_ACTION_TYPES as readonly string[]).includes(type)) return null
  const payload = rec.payload && typeof rec.payload === 'object' ? { ...rec.payload } : {}
  return JSON.parse(JSON.stringify({ type, payload })) as BochAction
}

function sanitizeContext(ctx: Record<string, unknown>) {
  try {
    return JSON.parse(JSON.stringify(ctx)) as Record<string, unknown>
  } catch {
    return undefined
  }
}

export function normalizePublicExpression(value: string | undefined): PublicExpression {
  const raw = String(value || 'NORMAL').toUpperCase()
  const map: Record<string, PublicExpression> = {
    NEUTRAL: 'NORMAL',
    FOCUSED: 'THINKING',
    EXCITED: 'HAPPY',
    SLEEPY: 'SLEEP',
    TIRED: 'SLEEP',
    DEADPAN: 'DEADPAN',
  }
  const mapped = map[raw] || raw
  return (PUBLIC_EXPRESSIONS as readonly string[]).includes(mapped)
    ? (mapped as PublicExpression)
    : 'NORMAL'
}

function clampEnergy(n: number | undefined) {
  const v = Number(n)
  if (!Number.isFinite(v)) return 0.5
  return Math.max(0, Math.min(1, v))
}

export function spokenForm(text: string) {
  return String(text || '')
    .replace(/\bBOCH\b/g, 'BOCK')
    .replace(/\bBoch\b/g, 'Bock')
    .replace(/\bboch\b/g, 'bock')
}

export function roundTripBoch<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

export function validateBochRequest(req: BochRequest, limits = PUBLIC_DEFAULT_LIMITS) {
  if (!req || typeof req !== 'object') {
    return { ok: false as const, error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'Invalid request.') }
  }
  if (Number(req.contractVersion) !== PUBLIC_CONTRACT_VERSION) {
    return {
      ok: false as const,
      error: createBochError(
        PUBLIC_ERROR_CODES.UNSUPPORTED_CONTRACT,
        `Unsupported contractVersion. Expected ${PUBLIC_CONTRACT_VERSION}.`,
      ),
    }
  }
  if (!req.sessionId) {
    return { ok: false as const, error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'sessionId is required.') }
  }
  if (!req.requestId) {
    return { ok: false as const, error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'requestId is required.') }
  }
  const text = String(req.text || '')
  if (!text.trim()) {
    return { ok: false as const, error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'text is required.') }
  }
  if (text.length > limits.maxMessageLength) {
    return { ok: false as const, error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'Message too long.') }
  }
  const extra = req as BochRequest & { profile?: unknown; deploymentProfile?: unknown; deploymentId?: string }
  if (extra.profile != null || extra.deploymentProfile != null || extra.deploymentId === 'PERSONAL') {
    return {
      ok: false as const,
      error: createBochError(PUBLIC_ERROR_CODES.INVALID_REQUEST, 'Deployment is fixed by the runtime.'),
    }
  }
  return { ok: true as const }
}

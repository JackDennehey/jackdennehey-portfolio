import crypto from 'node:crypto'
import {
  GUESTBOOK_DISPLAY_NAME_LIMIT,
  GUESTBOOK_MESSAGE_LIMIT,
  GUESTBOOK_ORGANIZATION_LIMIT,
  GUESTBOOK_PAGE_SIZE,
  type GuestbookAdminEntry,
  type GuestbookFieldErrors,
  type GuestbookPublicEntry,
  type GuestbookSubmitPayload,
  type GuestbookSubmitResponse,
} from './guestbook'

type GuestbookStatus = 'pending' | 'approved' | 'rejected' | 'blocked'
type ModerationOutcome = 'pending-clean' | 'pending-flagged' | 'blocked'

type GuestbookConfig = {
  supabaseUrl: string
  supabaseServiceRoleKey: string
  supabaseAnonKey: string
  turnstileSecretKey: string
  fingerprintSecret: string
  adminEmail: string
}

type SanitizedGuestbookInput = {
  displayName: string
  organization: string | null
  message: string
}

type ModerationResult = {
  outcome: ModerationOutcome
  reason: string | null
  flags: string[]
}

const SERVER_ERROR_MESSAGE = 'The Guestbook is temporarily unavailable. Please try again later.'
const SUBMISSION_REJECTED_MESSAGE =
  'This message could not be submitted. Review the Guestbook guidelines and try again.'
const SUCCESS_DETAIL = 'Guestbook entries are reviewed before they appear publicly.'
const REQUEST_SIZE_LIMIT = 16_000
const SUBMISSION_LIMIT_PER_DAY = 3
const SUBMISSION_COOLDOWN_MS = 90_000
const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF\u2060]/g
const URL_RE =
  /\b(?:https?:\/\/|www\.|[a-z0-9][a-z0-9-]{1,63}\.(?:com|net|org|io|co|edu|gov|app|dev|xyz|info|biz)\b)/i
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const PHONE_RE = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}/
const SCRIPT_RE = /<\s*script|javascript\s*:|onerror\s*=|onload\s*=|data\s*:/i
const REPEATED_CHARACTER_RE = /(.)\1{12,}/u
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g
const MARKDOWN_LINK_TEST_RE = /\[[^\]]+\]\([^)]+\)/
const HTML_TAG_RE = /<[^>]*>/g
const HTML_TAG_TEST_RE = /<[^>]*>/

const MODERATION_CATEGORIES = [
  'racial or ethnic slurs',
  'religious hate',
  'misogynistic or gender-based slurs',
  'anti-LGBTQ harassment',
  'disability-based slurs',
  'explicit sexual content',
  'sexual harassment',
  'threats of violence',
  'encouragement of violence',
  'targeted harassment',
  'self-harm encouragement',
  'extremist praise or recruitment',
  'spam',
  'scams',
  'gambling promotion',
  'drug sales',
  'pornography promotion',
  'doxxing or personal-information exposure',
  'URLs and promotional links',
  'impersonation attempts',
  'script or injection attempts',
] as const

type ModerationCategory = (typeof MODERATION_CATEGORIES)[number]

const SERVER_ONLY_MODERATION_RULES: Array<{
  category: ModerationCategory
  terms: string[]
  hard: boolean
}> = [
  {
    category: 'script or injection attempts',
    terms: ['script', 'javascript', 'onerror', 'onload', 'iframe', 'document.cookie'],
    hard: true,
  },
  {
    category: 'URLs and promotional links',
    terms: ['http', 'www', 'dot com', 'visit my site'],
    hard: true,
  },
  {
    category: 'spam',
    terms: ['buy now', 'free money', 'limited offer', 'promo code', 'crypto giveaway'],
    hard: true,
  },
  {
    category: 'scams',
    terms: ['wire transfer', 'gift card', 'investment return', 'wallet recovery'],
    hard: true,
  },
  {
    category: 'gambling promotion',
    terms: ['casino bonus', 'sportsbook', 'betting odds'],
    hard: true,
  },
  {
    category: 'drug sales',
    terms: ['buy pills', 'shipping discreet', 'online pharmacy'],
    hard: true,
  },
  {
    category: 'pornography promotion',
    terms: ['adult site', 'explicit video'],
    hard: true,
  },
  {
    category: 'threats of violence',
    terms: ['i will hurt', 'i will kill', 'going to kill'],
    hard: true,
  },
  {
    category: 'self-harm encouragement',
    terms: ['hurt yourself', 'kill yourself'],
    hard: true,
  },
  {
    category: 'targeted harassment',
    terms: ['you are worthless', 'everyone hates you'],
    hard: false,
  },
  {
    category: 'impersonation attempts',
    terms: ['i am jack dennehey', 'official jack support'],
    hard: false,
  },
]

function getEnv(name: string) {
  return process.env[name]?.trim() ?? ''
}

export function getGuestbookConfigStatus() {
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const turnstileSiteKey = getEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY')
  const turnstileSecretKey = getEnv('TURNSTILE_SECRET_KEY')
  const fingerprintSecret = getEnv('GUESTBOOK_FINGERPRINT_SECRET')
  const adminEmail = getEnv('GUESTBOOK_ADMIN_EMAIL')

  return {
    canRead: Boolean(supabaseUrl && serviceKey),
    canSubmit: Boolean(supabaseUrl && serviceKey && turnstileSecretKey && fingerprintSecret),
    canModerate: Boolean(supabaseUrl && serviceKey && anonKey && adminEmail),
    hasTurnstileSiteKey: Boolean(turnstileSiteKey),
    turnstileSiteKey,
  }
}

function getGuestbookConfig(): GuestbookConfig | null {
  const status = getGuestbookConfigStatus()
  if (!status.canRead) return null

  return {
    supabaseUrl: getEnv('NEXT_PUBLIC_SUPABASE_URL').replace(/\/$/, ''),
    supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseAnonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    turnstileSecretKey: getEnv('TURNSTILE_SECRET_KEY'),
    fingerprintSecret: getEnv('GUESTBOOK_FINGERPRINT_SECRET'),
    adminEmail: getEnv('GUESTBOOK_ADMIN_EMAIL').toLowerCase(),
  }
}

function getSubmissionConfig(): GuestbookConfig | null {
  const config = getGuestbookConfig()
  if (!config?.turnstileSecretKey || !config.fingerprintSecret) return null
  return config
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''

  return collapseWhitespace(
    value
      .slice(0, REQUEST_SIZE_LIMIT)
      .normalize('NFKC')
      .replace(/\0/g, '')
      .replace(ZERO_WIDTH_RE, '')
      .replace(MARKDOWN_LINK_RE, '$1')
      .replace(HTML_TAG_RE, ''),
  )
}

function validateGuestbookPayload(payload: GuestbookSubmitPayload): {
  input?: SanitizedGuestbookInput
  response?: GuestbookSubmitResponse
} {
  const rawCombined = [payload.displayName, payload.organization, payload.message]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')

  if (
    rawCombined.includes('\0') ||
    SCRIPT_RE.test(rawCombined) ||
    HTML_TAG_TEST_RE.test(rawCombined) ||
    MARKDOWN_LINK_TEST_RE.test(rawCombined) ||
    URL_RE.test(rawCombined)
  ) {
    return {
      response: {
        ok: false,
        code: 'moderation',
        message: SUBMISSION_REJECTED_MESSAGE,
      },
    }
  }

  const displayName = sanitizeText(payload.displayName)
  const organization = sanitizeText(payload.organization ?? '')
  const message = sanitizeText(payload.message)
  const fieldErrors: GuestbookFieldErrors = {}

  if (displayName.length < 2 || displayName.length > GUESTBOOK_DISPLAY_NAME_LIMIT) {
    fieldErrors.displayName = 'Use 2 to 50 characters.'
  }
  if (organization.length > GUESTBOOK_ORGANIZATION_LIMIT) {
    fieldErrors.organization = 'Use 80 characters or fewer.'
  }
  if (message.length < 5 || message.length > GUESTBOOK_MESSAGE_LIMIT) {
    fieldErrors.message = 'Use 5 to 500 characters.'
  }
  if (payload.consent !== true) {
    fieldErrors.consent = 'Confirm that approved entries may appear publicly.'
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      response: {
        ok: false,
        code: 'validation',
        message: 'Check the highlighted fields and try again.',
        fieldErrors,
      },
    }
  }

  return {
    input: {
      displayName,
      organization: organization || null,
      message,
    },
  }
}

function normalizeModerationText(value: string) {
  return collapseWhitespace(
    value
      .normalize('NFKC')
      .replace(ZERO_WIDTH_RE, '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .toLowerCase(),
  )
}

function reduceRepeatedCharacters(value: string) {
  return value.replace(/(.)\1{2,}/gu, '$1$1')
}

function compactForComparison(value: string) {
  return value.replace(/[^a-z0-9]/g, '')
}

function applyLeetspeakMap(value: string) {
  return value.replace(/[0123456789@$!|]/g, (character) => {
    const map: Record<string, string> = {
      '0': 'o',
      '1': 'i',
      '2': 's',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '6': 'g',
      '7': 't',
      '8': 'b',
      '9': 'g',
      '@': 'a',
      '$': 's',
      '!': 'i',
      '|': 'i',
    }
    return map[character] ?? character
  })
}

function createModerationCandidates(value: string) {
  const base = normalizeModerationText(value)
  const reduced = reduceRepeatedCharacters(base)
  const leet = applyLeetspeakMap(reduced)
  const candidates = [base, reduced, leet].flatMap((candidate) => {
    const compact = compactForComparison(candidate)
    return [candidate, compact, compact.split('').reverse().join('')]
  })

  return Array.from(new Set(candidates.filter(Boolean)))
}

function hasExcessiveEmoji(value: string) {
  const matches = value.match(/\p{Extended_Pictographic}/gu)
  return (matches?.length ?? 0) > 12
}

function hasExcessivePunctuation(value: string) {
  return (value.match(/[!?.,;:]/g)?.length ?? 0) > 36
}

function hasExcessiveCaps(value: string) {
  const letters = value.replace(/[^a-z]/gi, '')
  if (letters.length < 24) return false
  const uppercase = letters.replace(/[^A-Z]/g, '')
  return uppercase.length / letters.length > 0.86
}

function moderateInput(input: SanitizedGuestbookInput): ModerationResult {
  const combined = `${input.displayName} ${input.organization ?? ''} ${input.message}`
  const candidates = createModerationCandidates(combined)
  const flags: string[] = []
  let hardBlock = false

  if (URL_RE.test(combined)) {
    flags.push('URLs and promotional links')
    hardBlock = true
  }
  if (EMAIL_RE.test(combined) || PHONE_RE.test(combined)) {
    flags.push('doxxing or personal-information exposure')
    hardBlock = true
  }
  if (SCRIPT_RE.test(combined)) {
    flags.push('script or injection attempts')
    hardBlock = true
  }
  if (REPEATED_CHARACTER_RE.test(combined) || hasExcessiveEmoji(combined)) {
    flags.push('spam')
    hardBlock = true
  }
  if (hasExcessivePunctuation(combined) || hasExcessiveCaps(combined)) {
    flags.push('spam')
  }

  for (const rule of SERVER_ONLY_MODERATION_RULES) {
    const matched = rule.terms.some((term) => {
      const normalizedTerm = normalizeModerationText(term)
      const compactTerm = compactForComparison(applyLeetspeakMap(normalizedTerm))
      return candidates.some(
        (candidate) => candidate.includes(normalizedTerm) || candidate.includes(compactTerm),
      )
    })
    if (!matched) continue

    flags.push(rule.category)
    if (rule.hard) {
      hardBlock = true
    }
  }

  const uniqueFlags = Array.from(new Set(flags))
  if (hardBlock) {
    return {
      outcome: 'blocked',
      flags: uniqueFlags,
      reason: uniqueFlags.join(', ') || 'blocked',
    }
  }

  if (uniqueFlags.length > 0) {
    return {
      outcome: 'pending-flagged',
      flags: uniqueFlags,
      reason: uniqueFlags.join(', '),
    }
  }

  return { outcome: 'pending-clean', flags: [], reason: null }
}

function normalizeMessageHash(message: string) {
  const normalized = compactForComparison(applyLeetspeakMap(reduceRepeatedCharacters(message)))
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

function getClientIp(headers: Headers) {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

function getUserAgentCategory(headers: Headers) {
  const userAgent = headers.get('user-agent')?.toLowerCase() ?? ''
  if (!userAgent) return 'unknown'
  if (/bot|crawler|spider|preview/.test(userAgent)) return 'automated'
  if (/mobile|iphone|android/.test(userAgent)) return 'mobile'
  return 'desktop'
}

function getDateBucket(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function createSubmissionFingerprint(headers: Headers, secret: string) {
  const ip = getClientIp(headers)
  const userAgentCategory = getUserAgentCategory(headers)
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${getDateBucket()}|${ip}|${userAgentCategory}`)
  return {
    fingerprint: hmac.digest('hex'),
    userAgentCategory,
  }
}

async function verifyTurnstile(token: string, config: GuestbookConfig, headers: Headers) {
  if (process.env.NODE_ENV !== 'production' && config.turnstileSecretKey === 'dev-bypass') {
    return token === 'dev-bypass-token'
  }

  if (!token) return false

  const formData = new FormData()
  formData.set('secret', config.turnstileSecretKey)
  formData.set('response', token)
  const ip = getClientIp(headers)
  if (ip !== 'unknown') {
    formData.set('remoteip', ip)
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    })
    if (!response.ok) return false
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}

async function supabaseRequest<T>(
  config: GuestbookConfig,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Supabase request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

function mapPublicEntry(row: Record<string, unknown>): GuestbookPublicEntry {
  return {
    id: String(row.id),
    displayName: String(row.display_name ?? ''),
    organization: row.organization ? String(row.organization) : null,
    message: String(row.message ?? ''),
    signedAt: String(row.approved_at ?? row.created_at ?? ''),
  }
}

function mapAdminEntry(row: Record<string, unknown>): GuestbookAdminEntry {
  return {
    id: String(row.id),
    displayName: String(row.display_name ?? ''),
    organization: row.organization ? String(row.organization) : null,
    message: String(row.message ?? ''),
    originalText: String(row.original_text ?? row.message ?? ''),
    status: String(row.status ?? 'pending') as GuestbookStatus,
    createdAt: String(row.created_at ?? ''),
    approvedAt: row.approved_at ? String(row.approved_at) : null,
    moderationReason: row.moderation_reason ? String(row.moderation_reason) : null,
    userAgentCategory: row.user_agent_category ? String(row.user_agent_category) : null,
  }
}

export async function listApprovedGuestbookEntries(page: number) {
  const config = getGuestbookConfig()
  if (!config) {
    return { ok: false as const, message: SERVER_ERROR_MESSAGE }
  }

  const safePage = Math.max(0, page)
  const limit = GUESTBOOK_PAGE_SIZE + 1
  const offset = safePage * GUESTBOOK_PAGE_SIZE
  const query = new URLSearchParams({
    select: 'id,display_name,organization,message,approved_at,created_at',
    order: 'approved_at.desc.nullslast,created_at.desc',
    limit: String(limit),
    offset: String(offset),
  })

  try {
    const rows = await supabaseRequest<Array<Record<string, unknown>>>(
      config,
      `/rest/v1/guestbook_public_entries?${query}`,
    )
    const entries = rows.slice(0, GUESTBOOK_PAGE_SIZE).map(mapPublicEntry)
    return {
      ok: true as const,
      entries,
      nextPage: rows.length > GUESTBOOK_PAGE_SIZE ? safePage + 1 : null,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Guestbook read failed', error)
    }
    return { ok: false as const, message: SERVER_ERROR_MESSAGE }
  }
}

async function checkRateLimit(
  config: GuestbookConfig,
  fingerprint: string,
  messageHash: string,
) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const attemptsQuery = new URLSearchParams({
    select: 'id,created_at,status',
    submission_fingerprint: `eq.${fingerprint}`,
    created_at: `gte.${since}`,
    order: 'created_at.desc',
    limit: '4',
  })
  const duplicateQuery = new URLSearchParams({
    select: 'id',
    normalized_message_hash: `eq.${messageHash}`,
    created_at: `gte.${since}`,
    limit: '1',
  })

  const [attempts, duplicates] = await Promise.all([
    supabaseRequest<Array<{ id: string; created_at: string; status: GuestbookStatus }>>(
      config,
      `/rest/v1/guestbook_entries?${attemptsQuery}`,
    ),
    supabaseRequest<Array<{ id: string }>>(
      config,
      `/rest/v1/guestbook_entries?${duplicateQuery}`,
    ),
  ])

  if (duplicates.length > 0) {
    return { allowed: false, reason: 'duplicate' }
  }

  if (attempts.length >= SUBMISSION_LIMIT_PER_DAY) {
    return { allowed: false, reason: 'daily-limit' }
  }

  const lastAttempt = attempts[0]
  if (lastAttempt) {
    const elapsed = Date.now() - new Date(lastAttempt.created_at).getTime()
    if (elapsed < SUBMISSION_COOLDOWN_MS) {
      return { allowed: false, reason: 'cooldown' }
    }
  }

  return { allowed: true, reason: null }
}

async function insertGuestbookEntry({
  config,
  input,
  moderation,
  fingerprint,
  userAgentCategory,
  messageHash,
}: {
  config: GuestbookConfig
  input: SanitizedGuestbookInput
  moderation: ModerationResult
  fingerprint: string
  userAgentCategory: string
  messageHash: string
}) {
  const status: GuestbookStatus = moderation.outcome === 'blocked' ? 'blocked' : 'pending'
  await supabaseRequest(config, '/rest/v1/guestbook_entries', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      display_name: input.displayName,
      organization: input.organization,
      message: input.message,
      original_text: `${input.displayName}\n${input.organization ?? ''}\n${input.message}`,
      normalized_message_hash: messageHash,
      status,
      moderation_reason: moderation.reason,
      submission_fingerprint: fingerprint,
      user_agent_category: userAgentCategory,
    }),
  })

  return status
}

export async function submitGuestbookEntry(
  payload: GuestbookSubmitPayload,
  headers: Headers,
): Promise<GuestbookSubmitResponse> {
  const config = getSubmissionConfig()
  if (!config) {
    return { ok: false, code: 'configuration', message: SERVER_ERROR_MESSAGE }
  }

  const validation = validateGuestbookPayload(payload)
  if (validation.response) {
    return validation.response
  }
  const input = validation.input
  if (!input) {
    return { ok: false, code: 'validation', message: SUBMISSION_REJECTED_MESSAGE }
  }

  const turnstileOk = await verifyTurnstile(payload.turnstileToken, config, headers)
  if (!turnstileOk) {
    return {
      ok: false,
      code: 'turnstile',
      message: 'Verification failed. Refresh the challenge and try again.',
    }
  }

  const { fingerprint, userAgentCategory } = createSubmissionFingerprint(
    headers,
    config.fingerprintSecret,
  )
  const moderation = moderateInput(input)
  const messageHash = normalizeMessageHash(input.message)

  try {
    const rateLimit = await checkRateLimit(config, fingerprint, messageHash)
    if (!rateLimit.allowed) {
      return {
        ok: false,
        code: 'rate_limited',
        message: 'Please wait before submitting another Guestbook entry.',
      }
    }

    const status = await insertGuestbookEntry({
      config,
      input,
      moderation,
      fingerprint,
      userAgentCategory,
      messageHash,
    })

    if (status === 'blocked') {
      return { ok: false, code: 'moderation', message: SUBMISSION_REJECTED_MESSAGE }
    }

    return {
      ok: true,
      status: 'pending',
      message: 'Message received.',
      detail: SUCCESS_DETAIL,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Guestbook submission failed', error)
    }
    return { ok: false, code: 'server', message: SERVER_ERROR_MESSAGE }
  }
}

export async function verifyAdminToken(token: string) {
  const config = getGuestbookConfig()
  if (!config?.supabaseAnonKey || !config.adminEmail) return null

  try {
    const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    if (!response.ok) return null
    const user = (await response.json()) as { email?: string }
    return user.email?.toLowerCase() === config.adminEmail ? config : null
  } catch {
    return null
  }
}

export async function listAdminGuestbookEntries({
  token,
  status,
  search,
  page,
}: {
  token: string
  status: GuestbookStatus
  search: string
  page: number
}) {
  const config = await verifyAdminToken(token)
  if (!config) {
    return { ok: false as const, status: 401, message: 'Unauthorized' }
  }

  const safePage = Math.max(0, page)
  const query = new URLSearchParams({
    select:
      'id,display_name,organization,message,original_text,status,created_at,approved_at,moderation_reason,user_agent_category',
    status: `eq.${status}`,
    order: 'created_at.desc',
    limit: String(GUESTBOOK_PAGE_SIZE),
    offset: String(safePage * GUESTBOOK_PAGE_SIZE),
  })
  const safeSearch = collapseWhitespace(sanitizeText(search).replace(/[,%()*]/g, ' '))
  if (safeSearch) {
    query.set('or', `(display_name.ilike.*${safeSearch}*,message.ilike.*${safeSearch}*)`)
  }

  try {
    const rows = await supabaseRequest<Array<Record<string, unknown>>>(
      config,
      `/rest/v1/guestbook_entries?${query}`,
    )
    return { ok: true as const, entries: rows.map(mapAdminEntry) }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Guestbook admin read failed', error)
    }
    return { ok: false as const, status: 500, message: SERVER_ERROR_MESSAGE }
  }
}

export async function moderateGuestbookEntry({
  token,
  id,
  action,
}: {
  token: string
  id: string
  action: 'approve' | 'reject' | 'block'
}) {
  const config = await verifyAdminToken(token)
  if (!config) {
    return { ok: false as const, status: 401, message: 'Unauthorized' }
  }

  const status: GuestbookStatus =
    action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'blocked'

  try {
    await supabaseRequest(
      config,
      `/rest/v1/guestbook_entries?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        }),
      },
    )
    return { ok: true as const }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Guestbook admin action failed', error)
    }
    return { ok: false as const, status: 500, message: SERVER_ERROR_MESSAGE }
  }
}

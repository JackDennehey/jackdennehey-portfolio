import { PUBLIC_ACTION_TYPES, type BochAction } from './contracts'

const M6_APP_IDS = ['projects', 'resume', 'contact', 'about', 'home', 'skills', 'boch'] as const

/** JackOS expands the M6 app allowlist with real window IDs. Still an explicit list. */
const JACKOS_APP_IDS = [
  ...M6_APP_IDS,
  'portfolio',
  'recruiter',
  'kickoff',
  'pocket-pier',
  'blue-ocean',
  'case-study',
  'certifications',
  'timeline',
  'roadmap',
  'jden-studios',
  'files',
] as const

export const JACKOS_APP_IDS_ALLOWLIST = JACKOS_APP_IDS

type ValidationOk = { ok: true; action: BochAction }
type ValidationDeny = { ok: false; error: string; code: string }

export class JackOSActionValidator {
  urlAllowlist: Set<string>

  constructor({ urlAllowlist = [] as string[] } = {}) {
    this.urlAllowlist = new Set((urlAllowlist || []).map((u) => String(u).toLowerCase()))
  }

  setUrlAllowlist(urls: string[]) {
    this.urlAllowlist = new Set((urls || []).map((u) => String(u).toLowerCase()))
  }

  validate(action: unknown): ValidationOk | ValidationDeny {
    if (!action || typeof action !== 'object') return deny('Malformed action.')
    const rec = action as { type?: string; payload?: Record<string, unknown> }
    const type = String(rec.type || '')
    if (/EXECUTE|EVAL|SHELL|SCRIPT|DOM|SQL|IMPORT/i.test(type) || type === 'EXECUTE_CODE') {
      return deny('Action type denied.', 'ACTION_DENIED')
    }
    if (!(PUBLIC_ACTION_TYPES as readonly string[]).includes(type)) {
      return deny(`Unknown action type: ${type}`, 'ACTION_DENIED')
    }
    for (const key of Object.keys(rec)) {
      if (key !== 'type' && key !== 'payload') return deny('Unexpected action fields.', 'ACTION_DENIED')
    }
    const payload = rec.payload && typeof rec.payload === 'object' ? rec.payload : {}
    switch (type) {
      case 'OPEN_APP':
        return this.openApp(payload)
      case 'OPEN_PROJECT':
        return this.openProject(payload)
      case 'OPEN_RESUME':
      case 'OPEN_CONTACT':
      case 'OPEN_ABOUT':
        return ok({ type, payload: {} })
      case 'OPEN_URL':
        return this.openUrl(payload)
      case 'FOCUS_WINDOW':
        return this.focusWindow(payload)
      case 'SHOW_NOTIFICATION':
        return this.showNotification(payload)
      default:
        return deny('Action type denied.', 'ACTION_DENIED')
    }
  }

  validateMany(actions: unknown, { max = 3 } = {}) {
    if (!Array.isArray(actions)) return { ok: false, actions: [] as BochAction[], errors: ['actions must be an array'] }
    const out: BochAction[] = []
    const errors: string[] = []
    for (const item of actions.slice(0, max)) {
      const result = this.validate(item)
      if (result.ok) out.push(result.action)
      else errors.push(result.error)
    }
    return { ok: errors.length === 0 || out.length > 0, actions: out, errors }
  }

  private openApp(payload: Record<string, unknown>): ValidationOk | ValidationDeny {
    const appId = String(payload.appId || '').toLowerCase().trim()
    if (!appId || !(JACKOS_APP_IDS as readonly string[]).includes(appId)) {
      return deny('Invalid or unknown appId.')
    }
    return ok({ type: 'OPEN_APP', payload: { appId } })
  }

  private openProject(payload: Record<string, unknown>): ValidationOk | ValidationDeny {
    const projectId = String(payload.projectId || '').trim()
    if (!projectId || !/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(projectId)) {
      return deny('Invalid projectId.')
    }
    if (payload.code || payload.script || payload.html) {
      return deny('Unsafe project payload.')
    }
    return ok({ type: 'OPEN_PROJECT', payload: { projectId: projectId.toLowerCase() } })
  }

  private openUrl(payload: Record<string, unknown>): ValidationOk | ValidationDeny {
    const url = String(payload.url || '').trim()
    if (!url) return deny('Missing URL.')
    const lower = url.toLowerCase()
    if (/^(javascript|data|file|vbscript):/i.test(lower)) return deny('Unsafe URL scheme.')
    if (!/^https:\/\//i.test(url)) return deny('Only https URLs are allowed.')
    if (this.urlAllowlist.size === 0) return deny('OPEN_URL is disabled (empty allowlist).')
    const parsed = parseHttpsUrl(url)
    if (!parsed) return deny('Malformed URL.')
    const href = parsed.href.toLowerCase()
    const origin = parsed.origin.toLowerCase()
    let allowed = false
    for (const entry of this.urlAllowlist) {
      if (href === entry || origin === entry || href.startsWith(entry)) {
        allowed = true
        break
      }
    }
    if (!allowed) return deny('URL not on allowlist.')
    return ok({ type: 'OPEN_URL', payload: { url: parsed.href } })
  }

  private focusWindow(payload: Record<string, unknown>): ValidationOk | ValidationDeny {
    const windowId = String(payload.windowId || '').slice(0, 64)
    if (!windowId || !/^[a-z0-9_-]+$/i.test(windowId)) return deny('Invalid windowId.')
    return ok({ type: 'FOCUS_WINDOW', payload: { windowId } })
  }

  private showNotification(payload: Record<string, unknown>): ValidationOk | ValidationDeny {
    const title = String(payload.title || 'BOCH').slice(0, 80)
    const body = String(payload.body || '').slice(0, 200)
    return ok({ type: 'SHOW_NOTIFICATION', payload: { title, body } })
  }
}

function ok(action: BochAction): ValidationOk {
  return { ok: true, action: JSON.parse(JSON.stringify(action)) as BochAction }
}

function deny(message: string, code = 'ACTION_DENIED'): ValidationDeny {
  return { ok: false, error: message, code }
}

function parseHttpsUrl(url: string) {
  const m = String(url).match(/^https:\/\/([^/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/i)
  if (!m) return null
  const host = m[1]
  if (!host || /\s/.test(host)) return null
  const path = m[2] || ''
  const query = m[3] || ''
  const hash = m[4] || ''
  const href = `https://${host}${path}${query}${hash}`
  return { href, origin: `https://${host}` }
}

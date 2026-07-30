export const DESKTOP_SESSION_STORAGE_KEY = 'jack-os:desktop-session.v1'

export type PersistedWindowStatus = 'open' | 'minimized' | 'maximized'

export type PersistedWindowGeometry = {
  x: number
  y: number
  width: number
  height: number
}

export type PersistedWindowRecord = PersistedWindowGeometry & {
  id: string
  status: PersistedWindowStatus
  normal: PersistedWindowGeometry
  restoreStatus?: 'open' | 'maximized'
}

export type PersistedDesktopSession = {
  windows: PersistedWindowRecord[]
  order: string[]
  activeWindowId: string | null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseGeometry(value: unknown): PersistedWindowGeometry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const candidate = value as Partial<PersistedWindowGeometry>
  if (
    isFiniteNumber(candidate.x) &&
    isFiniteNumber(candidate.y) &&
    isFiniteNumber(candidate.width) &&
    isFiniteNumber(candidate.height) &&
    candidate.width >= 240 &&
    candidate.height >= 180
  ) {
    return {
      x: candidate.x,
      y: candidate.y,
      width: candidate.width,
      height: candidate.height,
    }
  }
  return null
}

function isPersistedStatus(value: unknown): value is PersistedWindowStatus {
  return value === 'open' || value === 'minimized' || value === 'maximized'
}

export function parseDesktopSession(
  value: string | null,
  allowedIds: readonly string[],
): PersistedDesktopSession | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

    const allowed = new Set(allowedIds)
    const candidate = parsed as Partial<PersistedDesktopSession>
    if (!Array.isArray(candidate.windows)) return null

    const seen = new Set<string>()
    const windows: PersistedWindowRecord[] = []
    candidate.windows.forEach((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return
      const record = item as Partial<PersistedWindowRecord>
      if (typeof record.id !== 'string' || !allowed.has(record.id) || seen.has(record.id)) return
      if (!isPersistedStatus(record.status)) return

      const geometry = parseGeometry(record)
      const normal = parseGeometry(record.normal)
      if (!geometry || !normal) return

      seen.add(record.id)
      windows.push({
        id: record.id,
        ...geometry,
        normal,
        status: record.status,
        restoreStatus:
          record.restoreStatus === 'maximized' || record.restoreStatus === 'open'
            ? record.restoreStatus
            : undefined,
      })
    })

    if (windows.length === 0) return null

    const ids = new Set(windows.map((windowRecord) => windowRecord.id))
    const order = Array.isArray(candidate.order)
      ? candidate.order.filter((id): id is string => typeof id === 'string' && ids.has(id))
      : []
    const activeWindowId =
      typeof candidate.activeWindowId === 'string' && ids.has(candidate.activeWindowId)
        ? candidate.activeWindowId
        : null

    return {
      windows,
      order,
      activeWindowId,
    }
  } catch {
    return null
  }
}

export function readDesktopSession(allowedIds: readonly string[]) {
  if (typeof window === 'undefined') return null

  try {
    return parseDesktopSession(
      window.localStorage.getItem(DESKTOP_SESSION_STORAGE_KEY),
      allowedIds,
    )
  } catch {
    return null
  }
}

export function writeDesktopSession(session: PersistedDesktopSession) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(DESKTOP_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Window restoration is local-only and best-effort.
  }
}

export function clearDesktopSession() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(DESKTOP_SESSION_STORAGE_KEY)
  } catch {
    // Best effort only.
  }
}

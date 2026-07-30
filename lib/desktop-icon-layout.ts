export const DESKTOP_ICON_LAYOUT_STORAGE_KEY = 'jack-os:desktop-icon-layout.v1'

export type DesktopIconGridPosition = {
  column: number
  row: number
}

export type DesktopIconLayout = Record<string, DesktopIconGridPosition>

export function parseDesktopIconLayout(
  value: string | null,
  allowedIds: readonly string[],
): DesktopIconLayout {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    const allowed = new Set(allowedIds)
    const layout: DesktopIconLayout = {}
    Object.entries(parsed as Record<string, unknown>).forEach(([id, position]) => {
      if (!allowed.has(id)) return
      if (!position || typeof position !== 'object' || Array.isArray(position)) return

      const candidate = position as Partial<DesktopIconGridPosition>
      const column = candidate.column
      const row = candidate.row
      if (
        Number.isInteger(column) &&
        Number.isInteger(row) &&
        typeof column === 'number' &&
        typeof row === 'number' &&
        column >= 0 &&
        row >= 0 &&
        column <= 60 &&
        row <= 80
      ) {
        layout[id] = {
          column,
          row,
        }
      }
    })

    return layout
  } catch {
    return {}
  }
}

export function readDesktopIconLayout(allowedIds: readonly string[]): DesktopIconLayout {
  if (typeof window === 'undefined') return {}

  try {
    return parseDesktopIconLayout(
      window.localStorage.getItem(DESKTOP_ICON_LAYOUT_STORAGE_KEY),
      allowedIds,
    )
  } catch {
    return {}
  }
}

export function writeDesktopIconLayout(layout: DesktopIconLayout) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(DESKTOP_ICON_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  } catch {
    // Local layout persistence is best effort.
  }
}

export function clearDesktopIconLayout() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(DESKTOP_ICON_LAYOUT_STORAGE_KEY)
  } catch {
    // Best effort only.
  }
}

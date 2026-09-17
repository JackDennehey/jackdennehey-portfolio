import { WINDOW_APPS, type WindowId } from '@/components/os/apps'

export type WindowStatus = 'opening' | 'open' | 'minimized' | 'maximized' | 'closing'
export type RestorableWindowStatus = 'open' | 'maximized'
export type WindowGeometry = { x: number; y: number; width: number; height: number }
export type OpenWindow = WindowGeometry & {
  id: WindowId
  normal: WindowGeometry
  status: WindowStatus
  restoreStatus?: RestorableWindowStatus
}

export const WINDOW_OPEN_DURATION_MS = 180
export const WINDOW_CLOSE_DURATION_MS = 160
export const DESKTOP_EDGE_PADDING = 8
export const MENU_BAR_HEIGHT = 32
export const MIN_VISIBLE_TITLEBAR_WIDTH = 128
export const DESKTOP_BOTTOM_TITLEBAR_MARGIN = 48
export const DESKTOP_BOTTOM_SAFE_AREA = 72
export const MAXIMIZED_MARGIN = 8
export const INITIAL_WINDOW_CASCADE_STEP = 28
export const INITIAL_WINDOW_CASCADE_SLOTS = 5

export function getUsableDesktopBounds() {
  if (typeof window === 'undefined') {
    return { left: 8, top: 40, right: 720, bottom: 600, width: 712, height: 560 }
  }

  const left = DESKTOP_EDGE_PADDING
  const top = MENU_BAR_HEIGHT + DESKTOP_EDGE_PADDING
  const right = Math.max(left + 320, window.innerWidth - DESKTOP_EDGE_PADDING)
  const bottom = Math.max(top + 260, window.innerHeight - DESKTOP_BOTTOM_SAFE_AREA)

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  }
}

export function clampWindowPosition(
  id: WindowId,
  x: number,
  y: number,
  options: {
    width?: number
    height?: number
    fullyVisible?: boolean
  } = {},
) {
  if (typeof window === 'undefined') {
    return { x, y }
  }

  const app = WINDOW_APPS[id]
  const bounds = getUsableDesktopBounds()
  const width = options.width ?? app.width
  const height = options.height ?? app.height
  const minX = bounds.left
  const minY = bounds.top
  const maxX = options.fullyVisible
    ? Math.max(minX, bounds.right - width)
    : Math.max(minX, bounds.right - Math.min(MIN_VISIBLE_TITLEBAR_WIDTH, width))
  const maxY = options.fullyVisible
    ? Math.max(minY, bounds.bottom - height)
    : Math.max(minY, window.innerHeight - DESKTOP_BOTTOM_TITLEBAR_MARGIN)

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  }
}

export function clampWindowGeometry(id: WindowId, geometry: WindowGeometry): WindowGeometry {
  if (typeof window === 'undefined') {
    return geometry
  }

  const bounds = getUsableDesktopBounds()
  const maxWidth = Math.max(280, bounds.width)
  const maxHeight = Math.max(220, bounds.height)
  const width = Math.min(geometry.width, maxWidth)
  const height = Math.min(geometry.height, maxHeight)
  const position = clampWindowPosition(id, geometry.x, geometry.y, {
    width,
    height,
    fullyVisible: true,
  })

  return { ...position, width, height }
}

export function getMaximizedGeometry(): WindowGeometry {
  if (typeof window === 'undefined') {
    return { x: 8, y: 40, width: 720, height: 560 }
  }

  return {
    x: MAXIMIZED_MARGIN,
    y: MENU_BAR_HEIGHT + MAXIMIZED_MARGIN,
    width: Math.max(320, window.innerWidth - MAXIMIZED_MARGIN * 2),
    height: Math.max(260, window.innerHeight - MENU_BAR_HEIGHT - MAXIMIZED_MARGIN * 2),
  }
}

export function getInitialWindowGeometry(id: WindowId, count: number): WindowGeometry {
  if (typeof window === 'undefined') {
    const app = WINDOW_APPS[id]
    return { x: 80, y: 60, width: app.width, height: app.height }
  }

  const app = WINDOW_APPS[id]
  const bounds = getUsableDesktopBounds()
  const width = Math.min(app.width, bounds.width)
  const height = Math.min(app.height, bounds.height)
  const cascadeIndex = count % INITIAL_WINDOW_CASCADE_SLOTS
  const baseX = bounds.left + Math.max(0, (bounds.width - width) / 2)
  const baseY = bounds.top + Math.max(0, (bounds.height - height) / 2)

  return clampWindowGeometry(id, {
    x: baseX + cascadeIndex * INITIAL_WINDOW_CASCADE_STEP,
    y: baseY + cascadeIndex * INITIAL_WINDOW_CASCADE_STEP,
    width,
    height,
  })
}

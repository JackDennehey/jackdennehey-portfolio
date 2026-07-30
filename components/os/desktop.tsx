'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { BootScreen } from './boot-screen'
import { MenuBar } from './menu-bar'
import { DesktopIcon } from './desktop-icon'
import { OsWindow } from './os-window'
import {
  DESKTOP_ITEMS,
  WINDOW_APPS,
  getWindowHash,
  getWindowIdFromHash,
  type WindowId,
} from './apps'
import { DesktopCalendar } from './desktop-calendar'
import { DesktopClock } from './desktop-clock'
import { DesktopContextMenu } from './desktop-context-menu'
import { useDesktopPreferences } from './use-desktop-preferences'
import { WallpaperManager } from './wallpaper-manager'
import { CommandPalette, type JackOsCommand } from './command-palette'
import { HomeContent } from './content/home-content'
import { AboutContent } from './content/about-content'
import { ProjectsContent } from './content/projects-content'
import { CertificationsContent } from './content/certifications-content'
import { ResumeContent } from './content/resume-content'
import { ContactContent } from './content/contact-content'
import { WallpapersContent } from './content/wallpapers-content'
import { SecretsContent } from './content/secrets-content'
import { SystemInfoContent } from './content/system-info-content'
import { useSoundEffects } from './use-sound-effects'
import { useInterfaceTheme } from './use-interface-theme'
import { MinimizedWindowStrip } from './minimized-window-strip'
import { useSecretUnlocks } from './use-secret-unlocks'
import { useJackNotifications } from './use-jack-notifications'
import { NotificationCenter } from './notification-center'
import { OnboardingDialog } from './onboarding-dialog'
import { SystemConfirmationDialog } from './system-confirmation-dialog'
import {
  getSecretDefinition,
  type SecretId,
} from '@/lib/secrets'
import { CONTACT } from '@/lib/portfolio-data'
import {
  DEFAULT_WALLPAPER_ID,
  getWallpaperAsset,
  isHiddenWallpaper,
} from '@/lib/wallpapers'
import {
  clearDesktopIconLayout,
  readDesktopIconLayout,
  writeDesktopIconLayout,
  type DesktopIconGridPosition,
  type DesktopIconLayout,
} from '@/lib/desktop-icon-layout'
import {
  clearDesktopSession,
  readDesktopSession,
  writeDesktopSession,
  type PersistedDesktopSession,
  type PersistedWindowStatus,
} from '@/lib/desktop-session'
import {
  clearOnboardingComplete,
  readOnboardingComplete,
  writeOnboardingComplete,
} from '@/lib/onboarding'
import {
  CRT_LINES_STORAGE_KEY,
  DEFAULT_CRT_LINES_ENABLED,
  parseCrtPreference,
} from '@/lib/crt-preferences'
import {
  JACK_OS_RELEASE_NAME,
  JACK_OS_VERSION,
} from '@/lib/release'

type WindowStatus = 'opening' | 'open' | 'minimized' | 'maximized' | 'closing'
type RestorableWindowStatus = 'open' | 'maximized'
type WindowGeometry = { x: number; y: number; width: number; height: number }
type OpenWindow = WindowGeometry & {
  id: WindowId
  normal: WindowGeometry
  status: WindowStatus
  restoreStatus?: RestorableWindowStatus
}
type OpenWindowOptions = { playSound?: boolean; updateHash?: boolean }
type ContextMenuPosition = { x: number; y: number } | null

const CONTEXT_MENU_WIDTH = 176
const CONTEXT_MENU_HEIGHT = 132
const WINDOW_OPEN_DURATION_MS = 180
const WINDOW_CLOSE_DURATION_MS = 160
const DESKTOP_EDGE_PADDING = 8
const MENU_BAR_HEIGHT = 32
const MIN_VISIBLE_TITLEBAR_WIDTH = 128
const DESKTOP_BOTTOM_TITLEBAR_MARGIN = 48
const MAXIMIZED_MARGIN = 8
const DESKTOP_ICON_GRID_WIDTH = 108
const DESKTOP_ICON_GRID_HEIGHT = 88
const DESKTOP_ICON_WIDTH = 96
const DESKTOP_ICON_HEIGHT = 78
const DESKTOP_ICON_TOP = 44
const DESKTOP_ICON_LEFT = 10
const DESKTOP_ICON_BOTTOM_SAFE = 96
const DESKTOP_SESSION_WINDOW_LIMIT = 7

function clampWindowPosition(id: WindowId, x: number, y: number) {
  if (typeof window === 'undefined') {
    return { x, y }
  }

  const app = WINDOW_APPS[id]
  const minX = DESKTOP_EDGE_PADDING
  const minY = MENU_BAR_HEIGHT + DESKTOP_EDGE_PADDING
  const maxX = Math.max(minX, window.innerWidth - Math.min(MIN_VISIBLE_TITLEBAR_WIDTH, app.width))
  const maxY = Math.max(minY, window.innerHeight - DESKTOP_BOTTOM_TITLEBAR_MARGIN)

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  }
}

function clampWindowGeometry(id: WindowId, geometry: WindowGeometry): WindowGeometry {
  if (typeof window === 'undefined') {
    return geometry
  }

  const maxWidth = Math.max(280, window.innerWidth - DESKTOP_EDGE_PADDING * 2)
  const maxHeight = Math.max(220, window.innerHeight - MENU_BAR_HEIGHT - 24)
  const width = Math.min(geometry.width, maxWidth)
  const height = Math.min(geometry.height, maxHeight)
  const position = clampWindowPosition(id, geometry.x, geometry.y)

  return { ...position, width, height }
}

function getMaximizedGeometry(): WindowGeometry {
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

function getInitialWindowGeometry(id: WindowId, count: number): WindowGeometry {
  if (typeof window === 'undefined') {
    const app = WINDOW_APPS[id]
    return { x: 80, y: 60, width: app.width, height: app.height }
  }

  const app = WINDOW_APPS[id]
  const baseX = Math.max(24, (window.innerWidth - app.width) / 2 - 80)
  return clampWindowGeometry(id, {
    x: baseX + count * 30,
    y: 60 + count * 30,
    width: app.width,
    height: app.height,
  })
}

function syncWindowHash(id: WindowId) {
  if (typeof window === 'undefined') return

  const slug = getWindowHash(id)
  const nextUrl = `${window.location.pathname}${window.location.search}#${slug}`
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === nextUrl) {
    return
  }

  window.history.replaceState(null, '', nextUrl)
}

function readStoredCrtLines() {
  if (typeof window === 'undefined') return DEFAULT_CRT_LINES_ENABLED

  try {
    return parseCrtPreference(window.localStorage.getItem(CRT_LINES_STORAGE_KEY))
  } catch {
    return DEFAULT_CRT_LINES_ENABLED
  }
}

function writeStoredCrtLines(enabled: boolean) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CRT_LINES_STORAGE_KEY, String(enabled))
  } catch {
    // CRT preference persistence is best effort.
  }
}

function getViewportCategory() {
  if (typeof window === 'undefined') return 'desktop'
  if (window.innerWidth < 640) return 'mobile'
  if (window.innerWidth < 1024) return 'tablet'
  if (window.innerWidth < 1440) return 'laptop'
  return 'desktop'
}

function getIconGridBounds() {
  if (typeof window === 'undefined') {
    return { maxColumn: 6, maxRow: 6 }
  }

  return {
    maxColumn: Math.max(
      0,
      Math.floor((window.innerWidth - DESKTOP_ICON_LEFT * 2 - DESKTOP_ICON_WIDTH) / DESKTOP_ICON_GRID_WIDTH),
    ),
    maxRow: Math.max(
      0,
      Math.floor(
        (window.innerHeight - DESKTOP_ICON_TOP - DESKTOP_ICON_BOTTOM_SAFE - DESKTOP_ICON_HEIGHT) /
          DESKTOP_ICON_GRID_HEIGHT,
      ),
    ),
  }
}

function clampIconGridPosition(position: DesktopIconGridPosition): DesktopIconGridPosition {
  const bounds = getIconGridBounds()
  return {
    column: Math.min(Math.max(position.column, 0), bounds.maxColumn),
    row: Math.min(Math.max(position.row, 0), bounds.maxRow),
  }
}

function getIconPixelPosition(position: DesktopIconGridPosition) {
  const clamped = clampIconGridPosition(position)
  return {
    x: DESKTOP_ICON_LEFT + clamped.column * DESKTOP_ICON_GRID_WIDTH,
    y: DESKTOP_ICON_TOP + clamped.row * DESKTOP_ICON_GRID_HEIGHT,
  }
}

function getGridPositionFromPixels(x: number, y: number): DesktopIconGridPosition {
  return clampIconGridPosition({
    column: Math.round((x - DESKTOP_ICON_LEFT) / DESKTOP_ICON_GRID_WIDTH),
    row: Math.round((y - DESKTOP_ICON_TOP) / DESKTOP_ICON_GRID_HEIGHT),
  })
}

function getDefaultIconLayout(itemIds: readonly string[]): DesktopIconLayout {
  const { maxColumn, maxRow } = getIconGridBounds()
  const rowsPerColumn = Math.max(1, maxRow + 1)
  const layout: DesktopIconLayout = {}

  itemIds.forEach((id, index) => {
    const columnOffset = Math.floor(index / rowsPerColumn)
    layout[id] = {
      column: Math.max(0, maxColumn - columnOffset),
      row: index % rowsPerColumn,
    }
  })

  return layout
}

function resolveIconCollision(
  id: string,
  desired: DesktopIconGridPosition,
  currentLayout: DesktopIconLayout,
  itemIds: readonly string[],
) {
  const { maxColumn, maxRow } = getIconGridBounds()
  const occupied = new Set(
    Object.entries(currentLayout)
      .filter(([itemId]) => itemId !== id && itemIds.includes(itemId))
      .map(([, position]) => {
        const clamped = clampIconGridPosition(position)
        return `${clamped.column}:${clamped.row}`
      }),
  )

  const desiredKey = `${desired.column}:${desired.row}`
  if (!occupied.has(desiredKey)) return desired

  const available: DesktopIconGridPosition[] = []
  for (let column = 0; column <= maxColumn; column += 1) {
    for (let row = 0; row <= maxRow; row += 1) {
      const key = `${column}:${row}`
      if (!occupied.has(key)) {
        available.push({ column, row })
      }
    }
  }

  return (
    available.sort((a, b) => {
      const aDistance = Math.abs(a.column - desired.column) + Math.abs(a.row - desired.row)
      const bDistance = Math.abs(b.column - desired.column) + Math.abs(b.row - desired.row)
      if (aDistance !== bDistance) return aDistance - bDistance
      if (a.row !== b.row) return a.row - b.row
      return b.column - a.column
    })[0] ?? desired
  )
}

function toPersistedWindowStatus(status: WindowStatus): PersistedWindowStatus | null {
  if (status === 'open' || status === 'minimized' || status === 'maximized') return status
  return null
}

function restorePersistedSession(
  session: PersistedDesktopSession,
  isMobile: boolean,
): { windows: OpenWindow[]; order: WindowId[] } {
  const restoredWindows = session.windows
    .slice(0, DESKTOP_SESSION_WINDOW_LIMIT)
    .map((record) => {
      const id = record.id as WindowId
      const status = isMobile && record.status === 'minimized' ? 'open' : record.status
      const geometry =
        status === 'maximized' && !isMobile
          ? getMaximizedGeometry()
          : clampWindowGeometry(id, record)
      const normal = clampWindowGeometry(id, record.normal)
      return {
        id,
        ...geometry,
        normal,
        status,
        restoreStatus:
          status === 'minimized'
            ? record.restoreStatus ?? 'open'
            : undefined,
      } satisfies OpenWindow
    })

  const restoredIds = new Set(restoredWindows.map((windowRecord) => windowRecord.id))
  const orderedIds = session.order.filter((id): id is WindowId =>
    restoredIds.has(id as WindowId),
  )
  const missingIds = restoredWindows
    .map((windowRecord) => windowRecord.id)
    .filter((id) => !orderedIds.includes(id))
  const baseOrder = [...orderedIds, ...missingIds].filter(
    (id, index, ids) => ids.indexOf(id) === index,
  )

  const activeWindow =
    session.activeWindowId && restoredIds.has(session.activeWindowId as WindowId)
      ? (session.activeWindowId as WindowId)
      : null
  const activeWindowRecord = activeWindow
    ? restoredWindows.find((windowRecord) => windowRecord.id === activeWindow)
    : null
  const nextOrder: WindowId[] =
    activeWindow && activeWindowRecord && activeWindowRecord.status !== 'minimized'
      ? [...baseOrder.filter((id) => id !== activeWindow), activeWindow]
      : baseOrder

  return {
    windows: restoredWindows,
    order: nextOrder,
  }
}

export function Desktop() {
  const [booted, setBooted] = useState(false)
  const [scanlines, setScanlines] = useState(DEFAULT_CRT_LINES_ENABLED)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportCategory, setViewportCategory] = useState('desktop')
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [order, setOrder] = useState<WindowId[]>([])
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [confirmRestoreDefault, setConfirmRestoreDefault] = useState(false)
  const [iconLayout, setIconLayout] = useState<DesktopIconLayout>({})
  const secretUnlocks = useSecretUnlocks()
  const { preferences, updatePreferences, resetWallpaper } = useDesktopPreferences(
    secretUnlocks.unlockedIds,
    secretUnlocks.loaded,
  )
  const soundEffects = useSoundEffects()
  const { theme, toggleTheme } = useInterfaceTheme()
  const notifications = useJackNotifications()
  const windowsRef = useRef<OpenWindow[]>([])
  const orderRef = useRef<WindowId[]>([])
  const preferencesRef = useRef(preferences)
  const handledInitialHash = useRef(false)
  const restoredInitialSession = useRef(false)
  const showedInitialOnboarding = useRef(false)
  const iconLayoutLoaded = useRef(false)
  const sessionStartedAt = useRef(Date.now())
  const windowOpenSequence = useRef(0)
  const openTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const closeTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const windowAppIds = useMemo(() => Object.keys(WINDOW_APPS) as WindowId[], [])
  const desktopItems = useMemo(() => DESKTOP_ITEMS, [])
  const desktopItemIds = useMemo(
    () => desktopItems.map((item) => item.id),
    [desktopItems],
  )

  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  useEffect(() => {
    orderRef.current = order
  }, [order])

  useEffect(() => {
    preferencesRef.current = preferences
  }, [preferences])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => {
      setIsMobile(mq.matches)
      setViewportCategory(getViewportCategory())
    }
    update()
    mq.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    setScanlines(readStoredCrtLines())
  }, [])

  useEffect(() => {
    if (iconLayoutLoaded.current || isMobile) return

    const storedLayout = readDesktopIconLayout(desktopItemIds)
    const defaultLayout = getDefaultIconLayout(desktopItemIds)
    iconLayoutLoaded.current = true
    setIconLayout({ ...defaultLayout, ...storedLayout })
  }, [desktopItemIds, isMobile])

  useEffect(() => {
    if (isMobile || !iconLayoutLoaded.current) return
    setIconLayout((current) => {
      const defaultLayout = getDefaultIconLayout(desktopItemIds)
      const next: DesktopIconLayout = {}
      desktopItemIds.forEach((id) => {
        const desired = clampIconGridPosition(current[id] ?? defaultLayout[id])
        next[id] = resolveIconCollision(id, desired, next, desktopItemIds)
      })
      return next
    })
  }, [desktopItemIds, isMobile, viewportCategory])

  const focusWindow = useCallback((id: WindowId) => {
    setOrder((prev) => {
      const next = [...prev.filter((w) => w !== id), id]
      orderRef.current = next
      return next
    })
  }, [])

  const focusDesktop = useCallback(() => {
    window.setTimeout(() => {
      document.getElementById('jack-os-desktop')?.focus()
    }, 0)
  }, [])

  const openWindow = useCallback(
    (id: string, options: OpenWindowOptions = {}) => {
      const windowId = id as WindowId
      if (!WINDOW_APPS[windowId]) return

      if (options.updateHash !== false) {
        syncWindowHash(windowId)
      }

      const existing = windowsRef.current.find((w) => w.id === windowId)
      if (existing) {
        if (existing.status === 'minimized') {
          const restoredStatus = existing.restoreStatus ?? 'open'
          const restoredGeometry =
            restoredStatus === 'maximized'
              ? getMaximizedGeometry()
              : clampWindowGeometry(windowId, existing.normal)

          windowsRef.current = windowsRef.current.map((w) =>
            w.id === windowId
              ? { ...w, ...restoredGeometry, status: restoredStatus, restoreStatus: undefined }
              : w,
          )
          setWindows(windowsRef.current)
        }
        focusWindow(windowId)
        return
      }

      const geometry = getInitialWindowGeometry(windowId, windowOpenSequence.current)
      windowOpenSequence.current += 1
      const nextWindow: OpenWindow = {
        id: windowId,
        ...geometry,
        normal: geometry,
        status: 'opening',
      }
      windowsRef.current = [...windowsRef.current, nextWindow]
      setWindows((prev) =>
        prev.some((w) => w.id === windowId) ? prev : [...prev, nextWindow],
      )
      focusWindow(windowId)
      openTimers.current[windowId] = setTimeout(() => {
        windowsRef.current = windowsRef.current.map((w) =>
          w.id === windowId && w.status === 'opening' ? { ...w, status: 'open' } : w,
        )
        setWindows((prev) =>
          prev.map((w) =>
            w.id === windowId && w.status === 'opening' ? { ...w, status: 'open' } : w,
          ),
        )
        delete openTimers.current[windowId]
      }, WINDOW_OPEN_DURATION_MS)
      if (options.playSound !== false) {
        soundEffects.appOpen()
      }
    },
    [focusWindow, soundEffects],
  )

  const closeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status === 'closing') {
      return
    }

    if (openTimers.current[id]) {
      clearTimeout(openTimers.current[id])
      delete openTimers.current[id]
    }

    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id ? { ...w, status: 'closing' } : w,
    )
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'closing' } : w)),
    )
    soundEffects.windowClose()
    closeTimers.current[id] = setTimeout(() => {
      windowsRef.current = windowsRef.current.filter((w) => w.id !== id)
      setWindows((prev) => prev.filter((w) => w.id !== id))
      const nextOrder = orderRef.current.filter((w) => w !== id)
      orderRef.current = nextOrder
      setOrder(nextOrder)
      const nextFocusedWindow = [...nextOrder].reverse().find((windowId) => {
        const windowRecord = windowsRef.current.find((w) => w.id === windowId)
        return windowRecord && windowRecord.status !== 'minimized'
      })
      if (!nextFocusedWindow) {
        focusDesktop()
      }
      delete closeTimers.current[id]
    }, WINDOW_CLOSE_DURATION_MS)
  }, [focusDesktop, soundEffects])

  const moveWindow = useCallback((id: WindowId, x: number, y: number) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status === 'maximized' || target.status === 'minimized') {
      return
    }

    const position = clampWindowPosition(id, x, y)
    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id ? { ...w, ...position, normal: { ...w.normal, ...position } } : w,
    )
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, ...position, normal: { ...w.normal, ...position } } : w,
      ),
    )
  }, [])

  const minimizeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status === 'minimized' || target.status === 'closing') return

    const restoreStatus: RestorableWindowStatus =
      target.status === 'maximized' ? 'maximized' : 'open'
    const normal = target.status === 'maximized'
      ? target.normal
      : { x: target.x, y: target.y, width: target.width, height: target.height }

    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id ? { ...w, normal, status: 'minimized', restoreStatus } : w,
    )
    setWindows(windowsRef.current)
    setOrder((prev) => {
      const next = prev.filter((w) => w !== id)
      orderRef.current = next
      return next
    })
    focusDesktop()
  }, [focusDesktop])

  const restoreWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status !== 'minimized') return

    const restoredStatus = target.restoreStatus ?? 'open'
    const restoredGeometry =
      restoredStatus === 'maximized'
        ? getMaximizedGeometry()
        : clampWindowGeometry(id, target.normal)

    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id
        ? { ...w, ...restoredGeometry, status: restoredStatus, restoreStatus: undefined }
        : w,
    )
    setWindows(windowsRef.current)
    focusWindow(id)
  }, [focusWindow])

  const restoreAllMinimized = useCallback(() => {
    const minimizedWindows = windowsRef.current.filter((w) => w.status === 'minimized')
    if (minimizedWindows.length === 0) return

    const restoredWindows = windowsRef.current.map((w) => {
      if (w.status !== 'minimized') return w

      const restoredStatus = w.restoreStatus ?? 'open'
      const restoredGeometry =
        restoredStatus === 'maximized' ? getMaximizedGeometry() : clampWindowGeometry(w.id, w.normal)
      return { ...w, ...restoredGeometry, status: restoredStatus, restoreStatus: undefined }
    })

    windowsRef.current = restoredWindows
    setWindows(restoredWindows)
    setOrder((prev) => {
      const next = [
        ...prev.filter((id) => !minimizedWindows.some((w) => w.id === id)),
        ...minimizedWindows.map((w) => w.id),
      ]
      orderRef.current = next
      return next
    })
  }, [])

  const maximizeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status === 'minimized' || target.status === 'closing') return

    if (target.status === 'maximized') {
      const restoredGeometry = clampWindowGeometry(id, target.normal)
      windowsRef.current = windowsRef.current.map((w) =>
        w.id === id ? { ...w, ...restoredGeometry, status: 'open' } : w,
      )
      setWindows(windowsRef.current)
      focusWindow(id)
      return
    }

    const normal = { x: target.x, y: target.y, width: target.width, height: target.height }
    const maximized = getMaximizedGeometry()
    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id ? { ...w, ...maximized, normal, status: 'maximized' } : w,
    )
    setWindows(windowsRef.current)
    focusWindow(id)
  }, [focusWindow])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    focusDesktop()
  }, [focusDesktop])

  const openCommandPalette = useCallback(() => {
    setContextMenu(null)
    setCommandPaletteOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false)
  }, [])

  const notify = notifications.notify

  const toggleThemeWithNotice = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    toggleTheme()
    notify({
      title: 'Theme changed',
      message: `${nextTheme} theme is now active.`,
      type: 'success',
    })
  }, [notify, theme, toggleTheme])

  const toggleScanlinesWithNotice = useCallback(() => {
    setScanlines((current) => {
      const next = !current
      writeStoredCrtLines(next)
      notify({
        title: next ? 'CRT enabled' : 'CRT disabled',
        message: next ? 'Scanlines are visible.' : 'Scanlines are hidden.',
        type: 'success',
      })
      return next
    })
  }, [notify])

  const setSoundEffectsWithNotice = useCallback(
    (enabled: boolean) => {
      soundEffects.setSoundEffectsEnabled(enabled)
      notify({
        title: enabled ? 'Sound enabled' : 'Sound disabled',
        message: enabled ? 'Future system sounds will play.' : 'Future system sounds are muted.',
        type: 'success',
      })
    },
    [notify, soundEffects],
  )

  const toggleSoundEffectsWithNotice = useCallback(() => {
    setSoundEffectsWithNotice(!soundEffects.soundEffectsEnabled)
  }, [setSoundEffectsWithNotice, soundEffects.soundEffectsEnabled])

  const updateDesktopPreferences = useCallback(
    (patch: Partial<typeof preferences>) => {
      const previous = preferencesRef.current
      updatePreferences(patch)

      if (patch.wallpaperId && patch.wallpaperId !== previous.wallpaperId) {
        const wallpaper = getWallpaperAsset(patch.wallpaperId)
        notify({
          title: patch.wallpaperId === DEFAULT_WALLPAPER_ID ? 'Wallpaper reset' : 'Wallpaper changed',
          message: `${wallpaper.displayName} is now active.`,
          type: 'success',
        })
      }

      if (typeof patch.showClock === 'boolean' && patch.showClock !== previous.showClock) {
        notify({
          title: patch.showClock ? 'Clock shown' : 'Clock hidden',
          type: 'success',
        })
      }

      if (
        typeof patch.showCalendar === 'boolean' &&
        patch.showCalendar !== previous.showCalendar
      ) {
        notify({
          title: patch.showCalendar ? 'Calendar shown' : 'Calendar hidden',
          type: 'success',
        })
      }
    },
    [notify, updatePreferences],
  )

  const resetWallpaperWithNotice = useCallback(() => {
    resetWallpaper()
    notify({
      title: 'Wallpaper reset',
      message: 'Jack OS Classic is now active.',
      type: 'success',
    })
  }, [notify, resetWallpaper])

  const copyEmailToClipboard = useCallback(() => {
    const email = CONTACT.email
    if (!navigator.clipboard) {
      notify({
        title: 'Copy unavailable',
        message: email,
        type: 'warning',
      })
      return
    }

    void navigator.clipboard
      .writeText(email)
      .then(() => {
        notify({
          title: 'Email copied',
          message: email,
          type: 'success',
        })
      })
      .catch(() => {
        notify({
          title: 'Copy unavailable',
          message: email,
          type: 'warning',
        })
      })
  }, [notify])

  const showResumeUnavailableNotice = useCallback(() => {
    notify({
      title: 'Resume unavailable',
      message: 'The public resume is being prepared.',
      type: 'info',
    })
  }, [notify])

  const resetDesktopLayout = useCallback(() => {
    const defaultLayout = getDefaultIconLayout(desktopItemIds)
    clearDesktopIconLayout()
    setIconLayout(defaultLayout)
    notify({
      title: 'Desktop layout reset',
      message: 'Desktop icons returned to their default positions.',
      type: 'success',
    })
  }, [desktopItemIds, notify])

  const commitIconPosition = useCallback(
    (id: string, x: number, y: number) => {
      setIconLayout((current) => {
        const desired = getGridPositionFromPixels(x, y)
        const resolved = resolveIconCollision(id, desired, current, desktopItemIds)
        const next = { ...current, [id]: resolved }
        writeDesktopIconLayout(next)
        return next
      })
    },
    [desktopItemIds],
  )

  const restoreDefaultDesktop = useCallback(() => {
    setConfirmRestoreDefault(false)
    clearDesktopSession()
    clearDesktopIconLayout()
    Object.values(openTimers.current).forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    Object.values(closeTimers.current).forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    openTimers.current = {}
    closeTimers.current = {}
    const defaultLayout = getDefaultIconLayout(desktopItemIds)
    setIconLayout(defaultLayout)
    windowsRef.current = []
    orderRef.current = []
    setWindows([])
    setOrder([])
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
    windowOpenSequence.current = 0
    if (!isMobile) {
      window.setTimeout(() => openWindow('home', { playSound: false, updateHash: false }), 0)
    }
    notify({
      title: 'Settings restored',
      message: 'Window state and desktop icon layout were reset.',
      type: 'success',
    })
  }, [desktopItemIds, isMobile, notify, openWindow])

  const showWelcomeTour = useCallback(() => {
    setCommandPaletteOpen(false)
    setOnboardingOpen(true)
  }, [])

  const finishWelcomeTour = useCallback(() => {
    writeOnboardingComplete(true)
    setOnboardingOpen(false)
    notify({
      title: 'Welcome tour completed',
      type: 'success',
    })
  }, [notify])

  const skipWelcomeTour = useCallback(() => {
    writeOnboardingComplete(true)
    setOnboardingOpen(false)
    notify({
      title: 'Welcome tour skipped',
      type: 'info',
    })
  }, [notify])

  const resetWelcomeTour = useCallback(() => {
    clearOnboardingComplete()
    notify({
      title: 'Welcome tour reset',
      message: 'It will appear on the next fresh visit, or you can show it now.',
      type: 'success',
    })
  }, [notify])

  const openPersonalize = useCallback(() => {
    openWindow('wallpapers')
  }, [openWindow])

  const openSecrets = useCallback(() => {
    openWindow('secrets')
  }, [openWindow])

  const unlockSecret = useCallback(
    (id: SecretId) => {
      const result = secretUnlocks.unlock(id)
      const secret = getSecretDefinition(id)
      if (result === 'unlocked') {
        soundEffects.playSecretUnlock(id)
        notify({
          title: 'Secret unlocked',
          message: secret ? `${secret.wallpaperTitle} recovered.` : 'Hidden file recovered.',
          type: 'success',
        })
      } else {
        notify({
          title: 'Already unlocked',
          message: secret ? `${secret.wallpaperTitle} is already available.` : undefined,
          type: 'info',
        })
      }
      return result
    },
    [notify, secretUnlocks, soundEffects],
  )

  const resetSecretUnlocks = useCallback(() => {
    const activeWallpaper = getWallpaperAsset(preferences.wallpaperId)
    secretUnlocks.reset()
    if (isHiddenWallpaper(activeWallpaper)) {
      updateDesktopPreferences({ wallpaperId: DEFAULT_WALLPAPER_ID })
    }
    notify({
      title: 'Settings restored',
      message: 'Secret unlock records were cleared.',
      type: 'success',
    })
  }, [notify, preferences.wallpaperId, secretUnlocks, updateDesktopPreferences])

  const handleDesktopContextMenu = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault()

      if (isMobile) {
        closeContextMenu()
        return
      }

      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('[data-desktop-interactive="true"], [role="dialog"], button, a')
      ) {
        closeContextMenu()
        return
      }

      setCommandPaletteOpen(false)
      setContextMenu({
        x: Math.max(8, Math.min(event.clientX, window.innerWidth - CONTEXT_MENU_WIDTH - 8)),
        y: Math.max(40, Math.min(event.clientY, window.innerHeight - CONTEXT_MENU_HEIGHT - 8)),
      })
    },
    [closeContextMenu, isMobile],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!booted) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openCommandPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [booted, openCommandPalette])

  useEffect(() => {
    if (!booted || handledInitialHash.current) return

    handledInitialHash.current = true
    const hashWindow = getWindowIdFromHash(window.location.hash)
    if (hashWindow) {
      openWindow(hashWindow, { playSound: false, updateHash: false })
      restoredInitialSession.current = true
      return
    }

    const storedSession = readDesktopSession(windowAppIds)
    if (storedSession) {
      const restored = restorePersistedSession(storedSession, isMobile)
      if (restored.windows.length > 0) {
        windowsRef.current = restored.windows
        orderRef.current = restored.order
        setWindows(restored.windows)
        setOrder(restored.order)
        restoredInitialSession.current = true
        return
      }
    }

    if (!isMobile && windowsRef.current.length === 0) {
      openWindow('home', { playSound: false, updateHash: false })
    }
    restoredInitialSession.current = true
  }, [booted, isMobile, openWindow, windowAppIds])

  useEffect(() => {
    const onHashChange = () => {
      if (!booted) return

      const hashWindow = getWindowIdFromHash(window.location.hash)
      if (hashWindow) {
        openWindow(hashWindow, { playSound: false, updateHash: false })
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [booted, openWindow])

  useEffect(() => {
    if (!booted || showedInitialOnboarding.current) return
    showedInitialOnboarding.current = true
    if (readOnboardingComplete()) return

    const timer = window.setTimeout(() => {
      setOnboardingOpen(true)
    }, 450)

    return () => window.clearTimeout(timer)
  }, [booted])

  useEffect(() => {
    const onResize = () => {
      const nextWindows = windowsRef.current.map((w) => {
        if (w.status === 'maximized') {
          return { ...w, ...getMaximizedGeometry() }
        }

        if (w.status === 'minimized') {
          return w
        }

        const geometry = clampWindowGeometry(w.id, w)
        return geometry.x === w.x &&
          geometry.y === w.y &&
          geometry.width === w.width &&
          geometry.height === w.height
          ? w
          : { ...w, ...geometry, normal: { ...w.normal, ...geometry } }
      })
      windowsRef.current = nextWindows
      setWindows(nextWindows)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const minimizedWindows = windowsRef.current.filter((w) => w.status === 'minimized')
    if (minimizedWindows.length === 0) return

    windowsRef.current = windowsRef.current.map((w) =>
      w.status === 'minimized'
        ? { ...w, ...clampWindowGeometry(w.id, w.normal), status: 'open', restoreStatus: undefined }
        : w,
    )
    setWindows(windowsRef.current)
    setOrder((prev) => {
      const next = [
        ...prev.filter((id) => !minimizedWindows.some((w) => w.id === id)),
        ...minimizedWindows.map((w) => w.id),
      ]
      orderRef.current = next
      return next
    })
  }, [isMobile])

  useEffect(() => {
    return () => {
      Object.values(openTimers.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer)
        }
      })
      Object.values(closeTimers.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer)
        }
      })
    }
  }, [])

  // Established Jack OS behavior: Escape closes the top-most app window after temporary UI.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contextMenu || commandPaletteOpen || onboardingOpen || confirmRestoreDefault) return
      const visibleOrder = order.filter((id) => {
        const windowRecord = windowsRef.current.find((w) => w.id === id)
        return windowRecord && windowRecord.status !== 'minimized'
      })
      if (e.key === 'Escape' && visibleOrder.length > 0) {
        closeWindow(visibleOrder[visibleOrder.length - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commandPaletteOpen, confirmRestoreDefault, contextMenu, onboardingOpen, order, closeWindow])

  const topId = order[order.length - 1]
  const minimizedWindows = windows.filter((w) => w.status === 'minimized')
  const visibleWindows = windows.filter((w) => w.status !== 'minimized')
  const defaultIconLayout = useMemo(
    () => (isMobile ? {} : getDefaultIconLayout(desktopItemIds)),
    [desktopItemIds, isMobile, viewportCategory],
  )

  useEffect(() => {
    if (!booted || !restoredInitialSession.current) return

    const timer = window.setTimeout(() => {
      const restorableWindows = windowsRef.current
        .map((windowRecord) => {
          const status = toPersistedWindowStatus(windowRecord.status)
          if (!status) return null
          return {
            id: windowRecord.id,
            x: windowRecord.x,
            y: windowRecord.y,
            width: windowRecord.width,
            height: windowRecord.height,
            normal: windowRecord.normal,
            status,
            restoreStatus: windowRecord.restoreStatus,
          }
        })
        .filter((windowRecord): windowRecord is NonNullable<typeof windowRecord> =>
          Boolean(windowRecord),
        )
        .slice(-DESKTOP_SESSION_WINDOW_LIMIT)

      if (restorableWindows.length === 0) {
        clearDesktopSession()
        return
      }

      writeDesktopSession({
        windows: restorableWindows,
        order: orderRef.current.filter((id) =>
          restorableWindows.some((windowRecord) => windowRecord.id === id),
        ),
        activeWindowId: topId ?? null,
      })
    }, 150)

    return () => window.clearTimeout(timer)
  }, [booted, order, topId, windows])

  const minimizeActiveWindow = useCallback(() => {
    if (topId) {
      minimizeWindow(topId)
    }
  }, [minimizeWindow, topId])

  const commandRegistry = useMemo<JackOsCommand[]>(() => {
    const appIds: WindowId[] = [
      'home',
      'system-info',
      'about',
      'projects',
      'certifications',
      'resume',
      'contact',
      'wallpapers',
      'secrets',
    ]
    const appAliases: Partial<Record<WindowId, readonly string[]>> = {
      home: ['welcome', 'start'],
      'system-info': ['system information', 'about this computer', 'about jack os', 'version'],
      about: ['about me', 'jack', 'bio'],
      resume: ['cv'],
      contact: ['email', 'mail'],
      certifications: ['credentials', 'certifications', 'certificates'],
      wallpapers: ['personalize', 'background', 'desktop'],
      secrets: ['hidden', 'files', 'manual'],
    }

    const appCommands = appIds.map((id) => {
      const app = WINDOW_APPS[id]
      return {
        id: `open-${id}`,
        title: id === 'home' ? 'Open Welcome' : `Open ${app.title}`,
        subtitle: 'Application',
        keywords: [app.title, id, ...(appAliases[id] ?? [])],
        Icon: app.Icon,
        action: () => openWindow(id),
      }
    })

    const unlockedSecretCommands = secretUnlocks.unlockedIds
      .map((secretId) => getSecretDefinition(secretId))
      .filter((secret): secret is NonNullable<typeof secret> => Boolean(secret))
      .map((secret) => ({
        id: `find-${secret.id}`,
        title: `Find ${secret.wallpaperTitle} in Wallpapers`,
        subtitle: 'Hidden file recovered',
        keywords: [secret.wallpaperTitle, 'hidden wallpaper', 'exclusive'],
        Icon: WINDOW_APPS.wallpapers.Icon,
        action: () => openWindow('wallpapers'),
      }))

    return [
      ...appCommands,
      {
        id: 'toggle-theme',
        title: 'Toggle Light/Dark Theme',
        subtitle: `Current: ${theme}`,
        keywords: ['theme', 'light', 'dark'],
        action: toggleThemeWithNotice,
      },
      {
        id: 'toggle-scanlines',
        title: 'Toggle CRT Lines',
        subtitle: scanlines ? 'Currently On' : 'Currently Off',
        keywords: ['crt', 'scanlines', 'lines'],
        action: toggleScanlinesWithNotice,
      },
      {
        id: 'toggle-sound-effects',
        title: 'Toggle Sound Effects',
        subtitle: soundEffects.soundEffectsEnabled ? 'Currently On' : 'Currently Off',
        keywords: ['sound', 'audio', 'effects'],
        action: toggleSoundEffectsWithNotice,
      },
      {
        id: 'open-wallpapers-system',
        title: 'Open Wallpapers',
        subtitle: 'Personalization',
        keywords: ['personalize', 'wallpaper', 'background'],
        Icon: WINDOW_APPS.wallpapers.Icon,
        action: () => openWindow('wallpapers'),
      },
      {
        id: 'open-personalize',
        title: 'Open Personalize',
        subtitle: 'Wallpaper and desktop settings',
        keywords: ['personalize', 'settings', 'wallpapers'],
        Icon: WINDOW_APPS.wallpapers.Icon,
        action: () => openWindow('wallpapers'),
      },
      {
        id: 'open-secrets-system',
        title: 'Open Secrets',
        subtitle: 'Some parts of Jack OS are not listed in the manual.',
        keywords: ['secrets', 'hidden', 'manual'],
        Icon: WINDOW_APPS.secrets.Icon,
        action: () => openWindow('secrets'),
      },
      {
        id: 'show-welcome-tour',
        title: 'Show Welcome Tour',
        subtitle: 'Onboarding',
        keywords: ['welcome tour', 'onboarding', 'help', 'intro'],
        action: showWelcomeTour,
      },
      {
        id: 'reset-welcome-tour',
        title: 'Reset Welcome Tour',
        subtitle: 'Show again on the next fresh visit',
        keywords: ['reset onboarding', 'reset welcome tour', 'tour'],
        action: resetWelcomeTour,
      },
      {
        id: 'reset-desktop-layout',
        title: 'Reset Desktop Layout',
        subtitle: 'Restore desktop icon positions',
        keywords: ['reset icons', 'desktop layout', 'icon positions'],
        action: resetDesktopLayout,
      },
      {
        id: 'restore-default-desktop',
        title: 'Restore Default Desktop',
        subtitle: 'Reset open windows and icon positions',
        keywords: ['restore desktop', 'reset windows', 'default desktop'],
        action: () => setConfirmRestoreDefault(true),
      },
      {
        id: 'restore-all-minimized',
        title: 'Restore all minimized windows',
        subtitle:
          minimizedWindows.length > 0
            ? `${minimizedWindows.length} minimized`
            : 'No minimized windows',
        keywords: ['restore', 'windows', 'minimized'],
        disabled: minimizedWindows.length === 0,
        action: restoreAllMinimized,
      },
      {
        id: 'minimize-active-window',
        title: 'Minimize active window',
        subtitle: topId ? WINDOW_APPS[topId].title : 'No active window',
        keywords: ['minimize', 'active', 'window'],
        disabled: !topId || isMobile,
        action: minimizeActiveWindow,
      },
      ...unlockedSecretCommands,
    ]
  }, [
    isMobile,
    minimizedWindows.length,
    minimizeActiveWindow,
    openWindow,
    resetDesktopLayout,
    resetWelcomeTour,
    restoreAllMinimized,
    scanlines,
    secretUnlocks.unlockedIds,
    showWelcomeTour,
    soundEffects,
    theme,
    toggleScanlinesWithNotice,
    toggleSoundEffectsWithNotice,
    toggleThemeWithNotice,
    topId,
  ])

  const renderContent = (id: WindowId) => {
    switch (id) {
      case 'home':
        return (
          <HomeContent
            onOpen={openWindow}
            theme={theme}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            scanlines={scanlines}
            onShowTour={showWelcomeTour}
          />
        )
      case 'system-info':
        return (
          <SystemInfoContent
            theme={theme}
            scanlines={scanlines}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            wallpaperId={preferences.wallpaperId}
            unlockedSecretCount={secretUnlocks.unlockedIds.length}
            viewportCategory={viewportCategory}
            sessionStartedAt={sessionStartedAt.current}
            onShowTour={showWelcomeTour}
            onResetDesktopLayout={resetDesktopLayout}
            onRestoreDefaultDesktop={() => setConfirmRestoreDefault(true)}
          />
        )
      case 'about':
        return <AboutContent onOpen={openWindow} />
      case 'projects':
        return <ProjectsContent />
      case 'certifications':
        return <CertificationsContent />
      case 'resume':
        return (
          <ResumeContent
            onOpen={openWindow}
            onCopyEmail={copyEmailToClipboard}
            onResumeUnavailable={showResumeUnavailableNotice}
          />
        )
      case 'contact':
        return <ContactContent onCopyEmail={copyEmailToClipboard} />
      case 'wallpapers':
        return (
          <WallpapersContent
            preferences={preferences}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            onUpdatePreferences={updateDesktopPreferences}
            onResetWallpaper={resetWallpaperWithNotice}
            onSetSoundEffectsEnabled={setSoundEffectsWithNotice}
            onFirstCustomWallpaperSet={soundEffects.firstWallpaperSet}
            unlockedSecretIds={secretUnlocks.unlockedIds}
            onOpenSecrets={openSecrets}
          />
        )
      case 'secrets':
        return (
          <SecretsContent
            unlockedIds={secretUnlocks.unlockedIds}
            onUnlockSecret={unlockSecret}
            onOpenWallpapers={openPersonalize}
            onResetUnlocks={resetSecretUnlocks}
          />
        )
    }
  }

  return (
    <div className={scanlines ? 'scanlines' : undefined}>
      {!booted ? (
        <BootScreen
          onPowerOn={soundEffects.playStartup}
          onDone={() => {
            setBooted(true)
            soundEffects.startAmbience()
          }}
        />
      ) : null}

      <MenuBar
        onOpen={openWindow}
        scanlines={scanlines}
        onToggleScanlines={toggleScanlinesWithNotice}
        theme={theme}
        onToggleTheme={toggleThemeWithNotice}
        soundEffectsEnabled={soundEffects.soundEffectsEnabled}
        onToggleSoundEffects={toggleSoundEffectsWithNotice}
        onOpenCommandPalette={openCommandPalette}
      />

      <WallpaperManager
        id="jack-os-desktop"
        tabIndex={-1}
        wallpaperId={preferences.wallpaperId}
        unlockedSecretIds={secretUnlocks.unlockedIds}
        className="relative min-h-[100dvh] pt-8"
        aria-label="Jack OS desktop"
        onContextMenu={handleDesktopContextMenu}
        onPointerDown={contextMenu ? () => closeContextMenu() : undefined}
      >
        {/* Desktop watermark */}
        <p
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 max-w-xs font-pixel text-[9px] leading-relaxed text-muted-foreground/60"
        >
          Jack OS Version {JACK_OS_VERSION}
          <br />
          {JACK_OS_RELEASE_NAME}
          <br />
          {isMobile ? 'Tap an icon to open' : 'Double-click an icon to open'}
        </p>

        {/* Desktop widgets */}
        {!isMobile && booted && (preferences.showClock || preferences.showCalendar) ? (
          <div
            data-desktop-interactive="true"
            className="absolute left-4 top-12 z-[2] flex w-[178px] flex-col gap-3"
          >
            {preferences.showClock ? <DesktopClock /> : null}
            {preferences.showCalendar ? (
              <DesktopCalendar onOpenCalendar={() => undefined} />
            ) : null}
          </div>
        ) : null}

        {/* Desktop icons */}
        {!isMobile ? (
          <div
            data-desktop-interactive="true"
            className="absolute inset-0 z-[3] pointer-events-none"
          >
            {desktopItems.map((item) => (
              <DesktopIcon
                key={item.id}
                item={item}
                variant="desktop"
                onOpenWindow={openWindow}
                draggable
                position={getIconPixelPosition(
                  iconLayout[item.id] ?? defaultIconLayout[item.id],
                )}
                onClampDragPosition={(x, y) => getIconPixelPosition(getGridPositionFromPixels(x, y))}
                onCommitDragPosition={commitIconPosition}
              />
            ))}
          </div>
        ) : null}

        {/* Mobile: OS-style app grid (only when nothing is open) */}
        {isMobile && visibleWindows.length === 0 ? (
          <div className="animate-fade-in px-5 pb-24 pt-6">
            <div className="os-border bg-paper/70 p-4">
              <p className="font-pixel text-[10px] leading-relaxed text-foreground">
                Welcome to Jack OS
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap an app to explore Jack Dennehey&apos;s work.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <DesktopIcon
                item={{ kind: 'window', id: 'home', label: 'Home', Icon: WINDOW_APPS.home.Icon }}
                variant="mobile"
                onOpenWindow={openWindow}
              />
              {desktopItems.map((item) => (
                <DesktopIcon
                  key={item.id}
                  item={item}
                  variant="mobile"
                  onOpenWindow={openWindow}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Windows */}
        {windows.map((w) => {
          const app = WINDOW_APPS[w.id]
          const z = 10 + order.indexOf(w.id)
          return (
            <OsWindow
              key={w.id}
              app={app}
              x={w.x}
              y={w.y}
              width={w.width}
              height={w.height}
              z={z}
              status={w.status}
              focused={topId === w.id}
              isMobile={isMobile}
              onFocus={() => {
                if (w.status !== 'closing' && w.status !== 'minimized') {
                  focusWindow(w.id)
                }
              }}
              onClose={() => closeWindow(w.id)}
              onMinimize={() => minimizeWindow(w.id)}
              onMaximize={() => maximizeWindow(w.id)}
              onMove={(x, y) => moveWindow(w.id, x, y)}
            >
              {renderContent(w.id)}
            </OsWindow>
          )
        })}

        {!isMobile ? (
          <MinimizedWindowStrip
            windows={minimizedWindows.map((w) => WINDOW_APPS[w.id])}
            onRestore={(id) => restoreWindow(id)}
          />
        ) : null}

        {/* Mobile: home indicator to close current app */}
        {isMobile && visibleWindows.length > 0 ? (
          <button
            type="button"
            onClick={() => topId && closeWindow(topId)}
            className="fixed inset-x-0 bottom-0 z-[60] flex h-12 items-center justify-center border-t-2 border-border bg-paper font-pixel text-[9px] leading-none text-foreground"
          >
            ◄ Close
          </button>
        ) : null}

        {contextMenu ? (
          <DesktopContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onPersonalize={openPersonalize}
            onResetWallpaper={resetWallpaperWithNotice}
            onResetDesktopLayout={resetDesktopLayout}
          />
        ) : null}

        <CommandPalette
          open={commandPaletteOpen}
          commands={commandRegistry}
          onClose={closeCommandPalette}
        />

        <NotificationCenter
          notifications={notifications.notifications}
          onDismiss={notifications.dismiss}
        />

        {onboardingOpen ? (
          <OnboardingDialog
            isMobile={isMobile}
            onFinish={finishWelcomeTour}
            onSkip={skipWelcomeTour}
            onClose={skipWelcomeTour}
          />
        ) : null}

        {confirmRestoreDefault ? (
          <SystemConfirmationDialog
            title="Restore Default Desktop"
            message="This resets open windows and desktop icon positions. Wallpaper, theme, sound, CRT, and secret unlocks stay intact."
            confirmLabel="Restore Desktop"
            onCancel={() => setConfirmRestoreDefault(false)}
            onConfirm={restoreDefaultDesktop}
          />
        ) : null}
      </WallpaperManager>
    </div>
  )
}

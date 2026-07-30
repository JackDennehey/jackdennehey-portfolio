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
import { RecruiterViewContent } from './content/recruiter-view-content'
import { KeyboardShortcutsContent } from './content/keyboard-shortcuts-content'
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
import { CONTACT, getProjectBySlug } from '@/lib/portfolio-data'
import {
  DEFAULT_WALLPAPER_ID,
  getWallpaperAsset,
  isHiddenWallpaper,
} from '@/lib/wallpapers'
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
type HistoryMode = 'push' | 'replace'
type OpenWindowOptions = {
  playSound?: boolean
  updateHash?: boolean
  history?: HistoryMode
  projectSlug?: string | null
}
type ContextMenuPosition = { x: number; y: number } | null

const CONTEXT_MENU_WIDTH = 176
const CONTEXT_MENU_HEIGHT = 92
const WINDOW_OPEN_DURATION_MS = 180
const WINDOW_CLOSE_DURATION_MS = 160
const DESKTOP_EDGE_PADDING = 8
const MENU_BAR_HEIGHT = 32
const MIN_VISIBLE_TITLEBAR_WIDTH = 128
const DESKTOP_BOTTOM_TITLEBAR_MARGIN = 48
const MAXIMIZED_MARGIN = 8
const DESKTOP_SESSION_WINDOW_LIMIT = 7
const OBSOLETE_DESKTOP_ICON_LAYOUT_STORAGE_KEY = 'jack-os:desktop-icon-layout.v1'
const PRIMARY_DESKTOP_ITEM_IDS: readonly string[] = [
  'home',
  'about',
  'projects',
  'certifications',
  'contact',
  'resume',
  'recruiter',
] as const
const SYSTEM_DESKTOP_ITEM_IDS: readonly string[] = ['wallpapers', 'system-info', 'secrets'] as const
const EXTERNAL_DESKTOP_ITEM_IDS: readonly string[] = ['github', 'linkedin'] as const

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

function writeCleanUrl(nextUrl: string, mode: HistoryMode) {
  if (typeof window === 'undefined') return

  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === nextUrl) {
    return
  }

  if (mode === 'replace') {
    window.history.replaceState(null, '', nextUrl)
    return
  }

  window.history.pushState(null, '', nextUrl)
}

function syncWindowHash(id: WindowId, mode: HistoryMode = 'push') {
  if (typeof window === 'undefined') return

  const slug = getWindowHash(id)
  const nextUrl = `${window.location.pathname}${window.location.search}#${slug}`
  writeCleanUrl(nextUrl, mode)
}

function syncProjectHash(slug: string, mode: HistoryMode = 'push') {
  if (typeof window === 'undefined') return
  const nextUrl = `${window.location.pathname}${window.location.search}#projects/${slug}`
  writeCleanUrl(nextUrl, mode)
}

function getProjectSlugFromHash(hash: string): string | null | undefined {
  const slug = hash.replace(/^#/, '').trim().toLowerCase()
  if (slug === 'projects') return null
  if (!slug.startsWith('projects/')) return undefined
  return slug.slice('projects/'.length).split('/')[0] || null
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
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null)
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
  const sessionStartedAt = useRef(Date.now())
  const windowOpenSequence = useRef(0)
  const openTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const closeTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const windowAppIds = useMemo(() => Object.keys(WINDOW_APPS) as WindowId[], [])
  const desktopItems = useMemo(() => DESKTOP_ITEMS, [])
  const primaryDesktopItems = useMemo(
    () => desktopItems.filter((item) => PRIMARY_DESKTOP_ITEM_IDS.includes(item.id)),
    [desktopItems],
  )
  const systemDesktopItems = useMemo(
    () => desktopItems.filter((item) => SYSTEM_DESKTOP_ITEM_IDS.includes(item.id)),
    [desktopItems],
  )
  const externalDesktopItems = useMemo(
    () => desktopItems.filter((item) => EXTERNAL_DESKTOP_ITEM_IDS.includes(item.id)),
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
    try {
      window.localStorage.removeItem(OBSOLETE_DESKTOP_ICON_LAYOUT_STORAGE_KEY)
    } catch {
      // Old Phase 4B icon coordinates are ignored in Phase 4C.
    }
  }, [])

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

      if (windowId === 'projects') {
        if (options.projectSlug !== undefined) {
          setSelectedProjectSlug(getProjectBySlug(options.projectSlug)?.slug ?? null)
        } else if (options.updateHash !== false) {
          setSelectedProjectSlug(null)
        }
      }

      if (options.updateHash !== false) {
        if (windowId === 'projects' && options.projectSlug) {
          syncProjectHash(options.projectSlug, options.history ?? 'push')
        } else {
          syncWindowHash(windowId, options.history ?? 'push')
        }
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

  const topId = order[order.length - 1]
  const minimizedWindows = windows.filter((w) => w.status === 'minimized')
  const visibleWindows = windows.filter((w) => w.status !== 'minimized')

  const copyTextToClipboard = useCallback(
    (text: string, successTitle: string, fallbackTitle: string) => {
      if (!navigator.clipboard) {
        notify({
          title: fallbackTitle,
          message: text,
          type: 'warning',
        })
        return
      }

      void navigator.clipboard
        .writeText(text)
        .then(() => {
          notify({
            title: successTitle,
            message: text,
            type: 'success',
          })
        })
        .catch(() => {
          notify({
            title: fallbackTitle,
            message: text,
            type: 'warning',
          })
        })
    },
    [notify],
  )

  const getCleanShareUrl = useCallback(
    (hash?: string) => {
      if (typeof window === 'undefined') return `https://${CONTACT.domain}`

      const url = new URL(window.location.href)
      if (hash !== undefined) {
        url.hash = hash
      } else if (topId) {
        url.hash =
          topId === 'projects' && selectedProjectSlug
            ? `projects/${selectedProjectSlug}`
            : getWindowHash(topId)
      }
      return url.toString()
    },
    [selectedProjectSlug, topId],
  )

  const copyEmailToClipboard = useCallback(() => {
    copyTextToClipboard(CONTACT.email, 'Email copied', 'Copy unavailable')
  }, [copyTextToClipboard])

  const copyPortfolioLink = useCallback(() => {
    copyTextToClipboard(getCleanShareUrl(), 'Portfolio link copied', 'Copy unavailable')
  }, [copyTextToClipboard, getCleanShareUrl])

  const copyProjectLink = useCallback(
    (slug: string) => {
      copyTextToClipboard(
        getCleanShareUrl(`projects/${slug}`),
        'Project link copied',
        'Copy unavailable',
      )
    },
    [copyTextToClipboard, getCleanShareUrl],
  )

  const openProjectDetail = useCallback(
    (slug: string) => {
      const project = getProjectBySlug(slug)
      const nextSlug = project?.slug ?? null
      setSelectedProjectSlug(nextSlug)
      if (nextSlug) {
        syncProjectHash(nextSlug)
      } else {
        syncWindowHash('projects')
      }
      openWindow('projects', { updateHash: false, projectSlug: nextSlug })
    },
    [openWindow],
  )

  const showProjectsIndex = useCallback(() => {
    setSelectedProjectSlug(null)
    syncWindowHash('projects')
    openWindow('projects', { updateHash: false, projectSlug: null })
  }, [openWindow])

  const restartJackOs = useCallback(() => {
    setContextMenu(null)
    setCommandPaletteOpen(false)
    setOnboardingOpen(false)
    setConfirmRestoreDefault(false)
    soundEffects.stopAmbience(true, false)
    setBooted(false)
  }, [soundEffects])

  const showResumeUnavailableNotice = useCallback(() => {
    notify({
      title: 'Resume unavailable',
      message: 'The public resume is being prepared.',
      type: 'info',
    })
  }, [notify])

  const restoreDefaultDesktop = useCallback(() => {
    setConfirmRestoreDefault(false)
    clearDesktopSession()
    Object.values(openTimers.current).forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    Object.values(closeTimers.current).forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    openTimers.current = {}
    closeTimers.current = {}
    windowsRef.current = []
    orderRef.current = []
    setWindows([])
    setOrder([])
    setSelectedProjectSlug(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
    windowOpenSequence.current = 0
    if (!isMobile) {
      window.setTimeout(() => openWindow('home', { playSound: false, updateHash: false }), 0)
    }
    notify({
      title: 'Settings restored',
      message: 'Open windows and saved window positions were reset.',
      type: 'success',
    })
  }, [isMobile, notify, openWindow])

  const showWelcomeTour = useCallback(() => {
    setCommandPaletteOpen(false)
    setOnboardingOpen(true)
  }, [])

  const openKeyboardShortcutsFromTour = useCallback(() => {
    setOnboardingOpen(false)
    openWindow('shortcuts')
  }, [openWindow])

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

  const openHashTarget = useCallback(
    (hash: string) => {
      const projectSlug = getProjectSlugFromHash(hash)
      if (projectSlug !== undefined) {
        openWindow('projects', {
          playSound: false,
          updateHash: false,
          projectSlug,
        })
        return true
      }

      const hashWindow = getWindowIdFromHash(hash)
      if (hashWindow) {
        openWindow(hashWindow, { playSound: false, updateHash: false })
        return true
      }

      if (!hash) {
        setSelectedProjectSlug(null)
        if (!isMobile) {
          openWindow('home', { playSound: false, updateHash: false })
        }
        return true
      }

      return false
    },
    [isMobile, openWindow],
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
    if (window.location.hash && openHashTarget(window.location.hash)) {
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
  }, [booted, isMobile, openHashTarget, openWindow, windowAppIds])

  useEffect(() => {
    const onHistoryChange = () => {
      if (!booted) return

      openHashTarget(window.location.hash)
    }

    window.addEventListener('hashchange', onHistoryChange)
    window.addEventListener('popstate', onHistoryChange)
    return () => {
      window.removeEventListener('hashchange', onHistoryChange)
      window.removeEventListener('popstate', onHistoryChange)
    }
  }, [booted, openHashTarget])

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
      if (e.defaultPrevented || document.querySelector('[data-jack-os-menu-open="true"]')) return
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
      'recruiter',
      'system-info',
      'shortcuts',
      'about',
      'projects',
      'certifications',
      'resume',
      'contact',
      'wallpapers',
      'secrets',
    ]
    const appAliases: Partial<Record<WindowId, readonly string[]>> = {
      home: ['welcome', 'start', 'intro'],
      recruiter: ['recruiter view', 'hire', 'professional overview', 'guided'],
      'system-info': ['system information', 'about this computer', 'about jack os', 'version'],
      shortcuts: ['keyboard shortcuts', 'help', 'interaction help', 'controls'],
      about: ['about me', 'jack', 'bio', 'biography', 'profile'],
      projects: ['work', 'portfolio', 'case studies', 'development', 'website'],
      resume: ['cv'],
      contact: ['email', 'mail', 'gmail', 'linkedin', 'github', 'connect', 'hire'],
      certifications: ['credentials', 'certifications', 'certificates', 'education', 'cisco', 'cybersecurity', 'azure', 'aws'],
      wallpapers: ['personalize', 'background', 'desktop', 'settings', 'preferences', 'theme', 'sound', 'crt'],
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
        id: 'enter-recruiter-view',
        title: 'Enter Recruiter View',
        subtitle: 'Guided professional overview',
        keywords: ['recruiter', 'hire', 'overview', 'professional', 'guided'],
        Icon: WINDOW_APPS.recruiter.Icon,
        action: () => openWindow('recruiter'),
      },
      {
        id: 'open-jack-os-case-study',
        title: 'Open Jack OS Case Study',
        subtitle: 'Featured project',
        keywords: ['jack os', 'case study', 'project', 'website', 'portfolio'],
        Icon: WINDOW_APPS.projects.Icon,
        action: () => openProjectDetail('jack-os'),
      },
      {
        id: 'copy-portfolio-link',
        title: 'Copy Portfolio Link',
        subtitle: 'Share current Jack OS view',
        keywords: ['copy link', 'share', 'portfolio url', 'website'],
        action: copyPortfolioLink,
      },
      {
        id: 'copy-email',
        title: 'Copy Email',
        subtitle: CONTACT.email,
        keywords: ['email', 'gmail', 'contact', 'copy', 'connect'],
        action: copyEmailToClipboard,
      },
      {
        id: 'restart-jack-os',
        title: 'Restart Jack OS',
        subtitle: 'Replay startup',
        keywords: ['restart', 'boot', 'startup', 'power'],
        action: restartJackOs,
      },
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
        id: 'restore-default-desktop',
        title: 'Restore Default Desktop',
        subtitle: 'Reset open windows and saved window positions',
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
    copyEmailToClipboard,
    copyPortfolioLink,
    isMobile,
    minimizedWindows.length,
    minimizeActiveWindow,
    openProjectDetail,
    openWindow,
    resetWelcomeTour,
    restartJackOs,
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
            onOpenProject={openProjectDetail}
            onEnterRecruiterView={() => openWindow('recruiter')}
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
            onRestoreDefaultDesktop={() => setConfirmRestoreDefault(true)}
          />
        )
      case 'about':
        return <AboutContent onOpen={openWindow} />
      case 'projects':
        return (
          <ProjectsContent
            selectedProjectSlug={selectedProjectSlug}
            onSelectProject={openProjectDetail}
            onBackToProjects={showProjectsIndex}
            onCopyProjectLink={copyProjectLink}
          />
        )
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
        return (
          <ContactContent
            onCopyEmail={copyEmailToClipboard}
            onCopyPortfolioLink={copyPortfolioLink}
          />
        )
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
      case 'recruiter':
        return (
          <RecruiterViewContent
            onOpen={openWindow}
            onOpenProject={openProjectDetail}
            onCopyEmail={copyEmailToClipboard}
            onCopyPortfolioLink={copyPortfolioLink}
            onExit={() => closeWindow('recruiter')}
          />
        )
      case 'shortcuts':
        return <KeyboardShortcutsContent />
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
        onOpenProjectCaseStudy={openProjectDetail}
        onRestart={restartJackOs}
        onRestoreDefaultDesktop={() => setConfirmRestoreDefault(true)}
        onShowWelcomeTour={showWelcomeTour}
        onCopyPortfolioLink={copyPortfolioLink}
        onCopyEmail={copyEmailToClipboard}
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
            className="pointer-events-none absolute inset-0 z-[3]"
          >
            <div className="pointer-events-auto absolute left-4 top-[20rem] grid grid-cols-2 gap-x-3 gap-y-3 xl:top-[18rem]">
              {primaryDesktopItems.map((item) => (
                <DesktopIcon
                  key={item.id}
                  item={item}
                  variant="desktop"
                  onOpenWindow={openWindow}
                />
              ))}
            </div>

            <div className="pointer-events-auto absolute right-4 top-12 grid grid-cols-1 gap-3">
              {systemDesktopItems.map((item) => (
                <DesktopIcon
                  key={item.id}
                  item={item}
                  variant="desktop"
                  onOpenWindow={openWindow}
                />
              ))}
            </div>

            <div className="pointer-events-auto absolute bottom-24 right-4 grid grid-cols-2 gap-3">
              {externalDesktopItems.map((item) => (
                <DesktopIcon
                  key={item.id}
                  item={item}
                  variant="desktop"
                  onOpenWindow={openWindow}
                />
              ))}
            </div>
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
            onOpenShortcuts={openKeyboardShortcutsFromTour}
          />
        ) : null}

        {confirmRestoreDefault ? (
          <SystemConfirmationDialog
            title="Restore Default Desktop"
            message="This resets open windows and saved window positions. Wallpaper, theme, sound, CRT, and secret unlocks stay intact."
            confirmLabel="Restore Desktop"
            onCancel={() => setConfirmRestoreDefault(false)}
            onConfirm={restoreDefaultDesktop}
          />
        ) : null}
      </WallpaperManager>
    </div>
  )
}

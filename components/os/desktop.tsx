'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import dynamic from 'next/dynamic'
import { BootScreen } from './boot-screen'
import { MenuBar } from './menu-bar'
import { AchievementsPanel } from './achievements-panel'
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
import { JdWidget } from './jd-widget'
import { useDesktopPreferences } from './use-desktop-preferences'
import { useHourlyChime } from './use-hourly-chime'
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
import { RecruiterModeContent } from './content/recruiter-mode-content'
import { JdAssistantContent } from './content/jd-assistant-content'
import { useSoundEffects } from './use-sound-effects'
import { useInterfaceTheme } from './use-interface-theme'
import { MinimizedWindowStrip } from './minimized-window-strip'
import { useSecretUnlocks } from './use-secret-unlocks'
import {
  getSecretDefinition,
  type SecretId,
} from '@/lib/secrets'
import {
  CURRENT_WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  getWallpaperAsset,
  isHiddenWallpaper,
} from '@/lib/wallpapers'
import { CONTACT, CREDENTIALS, PROJECTS } from '@/lib/portfolio-data'
import {
  RECRUITER_SECTIONS,
  isRecruiterSectionId,
  type RecruiterSectionId,
} from '@/lib/portfolio-knowledge'
import {
  ACHIEVEMENTS_STORAGE_KEY,
  ACHIEVEMENT_MESSAGES,
  INTERACTIVE_APPS_OPENED_STORAGE_KEY,
  JACK_OS_ACHIEVEMENT_IDS,
  JACK_OS_ACHIEVEMENT_REGISTRY,
  JACK_OS_5B_APP_IDS,
  parseStoredIds,
  type JackOsAchievementId,
  type JackOsInteractiveAppId,
} from '@/lib/achievements'
import { TIMELINE_ENTRIES } from '@/lib/timeline-data'

const TimelineContent = dynamic(
  () => import('./content/timeline-content').then((module) => module.TimelineContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Timeline..." /> },
)
const GuestbookContent = dynamic(
  () => import('./content/guestbook-content').then((module) => module.GuestbookContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Guestbook..." /> },
)
const NetworkFirewallContent = dynamic(
  () =>
    import('./content/network-firewall-content').then(
      (module) => module.NetworkFirewallContent,
    ),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Firewall..." /> },
)
const RoadmapContent = dynamic(
  () => import('./content/roadmap-content').then((module) => module.RoadmapContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Road Map..." /> },
)
const BlueOceanContent = dynamic(
  () => import('./content/blue-ocean-content').then((module) => module.BlueOceanContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Keynote..." /> },
)

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
const CONTEXT_MENU_HEIGHT = 92
const WINDOW_OPEN_DURATION_MS = 180
const WINDOW_CLOSE_DURATION_MS = 160
const DESKTOP_EDGE_PADDING = 8
const MENU_BAR_HEIGHT = 32
const MIN_VISIBLE_TITLEBAR_WIDTH = 128
const DESKTOP_BOTTOM_TITLEBAR_MARGIN = 48
const DESKTOP_BOTTOM_SAFE_AREA = 72
const MAXIMIZED_MARGIN = 8
const COPY_CONFIRMATION_DURATION_MS = 2200
const ACHIEVEMENT_NOTICE_DURATION_MS = 3200
const INITIAL_WINDOW_CASCADE_STEP = 28
const INITIAL_WINDOW_CASCADE_SLOTS = 5
const AUTO_MAXIMIZED_WINDOW_IDS = new Set<WindowId>(['recruiter', 'firewall'])
const DESKTOP_ICON_DEFAULT_ROWS = 7
const DESKTOP_ICON_TOP_OFFSET = 44
const DESKTOP_ICON_BOTTOM_PADDING = 28
const DESKTOP_ICON_ROW_HEIGHT = 78
const DESKTOP_ICON_ROW_GAP = 10

function formatUptime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function readStoredAchievementIds() {
  if (typeof window === 'undefined') return []

  try {
    return parseStoredIds(
      window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY),
      JACK_OS_ACHIEVEMENT_IDS,
    )
  } catch {
    return []
  }
}

function LazyWindowLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-48 place-items-center os-border bg-secondary p-4">
      <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{label}</p>
    </div>
  )
}

function getUsableDesktopBounds() {
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

function clampWindowPosition(
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

function clampWindowGeometry(id: WindowId, geometry: WindowGeometry): WindowGeometry {
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

function writeHashSlug(slug: string, mode: 'push' | 'replace' = 'push') {
  if (typeof window === 'undefined') return

  const nextUrl = `${window.location.pathname}${window.location.search}#${slug}`
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` === nextUrl) {
    return
  }

  if (mode === 'replace') {
    window.history.replaceState(null, '', nextUrl)
    return
  }

  window.history.pushState(null, '', nextUrl)
}

function syncWindowHash(id: WindowId, mode: 'push' | 'replace' = 'push') {
  writeHashSlug(getWindowHash(id), mode)
}

function getRecruiterSectionFromHash(hash: string): RecruiterSectionId | null {
  const slug = hash.replace(/^#/, '').trim().toLowerCase()
  if (slug === 'recruiter') return 'overview'
  if (!slug.startsWith('recruiter/')) return null

  const sectionSlug = slug.replace(/^recruiter\//, '')
  if (sectionSlug === 'skills-and-direction') return 'skills'
  return isRecruiterSectionId(sectionSlug) ? sectionSlug : 'overview'
}

function getRecruiterHash(section: RecruiterSectionId) {
  return section === 'overview' ? 'recruiter' : `recruiter/${section}`
}

function isInteractiveAppId(id: WindowId): id is JackOsInteractiveAppId {
  return (JACK_OS_5B_APP_IDS as readonly string[]).includes(id)
}

function getDesktopIconRows(viewportHeight: number) {
  const availableHeight = Math.max(
    DESKTOP_ICON_ROW_HEIGHT,
    viewportHeight - DESKTOP_ICON_TOP_OFFSET - DESKTOP_ICON_BOTTOM_PADDING,
  )

  return Math.max(
    1,
    Math.floor(
      (availableHeight + DESKTOP_ICON_ROW_GAP) /
        (DESKTOP_ICON_ROW_HEIGHT + DESKTOP_ICON_ROW_GAP),
    ),
  )
}

export function Desktop() {
  const [booted, setBooted] = useState(false)
  const [scanlines, setScanlines] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [desktopIconRows, setDesktopIconRows] = useState(DESKTOP_ICON_DEFAULT_ROWS)
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [order, setOrder] = useState<WindowId[]>([])
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [achievementsPanelOpen, setAchievementsPanelOpen] = useState(false)
  const [earnedAchievementIds, setEarnedAchievementIds] = useState<JackOsAchievementId[]>([])
  const [uptimeSeconds, setUptimeSeconds] = useState(0)
  const [uiActivity, setUiActivity] = useState(8)
  const [recruiterSection, setRecruiterSection] = useState<RecruiterSectionId>('overview')
  const [assistantSeedPrompt, setAssistantSeedPrompt] = useState<{
    question: string
    nonce: number
  } | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const [achievementNotice, setAchievementNotice] = useState<{
    title: string
    message: string
  } | null>(null)
  const secretUnlocks = useSecretUnlocks()
  const { preferences, preferencesLoaded, updatePreferences, resetWallpaper } =
    useDesktopPreferences(secretUnlocks.unlockedIds, secretUnlocks.loaded)
  const soundEffects = useSoundEffects()
  const { theme, toggleTheme } = useInterfaceTheme()
  const windowsRef = useRef<OpenWindow[]>([])
  const handledInitialHash = useRef(false)
  const windowOpenSequence = useRef(0)
  const assistantPromptSequence = useRef(0)
  const bootedAt = useRef<number | null>(null)
  const copyStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const achievementNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstBootAchievementTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uiActivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const closeTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})

  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  useHourlyChime({
    booted,
    enabled: preferences.hourlyChime,
    soundEffectsEnabled: soundEffects.soundEffectsEnabled,
    playHourlyChime: soundEffects.playHourlyChime,
  })

  useEffect(() => {
    setEarnedAchievementIds(readStoredAchievementIds())
  }, [])

  useEffect(() => {
    if (!booted) return
    bootedAt.current = Date.now()

    const updateUptime = () => {
      if (document.hidden || bootedAt.current === null) return
      setUptimeSeconds(Math.max(0, Math.floor((Date.now() - bootedAt.current) / 1000)))
    }

    updateUptime()
    const intervalId = window.setInterval(updateUptime, 1000)
    document.addEventListener('visibilitychange', updateUptime)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', updateUptime)
    }
  }, [booted])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const updateDesktopIconRows = () => {
      setDesktopIconRows(
        getDesktopIconRows(window.visualViewport?.height ?? window.innerHeight),
      )
    }

    updateDesktopIconRows()
    window.addEventListener('resize', updateDesktopIconRows)
    window.visualViewport?.addEventListener('resize', updateDesktopIconRows)

    return () => {
      window.removeEventListener('resize', updateDesktopIconRows)
      window.visualViewport?.removeEventListener('resize', updateDesktopIconRows)
    }
  }, [])

  const focusWindow = useCallback((id: WindowId) => {
    setOrder((prev) => [...prev.filter((w) => w !== id), id])
  }, [])

  const focusDesktop = useCallback(() => {
    window.setTimeout(() => {
      document.getElementById('jack-os-desktop')?.focus()
    }, 0)
  }, [])

  const showAchievement = useCallback(
    (achievementId: JackOsAchievementId) => {
      const newlyUnlocked = soundEffects.achievementUnlocked(achievementId)
      if (!newlyUnlocked) return

      setEarnedAchievementIds((current) =>
        current.includes(achievementId) ? current : [...current, achievementId],
      )
      if (achievementNoticeTimer.current) {
        clearTimeout(achievementNoticeTimer.current)
      }
      setAchievementNotice(ACHIEVEMENT_MESSAGES[achievementId])
      achievementNoticeTimer.current = setTimeout(() => {
        setAchievementNotice(null)
        achievementNoticeTimer.current = null
      }, ACHIEVEMENT_NOTICE_DURATION_MS)
    },
    [soundEffects],
  )

  const bumpUiActivity = useCallback((amount = 16) => {
    setUiActivity((current) => Math.min(99, Math.max(12, current + amount)))
    if (uiActivityTimer.current) {
      clearTimeout(uiActivityTimer.current)
    }
    uiActivityTimer.current = setTimeout(() => {
      setUiActivity((current) => Math.max(8, Math.round(current * 0.45)))
      uiActivityTimer.current = null
    }, 1400)
  }, [])

  useEffect(() => {
    if (!booted) return
    firstBootAchievementTimer.current = setTimeout(() => {
      showAchievement('first-boot')
    }, 650)

    return () => {
      if (firstBootAchievementTimer.current) {
        clearTimeout(firstBootAchievementTimer.current)
        firstBootAchievementTimer.current = null
      }
    }
  }, [booted, showAchievement])

  const recordInteractiveAppOpen = useCallback(
    (id: WindowId) => {
      if (!isInteractiveAppId(id) || typeof window === 'undefined') return

      try {
        const current = parseStoredIds(
          window.localStorage.getItem(INTERACTIVE_APPS_OPENED_STORAGE_KEY),
          JACK_OS_5B_APP_IDS,
        )
        const next = current.includes(id) ? current : [...current, id]
        window.localStorage.setItem(
          INTERACTIVE_APPS_OPENED_STORAGE_KEY,
          JSON.stringify(next),
        )
        if (JACK_OS_5B_APP_IDS.every((appId) => next.includes(appId))) {
          showAchievement('interactive-update-explorer')
        }
      } catch {
        // Achievement progress is nice-to-have and must never block app opening.
      }
    },
    [showAchievement],
  )

  const openWindow = useCallback(
    (id: string, options: OpenWindowOptions = {}) => {
      const windowId = id as WindowId
      if (!WINDOW_APPS[windowId]) return

      const existing = windowsRef.current.find((w) => w.id === windowId)
      if (windowId === 'recruiter' && options.updateHash !== false) {
        if (!existing) {
          setRecruiterSection('overview')
        }
        writeHashSlug(getRecruiterHash(existing ? recruiterSection : 'overview'))
      } else if (options.updateHash !== false) {
        syncWindowHash(windowId)
      }

      if (existing) {
        if (existing.status === 'minimized') {
          const restoredStatus: RestorableWindowStatus =
            AUTO_MAXIMIZED_WINDOW_IDS.has(windowId) && !isMobile
              ? 'maximized'
              : (existing.restoreStatus ?? 'open')
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
        } else if (
          AUTO_MAXIMIZED_WINDOW_IDS.has(windowId) &&
          !isMobile &&
          existing.status !== 'maximized'
        ) {
          const normal = {
            x: existing.x,
            y: existing.y,
            width: existing.width,
            height: existing.height,
          }
          const maximized = getMaximizedGeometry()
          windowsRef.current = windowsRef.current.map((w) =>
            w.id === windowId ? { ...w, ...maximized, normal, status: 'maximized' } : w,
          )
          setWindows(windowsRef.current)
        }
        focusWindow(windowId)
        return
      }

      const normalGeometry = getInitialWindowGeometry(windowId, windowOpenSequence.current)
      const geometry =
        AUTO_MAXIMIZED_WINDOW_IDS.has(windowId) && !isMobile
          ? getMaximizedGeometry()
          : normalGeometry
      windowOpenSequence.current += 1
      const nextWindow: OpenWindow = {
        id: windowId,
        ...geometry,
        normal: normalGeometry,
        status: 'opening',
      }
      windowsRef.current = [...windowsRef.current, nextWindow]
      setWindows((prev) =>
        prev.some((w) => w.id === windowId) ? prev : [...prev, nextWindow],
      )
      focusWindow(windowId)
      openTimers.current[windowId] = setTimeout(() => {
        windowsRef.current = windowsRef.current.map((w) =>
          w.id === windowId && w.status === 'opening'
            ? {
                ...w,
                status:
                  AUTO_MAXIMIZED_WINDOW_IDS.has(windowId) && !isMobile ? 'maximized' : 'open',
              }
            : w,
        )
        setWindows((prev) =>
          prev.map((w) =>
            w.id === windowId && w.status === 'opening'
              ? {
                  ...w,
                  status:
                    AUTO_MAXIMIZED_WINDOW_IDS.has(windowId) && !isMobile ? 'maximized' : 'open',
                }
              : w,
          ),
        )
        delete openTimers.current[windowId]
      }, WINDOW_OPEN_DURATION_MS)
      if (options.playSound !== false) {
        soundEffects.appOpen()
        recordInteractiveAppOpen(windowId)
        bumpUiActivity()
        if (windowId === 'recruiter') {
          showAchievement('recruiter-mode-opened')
        }
        if (windowId === 'timeline') {
          showAchievement('timeline-opened')
        }
        if (windowId === 'roadmap') {
          showAchievement('roadmap-opened')
        }
      }
    },
    [
      bumpUiActivity,
      focusWindow,
      isMobile,
      recruiterSection,
      recordInteractiveAppOpen,
      showAchievement,
      soundEffects,
    ],
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
    bumpUiActivity(10)
    closeTimers.current[id] = setTimeout(() => {
      windowsRef.current = windowsRef.current.filter((w) => w.id !== id)
      setWindows((prev) => prev.filter((w) => w.id !== id))
      setOrder((prev) => prev.filter((w) => w !== id))
      focusDesktop()
      delete closeTimers.current[id]
    }, WINDOW_CLOSE_DURATION_MS)
  }, [bumpUiActivity, focusDesktop, soundEffects])

  const moveWindow = useCallback((id: WindowId, x: number, y: number) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status === 'maximized' || target.status === 'minimized') {
      return
    }

    const position = clampWindowPosition(id, x, y, {
      width: target.width,
      height: target.height,
    })
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
    setOrder((prev) => prev.filter((w) => w !== id))
    bumpUiActivity(8)
    focusDesktop()
  }, [bumpUiActivity, focusDesktop])

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
    bumpUiActivity(8)
    focusWindow(id)
  }, [bumpUiActivity, focusWindow])

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
    setOrder((prev) => [
      ...prev.filter((id) => !minimizedWindows.some((w) => w.id === id)),
      ...minimizedWindows.map((w) => w.id),
    ])
    bumpUiActivity(10)
  }, [bumpUiActivity])

  const maximizeWindow = useCallback((id: WindowId) => {
    const target = windowsRef.current.find((w) => w.id === id)
    if (!target || target.status === 'minimized' || target.status === 'closing') return

    if (target.status === 'maximized') {
      const restoredGeometry = clampWindowGeometry(id, target.normal)
      windowsRef.current = windowsRef.current.map((w) =>
        w.id === id ? { ...w, ...restoredGeometry, status: 'open' } : w,
      )
      setWindows(windowsRef.current)
      bumpUiActivity(8)
      focusWindow(id)
      return
    }

    const normal = { x: target.x, y: target.y, width: target.width, height: target.height }
    const maximized = getMaximizedGeometry()
    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id ? { ...w, ...maximized, normal, status: 'maximized' } : w,
    )
    setWindows(windowsRef.current)
    bumpUiActivity(8)
    focusWindow(id)
  }, [bumpUiActivity, focusWindow])

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

  const openPersonalize = useCallback(() => {
    openWindow('wallpapers')
  }, [openWindow])

  const openSecrets = useCallback(() => {
    openWindow('secrets')
  }, [openWindow])

  const openSimpleMode = useCallback(() => {
    showAchievement('simple-mode-opened')
    window.location.assign('/simple')
  }, [showAchievement])

  const selectRecruiterSection = useCallback(
    (section: RecruiterSectionId) => {
      setRecruiterSection(section)
      writeHashSlug(getRecruiterHash(section))
      openWindow('recruiter', { playSound: false, updateHash: false })
    },
    [openWindow],
  )

  const openAssistant = useCallback(
    (question?: string) => {
      if (question) {
        assistantPromptSequence.current += 1
        setAssistantSeedPrompt({
          question,
          nonce: assistantPromptSequence.current,
        })
      }
      openWindow('assistant')
    },
    [openWindow],
  )

  const showCopyStatus = useCallback((message: string) => {
    if (copyStatusTimer.current) {
      clearTimeout(copyStatusTimer.current)
    }
    setCopyStatus(message)
    copyStatusTimer.current = setTimeout(() => {
      setCopyStatus(null)
      copyStatusTimer.current = null
    }, COPY_CONFIRMATION_DURATION_MS)
  }, [])

  const copyEmailToClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable')
      }
      await navigator.clipboard.writeText(CONTACT.email)
      showCopyStatus('Email copied')
    } catch {
      showCopyStatus(`Email: ${CONTACT.email}`)
    }
  }, [showCopyStatus])

  const unlockSecret = useCallback(
    (id: SecretId) => {
      const result = secretUnlocks.unlock(id)
      if (result === 'unlocked') {
        soundEffects.playSecretUnlock(id)
        showAchievement('secret-discovered')
      }
      return result
    },
    [secretUnlocks, showAchievement, soundEffects],
  )

  const resetSecretUnlocks = useCallback(() => {
    const activeWallpaper = getWallpaperAsset(preferences.wallpaperId)
    secretUnlocks.reset()
    if (isHiddenWallpaper(activeWallpaper)) {
      updatePreferences({ wallpaperId: DEFAULT_WALLPAPER_ID })
    }
  }, [preferences.wallpaperId, secretUnlocks, updatePreferences])

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
    if (!booted || !preferencesLoaded || handledInitialHash.current) return

    handledInitialHash.current = true
    const recruiterHashSection = getRecruiterSectionFromHash(window.location.hash)
    if (recruiterHashSection) {
      setRecruiterSection(recruiterHashSection)
      openWindow('recruiter', { playSound: false, updateHash: false })
      return
    }

    const hashWindow = getWindowIdFromHash(window.location.hash)
    if (hashWindow) {
      openWindow(hashWindow, { playSound: false, updateHash: false })
      return
    }

    if (!isMobile && windowsRef.current.length === 0 && !preferences.hasSeenFirstVisit) {
      openWindow('home', { playSound: false, updateHash: false })
      updatePreferences({ hasSeenFirstVisit: true })
    }
  }, [
    booted,
    isMobile,
    openWindow,
    preferences.hasSeenFirstVisit,
    preferencesLoaded,
    updatePreferences,
  ])

  useEffect(() => {
    const onHashChange = () => {
      if (!booted) return

      const recruiterHashSection = getRecruiterSectionFromHash(window.location.hash)
      if (recruiterHashSection) {
        setRecruiterSection(recruiterHashSection)
        openWindow('recruiter', { playSound: false, updateHash: false })
        return
      }

      const hashWindow = getWindowIdFromHash(window.location.hash)
      if (hashWindow) {
        openWindow(hashWindow, { playSound: false, updateHash: false })
      }
    }

    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [booted, openWindow])

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
    setOrder((prev) => [
      ...prev.filter((id) => !minimizedWindows.some((w) => w.id === id)),
      ...minimizedWindows.map((w) => w.id),
    ])
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
      if (copyStatusTimer.current) {
        clearTimeout(copyStatusTimer.current)
      }
      if (achievementNoticeTimer.current) {
        clearTimeout(achievementNoticeTimer.current)
      }
      if (firstBootAchievementTimer.current) {
        clearTimeout(firstBootAchievementTimer.current)
      }
      if (uiActivityTimer.current) {
        clearTimeout(uiActivityTimer.current)
      }
    }
  }, [])

  // Escape closes the top-most window.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contextMenu || commandPaletteOpen) return
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
  }, [commandPaletteOpen, contextMenu, order, closeWindow])

  const topId = order[order.length - 1]
  const desktopItems = useMemo(() => DESKTOP_ITEMS, [])
  const desktopIconItems = useMemo(
    () => desktopItems.filter((item) => !(item.kind === 'window' && item.id === 'assistant')),
    [desktopItems],
  )
  const desktopIconGridStyle = useMemo(
    () =>
      ({
        '--desktop-icon-rows': desktopIconRows,
      }) as CSSProperties,
    [desktopIconRows],
  )
  const minimizedWindows = windows.filter((w) => w.status === 'minimized')
  const visibleWindows = windows.filter((w) => w.status !== 'minimized')
  const uptimeLabel = formatUptime(uptimeSeconds)
  const recruiterVisible = windows.some(
    (w) => w.id === 'recruiter' && w.status !== 'minimized',
  )
  const effectiveScanlines = scanlines && !recruiterVisible

  const minimizeActiveWindow = useCallback(() => {
    if (topId) {
      minimizeWindow(topId)
    }
  }, [minimizeWindow, topId])

  const commandRegistry = useMemo<JackOsCommand[]>(() => {
    const appIds: WindowId[] = [
      'home',
      'blue-ocean',
      'about',
      'projects',
      'certifications',
      'recruiter',
      'resume',
      'contact',
      'assistant',
      'timeline',
      'guestbook',
      'firewall',
      'roadmap',
      'wallpapers',
      'secrets',
    ]
    const appAliases: Partial<Record<WindowId, readonly string[]>> = {
      home: ['welcome', 'system', 'start'],
      'blue-ocean': ['1984', 'blue ocean', 'keynote', 'presentation', 'retro computing'],
      about: ['about me', 'jack', 'bio'],
      certifications: ['credentials', 'certifications', 'certificates'],
      recruiter: ['corporate', 'professional', 'overview', 'recruiter mode'],
      assistant: ['jd', 'portfolio assistant', 'ask'],
      timeline: ['history', 'journey', 'milestones', 'education history', 'system history'],
      guestbook: ['visitor log', 'sign', 'message', 'comments'],
      firewall: [
        'network',
        'packets',
        'security',
        'ports',
        'traffic',
        'simulation',
        'packet inspector',
        'beginner guide',
        'firewall certified',
      ],
      roadmap: ['plans', 'goals', 'future direction', 'next steps', 'deployment track'],
      wallpapers: ['personalize', 'background', 'desktop'],
      secrets: ['hidden', 'files', 'manual'],
    }

    const appCommands = appIds.map((id) => {
      const app = WINDOW_APPS[id]
      return {
        id: `open-${id}`,
        title: id === 'home' ? 'Open Welcome' : `Open ${app.title}`,
        subtitle: app.description ? `Application / ${app.description}` : 'Application',
        keywords: [app.title, id, ...(appAliases[id] ?? [])],
        Icon: app.Icon,
        tone: app.tone,
        iconVisual: app.iconVisual,
        ariaLabel:
          id === 'recruiter'
            ? 'Open Recruiter Mode — guided professional overview'
            : undefined,
        action: () => openWindow(id),
      }
    })

    const timelineEntryCommands = TIMELINE_ENTRIES.map((entry) => ({
      id: `timeline-${entry.id}`,
      title: entry.title,
      subtitle: `Timeline / ${entry.category}`,
      keywords: [entry.title, entry.summary, entry.category, 'timeline', 'history', 'milestone'],
      Icon: WINDOW_APPS.timeline.Icon,
      action: () => openWindow('timeline'),
    }))

    const projectCommands = PROJECTS.map((project) => ({
      id: `project-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: project.title,
      subtitle: project.status ? `Project / ${project.status}` : 'Project',
      keywords: [
        project.title,
        project.description,
        project.status ?? '',
        ...project.technologies,
        'projects',
      ],
      Icon: WINDOW_APPS.projects.Icon,
      action: () => openWindow('projects'),
    }))

    const credentialCommands = CREDENTIALS.map((credential) => ({
      id: `credential-${credential.id}`,
      title: credential.title,
      subtitle: `${credential.issuer} / ${credential.status}`,
      keywords: [
        credential.title,
        credential.issuer,
        credential.status,
        credential.summary,
        'credentials',
        'certifications',
      ],
      Icon: WINDOW_APPS.certifications.Icon,
      iconVisual: WINDOW_APPS.certifications.iconVisual,
      action: () => openWindow('certifications'),
    }))

    const recruiterSectionCommands = RECRUITER_SECTIONS.map((section) => ({
      id: `recruiter-section-${section.id}`,
      title: `Recruiter: ${section.label}`,
      subtitle: 'Guided overview section',
      keywords: ['recruiter', 'overview', section.label, section.id],
      Icon: WINDOW_APPS.recruiter.Icon,
      tone: WINDOW_APPS.recruiter.tone,
      action: () => selectRecruiterSection(section.id),
    }))

    const wallpaperCommands = CURRENT_WALLPAPERS.map((wallpaper) => ({
      id: `wallpaper-${wallpaper.id}`,
      title: wallpaper.displayName,
      subtitle: 'Wallpaper / open gallery',
      keywords: [
        wallpaper.displayName,
        wallpaper.description,
        wallpaper.id,
        'wallpaper',
        'personalize',
        'background',
      ],
      Icon: WINDOW_APPS.wallpapers.Icon,
      action: () => openWindow('wallpapers'),
    }))

    const firewallHelpCommands = [
      'allow vs block',
      'inbound and outbound',
      'ports and protocols',
      'rule priority',
      'sample network traffic',
      'beginner guide',
      'packet inspector',
      'firewall certified',
    ].map((topic) => ({
      id: `firewall-help-${topic.replace(/\s+/g, '-')}`,
      title: `Firewall Help: ${topic}`,
      subtitle: 'Network Firewall',
      keywords: [topic, 'firewall', 'network', 'security', 'traffic'],
      Icon: WINDOW_APPS.firewall.Icon,
      action: () => openWindow('firewall'),
    }))

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
      ...projectCommands,
      ...credentialCommands,
      ...recruiterSectionCommands,
      ...timelineEntryCommands,
      ...wallpaperCommands,
      ...firewallHelpCommands,
      {
        id: 'return-to-jack-os',
        title: 'Return to Jack OS Desktop',
        subtitle: 'Focus desktop workspace',
        keywords: ['return to jack os', 'desktop', 'home', 'workspace', 'back'],
        action: focusDesktop,
      },
      {
        id: 'view-achievements',
        title: 'View Achievements',
        subtitle: `${earnedAchievementIds.length}/${JACK_OS_ACHIEVEMENT_REGISTRY.length} unlocked`,
        keywords: ['achievements', 'progress', 'trophies', 'completed', 'milestones'],
        action: () => setAchievementsPanelOpen(true),
      },
      {
        id: 'open-simple-mode',
        title: 'Open Simple Mode',
        subtitle: 'Professional portfolio view',
        keywords: ['simple', 'plain portfolio', 'professional view', 'resume view', 'recruiter'],
        Icon: WINDOW_APPS.recruiter.Icon,
        tone: WINDOW_APPS.recruiter.tone,
        action: openSimpleMode,
      },
      {
        id: 'ask-jd',
        title: 'Ask J.D.',
        subtitle: 'Portfolio Assistant',
        keywords: ['assistant', 'jd', 'question', 'ask'],
        Icon: WINDOW_APPS.assistant.Icon,
        action: () => openAssistant(),
      },
      {
        id: 'ask-jd-projects',
        title: 'Ask about projects',
        subtitle: 'J.D. topic shortcut',
        keywords: ['projects', 'jack os', 'built', 'portfolio assistant'],
        Icon: WINDOW_APPS.assistant.Icon,
        action: () => openAssistant('What has Jack built?'),
      },
      {
        id: 'ask-jd-credentials',
        title: 'Ask about credentials',
        subtitle: 'J.D. topic shortcut',
        keywords: ['credentials', 'certifications', 'earned', 'portfolio assistant'],
        Icon: WINDOW_APPS.assistant.Icon,
        action: () => openAssistant('What credentials has Jack earned?'),
      },
      {
        id: 'copy-email',
        title: 'Copy Email',
        subtitle: CONTACT.email,
        keywords: ['email', 'contact', 'copy', 'gmail'],
        Icon: WINDOW_APPS.contact.Icon,
        action: copyEmailToClipboard,
      },
      {
        id: 'toggle-theme',
        title: 'Toggle Light/Dark Theme',
        subtitle: `Current: ${theme}`,
        keywords: ['theme', 'light', 'dark'],
        action: toggleTheme,
      },
      {
        id: 'toggle-scanlines',
        title: 'Toggle CRT Lines',
        subtitle: scanlines ? 'Currently On' : 'Currently Off',
        keywords: ['crt', 'scanlines', 'lines'],
        action: () => setScanlines((value) => !value),
      },
      {
        id: 'toggle-sound-effects',
        title: 'Toggle Sound Effects',
        subtitle: soundEffects.soundEffectsEnabled ? 'Currently On' : 'Currently Off',
        keywords: ['sound', 'audio', 'effects'],
        action: () =>
          soundEffects.setSoundEffectsEnabled(!soundEffects.soundEffectsEnabled),
      },
      {
        id: 'toggle-hourly-chime',
        title: 'Toggle Hourly Chime',
        subtitle: preferences.hourlyChime ? 'Currently On' : 'Currently Off',
        keywords: ['hourly', 'chime', 'clock', 'ambience'],
        action: () => updatePreferences({ hourlyChime: !preferences.hourlyChime }),
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
    earnedAchievementIds.length,
    focusDesktop,
    isMobile,
    minimizedWindows.length,
    minimizeActiveWindow,
    openAssistant,
    openSimpleMode,
    openWindow,
    preferences.hourlyChime,
    restoreAllMinimized,
    scanlines,
    selectRecruiterSection,
    secretUnlocks.unlockedIds,
    soundEffects,
    theme,
    toggleTheme,
    topId,
    updatePreferences,
  ])

  const renderContent = (id: WindowId, active = true) => {
    switch (id) {
      case 'home':
        return (
          <HomeContent
            onOpen={openWindow}
            onAskAssistant={() => openAssistant()}
            onOpenSimpleMode={openSimpleMode}
            theme={theme}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            hourlyChimeEnabled={preferences.hourlyChime}
            scanlines={scanlines}
            achievementCount={earnedAchievementIds.length}
            achievementTotal={JACK_OS_ACHIEVEMENT_REGISTRY.length}
          />
        )
      case 'blue-ocean':
        return <BlueOceanContent active={active} />
      case 'about':
        return <AboutContent onOpen={openWindow} />
      case 'projects':
        return <ProjectsContent />
      case 'certifications':
        return <CertificationsContent />
      case 'recruiter':
        return (
          <RecruiterModeContent
            activeSection={recruiterSection}
            onSectionChange={selectRecruiterSection}
            onOpen={openWindow}
            onCopyEmail={copyEmailToClipboard}
            onAskAssistant={() => openAssistant()}
            onOpenSimpleMode={openSimpleMode}
          />
        )
      case 'resume':
        return <ResumeContent />
      case 'contact':
        return <ContactContent onCopyEmail={copyEmailToClipboard} />
      case 'assistant':
        return (
          <JdAssistantContent
            seedPrompt={assistantSeedPrompt}
            onOpen={openWindow}
            onCopyEmail={copyEmailToClipboard}
            onQuestionAnswered={() => showAchievement('jd-first-question')}
          />
        )
      case 'timeline':
        return <TimelineContent onOpen={openWindow} />
      case 'guestbook':
        return <GuestbookContent onSigned={soundEffects.guestbookSign} />
      case 'firewall':
        return (
          <NetworkFirewallContent
            active={active}
            onAchievement={showAchievement}
          />
        )
      case 'roadmap':
        return (
          <RoadmapContent
            onOpen={openWindow}
            onAskAssistant={(question) => openAssistant(question)}
          />
        )
      case 'wallpapers':
        return (
          <WallpapersContent
            preferences={preferences}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            onUpdatePreferences={updatePreferences}
            onResetWallpaper={resetWallpaper}
            onSetSoundEffectsEnabled={soundEffects.setSoundEffectsEnabled}
            onFirstCustomWallpaperSet={soundEffects.firstWallpaperSet}
            onPublicWallpaperChanged={() => showAchievement('wallpaper-changed')}
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
    <div className={effectiveScanlines ? 'scanlines' : undefined}>
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
        onToggleScanlines={() => setScanlines((s) => !s)}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEffectsEnabled={soundEffects.soundEffectsEnabled}
        onToggleSoundEffects={() =>
          soundEffects.setSoundEffectsEnabled(!soundEffects.soundEffectsEnabled)
        }
        onOpenCommandPalette={openCommandPalette}
        onOpenSimpleMode={openSimpleMode}
        achievementCount={earnedAchievementIds.length}
        achievementTotal={JACK_OS_ACHIEVEMENT_REGISTRY.length}
        onOpenAchievements={() => setAchievementsPanelOpen(true)}
        uptimeLabel={uptimeLabel}
        openWindowCount={visibleWindows.length}
        uiActivity={uiActivity}
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
          Jack OS V3A
          <br />
          {isMobile ? 'Tap an icon to open' : 'Double-click icons to open'}
        </p>

        {/* Desktop widgets */}
        {!isMobile && booted ? (
          <div
            data-desktop-interactive="true"
            className="absolute left-4 top-12 z-[2] flex w-[178px] flex-col gap-3"
          >
            {preferences.showClock ? <DesktopClock /> : null}
            {preferences.showCalendar ? (
              <DesktopCalendar onOpenCalendar={() => undefined} />
            ) : null}
            <JdWidget onOpen={() => openAssistant()} />
          </div>
        ) : null}

        {/* Desktop icons */}
        {!isMobile ? (
          <div
            className="desktop-icon-grid absolute right-7 top-11"
            style={desktopIconGridStyle}
          >
            {desktopIconItems.map((item) => (
              <DesktopIcon
                key={item.id}
                item={item}
                variant="desktop"
                onOpenWindow={openWindow}
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
              <button
                type="button"
                onClick={openSimpleMode}
                className="os-border mt-3 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                View Simple Mode
              </button>
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
              {renderContent(w.id, w.status !== 'minimized' && w.status !== 'closing')}
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
            onResetWallpaper={resetWallpaper}
          />
        ) : null}

        <CommandPalette
          open={commandPaletteOpen}
          commands={commandRegistry}
          onClose={closeCommandPalette}
        />

        <AchievementsPanel
          open={achievementsPanelOpen}
          earnedIds={earnedAchievementIds}
          onClose={() => setAchievementsPanelOpen(false)}
        />

        {copyStatus ? (
          <div
            role="status"
            aria-live="polite"
            data-desktop-interactive="true"
            className="fixed bottom-16 right-4 z-[80] max-w-[calc(100vw-2rem)] os-border bg-paper px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground os-shadow"
          >
            {copyStatus}
          </div>
        ) : null}

        {achievementNotice ? (
          <div
            role="status"
            aria-live="polite"
            data-desktop-interactive="true"
            className="achievement-notice fixed bottom-16 left-4 z-[80] max-w-[calc(100vw-2rem)] os-border bg-paper px-3 py-2 text-foreground os-shadow"
          >
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {achievementNotice.title}
            </p>
            <p className="font-pixel text-[10px] leading-relaxed text-foreground">
              {achievementNotice.message}
            </p>
          </div>
        ) : null}
      </WallpaperManager>
    </div>
  )
}

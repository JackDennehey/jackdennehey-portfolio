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
import { useRouter } from 'next/navigation'
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
  isWindowId,
  type WindowId,
} from './apps'
import { buildAppOpenCommands } from './build-app-commands'
import { useWindowManager } from './use-window-manager'
import { DesktopCalendar } from './desktop-calendar'
import { DesktopClock } from './desktop-clock'
import { DesktopContextMenu } from './desktop-context-menu'
import { JdWidget } from './jd-widget'
import { useDesktopPreferences } from './use-desktop-preferences'
import { useHourlyChime } from './use-hourly-chime'
import { WallpaperManager } from './wallpaper-manager'
import { CommandPalette, type JackOsCommand } from './command-palette'
import { JdenDesktopArtifact } from './jden-desktop-artifact'
import {
  JdenOwlMark,
  JdenTransitionOverlay,
  JdenWindowTrigger,
  useJdenLaunch,
} from './jden-launch'
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
import { POCKET_PIER_APP_STORE_URL } from '@/lib/pocket-pier'
import {
  RECRUITER_SECTIONS,
  isRecruiterSectionId,
  type RecruiterSectionId,
} from '@/lib/portfolio-knowledge'
import {
  ACHIEVEMENT_MESSAGES,
  JACK_OS_ACHIEVEMENT_REGISTRY,
  JACK_OS_5B_APP_IDS,
  readStoredAchievements,
  recordInteractiveAppOpened,
  type JackOsAchievementId,
  type JackOsInteractiveAppId,
} from '@/lib/achievements'
import { WINDOW_CLOSE_DURATION_MS } from '@/lib/os/window-geometry'
import { TIMELINE_ENTRIES } from '@/lib/timeline-data'
import {
  readBlueOceanCompleted,
  type BlueOceanLaunchContext,
} from '@/lib/blue-ocean'
import { hasValidBlueOceanSession } from '@/components/keynote/config/session'

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
const PocketPierContent = dynamic(
  () => import('./content/pocket-pier-content').then((module) => module.PocketPierContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Pocket Pier..." /> },
)
const KickoffContent = dynamic(
  () => import('./content/kickoff-content').then((module) => module.KickoffContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Kickoff..." /> },
)
const JdenStudiosContent = dynamic(
  () => import('./content/jden-studios-content').then((module) => module.JdenStudiosContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading JDEN STUDIOS..." /> },
)

type OpenWindowOptions = {
  playSound?: boolean
  updateHash?: boolean
  launchContext?: BlueOceanLaunchContext
}
type ContextMenuPosition = { x: number; y: number } | null

const CONTEXT_MENU_WIDTH = 176
const CONTEXT_MENU_HEIGHT = 92
const COPY_CONFIRMATION_DURATION_MS = 2200
const ACHIEVEMENT_NOTICE_DURATION_MS = 3200
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

function LazyWindowLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-48 place-items-center os-border bg-secondary p-4">
      <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{label}</p>
    </div>
  )
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
  const router = useRouter()
  const [booted, setBooted] = useState(false)
  const [scanlines, setScanlines] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [desktopIconRows, setDesktopIconRows] = useState(DESKTOP_ICON_DEFAULT_ROWS)
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
  const [blueOceanCompleted, setBlueOceanCompleted] = useState(false)
  const [blueOceanCanResume, setBlueOceanCanResume] = useState(false)
  const [blueOceanLaunchContext, setBlueOceanLaunchContext] =
    useState<BlueOceanLaunchContext>('desktop')
  const secretUnlocks = useSecretUnlocks()
  const jdenLaunch = useJdenLaunch()
  const { preferences, preferencesLoaded, updatePreferences, resetWallpaper } =
    useDesktopPreferences(secretUnlocks.unlockedIds, secretUnlocks.loaded)
  const soundEffects = useSoundEffects()
  const { theme, toggleTheme } = useInterfaceTheme()
  const {
    windows,
    order,
    activeWindowId,
    minimizedWindows,
    visibleWindows,
    getWindow,
    getStackZ,
    openWindow: openManagedWindow,
    closeWindow: closeManagedWindow,
    focusWindow,
    minimizeWindow: minimizeManagedWindow,
    maximizeWindow: maximizeManagedWindow,
    restoreWindow: restoreManagedWindow,
    restoreAllMinimized: restoreAllManagedMinimized,
    moveWindow,
    resizeWindow,
    commitGeometry,
  } = useWindowManager(isMobile)
  const handledInitialHash = useRef(false)
  const assistantPromptSequence = useRef(0)
  const bootedAt = useRef<number | null>(null)
  const copyStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const achievementNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstBootAchievementTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uiActivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hadActiveWindow = useRef(false)
  const blueOceanLaunchContextRef = useRef<BlueOceanLaunchContext>('desktop')

  useEffect(() => {
    blueOceanLaunchContextRef.current = blueOceanLaunchContext
  }, [blueOceanLaunchContext])

  useHourlyChime({
    booted,
    enabled: preferences.hourlyChime,
    soundEffectsEnabled: soundEffects.soundEffectsEnabled,
    playHourlyChime: soundEffects.playHourlyChime,
  })

  useEffect(() => {
    setEarnedAchievementIds(readStoredAchievements())
    setBlueOceanCompleted(readBlueOceanCompleted())
    setBlueOceanCanResume(hasValidBlueOceanSession())
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

  const focusDesktop = useCallback(() => {
    window.setTimeout(() => {
      document.getElementById('jack-os-desktop')?.focus()
    }, 0)
  }, [])

  const refreshBlueOceanState = useCallback(() => {
    setBlueOceanCompleted(readBlueOceanCompleted())
    setBlueOceanCanResume(hasValidBlueOceanSession())
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
      if (!isInteractiveAppId(id)) return

      try {
        const next = recordInteractiveAppOpened(id)
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
      if (!isWindowId(id)) return

      if (id === 'blue-ocean') {
        const urlContext =
          typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('from') === 'simple'
            ? 'simple'
            : null
        setBlueOceanLaunchContext(options.launchContext ?? urlContext ?? 'desktop')
        refreshBlueOceanState()
      }

      const existing = getWindow(id)
      if (id === 'recruiter' && options.updateHash !== false) {
        if (!existing) {
          setRecruiterSection('overview')
        }
        writeHashSlug(getRecruiterHash(existing ? recruiterSection : 'overview'))
      } else if (options.updateHash !== false) {
        syncWindowHash(id)
      }

      const result = openManagedWindow(id)
      if (!result?.isNew || options.playSound === false) return

      soundEffects.appOpen()
      recordInteractiveAppOpen(id)
      bumpUiActivity()
      if (id === 'recruiter') {
        showAchievement('recruiter-mode-opened')
      }
      if (id === 'timeline') {
        showAchievement('timeline-opened')
      }
      if (id === 'roadmap') {
        showAchievement('roadmap-opened')
      }
    },
    [
      bumpUiActivity,
      getWindow,
      openManagedWindow,
      recruiterSection,
      recordInteractiveAppOpen,
      refreshBlueOceanState,
      showAchievement,
      soundEffects,
    ],
  )

  const closeWindow = useCallback((id: WindowId) => {
    if (!closeManagedWindow(id)) return
    soundEffects.windowClose()
    bumpUiActivity(10)
  }, [bumpUiActivity, closeManagedWindow, soundEffects])

  const minimizeWindow = useCallback((id: WindowId) => {
    if (!minimizeManagedWindow(id)) return
    bumpUiActivity(8)
    focusDesktop()
  }, [bumpUiActivity, focusDesktop, minimizeManagedWindow])

  const restoreWindow = useCallback((id: WindowId) => {
    if (!restoreManagedWindow(id)) return
    bumpUiActivity(8)
  }, [bumpUiActivity, restoreManagedWindow])

  const restoreBlueOceanOrigin = useCallback(() => {
    refreshBlueOceanState()
    const context = blueOceanLaunchContextRef.current
    const originByContext: Partial<Record<BlueOceanLaunchContext, WindowId>> = {
      welcome: 'home',
      recruiter: 'recruiter',
      projects: 'projects',
      'ask-jd': 'assistant',
    }
    const origin = originByContext[context]

    if (context === 'simple') {
      router.push('/simple')
      return
    }

    if (origin) {
      const originWindow = getWindow(origin)
      if (originWindow && originWindow.status !== 'closing') {
        if (originWindow.status === 'minimized') {
          restoreWindow(origin)
        } else {
          focusWindow(origin)
        }
        return
      }
    }

    focusDesktop()
  }, [focusDesktop, focusWindow, getWindow, refreshBlueOceanState, restoreWindow, router])

  const handleBlueOceanCompleted = useCallback(() => {
    setBlueOceanCompleted(true)
    showAchievement('blue-ocean-completed')
  }, [showAchievement])

  const handleBlueOceanPowerDown = useCallback(() => {
    closeWindow('blue-ocean')
    window.setTimeout(restoreBlueOceanOrigin, WINDOW_CLOSE_DURATION_MS + 30)
  }, [closeWindow, restoreBlueOceanOrigin])

  const restoreAllMinimized = useCallback(() => {
    if (minimizedWindows.length === 0) return
    restoreAllManagedMinimized()
    bumpUiActivity(10)
  }, [bumpUiActivity, minimizedWindows.length, restoreAllManagedMinimized])

  const maximizeWindow = useCallback((id: WindowId) => {
    if (!maximizeManagedWindow(id)) return
    bumpUiActivity(8)
  }, [bumpUiActivity, maximizeManagedWindow])

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

    if (!isMobile && windows.length === 0 && !preferences.hasSeenFirstVisit) {
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
    windows.length,
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
    return () => {
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

  useEffect(() => {
    if (activeWindowId) {
      hadActiveWindow.current = true
      return
    }

    if (windows.some((windowRecord) => windowRecord.status === 'closing')) return
    if (!hadActiveWindow.current) return

    hadActiveWindow.current = false
    focusDesktop()
  }, [activeWindowId, focusDesktop, windows])

  // Escape closes the top-most window.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contextMenu || commandPaletteOpen) return
      const visibleOrder = order.filter((id) => {
        const windowRecord = getWindow(id)
        return windowRecord && windowRecord.status !== 'minimized'
      })
      if (e.key === 'Escape' && visibleOrder.length > 0) {
        closeWindow(visibleOrder[visibleOrder.length - 1]!)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commandPaletteOpen, contextMenu, closeWindow, getWindow, order])

  const topId = activeWindowId
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
    const appCommands = buildAppOpenCommands(openWindow)

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
      Icon: project.internalApp ? WINDOW_APPS[project.internalApp].Icon : WINDOW_APPS.projects.Icon,
      iconVisual: project.internalApp ? WINDOW_APPS[project.internalApp].iconVisual : undefined,
      tone: project.internalApp ? WINDOW_APPS[project.internalApp].tone : undefined,
      action: () => {
        if (project.internalApp) {
          openWindow(
            project.internalApp,
            project.internalApp === 'blue-ocean' ? { launchContext: 'search' } : undefined,
          )
          return
        }
        openWindow('projects')
      },
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
      {
        id: 'view-pocket-pier-app-store',
        title: 'View Pocket Pier on the App Store',
        subtitle: 'Official iOS listing',
        keywords: ['pocket pier', 'app store', 'download', 'ios', 'jden studios', 'apple'],
        Icon: WINDOW_APPS['pocket-pier'].Icon,
        iconVisual: WINDOW_APPS['pocket-pier'].iconVisual,
        ariaLabel: 'View Pocket Pier on the App Store (opens in a new tab)',
        action: () => {
          window.open(POCKET_PIER_APP_STORE_URL, '_blank', 'noopener,noreferrer')
        },
      },
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
        id: 'ask-jd-kickoff',
        title: 'Ask about Kickoff',
        subtitle: 'J.D. topic shortcut',
        keywords: ['kickoff', 'football', 'model', 'ask kickoff', 'portfolio assistant'],
        Icon: WINDOW_APPS.assistant.Icon,
        action: () => openAssistant('What is Kickoff?'),
      },
      {
        id: 'ask-jd-pocket-pier',
        title: 'Ask about Pocket Pier',
        subtitle: 'J.D. topic shortcut',
        keywords: ['pocket pier', 'app store', 'game', 'jden studios', 'portfolio assistant'],
        Icon: WINDOW_APPS.assistant.Icon,
        action: () => openAssistant('What is Pocket Pier?'),
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
            onOpenBlueOcean={() => openWindow('blue-ocean', { launchContext: 'welcome' })}
            onResumeBlueOcean={() => openWindow('blue-ocean', { launchContext: 'welcome' })}
            onAskAssistant={() => openAssistant()}
            onOpenSimpleMode={openSimpleMode}
            theme={theme}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            hourlyChimeEnabled={preferences.hourlyChime}
            scanlines={scanlines}
            achievementCount={earnedAchievementIds.length}
            achievementTotal={JACK_OS_ACHIEVEMENT_REGISTRY.length}
            blueOceanCanResume={blueOceanCanResume}
            blueOceanCompleted={blueOceanCompleted}
          />
        )
      case 'blue-ocean':
        return (
          <BlueOceanContent
            active={active}
            onPresentationEnter={soundEffects.keynotePresentationEnter}
            onPresentationPowerDown={soundEffects.keynotePresentationPowerDown}
            onCompleted={handleBlueOceanCompleted}
            onPowerDown={handleBlueOceanPowerDown}
          />
        )
      case 'pocket-pier':
        return <PocketPierContent />
      case 'kickoff':
        return <KickoffContent />
      case 'jden-studios':
        return (
          <JdenStudiosContent
            onEnterStudio={jdenLaunch.launch}
            onOpenPocketPier={() => openWindow('pocket-pier')}
          />
        )
      case 'about':
        return <AboutContent onOpen={openWindow} />
      case 'projects':
        return (
          <ProjectsContent
            onOpen={(windowId) =>
              openWindow(
                windowId,
                windowId === 'blue-ocean' ? { launchContext: 'projects' } : undefined,
              )
            }
          />
        )
      case 'certifications':
        return <CertificationsContent />
      case 'recruiter':
        return (
          <RecruiterModeContent
            activeSection={recruiterSection}
            onSectionChange={selectRecruiterSection}
            onOpen={(windowId) =>
              openWindow(
                windowId,
                windowId === 'blue-ocean' ? { launchContext: 'recruiter' } : undefined,
              )
            }
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
            onOpen={(windowId) =>
              openWindow(
                windowId,
                windowId === 'blue-ocean' ? { launchContext: 'ask-jd' } : undefined,
              )
            }
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
        className="relative min-h-[100dvh] pt-11 sm:pt-8"
        aria-label="Jack OS desktop"
        onContextMenu={handleDesktopContextMenu}
        onPointerDown={contextMenu ? () => closeContextMenu() : undefined}
      >
        {/* Desktop watermark */}
        <p
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 max-w-xs font-pixel text-[9px] leading-relaxed text-muted-foreground/60"
        >
          Jack OS V3B
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
            <JdenDesktopArtifact onOpen={() => openWindow('jden-studios')} />
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
              <JdenWindowTrigger
                onOpen={() => openWindow('jden-studios')}
                className="os-border mt-3 flex min-h-11 items-center gap-2 bg-foreground px-3 py-2 text-primary-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:bg-background focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <JdenOwlMark size="menu" className="size-8 shrink-0" />
                <span className="min-w-0 text-left">
                  <span className="block font-pixel text-[8px] leading-relaxed">
                    JDEN STUDIOS
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug opacity-80">
                    Independent digital studio
                  </span>
                </span>
              </JdenWindowTrigger>
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
          return (
            <OsWindow
              key={w.id}
              app={app}
              x={w.x}
              y={w.y}
              width={w.width}
              height={w.height}
              z={getStackZ(w.id)}
              status={w.status}
              focused={topId === w.id}
              isMobile={isMobile}
              onFocus={() => {
                if (w.status !== 'closing' && w.status !== 'minimized') {
                  focusWindow(w.id)
                }
              }}
              onClose={() =>
                w.id === 'blue-ocean' ? handleBlueOceanPowerDown() : closeWindow(w.id)
              }
              onMinimize={() => minimizeWindow(w.id)}
              onMaximize={() => maximizeWindow(w.id)}
              onMove={(x, y) => moveWindow(w.id, x, y)}
              onResize={(handle, start, dx, dy) => resizeWindow(w.id, handle, start, dx, dy)}
              onGeometryCommit={() => commitGeometry(w.id)}
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

        <JdenTransitionOverlay active={jdenLaunch.active} />

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

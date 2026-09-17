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
  isDockPinnedAppId,
  isWindowId,
  type WindowId,
} from './apps'
import { useWindowManager } from './use-window-manager'
import { useJackOsMobileBreakpoint } from './use-mobile-breakpoint'
import { MobileShell } from './mobile/mobile-shell'
import { DesktopCalendar } from './desktop-calendar'
import { DesktopClock } from './desktop-clock'
import { DesktopContextMenu } from './desktop-context-menu'
import { JdWidget } from './jd-widget'
import { useDesktopPreferences } from './use-desktop-preferences'
import { useHourlyChime } from './use-hourly-chime'
import { WallpaperManager } from './wallpaper-manager'
import { Spotlight } from './spotlight/spotlight'
import { JdenDesktopArtifact } from './jden-desktop-artifact'
import {
  JdenTransitionOverlay,
  useJdenLaunch,
} from './jden-launch'
import { HomeContent } from './content/home-content'
import { AboutContent } from './content/about-content'
import { PortfolioContent } from './content/portfolio-content'
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
import { JackOsDock } from './shell/dock'
import { useSecretUnlocks } from './use-secret-unlocks'
import {
  getSecretDefinition,
  type SecretId,
} from '@/lib/secrets'
import {
  DEFAULT_WALLPAPER_ID,
  getWallpaperAsset,
  isHiddenWallpaper,
} from '@/lib/wallpapers'
import { CONTACT } from '@/lib/portfolio-data'
import {
  getCaseStudyHash,
  getProjectById,
  isCaseStudyProjectId,
  parseCaseStudyHash,
  type CaseStudyOrigin,
  type CaseStudyProjectId,
} from '@/lib/portfolio'
import {
  type PortfolioSectionId,
  type SpotlightAction,
  type SpotlightEntry,
} from '@/lib/search'
import {
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
const CaseStudyContent = dynamic(
  () =>
    import('./case-study/case-study-content').then((module) => module.CaseStudyContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading Case Study..." /> },
)
const JdenStudiosContent = dynamic(
  () => import('./content/jden-studios-content').then((module) => module.JdenStudiosContent),
  { ssr: false, loading: () => <LazyWindowLoading label="Loading JDEN STUDIOS..." /> },
)

type OpenWindowOptions = {
  playSound?: boolean
  updateHash?: boolean
  launchContext?: BlueOceanLaunchContext
  caseStudyProjectId?: CaseStudyProjectId
}
type ContextMenuPosition = { x: number; y: number } | null

const CONTEXT_MENU_WIDTH = 176
const CONTEXT_MENU_HEIGHT = 176
const COPY_CONFIRMATION_DURATION_MS = 2200
const ACHIEVEMENT_NOTICE_DURATION_MS = 3200
const DESKTOP_ICON_DEFAULT_ROWS = 7
const DESKTOP_ICON_TOP_OFFSET = 44
const DESKTOP_ICON_BOTTOM_PADDING = 100
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

function clearHashSlug(mode: 'push' | 'replace' = 'push') {
  if (typeof window === 'undefined') return

  const nextUrl = `${window.location.pathname}${window.location.search}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (current === nextUrl || current === `${nextUrl}#`) return

  if (mode === 'replace') {
    window.history.replaceState(null, '', nextUrl)
    return
  }

  window.history.pushState(null, '', nextUrl)
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

function isUnrecognizedJackOsHash(hash: string) {
  const slug = hash.replace(/^#/, '').trim()
  if (!slug) return false
  return !(
    parseCaseStudyHash(hash) ||
    getRecruiterSectionFromHash(hash) ||
    getWindowIdFromHash(hash)
  )
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
  const isMobile = useJackOsMobileBreakpoint()
  const [mobileHome, setMobileHome] = useState(true)
  const [mobileSystemPanelOpen, setMobileSystemPanelOpen] = useState(false)
  const [desktopIconRows, setDesktopIconRows] = useState(DESKTOP_ICON_DEFAULT_ROWS)
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>(null)
  const [systemMenuOpen, setSystemMenuOpen] = useState(false)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [achievementsPanelOpen, setAchievementsPanelOpen] = useState(false)
  const [earnedAchievementIds, setEarnedAchievementIds] = useState<JackOsAchievementId[]>([])
  const [uptimeSeconds, setUptimeSeconds] = useState(0)
  const [recruiterSection, setRecruiterSection] = useState<RecruiterSectionId>('overview')
  const [caseStudyProjectId, setCaseStudyProjectId] = useState<CaseStudyProjectId>('jackos')
  const [caseStudyOrigin, setCaseStudyOrigin] = useState<CaseStudyOrigin>('hash')
  const [caseStudyFocusSectionId, setCaseStudyFocusSectionId] = useState<string | null>(null)
  const [caseStudyFocusNonce, setCaseStudyFocusNonce] = useState(0)
  const [portfolioFocusSectionId, setPortfolioFocusSectionId] = useState<PortfolioSectionId | null>(
    null,
  )
  const [portfolioFocusNonce, setPortfolioFocusNonce] = useState(0)
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
    resetWindowLayout: resetManagedWindowLayout,
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
      if (id === 'case-study') {
        const nextProjectId = options.caseStudyProjectId ?? caseStudyProjectId
        setCaseStudyProjectId(nextProjectId)
        if (options.updateHash !== false) {
          writeHashSlug(getCaseStudyHash(nextProjectId))
        }
      } else if (id === 'recruiter' && options.updateHash !== false) {
        if (!existing) {
          setRecruiterSection('overview')
        }
        writeHashSlug(getRecruiterHash(existing ? recruiterSection : 'overview'))
      } else if (options.updateHash !== false) {
        syncWindowHash(id)
      }

      const result = openManagedWindow(id)
      setMobileHome(false)
      setMobileSystemPanelOpen(false)
      if (!result?.isNew || options.playSound === false) return

      soundEffects.appOpen()
      recordInteractiveAppOpen(id)
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
      getWindow,
      openManagedWindow,
      recruiterSection,
      caseStudyProjectId,
      recordInteractiveAppOpen,
      refreshBlueOceanState,
      showAchievement,
      soundEffects,
    ],
  )

  const closeWindow = useCallback((id: WindowId) => {
    if (!closeManagedWindow(id)) return
    soundEffects.windowClose()
  }, [closeManagedWindow, soundEffects])

  const minimizeWindow = useCallback((id: WindowId) => {
    if (!minimizeManagedWindow(id)) return
    focusDesktop()
  }, [focusDesktop, minimizeManagedWindow])

  const restoreWindow = useCallback((id: WindowId) => {
    if (!restoreManagedWindow(id)) return
  }, [restoreManagedWindow])

  const restoreBlueOceanOrigin = useCallback(() => {
    refreshBlueOceanState()
    const context = blueOceanLaunchContextRef.current
    const originByContext: Partial<Record<BlueOceanLaunchContext, WindowId>> = {
      welcome: 'home',
      recruiter: 'recruiter',
      projects: 'projects',
      'case-study': 'case-study',
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
        if (isMobile) {
          setMobileHome(false)
          syncWindowHash(origin)
        }
        return
      }
      if (isMobile) {
        openWindow(origin)
        return
      }
    }

    if (isMobile) {
      setMobileHome(true)
      setMobileSystemPanelOpen(false)
      setSpotlightOpen(false)
      clearHashSlug()
      focusDesktop()
      return
    }

    focusDesktop()
  }, [focusDesktop, focusWindow, getWindow, isMobile, openWindow, refreshBlueOceanState, restoreWindow, router])

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
  }, [minimizedWindows.length, restoreAllManagedMinimized])

  const maximizeWindow = useCallback((id: WindowId) => {
    maximizeManagedWindow(id)
  }, [maximizeManagedWindow])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    focusDesktop()
  }, [focusDesktop])

  const closeSystemMenu = useCallback(() => {
    setSystemMenuOpen(false)
  }, [])

  const toggleSystemMenu = useCallback(() => {
    setContextMenu(null)
    setSpotlightOpen(false)
    setSystemMenuOpen((open) => !open)
  }, [])

  const openSpotlight = useCallback(() => {
    setContextMenu(null)
    setSystemMenuOpen(false)
    setMobileSystemPanelOpen(false)
    setSpotlightOpen(true)
  }, [])

  const closeSpotlight = useCallback(() => {
    setSpotlightOpen(false)
  }, [])

  const closeMobileSystemPanel = useCallback(() => {
    setMobileSystemPanelOpen(false)
  }, [])

  const toggleMobileSystemPanel = useCallback(() => {
    setSpotlightOpen(false)
    setMobileSystemPanelOpen((open) => !open)
  }, [])

  const goMobileHome = useCallback(() => {
    setMobileHome(true)
    setMobileSystemPanelOpen(false)
    setSpotlightOpen(false)
    clearHashSlug()
    focusDesktop()
  }, [focusDesktop])

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

  const openCaseStudy = useCallback(
    (projectId: string, origin: CaseStudyOrigin = 'portfolio', sectionId?: string) => {
      if (!isCaseStudyProjectId(projectId)) return
      setCaseStudyProjectId(projectId)
      setCaseStudyOrigin(origin)
      setCaseStudyFocusSectionId(sectionId ?? null)
      if (sectionId) {
        setCaseStudyFocusNonce((current) => current + 1)
      }
      writeHashSlug(getCaseStudyHash(projectId))
      openWindow('case-study', {
        updateHash: false,
        caseStudyProjectId: projectId,
      })
    },
    [openWindow],
  )

  const returnFromCaseStudy = useCallback(
    (target: 'portfolio' | 'projects') => {
      openWindow(target)
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

      setSpotlightOpen(false)
      setSystemMenuOpen(false)
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
        openSpotlight()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [booted, openSpotlight])

  useEffect(() => {
    if (!isMobile) {
      setMobileSystemPanelOpen(false)
      return
    }
    closeSystemMenu()
    closeContextMenu()
    const visible = windows.some(
      (windowRecord) => windowRecord.status !== 'minimized' && windowRecord.status !== 'closing',
    )
    setMobileHome(!visible)
    // Breakpoint crossing only: Home is a navigation flag, not derived from open windows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeContextMenu, closeSystemMenu, isMobile])

  useEffect(() => {
    if (!booted || !preferencesLoaded || handledInitialHash.current) return

    handledInitialHash.current = true
    if (isUnrecognizedJackOsHash(window.location.hash)) {
      clearHashSlug('replace')
    }

    const caseStudyHashProject = parseCaseStudyHash(window.location.hash)
    if (caseStudyHashProject) {
      setCaseStudyProjectId(caseStudyHashProject)
      setCaseStudyOrigin('hash')
      openWindow('case-study', {
        playSound: false,
        updateHash: false,
        caseStudyProjectId: caseStudyHashProject,
      })
      return
    }

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

      if (isUnrecognizedJackOsHash(window.location.hash)) {
        clearHashSlug('replace')
        if (isMobile) {
          setMobileHome(true)
          setMobileSystemPanelOpen(false)
        }
        return
      }

      const caseStudyHashProject = parseCaseStudyHash(window.location.hash)
      if (caseStudyHashProject) {
        setCaseStudyProjectId(caseStudyHashProject)
        setCaseStudyOrigin('hash')
        openWindow('case-study', {
          playSound: false,
          updateHash: false,
          caseStudyProjectId: caseStudyHashProject,
        })
        return
      }

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

      if (isMobile) {
        setMobileHome(true)
        setMobileSystemPanelOpen(false)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [booted, isMobile, openWindow])

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

  // Escape closes shell menus first, then returns Home on mobile or closes the top window on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (isMobile) {
        if (mobileSystemPanelOpen) {
          e.preventDefault()
          closeMobileSystemPanel()
          return
        }
        if (contextMenu || spotlightOpen) return
        if (!mobileHome) {
          e.preventDefault()
          goMobileHome()
        }
        return
      }
      if (systemMenuOpen) {
        e.preventDefault()
        closeSystemMenu()
        return
      }
      if (contextMenu || spotlightOpen) return
      const visibleOrder = order.filter((id) => {
        const windowRecord = getWindow(id)
        return windowRecord && windowRecord.status !== 'minimized'
      })
      if (visibleOrder.length > 0) {
        closeWindow(visibleOrder[visibleOrder.length - 1]!)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    closeMobileSystemPanel,
    closeSystemMenu,
    closeWindow,
    spotlightOpen,
    contextMenu,
    getWindow,
    goMobileHome,
    isMobile,
    mobileHome,
    mobileSystemPanelOpen,
    order,
    systemMenuOpen,
  ])

  useEffect(() => {
    if (!systemMenuOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.closest('#jackos-system-menu, [aria-controls="jackos-system-menu"]')) return
      closeSystemMenu()
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [closeSystemMenu, systemMenuOpen])

  const topId = activeWindowId
  const mobileAppId = useMemo(() => {
    if (mobileHome) return undefined
    if (topId) {
      const active = getWindow(topId)
      if (active && active.status !== 'minimized' && active.status !== 'closing') {
        return topId
      }
    }
    const visible = windows.filter(
      (windowRecord) => windowRecord.status !== 'minimized' && windowRecord.status !== 'closing',
    )
    return visible[visible.length - 1]?.id
  }, [getWindow, mobileHome, topId, windows])
  const desktopItems = useMemo(() => DESKTOP_ITEMS, [])
  const desktopIconItems = useMemo(
    () =>
      desktopItems.filter((item) => {
        if (item.kind !== 'window') return true
        if (item.id === 'assistant') return false
        if (isDockPinnedAppId(item.id)) return false
        return true
      }),
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
  const recruiterVisible = isMobile
    ? mobileAppId === 'recruiter'
    : windows.some((w) => w.id === 'recruiter' && w.status !== 'minimized')
  const effectiveScanlines = scanlines && !recruiterVisible

  const minimizeActiveWindow = useCallback(() => {
    if (topId) {
      minimizeWindow(topId)
    }
  }, [minimizeWindow, topId])

  const handleDockSelect = useCallback(
    (id: WindowId) => {
      closeSystemMenu()
      closeContextMenu()
      const existing = getWindow(id)
      if (!existing || existing.status === 'closing') {
        openWindow(id)
        return
      }
      if (existing.status === 'minimized') {
        restoreWindow(id)
        return
      }
      focusWindow(id)
    },
    [closeContextMenu, closeSystemMenu, focusWindow, getWindow, openWindow, restoreWindow],
  )

  const resetWindowLayout = useCallback(() => {
    resetManagedWindowLayout()
    showCopyStatus('Window layout reset')
  }, [resetManagedWindowLayout, showCopyStatus])

  const restartJackOsSession = useCallback(() => {
    window.location.reload()
  }, [])

  const extraSpotlightEntries = useMemo<SpotlightEntry[]>(
    () =>
      secretUnlocks.unlockedIds
        .map((secretId) => getSecretDefinition(secretId))
        .filter((secret): secret is NonNullable<typeof secret> => Boolean(secret))
        .map((secret) => ({
          id: `secret:${secret.id}`,
          kind: 'system',
          title: `Find ${secret.wallpaperTitle} in Wallpapers`,
          subtitle: 'Hidden file recovered',
          keywords: [secret.wallpaperTitle, 'hidden wallpaper', 'exclusive'],
          aliases: [],
          searchableText: secret.wallpaperTitle,
          action: { type: 'open-app', appId: 'wallpapers' },
          iconAppId: 'wallpapers',
        })),
    [secretUnlocks.unlockedIds],
  )

  const disabledSpotlightIds = useMemo(() => {
    const ids: string[] = []
    if (minimizedWindows.length === 0) ids.push('system:restore-minimized')
    if (!topId || isMobile) ids.push('system:minimize-active')
    return ids
  }, [isMobile, minimizedWindows.length, topId])

  const executeSpotlightAction = useCallback(
    (action: SpotlightAction) => {
      switch (action.type) {
        case 'open-app':
          openWindow(
            action.appId,
            action.appId === 'blue-ocean' ? { launchContext: 'search' } : undefined,
          )
          return
        case 'open-case-study':
          openCaseStudy(action.projectId, 'search')
          return
        case 'open-case-study-section':
          openCaseStudy(action.projectId, 'search', action.sectionId)
          return
        case 'open-portfolio-section':
          setPortfolioFocusSectionId(action.sectionId)
          setPortfolioFocusNonce((current) => current + 1)
          openWindow('portfolio')
          return
        case 'open-recruiter-section':
          if (isRecruiterSectionId(action.sectionId)) {
            selectRecruiterSection(action.sectionId)
          }
          return
        case 'open-external':
          window.open(action.href, '_blank', 'noopener,noreferrer')
          return
        case 'system':
          switch (action.command) {
            case 'personalize':
              openPersonalize()
              return
            case 'reset-layout':
              resetWindowLayout()
              return
            case 'simple-mode':
              openSimpleMode()
              return
            case 'restart':
              restartJackOsSession()
              return
            case 'toggle-theme':
              toggleTheme()
              return
            case 'toggle-scanlines':
              setScanlines((value) => !value)
              return
            case 'toggle-sound':
              soundEffects.setSoundEffectsEnabled(!soundEffects.soundEffectsEnabled)
              return
            case 'toggle-hourly-chime':
              updatePreferences({ hourlyChime: !preferences.hourlyChime })
              return
            case 'view-achievements':
              setAchievementsPanelOpen(true)
              return
            case 'copy-email':
              void copyEmailToClipboard()
              return
            case 'restore-minimized':
              restoreAllMinimized()
              return
            case 'minimize-active':
              minimizeActiveWindow()
              return
            case 'focus-desktop':
              if (isMobile) {
                goMobileHome()
                return
              }
              focusDesktop()
              return
            case 'ask-jd':
              openAssistant()
          }
      }
    },
    [
      copyEmailToClipboard,
      focusDesktop,
      goMobileHome,
      isMobile,
      minimizeActiveWindow,
      openAssistant,
      openCaseStudy,
      openPersonalize,
      openSimpleMode,
      openWindow,
      preferences.hourlyChime,
      resetWindowLayout,
      restartJackOsSession,
      restoreAllMinimized,
      selectRecruiterSection,
      soundEffects,
      toggleTheme,
      updatePreferences,
    ],
  )

  const renderContent = (id: WindowId, active = true) => {
    switch (id) {
      case 'home':
        return (
          <HomeContent
            onOpen={openWindow}
            onOpenBlueOcean={() => openWindow('blue-ocean', { launchContext: 'welcome' })}
            onResumeBlueOcean={() => openWindow('blue-ocean', { launchContext: 'welcome' })}
            onOpenSimpleMode={openSimpleMode}
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
      case 'portfolio':
        return (
          <PortfolioContent
            onOpen={openWindow}
            onOpenCaseStudy={(projectId) => openCaseStudy(projectId, 'portfolio')}
            focusSectionId={portfolioFocusSectionId}
            focusNonce={portfolioFocusNonce}
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
            onOpenCaseStudy={(projectId) => openCaseStudy(projectId, 'projects')}
          />
        )
      case 'case-study':
        return (
          <CaseStudyContent
            projectId={caseStudyProjectId}
            origin={caseStudyOrigin}
            focusSectionId={caseStudyFocusSectionId}
            focusNonce={caseStudyFocusNonce}
            onOpenApp={(windowId) =>
              openWindow(
                windowId,
                windowId === 'blue-ocean' ? { launchContext: 'case-study' } : undefined,
              )
            }
            onOpenCaseStudy={(nextProjectId, nextOrigin) =>
              openCaseStudy(nextProjectId, nextOrigin ?? 'next')
            }
            onReturn={returnFromCaseStudy}
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
            onOpenCaseStudy={(projectId) => openCaseStudy(projectId, 'portfolio')}
            onCopyEmail={copyEmailToClipboard}
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

      {isMobile ? (
        <MobileShell
          wallpaperId={preferences.wallpaperId}
          unlockedSecretIds={secretUnlocks.unlockedIds}
          atHome={mobileHome}
          activeAppId={mobileAppId}
          appContent={mobileAppId ? renderContent(mobileAppId, true) : null}
          systemPanelOpen={mobileSystemPanelOpen}
          theme={theme}
          soundEffectsEnabled={soundEffects.soundEffectsEnabled}
          scanlines={scanlines}
          titleOverride={
            mobileAppId === 'case-study'
              ? (getProjectById(caseStudyProjectId)?.name ?? 'Case Study')
              : undefined
          }
          onGoHome={goMobileHome}
          onOpenApp={openWindow}
          onToggleSystemPanel={toggleMobileSystemPanel}
          onCloseSystemPanel={closeMobileSystemPanel}
          onPersonalize={openPersonalize}
          onToggleTheme={toggleTheme}
          onToggleSoundEffects={() =>
            soundEffects.setSoundEffectsEnabled(!soundEffects.soundEffectsEnabled)
          }
          onToggleScanlines={() => setScanlines((s) => !s)}
          onOpenWelcome={() => openWindow('home')}
          onOpenRecruiter={() => openWindow('recruiter')}
          onOpenSimpleMode={openSimpleMode}
          onOpenAchievements={() => setAchievementsPanelOpen(true)}
          onRestartSession={restartJackOsSession}
          onOpenSpotlight={openSpotlight}
        />
      ) : (
        <>
          <MenuBar
            onOpen={openWindow}
            activeWindowId={topId}
            scanlines={scanlines}
            onToggleScanlines={() => setScanlines((s) => !s)}
            theme={theme}
            onToggleTheme={toggleTheme}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            onToggleSoundEffects={() =>
              soundEffects.setSoundEffectsEnabled(!soundEffects.soundEffectsEnabled)
            }
            onOpenSpotlight={openSpotlight}
            onOpenSimpleMode={openSimpleMode}
            achievementCount={earnedAchievementIds.length}
            achievementTotal={JACK_OS_ACHIEVEMENT_REGISTRY.length}
            onOpenAchievements={() => setAchievementsPanelOpen(true)}
            uptimeLabel={uptimeLabel}
            openWindowCount={visibleWindows.length}
            systemMenuOpen={systemMenuOpen}
            onToggleSystemMenu={toggleSystemMenu}
            onCloseSystemMenu={closeSystemMenu}
            onResetWindowLayout={resetWindowLayout}
            onRestartSession={restartJackOsSession}
          />

          <WallpaperManager
            id="jack-os-desktop"
            tabIndex={-1}
            wallpaperId={preferences.wallpaperId}
            unlockedSecretIds={secretUnlocks.unlockedIds}
            className="relative min-h-[100dvh] pt-8"
            aria-label="JackOS desktop"
            onContextMenu={handleDesktopContextMenu}
            onPointerDown={
              contextMenu || systemMenuOpen
                ? () => {
                    closeContextMenu()
                    closeSystemMenu()
                  }
                : undefined
            }
          >
            <p
              aria-hidden
              className="pointer-events-none absolute bottom-24 left-4 max-w-xs font-pixel text-[9px] leading-relaxed text-muted-foreground/60"
            >
              JackOS
              <br />
              {windows.length === 0 ? 'Desktop ready' : 'Double-click icons to open'}
            </p>

            {booted ? (
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

            {windows.map((w) => {
              const app =
                w.id === 'case-study'
                  ? {
                      ...WINDOW_APPS['case-study'],
                      title: getProjectById(caseStudyProjectId)?.name ?? 'Case Study',
                    }
                  : WINDOW_APPS[w.id]
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
                  isMobile={false}
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

            <JackOsDock
              windows={windows}
              activeWindowId={topId}
              onSelect={handleDockSelect}
            />

            {contextMenu ? (
              <DesktopContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={closeContextMenu}
                onPersonalize={openPersonalize}
                onOpenWelcome={() => openWindow('home')}
                onResetWindowLayout={resetWindowLayout}
                onResetWallpaper={resetWallpaper}
              />
            ) : null}
          </WallpaperManager>
        </>
      )}

      <Spotlight
        open={spotlightOpen}
        extraEntries={extraSpotlightEntries}
        disabledIds={disabledSpotlightIds}
        onClose={closeSpotlight}
        onAction={executeSpotlightAction}
        compact={isMobile}
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
          className="fixed bottom-24 right-4 z-[80] max-w-[calc(100vw-2rem)] os-border bg-paper px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground os-shadow"
        >
          {copyStatus}
        </div>
      ) : null}

      {achievementNotice ? (
        <div
          role="status"
          aria-live="polite"
          data-desktop-interactive="true"
          className="achievement-notice fixed bottom-24 left-4 z-[80] max-w-[calc(100vw-2rem)] os-border bg-paper px-3 py-2 text-foreground os-shadow"
        >
          <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
            {achievementNotice.title}
          </p>
          <p className="font-pixel text-[10px] leading-relaxed text-foreground">
            {achievementNotice.message}
          </p>
        </div>
      ) : null}
    </div>
  )
}

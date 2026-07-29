'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { BootScreen } from './boot-screen'
import { MenuBar } from './menu-bar'
import { DesktopIcon } from './desktop-icon'
import { OsWindow } from './os-window'
import { DESKTOP_ITEMS, WINDOW_APPS, type WindowId } from './apps'
import { DesktopCalendar } from './desktop-calendar'
import { DesktopClock } from './desktop-clock'
import { DesktopContextMenu } from './desktop-context-menu'
import { useDesktopPreferences } from './use-desktop-preferences'
import { WallpaperManager } from './wallpaper-manager'
import { HomeContent } from './content/home-content'
import { AboutContent } from './content/about-content'
import { ProjectsContent } from './content/projects-content'
import { CertificationsContent } from './content/certifications-content'
import { ResumeContent } from './content/resume-content'
import { ContactContent } from './content/contact-content'
import { WallpapersContent } from './content/wallpapers-content'
import { useSoundEffects } from './use-sound-effects'
import {
  DEFAULT_WALLPAPER_ID,
  type WallpaperId,
} from '@/lib/wallpapers'

type WindowStatus = 'open' | 'closing'
type OpenWindow = { id: WindowId; x: number; y: number; status: WindowStatus }
type OpenWindowOptions = { playSound?: boolean }
type ContextMenuPosition = { x: number; y: number } | null

const CONTEXT_MENU_WIDTH = 176
const CONTEXT_MENU_HEIGHT = 92
const WINDOW_CLOSE_DURATION_MS = 160
const WALLPAPER_TRANSITION_DURATION_MS = 210
const DESKTOP_EDGE_PADDING = 8
const MENU_BAR_HEIGHT = 32
const MIN_VISIBLE_TITLEBAR_WIDTH = 128

function clampWindowPosition(id: WindowId, x: number, y: number) {
  if (typeof window === 'undefined') {
    return { x, y }
  }

  const app = WINDOW_APPS[id]
  const minX = DESKTOP_EDGE_PADDING
  const minY = MENU_BAR_HEIGHT + DESKTOP_EDGE_PADDING
  const maxX = Math.max(minX, window.innerWidth - Math.min(MIN_VISIBLE_TITLEBAR_WIDTH, app.width))
  const maxY = Math.max(minY, window.innerHeight - 48)

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  }
}

function getInitialWindowPosition(id: WindowId, count: number) {
  if (typeof window === 'undefined') {
    return { x: 80, y: 60 }
  }

  const app = WINDOW_APPS[id]
  const baseX = Math.max(24, (window.innerWidth - app.width) / 2 - 80)
  return clampWindowPosition(id, baseX + count * 30, 60 + count * 30)
}

export function Desktop() {
  const [booted, setBooted] = useState(false)
  const [scanlines, setScanlines] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [order, setOrder] = useState<WindowId[]>([])
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition>(null)
  const [transitionFromWallpaperId, setTransitionFromWallpaperId] =
    useState<WallpaperId | null>(null)
  const { preferences, updatePreferences, resetWallpaper } = useDesktopPreferences()
  const soundEffects = useSoundEffects()
  const windowsRef = useRef<OpenWindow[]>([])
  const windowOpenSequence = useRef(0)
  const closeTimers = useRef<Partial<Record<WindowId, ReturnType<typeof setTimeout>>>>({})
  const wallpaperTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const focusWindow = useCallback((id: WindowId) => {
    setOrder((prev) => [...prev.filter((w) => w !== id), id])
  }, [])

  const openWindow = useCallback(
    (id: string, options: OpenWindowOptions = {}) => {
      const windowId = id as WindowId
      if (!WINDOW_APPS[windowId]) return

      if (windowsRef.current.some((w) => w.id === windowId)) {
        focusWindow(windowId)
        return
      }

      const position = getInitialWindowPosition(windowId, windowOpenSequence.current)
      windowOpenSequence.current += 1
      const nextWindow: OpenWindow = { id: windowId, ...position, status: 'open' }
      windowsRef.current = [...windowsRef.current, nextWindow]
      setWindows((prev) =>
        prev.some((w) => w.id === windowId) ? prev : [...prev, nextWindow],
      )
      focusWindow(windowId)
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
      setOrder((prev) => prev.filter((w) => w !== id))
      delete closeTimers.current[id]
    }, WINDOW_CLOSE_DURATION_MS)
  }, [soundEffects])

  const moveWindow = useCallback((id: WindowId, x: number, y: number) => {
    const position = clampWindowPosition(id, x, y)
    windowsRef.current = windowsRef.current.map((w) =>
      w.id === id ? { ...w, ...position } : w,
    )
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...position } : w)))
  }, [])

  const beginWallpaperTransition = useCallback((nextWallpaperId: WallpaperId) => {
    if (nextWallpaperId === preferences.wallpaperId) {
      return
    }

    setTransitionFromWallpaperId(preferences.wallpaperId)
    if (wallpaperTransitionTimer.current) {
      clearTimeout(wallpaperTransitionTimer.current)
    }

    wallpaperTransitionTimer.current = setTimeout(() => {
      setTransitionFromWallpaperId(null)
      wallpaperTransitionTimer.current = null
    }, WALLPAPER_TRANSITION_DURATION_MS)
  }, [preferences.wallpaperId])

  const updateDesktopPreferences = useCallback(
    (patch: Partial<typeof preferences>) => {
      if (patch.wallpaperId) {
        beginWallpaperTransition(patch.wallpaperId)
      }
      updatePreferences(patch)
    },
    [beginWallpaperTransition, updatePreferences],
  )

  const resetDesktopWallpaper = useCallback(() => {
    beginWallpaperTransition(DEFAULT_WALLPAPER_ID)
    resetWallpaper()
  }, [beginWallpaperTransition, resetWallpaper])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const openPersonalize = useCallback(() => {
    openWindow('wallpapers')
  }, [openWindow])

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

      setContextMenu({
        x: Math.max(8, Math.min(event.clientX, window.innerWidth - CONTEXT_MENU_WIDTH - 8)),
        y: Math.max(40, Math.min(event.clientY, window.innerHeight - CONTEXT_MENU_HEIGHT - 8)),
      })
    },
    [closeContextMenu, isMobile],
  )

  // Auto-open the welcome window on desktop after boot.
  useEffect(() => {
    if (booted && !isMobile && windows.length === 0) {
      openWindow('home', { playSound: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, isMobile])

  useEffect(() => {
    const onResize = () => {
      const nextWindows = windowsRef.current.map((w) => {
        const position = clampWindowPosition(w.id, w.x, w.y)
        return position.x === w.x && position.y === w.y ? w : { ...w, ...position }
      })
      windowsRef.current = nextWindows
      setWindows(nextWindows)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      Object.values(closeTimers.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer)
        }
      })
      if (wallpaperTransitionTimer.current) {
        clearTimeout(wallpaperTransitionTimer.current)
      }
    }
  }, [])

  // Escape closes the top-most window.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contextMenu) return
      if (e.key === 'Escape' && order.length > 0) {
        closeWindow(order[order.length - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [contextMenu, order, closeWindow])

  const renderContent = (id: WindowId) => {
    switch (id) {
      case 'home':
        return <HomeContent onOpen={openWindow} />
      case 'about':
        return <AboutContent />
      case 'projects':
        return <ProjectsContent />
      case 'certifications':
        return <CertificationsContent />
      case 'resume':
        return <ResumeContent />
      case 'contact':
        return <ContactContent />
      case 'wallpapers':
        return (
          <WallpapersContent
            preferences={preferences}
            soundEffectsEnabled={soundEffects.soundEffectsEnabled}
            onUpdatePreferences={updateDesktopPreferences}
            onResetWallpaper={resetDesktopWallpaper}
            onSetSoundEffectsEnabled={soundEffects.setSoundEffectsEnabled}
            onFirstCustomWallpaperSet={soundEffects.firstWallpaperSet}
          />
        )
    }
  }

  const topId = order[order.length - 1]
  const desktopItems = useMemo(() => DESKTOP_ITEMS, [])

  return (
    <div className={scanlines ? 'scanlines' : undefined}>
      {!booted ? <BootScreen onDone={() => setBooted(true)} /> : null}

      <MenuBar
        onOpen={openWindow}
        scanlines={scanlines}
        onToggleScanlines={() => setScanlines((s) => !s)}
      />

      <WallpaperManager
        wallpaperId={preferences.wallpaperId}
        transitionFromWallpaperId={transitionFromWallpaperId}
        className="relative min-h-[100dvh] pt-8"
        aria-label="Jack OS desktop"
        onContextMenu={handleDesktopContextMenu}
        onPointerDown={contextMenu ? closeContextMenu : undefined}
      >
        {/* Desktop watermark */}
        <p
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 max-w-xs font-pixel text-[9px] leading-relaxed text-muted-foreground/60"
        >
          Jack OS v1.0
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

        {/* Desktop icons (right rail) */}
        {!isMobile ? (
          <div className="absolute right-3 top-11 flex flex-col items-end gap-3">
            {desktopItems.map((item) => (
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
        {isMobile && windows.length === 0 ? (
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
              z={z}
              status={w.status}
              focused={topId === w.id}
              isMobile={isMobile}
              onFocus={() => {
                if (w.status !== 'closing') {
                  focusWindow(w.id)
                }
              }}
              onClose={() => closeWindow(w.id)}
              onMove={(x, y) => moveWindow(w.id, x, y)}
            >
              {renderContent(w.id)}
            </OsWindow>
          )
        })}

        {/* Mobile: home indicator to close current app */}
        {isMobile && windows.length > 0 ? (
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
            onResetWallpaper={resetDesktopWallpaper}
          />
        ) : null}
      </WallpaperManager>
    </div>
  )
}

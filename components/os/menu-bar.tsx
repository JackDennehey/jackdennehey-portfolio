'use client'

import type { ReactNode } from 'react'
import { SystemMenu } from './shell/system-menu'
import { SystemStatus } from './shell/system-status'
import { WINDOW_APPS, getDesktopAppLabel, type WindowId } from './apps'
import type { InterfaceTheme } from '@/lib/interface-theme'
import { JdenOwlMark, JdenWindowTrigger } from './jden-launch'

export function MenuBar({
  onOpen,
  activeWindowId,
  scanlines,
  onToggleScanlines,
  theme,
  onToggleTheme,
  soundEffectsEnabled,
  onToggleSoundEffects,
  onOpenSpotlight,
  onOpenSimpleMode,
  achievementCount,
  achievementTotal,
  onOpenAchievements,
  uptimeLabel,
  openWindowCount,
  systemMenuOpen,
  onToggleSystemMenu,
  onCloseSystemMenu,
  onResetWindowLayout,
  onRestartSession,
}: {
  onOpen: (id: WindowId) => void
  activeWindowId?: WindowId
  scanlines: boolean
  onToggleScanlines: () => void
  theme: InterfaceTheme
  onToggleTheme: () => void
  soundEffectsEnabled: boolean
  onToggleSoundEffects: () => void
  onOpenSpotlight: () => void
  onOpenSimpleMode: () => void
  achievementCount: number
  achievementTotal: number
  onOpenAchievements: () => void
  uptimeLabel: string
  openWindowCount: number
  systemMenuOpen: boolean
  onToggleSystemMenu: () => void
  onCloseSystemMenu: () => void
  onResetWindowLayout: () => void
  onRestartSession: () => void
}) {
  const activeAppLabel = activeWindowId ? getDesktopAppLabel(activeWindowId) : null
  const activeAppTitle = activeWindowId ? WINDOW_APPS[activeWindowId].title : null

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-11 items-center justify-between border-b-2 border-border bg-paper px-2 sm:h-8 sm:px-3">
      <nav aria-label="Main" className="flex min-w-0 items-center gap-0.5">
        <MenuButton onClick={() => onOpen('home')} featured>
          <span
            aria-hidden
            className="grid size-4 place-items-center bg-foreground text-[8px] text-primary-foreground"
          >
            J
          </span>
          JackOS
        </MenuButton>
        <span
          className="hidden min-w-0 max-w-[14rem] truncate px-2 font-pixel text-[10px] leading-none text-muted-foreground sm:inline"
          aria-live="polite"
          aria-atomic="true"
        >
          {activeAppTitle ? (
            <span className="text-foreground" title={activeAppTitle}>
              {activeAppLabel}
            </span>
          ) : (
            'Desktop'
          )}
        </span>
        <JdenWindowTrigger
          onOpen={() => onOpen('jden-studios')}
          className="jden-system-entry flex min-h-11 min-w-11 items-center gap-1.5 px-2 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none sm:min-h-0 sm:py-1"
        >
          <JdenOwlMark size="menu" className="size-4 shrink-0" />
          <span className="sm:hidden">JDEN</span>
          <span className="hidden sm:inline">JDEN STUDIOS</span>
        </JdenWindowTrigger>
        <div className="relative hidden sm:block">
          <MenuButton
            onClick={onToggleSystemMenu}
            expanded={systemMenuOpen}
            controls="jackos-system-menu"
          >
            System
          </MenuButton>
          {systemMenuOpen ? (
            <div id="jackos-system-menu">
              <SystemMenu
                onPersonalize={() => onOpen('wallpapers')}
                onOpenWelcome={() => onOpen('home')}
                onOpenRecruiter={() => onOpen('recruiter')}
                onOpenSimpleMode={onOpenSimpleMode}
                onResetWindowLayout={onResetWindowLayout}
                onRestartSession={onRestartSession}
                onClose={onCloseSystemMenu}
              />
            </div>
          ) : null}
        </div>
        <MenuButton onClick={() => onOpen('about')}>About</MenuButton>
        <MenuButton onClick={onOpenSimpleMode}>Simple</MenuButton>
        <button
          type="button"
          onClick={onOpenSpotlight}
          title="Spotlight"
          aria-label="Open Spotlight"
          className="min-h-11 min-w-11 px-2 py-1 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none sm:min-h-0 sm:min-w-0"
        >
          Search
        </button>
        <MenuButton onClick={() => onOpen('assistant')}>Help</MenuButton>
      </nav>

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenAchievements}
          className="hidden os-border bg-secondary px-2 py-1 font-pixel text-[7px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none sm:block"
          aria-label={`Achievements ${achievementCount} of ${achievementTotal} unlocked`}
        >
          ACH {achievementCount}/{achievementTotal}
        </button>
        <SystemStatus
          uptimeLabel={uptimeLabel}
          openWindowCount={openWindowCount}
          scanlines={scanlines}
          onToggleScanlines={onToggleScanlines}
          theme={theme}
          onToggleTheme={onToggleTheme}
          soundEffectsEnabled={soundEffectsEnabled}
          onToggleSoundEffects={onToggleSoundEffects}
        />
      </div>
    </header>
  )
}

function MenuButton({
  children,
  onClick,
  featured = false,
  expanded,
  controls,
}: {
  children: ReactNode
  onClick: () => void
  featured?: boolean
  expanded?: boolean
  controls?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-haspopup={typeof expanded === 'boolean' ? 'menu' : undefined}
      aria-controls={expanded ? controls : undefined}
      className={`flex items-center gap-1.5 px-2 py-1 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none ${
        featured ? '' : 'hidden sm:flex'
      } ${expanded ? 'bg-foreground text-primary-foreground' : ''}`}
    >
      {children}
    </button>
  )
}

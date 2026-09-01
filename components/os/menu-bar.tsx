'use client'

import type { ReactNode } from 'react'
import { Clock } from './clock'
import type { WindowId } from './apps'
import type { InterfaceTheme } from '@/lib/interface-theme'
import {
  JackScanlinesIcon,
  JackScanlinesOffIcon,
  JackSoundOffIcon,
  JackSoundOnIcon,
  JackThemeDarkIcon,
  JackThemeLightIcon,
} from './jack-icons'
import { JdenOwlMark, JdenWindowTrigger } from './jden-launch'

export function MenuBar({
  onOpen,
  scanlines,
  onToggleScanlines,
  theme,
  onToggleTheme,
  soundEffectsEnabled,
  onToggleSoundEffects,
  onOpenCommandPalette,
  onOpenSimpleMode,
  achievementCount,
  achievementTotal,
  onOpenAchievements,
  uptimeLabel,
  openWindowCount,
  uiActivity,
}: {
  onOpen: (id: WindowId) => void
  scanlines: boolean
  onToggleScanlines: () => void
  theme: InterfaceTheme
  onToggleTheme: () => void
  soundEffectsEnabled: boolean
  onToggleSoundEffects: () => void
  onOpenCommandPalette: () => void
  onOpenSimpleMode: () => void
  achievementCount: number
  achievementTotal: number
  onOpenAchievements: () => void
  uptimeLabel: string
  openWindowCount: number
  uiActivity: number
}) {
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
          Jack OS
        </MenuButton>
        <JdenWindowTrigger
          onOpen={() => onOpen('jden-studios')}
          className="jden-system-entry flex min-h-11 min-w-11 items-center gap-1.5 px-2 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none sm:min-h-0 sm:py-1"
        >
          <JdenOwlMark size="menu" className="size-4 shrink-0" />
          <span className="sm:hidden">JDEN</span>
          <span className="hidden sm:inline">JDEN STUDIOS</span>
        </JdenWindowTrigger>
        <MenuButton onClick={() => onOpen('wallpapers')}>System</MenuButton>
        <MenuButton onClick={() => onOpen('about')}>About</MenuButton>
        <MenuButton onClick={onOpenSimpleMode}>Simple</MenuButton>
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Search Jack OS"
          className="px-2 py-1 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
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
        <div
          aria-label={`Jack OS status nominal. Uptime ${uptimeLabel}. ${openWindowCount} windows open. UI activity ${uiActivity} percent.`}
          className="hidden os-border bg-secondary px-2 py-1 font-pixel text-[7px] leading-none text-foreground lg:block"
        >
          <span className="xl:hidden">NOMINAL</span>
          <span className="hidden xl:inline">
            SYS_STATUS: NOMINAL · UPTIME: {uptimeLabel} · WINDOWS:{' '}
            {String(openWindowCount).padStart(2, '0')} · UI ACTIVITY: {uiActivity}%
          </span>
        </div>
        <div
          aria-label="System controls"
          className="flex items-center gap-0.5 os-border bg-secondary p-0.5"
        >
          <button
            type="button"
            onClick={onToggleScanlines}
            aria-pressed={scanlines}
            className="grid size-6 place-items-center border-2 border-transparent text-foreground transition-colors hover:border-border hover:bg-card focus-visible:border-border focus-visible:bg-card focus-visible:outline-none"
            title={scanlines ? 'Disable CRT lines' : 'Enable CRT lines'}
          >
            {scanlines ? (
              <JackScanlinesIcon className="size-4" />
            ) : (
              <JackScanlinesOffIcon className="size-4" />
            )}
            <span className="sr-only">
              {scanlines ? 'Disable CRT lines' : 'Enable CRT lines'}
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
            className="grid size-6 place-items-center border-2 border-transparent text-foreground transition-colors hover:border-border hover:bg-card focus-visible:border-border focus-visible:bg-card focus-visible:outline-none"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <JackThemeDarkIcon className="size-4" />
            ) : (
              <JackThemeLightIcon className="size-4" />
            )}
            <span className="sr-only">
              {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleSoundEffects}
            aria-pressed={soundEffectsEnabled}
            className="grid size-6 place-items-center border-2 border-transparent text-foreground transition-colors hover:border-border hover:bg-card focus-visible:border-border focus-visible:bg-card focus-visible:outline-none"
            title={soundEffectsEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
          >
            {soundEffectsEnabled ? (
              <JackSoundOnIcon className="size-4" />
            ) : (
              <JackSoundOffIcon className="size-4" />
            )}
            <span className="sr-only">
              {soundEffectsEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
            </span>
          </button>
        </div>
        <Clock />
      </div>
    </header>
  )
}

function MenuButton({
  children,
  onClick,
  featured = false,
}: {
  children: ReactNode
  onClick: () => void
  featured?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none ${
        featured ? '' : 'hidden sm:flex'
      }`}
    >
      {children}
    </button>
  )
}

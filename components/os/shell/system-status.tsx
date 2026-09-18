'use client'

import type { ReactNode } from 'react'
import type { InterfaceTheme } from '@/lib/interface-theme'
import { Clock } from '../clock'
import {
  JackScanlinesIcon,
  JackScanlinesOffIcon,
  JackSoundOffIcon,
  JackSoundOnIcon,
  JackThemeDarkIcon,
  JackThemeLightIcon,
} from '../jack-icons'

export function SystemStatus({
  uptimeLabel,
  openWindowCount,
  scanlines,
  onToggleScanlines,
  theme,
  onToggleTheme,
  soundEffectsEnabled,
  onToggleSoundEffects,
}: {
  uptimeLabel: string
  openWindowCount: number
  scanlines: boolean
  onToggleScanlines: () => void
  theme: InterfaceTheme
  onToggleTheme: () => void
  soundEffectsEnabled: boolean
  onToggleSoundEffects: () => void
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <div
        aria-label={`Session uptime ${uptimeLabel}. ${openWindowCount} windows open.`}
        className="hidden os-border bg-secondary px-2 py-1 font-pixel text-[7px] leading-none text-foreground lg:block"
      >
        <span className="xl:hidden">{uptimeLabel}</span>
        <span className="hidden xl:inline">
          UPTIME {uptimeLabel} · WIN {String(openWindowCount).padStart(2, '0')}
        </span>
      </div>
      <div
        aria-label="System controls"
        className="flex items-center gap-0.5 os-border bg-secondary p-0.5"
      >
        <StatusToggle
          pressed={scanlines}
          label={scanlines ? 'Disable CRT lines' : 'Enable CRT lines'}
          onClick={onToggleScanlines}
        >
          {scanlines ? (
            <JackScanlinesIcon className="size-4" />
          ) : (
            <JackScanlinesOffIcon className="size-4" />
          )}
        </StatusToggle>
        <StatusToggle
          pressed={theme === 'dark'}
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? (
            <JackThemeDarkIcon className="size-4" />
          ) : (
            <JackThemeLightIcon className="size-4" />
          )}
        </StatusToggle>
        <StatusToggle
          pressed={soundEffectsEnabled}
          label={soundEffectsEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
          onClick={onToggleSoundEffects}
        >
          {soundEffectsEnabled ? (
            <JackSoundOnIcon className="size-4" />
          ) : (
            <JackSoundOffIcon className="size-4" />
          )}
        </StatusToggle>
      </div>
      <Clock showDate />
    </div>
  )
}

function StatusToggle({
  pressed,
  label,
  onClick,
  children,
}: {
  pressed: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      className="grid size-6 place-items-center border-2 border-transparent text-foreground transition-colors hover:border-border hover:bg-card focus-visible:border-border focus-visible:bg-card focus-visible:outline-none"
    >
      {children}
    </button>
  )
}

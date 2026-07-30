'use client'

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

const MENU: { id: WindowId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'resume', label: 'Resume' },
  { id: 'contact', label: 'Contact' },
]

export function MenuBar({
  onOpen,
  scanlines,
  onToggleScanlines,
  theme,
  onToggleTheme,
  soundEffectsEnabled,
  onToggleSoundEffects,
}: {
  onOpen: (id: WindowId) => void
  scanlines: boolean
  onToggleScanlines: () => void
  theme: InterfaceTheme
  onToggleTheme: () => void
  soundEffectsEnabled: boolean
  onToggleSoundEffects: () => void
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between border-b-2 border-border bg-paper px-2 sm:px-3">
      <nav aria-label="Main" className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onOpen('home')}
          className="flex items-center gap-1.5 px-2 py-1 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="grid size-4 place-items-center bg-foreground text-[8px] text-primary-foreground"
          >
            J
          </span>
          Jack
        </button>
        {MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="hidden px-2 py-1 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none sm:block"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
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

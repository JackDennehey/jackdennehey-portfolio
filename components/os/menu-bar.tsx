'use client'

import { Clock } from './clock'
import type { WindowId } from './apps'
import { JackScanlinesIcon, JackScanlinesOffIcon } from './jack-icons'

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
}: {
  onOpen: (id: WindowId) => void
  scanlines: boolean
  onToggleScanlines: () => void
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
        <button
          type="button"
          onClick={onToggleScanlines}
          aria-pressed={scanlines}
          className="grid size-6 place-items-center border-2 border-transparent text-foreground transition-colors hover:border-border focus-visible:border-border focus-visible:outline-none"
          title={scanlines ? 'Disable scanline effect' : 'Enable scanline effect'}
        >
          {scanlines ? (
            <JackScanlinesIcon className="size-4" />
          ) : (
            <JackScanlinesOffIcon className="size-4" />
          )}
          <span className="sr-only">
            {scanlines ? 'Disable scanline effect' : 'Enable scanline effect'}
          </span>
        </button>
        <Clock />
      </div>
    </header>
  )
}

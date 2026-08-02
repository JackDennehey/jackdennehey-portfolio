'use client'

import { useEffect, useRef } from 'react'
import type { WindowId } from './apps'

const FIRST_STOPS: readonly { label: string; marker: string; target: WindowId }[] = [
  { label: 'Recruiter Mode', marker: '⭐', target: 'recruiter' },
  { label: 'Network Firewall', marker: '🛡️', target: 'firewall' },
  { label: 'Timeline', marker: '📅', target: 'timeline' },
  { label: 'Ask J.D.', marker: '🤖', target: 'assistant' },
]

export function FirstVisitWelcome({
  onOpen,
  onDismiss,
}: {
  onOpen: (id: WindowId) => void
  onDismiss: () => void
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onDismiss])

  const openStop = (target: WindowId) => {
    onDismiss()
    onOpen(target)
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="first-visit-welcome-title"
      data-desktop-interactive="true"
      className="first-visit-window fixed left-1/2 top-24 z-[75] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden os-border bg-paper text-foreground os-shadow-lg"
    >
      <header className="flex h-8 items-center gap-2 border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onDismiss}
          aria-label="Close welcome window"
          className="grid size-4 place-items-center border-2 border-current bg-transparent font-pixel text-[8px] leading-none transition-colors hover:border-border focus-visible:border-border focus-visible:outline-none"
        >
          <span aria-hidden>x</span>
        </button>
        <h2
          id="first-visit-welcome-title"
          className="flex-1 text-center font-pixel text-[9px] leading-none"
        >
          Welcome to Jack OS
        </h2>
        <span aria-hidden className="size-4" />
      </header>

      <div className="space-y-3 p-3">
        <p className="text-sm leading-relaxed text-foreground">
          Recommended first stops:
        </p>
        <div className="grid gap-2">
          {FIRST_STOPS.map((stop) => (
            <button
              key={stop.target}
              type="button"
              onClick={() => openStop(stop.target)}
              className="os-border flex min-h-10 items-center gap-2 bg-card px-2.5 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              <span aria-hidden className="w-5 shrink-0 text-center text-[12px] leading-none">
                {stop.marker}
              </span>
              <span>{stop.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

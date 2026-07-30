'use client'

import { useEffect, useState } from 'react'
import type { InterfaceTheme } from '@/lib/interface-theme'
import {
  JACK_OS_RELEASE_NAME,
  JACK_OS_VERSION,
} from '@/lib/release'
import { readAndMarkReturningVisitor } from '@/lib/onboarding'

function getLocalGreeting(date: Date) {
  const hour = date.getHours()
  const rotation = date.getDate()

  if (hour >= 5 && hour < 12) {
    return ['Good morning.', 'Coffee?', 'You got this.'][rotation % 3]
  }
  if (hour >= 12 && hour < 17) {
    return ['Good afternoon.', 'Drifting...', 'How many more hours?'][rotation % 3]
  }
  if (hour >= 17 && hour < 22) {
    return 'Good evening.'
  }
  return ['Burning the midnight oil?', 'Job not finished.', 'ZZZ'][rotation % 3]
}

export function HomeContent({
  onOpen,
  theme,
  soundEffectsEnabled,
  scanlines,
  onShowTour,
}: {
  onOpen: (id: string) => void
  theme: InterfaceTheme
  soundEffectsEnabled: boolean
  scanlines: boolean
  onShowTour: () => void
}) {
  const [greeting, setGreeting] = useState('Welcome.')
  const [returningVisitor, setReturningVisitor] = useState(false)

  useEffect(() => {
    setGreeting(getLocalGreeting(new Date()))
    setReturningVisitor(readAndMarkReturningVisitor())
  }, [])

  return (
    <div className="space-y-5">
      <div className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> booting personal profile...'}
        </p>
        <p className="mt-3 font-pixel text-[9px] leading-relaxed text-foreground">
          {greeting}
        </p>
        {returningVisitor ? (
          <p className="mt-1 font-pixel text-[8px] leading-relaxed text-muted-foreground">
            System restored.
          </p>
        ) : null}
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Welcome to Jack OS
        </h2>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
          Jack Dennehey
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Business Student at Penn State
        </p>
      </div>

      <p className="text-sm leading-relaxed text-foreground text-pretty">
        {
          "I'm a business student passionate about technology, cybersecurity, networking, cloud computing, artificial intelligence, and building meaningful projects."
        }
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        This website documents my professional journey, projects, credentials, and continuous
        learning.
      </p>

      <section className="os-border bg-secondary p-3">
        <h3 className="font-pixel text-[9px] leading-relaxed text-foreground">
          System Information
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs leading-relaxed text-muted-foreground">
          <dt>Edition</dt>
          <dd className="text-foreground">Portfolio</dd>
          <dt>Version</dt>
          <dd className="text-foreground">{JACK_OS_VERSION}</dd>
          <dt>Release</dt>
          <dd className="text-foreground">{JACK_OS_RELEASE_NAME}</dd>
          <dt>Theme</dt>
          <dd className="capitalize text-foreground">{theme}</dd>
          <dt>Sound</dt>
          <dd className="text-foreground">{soundEffectsEnabled ? 'On' : 'Off'}</dd>
          <dt>CRT Lines</dt>
          <dd className="text-foreground">{scanlines ? 'On' : 'Off'}</dd>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2 pt-1">
        {[
          ['about', 'About Me'],
          ['projects', 'Projects'],
          ['resume', 'Resume'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            {`Open ${label}`}
          </button>
        ))}
        <button
          type="button"
          onClick={onShowTour}
          className="os-border bg-card px-3 py-1.5 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Show Welcome Tour
        </button>
      </div>
    </div>
  )
}

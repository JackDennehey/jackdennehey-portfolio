'use client'

import { useCallback, useEffect, useState } from 'react'
import { STARTUP_AUDIO_DURATION_MS } from './use-sound-effects'

const STARTUP_COMPLETE_BUFFER_MS = 120

function getStartupMessage(progress: number) {
  if (progress < 0.18) return 'Jack OS'
  if (progress < 0.42) return 'Checking desktop'
  if (progress < 0.72) return 'Loading preferences'
  if (progress < 0.96) return 'Preparing windows'
  return 'Ready'
}

export function BootScreen({
  onPowerOn,
  onDone,
}: {
  onPowerOn: () => void
  onDone: () => void
}) {
  const [started, setStarted] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!started) return

    let frame = 0
    const startedAt = performance.now()
    const totalMs = STARTUP_AUDIO_DURATION_MS + STARTUP_COMPLETE_BUFFER_MS

    const tick = (now: number) => {
      const nextElapsed = Math.min(totalMs, now - startedAt)
      setElapsed(nextElapsed)

      if (nextElapsed >= totalMs) {
        onDone()
        return
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onDone, started])

  const start = useCallback(() => {
    if (started) return
    setStarted(true)
    onPowerOn()
  }, [onPowerOn, started])

  const progress = Math.min(1, elapsed / STARTUP_AUDIO_DURATION_MS)
  const message = started ? getStartupMessage(progress) : 'Jack OS'
  const complete = progress >= 0.98

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (started) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        start()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [start, started])

  return (
    <div
      role="status"
      aria-label="Starting Jack OS"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background paper-texture ${
        complete ? 'animate-crt-off' : ''
      }`}
    >
      <div className="animate-boot-flicker flex flex-col items-center gap-6 px-6 text-center">
        <div
          aria-hidden
          className="os-border grid size-16 place-items-center bg-foreground text-primary-foreground"
        >
          <span className="font-pixel text-lg">J</span>
        </div>
        <div aria-live="polite" className="space-y-2">
          <p className="font-pixel text-sm leading-relaxed text-foreground sm:text-base">
            {started ? 'Starting ' : ''}
            {message}
            <span className="blink">_</span>
          </p>
          {!started ? (
            <button
              type="button"
              onClick={start}
              className="os-border bg-card px-4 py-2 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              Power On
            </button>
          ) : null}
        </div>
        <div className="os-border h-3 w-56 max-w-[70vw] overflow-hidden bg-secondary p-0.5">
          <div
            className="h-full origin-left bg-foreground"
            style={{ width: started ? `${Math.round(progress * 100)}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}

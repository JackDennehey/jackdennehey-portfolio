'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

type OnboardingDialogProps = {
  isMobile: boolean
  onFinish: () => void
  onSkip: () => void
  onClose: () => void
  onOpenShortcuts: () => void
}

const DESKTOP_STEPS = [
  {
    title: "Explore Jack's portfolio apps",
    body:
      "Open the desktop apps to learn about Jack's projects, credentials, education, and contact paths.",
  },
  {
    title: 'Manage windows',
    body: 'Drag windows, minimize them, maximize them, and bring open apps back into focus.',
  },
  {
    title: 'Search instantly',
    body: 'Press Command + K on macOS or Control + K on Windows to open Search Jack OS.',
  },
  {
    title: 'Enter Recruiter View',
    body: 'Use Recruiter View for a guided professional overview of Jack OS, credentials, projects, skills, and contact information.',
  },
  {
    title: 'Personalize',
    body: 'Change the wallpaper, theme, CRT effect, and sound from the desktop controls.',
    hint: 'Some parts of Jack OS are not listed in the manual.',
  },
] as const

const MOBILE_STEPS = [
  {
    title: "Explore Jack's portfolio apps",
    body:
      "Tap apps from the home grid to learn about Jack's projects, credentials, education, and contact paths.",
  },
  {
    title: 'Move through Jack OS',
    body: 'Open one app at a time, then use the bottom control to return to the home grid.',
  },
  {
    title: 'Search instantly',
    body: 'Use Search Jack OS from the system controls to jump directly to apps and actions.',
  },
  {
    title: 'Enter Recruiter View',
    body: 'Open Recruiter View for a guided professional overview that works well on touch screens.',
  },
  {
    title: 'Personalize',
    body: 'Change the wallpaper, theme, CRT effect, and sound from the Wallpapers app.',
    hint: 'Some parts of Jack OS are not listed in the manual.',
  },
] as const

export function OnboardingDialog({
  isMobile,
  onFinish,
  onSkip,
  onClose,
  onOpenShortcuts,
}: OnboardingDialogProps) {
  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS
  const [stepIndex, setStepIndex] = useState(0)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const progressLabel = `${stepIndex + 1} of ${steps.length}`

  const describedBy = useMemo(
    () => `jack-os-onboarding-step-${stepIndex}`,
    [stepIndex],
  )

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.setTimeout(() => firstButtonRef.current?.focus(), 0)

    return () => {
      window.setTimeout(() => {
        if (previousFocusRef.current?.isConnected) {
          previousFocusRef.current.focus()
        }
      }, 0)
    }
  }, [])

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onSkip()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
      return
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-background/35 px-4 py-10"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jack-os-onboarding-title"
        aria-describedby={describedBy}
        onKeyDown={trapFocus}
        className="animate-notification-in w-full max-w-lg overflow-hidden os-border bg-paper text-foreground os-shadow-lg"
      >
        <header className="flex h-8 items-center gap-2 border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
          <span
            id="jack-os-onboarding-title"
            className="font-pixel text-[10px] leading-none"
          >
            Welcome Tour
          </span>
          <span aria-hidden className="titlebar-lines h-3 flex-1 opacity-60" />
          <span className="font-pixel text-[7px] leading-none">{progressLabel}</span>
        </header>

        <div className="space-y-4 p-4">
          <div id={describedBy} className="space-y-3">
            <p className="font-pixel text-[11px] leading-relaxed text-foreground">
              {step.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {step.body}
            </p>
            {'hint' in step ? (
              <p className="os-border bg-secondary p-2 font-pixel text-[8px] leading-relaxed text-foreground">
                {step.hint}
              </p>
            ) : null}
          </div>

          <div
            aria-hidden
            className="grid grid-cols-5 gap-1"
          >
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={`h-2 border border-border ${
                  index <= stepIndex ? 'bg-foreground' : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              ref={firstButtonRef}
              type="button"
              onClick={onSkip}
              className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              Skip
            </button>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                {isMobile ? 'Interaction Help' : 'Keyboard Shortcuts'}
              </button>
              <button
                type="button"
                disabled={isFirst}
                onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLast) {
                    onFinish()
                    return
                  }
                  setStepIndex((index) => Math.min(steps.length - 1, index + 1))
                }}
                className="os-border bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none"
              >
                {isLast ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getKeynoteStepTransitionClassName } from '../animations/transitions'
import { getKeynoteAsset, getNextKeynoteAssetId } from '../assets/keynote-assets'
import {
  KEYNOTE_MOTION_TOKENS,
  formatKeynoteRomanNumeral,
  getKeynoteChapterDivider,
  getKeynoteMotionClassName,
  getKeynoteMotionPresetForStep,
  type KeynoteChapterDivider,
} from '../config/motion'
import { getKeynoteRenderer } from '../config/renderers'
import { KEYNOTE_STEPS } from '../config/steps'
import { getKeynoteTypography } from '../config/typography'
import {
  getKeynoteVisualTheme,
  getKeynoteVisualThemeStyle,
} from '../config/visual-themes'
import { usePrefersReducedMotion } from '../hooks/use-prefers-reduced-motion'
import { usePresentationController } from '../hooks/use-presentation-controller'
import type {
  KeynoteNavigationDirection,
  KeynoteProgress,
  KeynoteStep,
  KeynoteVisualTheme,
} from '../types/keynote'
import { writeBlueOceanCompleted } from '@/lib/blue-ocean'
import { cn } from '@/lib/utils'

type BlueOceanKeynoteProps = {
  active: boolean
  onPowerDown?: () => void
  onCompleted?: () => void
  onPresentationEnter?: () => void
  onPresentationPowerDown?: () => void
}

type KeynoteCoverProps = {
  canResume: boolean
  onBegin: () => void
  onPresent: () => void
  onResume: () => void
}

type KeynoteLaunchPhase = 'cover' | 'title' | 'progress'

const KEYNOTE_INACTIVITY_MS = 3000
const LAUNCH_SEGMENTS = Array.from({ length: 10 }, (_, index) => index)
const POWER_DOWN_MESSAGES = [
  'SAVING PRESENTATION STATE...',
  'CLOSING 1984 BLUE OCEAN...',
  'RETURNING TO JACK OS...',
]

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  )
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('button, a, [role="button"]'))
}

function preloadKeynoteAsset(path: string) {
  const image = new Image()
  image.decoding = 'async'
  image.src = path
}

function useKeynoteImagePreload(currentStep: KeynoteStep | null, isCover: boolean) {
  useEffect(() => {
    if (isCover) {
      preloadKeynoteAsset(getKeynoteAsset('sailboats').path)
      preloadKeynoteAsset(getKeynoteAsset('school-of-fish').path)
      return
    }

    if (!currentStep) return

    if (currentStep.imageAssetId) {
      preloadKeynoteAsset(getKeynoteAsset(currentStep.imageAssetId).path)
    }

    const currentIndex = KEYNOTE_STEPS.findIndex((step) => step.id === currentStep.id)
    const nextAssetId = getNextKeynoteAssetId(
      KEYNOTE_STEPS.map((step) => step.imageAssetId),
      currentIndex,
    )
    if (nextAssetId) {
      preloadKeynoteAsset(getKeynoteAsset(nextAssetId).path)
    }
  }, [currentStep, isCover])
}

function useDocumentVisible() {
  const [documentVisible, setDocumentVisible] = useState(true)

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(!document.hidden)
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  return documentVisible
}

function useTouchLikeInput() {
  const [touchLikeInput, setTouchLikeInput] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(hover: none), (pointer: coarse)')
    const updateInput = () => setTouchLikeInput(query.matches)
    updateInput()
    query.addEventListener('change', updateInput)
    return () => query.removeEventListener('change', updateInput)
  }, [])

  return touchLikeInput
}

function KeynoteCover({ canResume, onBegin, onPresent, onResume }: KeynoteCoverProps) {
  const beginRef = useRef<HTMLButtonElement | null>(null)
  const typography = getKeynoteTypography('opening')
  const sailboats = getKeynoteAsset('sailboats')

  useEffect(() => {
    beginRef.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby="blue-ocean-cover-title"
      className={cn('keynote-cover keynote-build-fade', typography.frame)}
    >
      <img
        src={sailboats.path}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="eager"
        className="keynote-cover-photo"
        style={{ objectPosition: sailboats.focalPosition }}
      />
      <div className="keynote-cover-panel">
        <div className="keynote-cover-meta" data-keynote-sequence="eyebrow">
          <span>Jack OS V3B</span>
          <span>August 2026</span>
        </div>
        <p className={typography.eyebrow} data-keynote-sequence="eyebrow">
          A Jack OS Keynote
        </p>
        <h1
          id="blue-ocean-cover-title"
          className={typography.heading}
          data-keynote-sequence="heading"
        >
          1984 Blue Ocean
        </h1>
        <p className={typography.subheading} data-keynote-sequence="copy">
          Bridging Strategy and Execution
        </p>
        <div className="keynote-presented-by" data-keynote-sequence="copy">
          <p className={typography.body}>Presented by</p>
          <p className={typography.accent}>Jack Dennehey</p>
        </div>
        <div className="keynote-cover-actions" data-keynote-sequence="footer">
          <button
            ref={beginRef}
            type="button"
            onClick={onBegin}
            className="keynote-primary-button"
          >
            Begin Presentation
          </button>
          <button
            type="button"
            onClick={onPresent}
            className="keynote-secondary-button"
          >
            Present Full Screen
          </button>
          {canResume ? (
            <button
              type="button"
              onClick={onResume}
              className="keynote-secondary-button"
            >
              Resume Presentation
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function KeynoteProgressMeter({
  progress,
  presentationMode,
}: {
  progress: KeynoteProgress
  presentationMode: boolean
}) {
  const progressPercent = Math.max(
    0,
    Math.min(100, (progress.stepNumber / progress.stepTotal) * 100),
  )
  const visibleLabel = presentationMode
    ? `${progress.isOpening ? 'OPENING' : `CHAPTER ${formatKeynoteRomanNumeral(progress.chapterNumber)}`} - ${progress.stepNumber} / ${progress.stepTotal}`
    : progress.chapterName

  return (
    <div
      className={cn('keynote-progress-meter', presentationMode ? 'keynote-progress-presentation' : null)}
      aria-label={progress.spokenLabel}
    >
      <div className="keynote-progress-copy">
        {presentationMode ? (
          <>
            <span>{visibleLabel}</span>
            <span>{progress.stageLabel}</span>
          </>
        ) : (
          <>
            <span>{progress.chapterLabel}</span>
            {!progress.isOpening ? <span>{progress.chapterName}</span> : null}
            <span>{progress.stageLabel}</span>
          </>
        )}
      </div>
      <div
        aria-hidden="true"
        className="keynote-progress-track"
      >
        <div
          className="keynote-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {progress.spokenLabel}
      </p>
    </div>
  )
}

function KeynoteStage({
  step,
  progress,
  navigationDirection,
  presentationMode,
}: {
  step: KeynoteStep
  progress: KeynoteProgress
  navigationDirection: KeynoteNavigationDirection
  presentationMode: boolean
}) {
  const StageComponent = getKeynoteRenderer(step.renderer)
  const transitionClassName = getKeynoteStepTransitionClassName(step)
  const motionPreset = getKeynoteMotionPresetForStep(step)
  const motionClassName = getKeynoteMotionClassName(step)

  return (
    <article
      key={step.id}
      className={cn('keynote-stage', transitionClassName, motionClassName)}
      aria-label={step.ariaLabel}
      data-keynote-build-mode={step.buildMode}
      data-keynote-chapter-start={step.chapterStart ? 'true' : 'false'}
      data-keynote-motion-preset={motionPreset}
      data-keynote-navigation-direction={navigationDirection}
      data-keynote-presentation-mode={presentationMode ? 'true' : 'false'}
      data-keynote-renderer={step.renderer}
      data-keynote-stage-id={step.id}
      data-keynote-theme={step.visualTheme}
    >
      <StageComponent
        step={step}
        progress={progress}
      />
    </article>
  )
}

function KeynoteLaunchSequence({
  phase,
  onSkip,
}: {
  phase: KeynoteLaunchPhase
  onSkip: () => void
}) {
  return (
    <div
      className="keynote-launch-sequence"
      data-keynote-launch-phase={phase}
      role="status"
      aria-live="polite"
      onClick={onSkip}
    >
      <button
        type="button"
        className="sr-only"
        onClick={onSkip}
      >
        Skip launch sequence
      </button>
      <div className="keynote-launch-card">
        <p>1984 BLUE OCEAN</p>
        <h2>A JACK OS KEYNOTE</h2>
        <span>INITIALIZING PRESENTATION...</span>
        <div className="keynote-launch-progress" aria-hidden="true">
          {LAUNCH_SEGMENTS.map((segment) => (
            <i key={segment} />
          ))}
        </div>
      </div>
    </div>
  )
}

function KeynoteChapterDividerPanel({
  divider,
  onSkip,
}: {
  divider: KeynoteChapterDivider
  onSkip: () => void
}) {
  return (
    <div
      className="keynote-chapter-divider"
      data-keynote-divider-motif={divider.motif}
      role="status"
      aria-live="polite"
      onClick={onSkip}
    >
      <button
        type="button"
        className="sr-only"
        onClick={onSkip}
      >
        Skip chapter divider
      </button>
      <div className="keynote-divider-card">
        <p>{`CHAPTER ${divider.romanNumeral}`}</p>
        <h2>{divider.title.toUpperCase()}</h2>
      </div>
    </div>
  )
}

function KeynotePowerDownPanel({ activeStep }: { activeStep: number }) {
  const progressPercent = ((activeStep + 1) / POWER_DOWN_MESSAGES.length) * 100

  return (
    <div
      className="keynote-power-down-panel os-border"
      role="status"
      aria-live="polite"
    >
      {POWER_DOWN_MESSAGES.slice(0, activeStep + 1).map((message) => (
        <p key={message}>{message}</p>
      ))}
      <div className="keynote-power-down-progress" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}

function getShellTheme(currentStep: KeynoteStep | null): KeynoteVisualTheme {
  return currentStep?.visualTheme ?? 'opening'
}

export function BlueOceanKeynote({
  active,
  onPowerDown,
  onCompleted,
  onPresentationEnter,
  onPresentationPowerDown,
}: BlueOceanKeynoteProps) {
  const [presentationMode, setPresentationMode] = useState(false)
  const [browserFullscreenActive, setBrowserFullscreenActive] = useState(false)
  const [presentationActivationPending, setPresentationActivationPending] = useState(false)
  const [controlsQuiet, setControlsQuiet] = useState(false)
  const [cursorHidden, setCursorHidden] = useState(false)
  const [launchPhase, setLaunchPhase] = useState<KeynoteLaunchPhase | null>(null)
  const [chapterDivider, setChapterDivider] = useState<KeynoteChapterDivider | null>(null)
  const [powerDownStep, setPowerDownStep] = useState<number | null>(null)
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const launchTimersRef = useRef<number[]>([])
  const pendingLaunchActionRef = useRef<(() => void) | null>(null)
  const chapterDividerTimerRef = useRef<number | null>(null)
  const powerDownTimersRef = useRef<number[]>([])
  const controlsTimerRef = useRef<number | null>(null)
  const cursorTimerRef = useRef<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const documentVisible = useDocumentVisible()
  const touchLikeInput = useTouchLikeInput()
  const isPoweringDown = powerDownStep !== null

  const clearPowerDownTimers = useCallback(() => {
    powerDownTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    powerDownTimersRef.current = []
  }, [])

  const clearLaunchTimers = useCallback(() => {
    launchTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    launchTimersRef.current = []
  }, [])

  const clearChapterDividerTimer = useCallback(() => {
    if (chapterDividerTimerRef.current !== null) {
      window.clearTimeout(chapterDividerTimerRef.current)
      chapterDividerTimerRef.current = null
    }
  }, [])

  const clearInactivityTimers = useCallback(() => {
    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current)
      controlsTimerRef.current = null
    }
    if (cursorTimerRef.current !== null) {
      window.clearTimeout(cursorTimerRef.current)
      cursorTimerRef.current = null
    }
  }, [])

  const runPendingLaunchAction = useCallback(() => {
    const action = pendingLaunchActionRef.current
    pendingLaunchActionRef.current = null
    action?.()
  }, [])

  const finishLaunchSequence = useCallback(() => {
    clearLaunchTimers()
    runPendingLaunchAction()
    setLaunchPhase(null)
  }, [clearLaunchTimers, runPendingLaunchAction])

  const revealPresentationControls = useCallback(() => {
    if (!presentationMode) return

    clearInactivityTimers()
    setControlsQuiet(false)
    setCursorHidden(false)

    if (!documentVisible) return

    controlsTimerRef.current = window.setTimeout(() => {
      setControlsQuiet(true)
    }, KEYNOTE_INACTIVITY_MS)

    if (!touchLikeInput) {
      cursorTimerRef.current = window.setTimeout(() => {
        const hoveredControl = rootRef.current?.querySelector('button:hover, a:hover, [role="button"]:hover')
        if (
          hoveredControl ||
          (rootRef.current?.contains(document.activeElement) && isInteractiveTarget(document.activeElement))
        ) {
          return
        }
        setCursorHidden(true)
      }, KEYNOTE_INACTIVITY_MS)
    }
  }, [clearInactivityTimers, documentVisible, presentationMode, touchLikeInput])

  const skipActiveSequence = useCallback(() => {
    if (launchPhase) {
      finishLaunchSequence()
      revealPresentationControls()
      return true
    }

    if (chapterDivider) {
      clearChapterDividerTimer()
      setChapterDivider(null)
      revealPresentationControls()
      return true
    }

    return false
  }, [
    chapterDivider,
    clearChapterDividerTimer,
    finishLaunchSequence,
    launchPhase,
    revealPresentationControls,
  ])

  const exitPresentationMode = useCallback(() => {
    setPresentationMode(false)
    setPresentationActivationPending(false)
    setBrowserFullscreenActive(false)
    setControlsQuiet(false)
    setCursorHidden(false)
    setScreenReaderAnnouncement('Exited Presentation Mode. Current keynote step preserved.')
    clearInactivityTimers()

    if (document.fullscreenElement === rootRef.current) {
      void document.exitFullscreen().catch(() => {
        // Fullscreen exit failure should not strand the fixed overlay fallback.
      })
    }

    window.requestAnimationFrame(() => {
      rootRef.current?.focus({ preventScroll: true })
    })
  }, [clearInactivityTimers])

  const completePowerDown = useCallback(() => {
    if (document.fullscreenElement === rootRef.current) {
      void document.exitFullscreen().catch(() => {
        // The Jack OS window close must continue even if the browser rejects exit.
      })
    }

    setPresentationMode(false)
    setBrowserFullscreenActive(false)
    setControlsQuiet(false)
    setCursorHidden(false)
    setPowerDownStep(null)
    clearInactivityTimers()
    writeBlueOceanCompleted()
    onCompleted?.()
    onPowerDown?.()
  }, [clearInactivityTimers, onCompleted, onPowerDown])

  const handlePowerDown = useCallback(() => {
    if (isPoweringDown) return

    clearLaunchTimers()
    clearChapterDividerTimer()
    clearPowerDownTimers()
    setLaunchPhase(null)
    setChapterDivider(null)
    setControlsQuiet(true)
    setCursorHidden(false)
    setPowerDownStep(0)
    onPresentationPowerDown?.()

    if (reducedMotion) {
      powerDownTimersRef.current = [
        window.setTimeout(() => setPowerDownStep(1), 100),
        window.setTimeout(() => setPowerDownStep(2), 190),
        window.setTimeout(completePowerDown, 310),
      ]
      return
    }

    powerDownTimersRef.current = [
      window.setTimeout(() => setPowerDownStep(1), 620),
      window.setTimeout(() => setPowerDownStep(2), 1180),
      window.setTimeout(completePowerDown, KEYNOTE_MOTION_TOKENS.powerDownMs),
    ]
  }, [
    clearChapterDividerTimer,
    clearLaunchTimers,
    clearPowerDownTimers,
    completePowerDown,
    isPoweringDown,
    onPresentationPowerDown,
    reducedMotion,
  ])

  const controller = usePresentationController({
    active,
    presentationMode,
    onExitPresentationMode: exitPresentationMode,
    onFinalNext: handlePowerDown,
    onInteraction: revealPresentationControls,
    onSkipOverlay: skipActiveSequence,
  })
  const { currentStep, isCover, navigationDirection, progress } = controller
  const visualThemeId = getShellTheme(currentStep)
  const visualTheme = getKeynoteVisualTheme(visualThemeId)
  const themeStyle = useMemo(
    () => getKeynoteVisualThemeStyle(visualThemeId),
    [visualThemeId],
  )
  const isPowerDownStep = currentStep?.completionAction === 'power-down'
  const nextButtonLabel = isPowerDownStep
    ? 'Power Down Keynote'
    : progress?.isFinalStep
      ? 'Complete'
      : 'Next'
  const nextButtonDisabled = isPoweringDown || (!controller.canGoNext && !isPowerDownStep)

  const startLaunchSequence = useCallback(
    (action: () => void) => {
      clearLaunchTimers()
      pendingLaunchActionRef.current = action
      setLaunchPhase('cover')

      if (reducedMotion) {
        runPendingLaunchAction()
        launchTimersRef.current = [
          window.setTimeout(() => setLaunchPhase(null), KEYNOTE_MOTION_TOKENS.reducedMs),
        ]
        return
      }

      launchTimersRef.current = [
        window.setTimeout(() => setLaunchPhase('title'), 220),
        window.setTimeout(() => setLaunchPhase('progress'), 620),
        window.setTimeout(runPendingLaunchAction, 920),
        window.setTimeout(() => setLaunchPhase(null), KEYNOTE_MOTION_TOKENS.launchMs),
      ]
    },
    [clearLaunchTimers, reducedMotion, runPendingLaunchAction],
  )

  const handleBegin = useCallback(() => {
    startLaunchSequence(controller.begin)
  }, [controller.begin, startLaunchSequence])

  const handleResume = useCallback(() => {
    startLaunchSequence(controller.resume)
  }, [controller.resume, startLaunchSequence])

  const enterPresentationMode = useCallback(() => {
    if (presentationMode || presentationActivationPending || isPoweringDown) return

    setPresentationActivationPending(true)
    setPresentationMode(true)
    setControlsQuiet(false)
    setCursorHidden(false)
    setScreenReaderAnnouncement('Entered Presentation Mode. Use Arrow keys or Space to navigate. Use Escape or Exit Presentation to return.')
    onPresentationEnter?.()

    if (isCover) {
      startLaunchSequence(controller.begin)
    }

    window.requestAnimationFrame(() => {
      rootRef.current?.focus({ preventScroll: true })
      revealPresentationControls()
    })

    const root = rootRef.current
    if (!root?.requestFullscreen || touchLikeInput) {
      setBrowserFullscreenActive(false)
      setPresentationActivationPending(false)
      return
    }

    try {
      const request = root.requestFullscreen()
      void request
        .then(() => {
          setBrowserFullscreenActive(document.fullscreenElement === root)
        })
        .catch(() => {
          setBrowserFullscreenActive(false)
        })
        .finally(() => {
          setPresentationActivationPending(false)
        })
    } catch {
      setBrowserFullscreenActive(false)
      setPresentationActivationPending(false)
    }
  }, [
    controller.begin,
    isCover,
    isPoweringDown,
    onPresentationEnter,
    presentationActivationPending,
    presentationMode,
    revealPresentationControls,
    startLaunchSequence,
    touchLikeInput,
  ])

  const handlePrevious = useCallback(() => {
    revealPresentationControls()
    if (skipActiveSequence()) return
    controller.goPrevious()
  }, [controller, revealPresentationControls, skipActiveSequence])

  const handleNext = useCallback(() => {
    revealPresentationControls()
    if (skipActiveSequence()) return

    if (isPowerDownStep) {
      handlePowerDown()
      return
    }

    controller.goNext()
  }, [
    controller,
    handlePowerDown,
    isPowerDownStep,
    revealPresentationControls,
    skipActiveSequence,
  ])

  useKeynoteImagePreload(currentStep, isCover)

  useEffect(() => {
    return () => {
      clearPowerDownTimers()
      clearLaunchTimers()
      clearChapterDividerTimer()
      clearInactivityTimers()
    }
  }, [
    clearChapterDividerTimer,
    clearInactivityTimers,
    clearLaunchTimers,
    clearPowerDownTimers,
  ])

  useEffect(() => {
    if (!active || isCover) return
    rootRef.current
      ?.querySelector<HTMLElement>('[data-keynote-stage-heading="true"]')
      ?.focus({ preventScroll: true })
  }, [active, currentStep?.id, isCover])

  useEffect(() => {
    const onFullscreenChange = () => {
      const rootIsFullscreen = document.fullscreenElement === rootRef.current
      setBrowserFullscreenActive(rootIsFullscreen)

      if (presentationMode && browserFullscreenActive && !rootIsFullscreen && !isPoweringDown) {
        setPresentationMode(false)
        setControlsQuiet(false)
        setCursorHidden(false)
        setScreenReaderAnnouncement('Exited browser fullscreen. Current keynote step preserved.')
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [browserFullscreenActive, isPoweringDown, presentationMode])

  useEffect(() => {
    document.documentElement.classList.toggle('keynote-presentation-active', presentationMode)
    return () => document.documentElement.classList.remove('keynote-presentation-active')
  }, [presentationMode])

  useEffect(() => {
    if (!presentationMode) {
      setControlsQuiet(false)
      setCursorHidden(false)
      clearInactivityTimers()
      return
    }

    revealPresentationControls()
  }, [clearInactivityTimers, currentStep?.id, presentationMode, revealPresentationControls])

  useEffect(() => {
    if (!presentationMode) return
    const root = rootRef.current
    if (!root) return

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      revealPresentationControls()
    }
    const onPointerDown = () => revealPresentationControls()
    const onFocusIn = () => revealPresentationControls()
    const onFocusOut = () => revealPresentationControls()

    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    return () => {
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
    }
  }, [presentationMode, revealPresentationControls])

  useEffect(() => {
    if (!active || presentationMode || isPoweringDown) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTextEntryTarget(event.target)) return
      if (event.key.toLowerCase() !== 'p' && event.key.toLowerCase() !== 'f') return
      event.preventDefault()
      event.stopPropagation()
      enterPresentationMode()
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [active, enterPresentationMode, isPoweringDown, presentationMode])

  useEffect(() => {
    clearChapterDividerTimer()

    if (
      !currentStep ||
      isCover ||
      isPoweringDown ||
      launchPhase ||
      navigationDirection !== 'forward'
    ) {
      setChapterDivider(null)
      return
    }

    const divider = getKeynoteChapterDivider(currentStep)
    if (!divider) {
      setChapterDivider(null)
      return
    }

    setChapterDivider(divider)
    chapterDividerTimerRef.current = window.setTimeout(
      () => setChapterDivider(null),
      reducedMotion ? KEYNOTE_MOTION_TOKENS.reducedMs : KEYNOTE_MOTION_TOKENS.chapterMs,
    )
  }, [
    clearChapterDividerTimer,
    currentStep,
    isCover,
    isPoweringDown,
    launchPhase,
    navigationDirection,
    reducedMotion,
  ])

  const fullscreenState = browserFullscreenActive ? 'browser' : presentationMode ? 'fallback' : 'windowed'

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={cn(
        'keynote-shell',
        visualTheme.texture,
        presentationMode ? 'keynote-shell-presentation' : null,
        browserFullscreenActive ? 'keynote-shell-browser-fullscreen' : null,
        isPoweringDown ? 'keynote-shell-powering-down' : null,
        cursorHidden ? 'keynote-shell-cursor-hidden' : null,
      )}
      style={themeStyle}
      aria-label="1984 Blue Ocean keynote"
      data-keynote-contrast={visualTheme.controlContrast}
      data-keynote-fullscreen={fullscreenState}
      data-keynote-paused={documentVisible ? 'false' : 'true'}
      data-keynote-presentation-mode={presentationMode ? 'true' : 'false'}
      data-keynote-theme={visualThemeId}
    >
      <p className="sr-only" aria-live="polite">
        {screenReaderAnnouncement}
      </p>

      {!presentationMode ? (
        <header className="keynote-shell-header">
          <div>
            <p className="keynote-shell-kicker">1984 Blue Ocean</p>
            <p className="keynote-shell-chapter">
              {progress ? progress.chapterName : 'A Jack OS Keynote'}
            </p>
          </div>
          <div className="keynote-shell-actions">
            <button
              type="button"
              onClick={enterPresentationMode}
              className="keynote-secondary-button"
              aria-label="Enter full-screen presentation mode"
              disabled={isPoweringDown || presentationActivationPending}
            >
              Present
            </button>
            {!isCover ? (
              <button
                type="button"
                onClick={controller.showCover}
                className="keynote-secondary-button"
                aria-label="Exit presentation and return to keynote cover"
                disabled={isPoweringDown}
              >
                Exit
              </button>
            ) : null}
          </div>
        </header>
      ) : null}

      <main className={cn('keynote-canvas', presentationMode ? 'keynote-presentation-canvas' : 'os-border')}>
        {isCover || !currentStep || !progress ? (
          <KeynoteCover
            canResume={controller.canResume}
            onBegin={handleBegin}
            onPresent={enterPresentationMode}
            onResume={handleResume}
          />
        ) : (
          <KeynoteStage
            step={currentStep}
            progress={progress}
            navigationDirection={navigationDirection}
            presentationMode={presentationMode}
          />
        )}
        {launchPhase ? (
          <KeynoteLaunchSequence
            phase={launchPhase}
            onSkip={finishLaunchSequence}
          />
        ) : null}
        {chapterDivider ? (
          <KeynoteChapterDividerPanel
            divider={chapterDivider}
            onSkip={skipActiveSequence}
          />
        ) : null}
      </main>

      {isPoweringDown ? (
        <KeynotePowerDownPanel activeStep={powerDownStep} />
      ) : null}

      <footer
        className={cn(
          'keynote-controls',
          presentationMode ? 'keynote-presentation-chrome' : 'os-border',
          controlsQuiet ? 'keynote-chrome-quiet' : null,
        )}
      >
        {progress ? (
          <KeynoteProgressMeter
            progress={progress}
            presentationMode={presentationMode}
          />
        ) : (
          <p className="keynote-key-hint">Arrow keys and Space navigate after the presentation begins.</p>
        )}
        <div className="keynote-control-row">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isPoweringDown || !controller.canGoPrevious}
            aria-label="Previous keynote step"
            className="keynote-secondary-button"
          >
            Previous
          </button>
          {presentationMode ? (
            <button
              type="button"
              onClick={exitPresentationMode}
              disabled={isPoweringDown}
              aria-label="Exit Presentation Mode and return to the Jack OS window"
              className="keynote-secondary-button"
            >
              Exit Presentation
            </button>
          ) : (
            <p
              className="keynote-step-label"
              aria-hidden="true"
            >
              {progress ? progress.stepLabel : 'Cover'}
            </p>
          )}
          <button
            type="button"
            onClick={progress ? handleNext : handleBegin}
            disabled={progress ? nextButtonDisabled : isPoweringDown}
            aria-label={isPowerDownStep ? 'Power down keynote and return to Jack OS' : 'Next keynote step'}
            className="keynote-primary-button"
          >
            {progress ? nextButtonLabel : 'Begin'}
          </button>
        </div>
      </footer>
    </div>
  )
}

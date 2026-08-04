'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getKeynoteStepTransitionClassName } from '../animations/transitions'
import { getKeynoteAsset, getNextKeynoteAssetId } from '../assets/keynote-assets'
import { getKeynoteRenderer } from '../config/renderers'
import { KEYNOTE_STEPS } from '../config/steps'
import { getKeynoteTypography } from '../config/typography'
import {
  getKeynoteVisualTheme,
  getKeynoteVisualThemeStyle,
} from '../config/visual-themes'
import { usePresentationController } from '../hooks/use-presentation-controller'
import type { KeynoteProgress, KeynoteStep, KeynoteVisualTheme } from '../types/keynote'
import { cn } from '@/lib/utils'

type BlueOceanKeynoteProps = {
  active: boolean
  onPowerDown?: () => void
}

type KeynoteCoverProps = {
  canResume: boolean
  onBegin: () => void
  onResume: () => void
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

function KeynoteCover({ canResume, onBegin, onResume }: KeynoteCoverProps) {
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
        <div className="keynote-cover-meta">
          <span>Jack OS V3B</span>
          <span>August 2026</span>
        </div>
        <p className={typography.eyebrow}>A Jack OS Keynote</p>
        <h1
          id="blue-ocean-cover-title"
          className={typography.heading}
        >
          1984 Blue Ocean
        </h1>
        <p className={typography.subheading}>Bridging Strategy and Execution</p>
        <div className="keynote-presented-by">
          <p className={typography.body}>Presented by</p>
          <p className={typography.accent}>Jack Dennehey</p>
        </div>
        <div className="keynote-cover-actions">
          <button
            ref={beginRef}
            type="button"
            onClick={onBegin}
            className="keynote-primary-button"
          >
            Begin Presentation
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

function KeynoteProgressMeter({ progress }: { progress: KeynoteProgress }) {
  const progressPercent = Math.max(
    0,
    Math.min(100, (progress.stepNumber / progress.stepTotal) * 100),
  )

  return (
    <div
      className="keynote-progress-meter"
      aria-label={progress.spokenLabel}
    >
      <div className="keynote-progress-copy">
        <span>{progress.chapterLabel}</span>
        {!progress.isOpening ? <span>{progress.chapterName}</span> : null}
        <span>{progress.stageLabel}</span>
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

function KeynoteStage({ step, progress }: { step: KeynoteStep; progress: KeynoteProgress }) {
  const StageComponent = getKeynoteRenderer(step.renderer)
  const transitionClassName = getKeynoteStepTransitionClassName(step)

  return (
    <article
      key={step.id}
      className={cn('keynote-stage', transitionClassName)}
      aria-label={step.ariaLabel}
      data-keynote-build-mode={step.buildMode}
      data-keynote-chapter-start={step.chapterStart ? 'true' : 'false'}
    >
      <StageComponent
        step={step}
        progress={progress}
      />
    </article>
  )
}

function getShellTheme(currentStep: KeynoteStep | null): KeynoteVisualTheme {
  return currentStep?.visualTheme ?? 'opening'
}

const POWER_DOWN_MESSAGES = [
  'Saving presentation state...',
  'Closing 1984 Blue Ocean...',
  'Returning to Jack OS...',
]

export function BlueOceanKeynote({ active, onPowerDown }: BlueOceanKeynoteProps) {
  const [presentationMode, setPresentationMode] = useState(false)
  const [powerDownStep, setPowerDownStep] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const powerDownTimersRef = useRef<number[]>([])
  const isPoweringDown = powerDownStep !== null

  const clearPowerDownTimers = useCallback(() => {
    powerDownTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    powerDownTimersRef.current = []
  }, [])

  const handlePowerDown = useCallback(() => {
    if (isPoweringDown) return

    clearPowerDownTimers()
    setPresentationMode(false)
    setPowerDownStep(0)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      powerDownTimersRef.current = [
        window.setTimeout(() => {
          setPowerDownStep(POWER_DOWN_MESSAGES.length - 1)
          onPowerDown?.()
        }, 160),
      ]
      return
    }

    powerDownTimersRef.current = [
      window.setTimeout(() => setPowerDownStep(1), 650),
      window.setTimeout(() => setPowerDownStep(2), 1250),
      window.setTimeout(() => onPowerDown?.(), 1900),
    ]
  }, [clearPowerDownTimers, isPoweringDown, onPowerDown])

  const controller = usePresentationController({
    active,
    presentationMode,
    onExitPresentationMode: () => setPresentationMode(false),
    onFinalNext: handlePowerDown,
  })
  const { currentStep, isCover, progress } = controller
  const visualThemeId = getShellTheme(currentStep)
  const visualTheme = getKeynoteVisualTheme(visualThemeId)
  const themeStyle = useMemo(
    () => getKeynoteVisualThemeStyle(visualThemeId),
    [visualThemeId],
  )

  useKeynoteImagePreload(currentStep, isCover)

  useEffect(() => clearPowerDownTimers, [clearPowerDownTimers])

  useEffect(() => {
    if (!active || isCover) return
    rootRef.current
      ?.querySelector<HTMLElement>('[data-keynote-stage-heading="true"]')
      ?.focus({ preventScroll: true })
  }, [active, currentStep?.id, isCover])

  const isPowerDownStep = currentStep?.completionAction === 'power-down'
  const nextButtonLabel = isPowerDownStep
    ? 'Power Down Keynote'
    : progress?.isFinalStep
      ? 'Complete'
      : 'Next'
  const nextButtonDisabled = isPoweringDown || (!controller.canGoNext && !isPowerDownStep)

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={cn(
        'keynote-shell',
        visualTheme.texture,
        presentationMode ? 'keynote-shell-presentation' : null,
        isPoweringDown ? 'keynote-shell-powering-down' : null,
      )}
      style={themeStyle}
      aria-label="1984 Blue Ocean keynote"
      data-keynote-contrast={visualTheme.controlContrast}
    >
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
            onClick={() => setPresentationMode((value) => !value)}
            className="keynote-secondary-button"
            aria-pressed={presentationMode}
            disabled={isPoweringDown}
          >
            {presentationMode ? 'Windowed' : 'Present'}
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

      <main className="keynote-canvas os-border">
        {isCover || !currentStep || !progress ? (
          <KeynoteCover
            canResume={controller.canResume}
            onBegin={controller.begin}
            onResume={controller.resume}
          />
        ) : (
          <KeynoteStage
            step={currentStep}
            progress={progress}
          />
        )}
      </main>

      {isPoweringDown ? (
        <div
          className="keynote-power-down-panel os-border"
          role="status"
          aria-live="polite"
        >
          {POWER_DOWN_MESSAGES.slice(0, powerDownStep + 1).map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <footer className="keynote-controls os-border">
        {progress ? <KeynoteProgressMeter progress={progress} /> : (
          <p className="keynote-key-hint">Arrow keys and Space navigate after the presentation begins.</p>
        )}
        <div className="keynote-control-row">
          <button
            type="button"
            onClick={controller.goPrevious}
            disabled={isPoweringDown || !controller.canGoPrevious}
            aria-label="Previous keynote step"
            className="keynote-secondary-button"
          >
            Previous
          </button>
          <p
            className="keynote-step-label"
            aria-hidden="true"
          >
            {progress ? progress.stepLabel : 'Cover'}
          </p>
          <button
            type="button"
            onClick={isPowerDownStep ? handlePowerDown : controller.goNext}
            disabled={nextButtonDisabled}
            aria-label={isPowerDownStep ? 'Power down keynote and return to Jack OS' : 'Next keynote step'}
            className="keynote-primary-button"
          >
            {nextButtonLabel}
          </button>
        </div>
      </footer>
    </div>
  )
}

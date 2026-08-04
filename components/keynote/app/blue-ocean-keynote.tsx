'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

export function BlueOceanKeynote({ active }: BlueOceanKeynoteProps) {
  const [presentationMode, setPresentationMode] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const controller = usePresentationController({
    active,
    presentationMode,
    onExitPresentationMode: () => setPresentationMode(false),
  })
  const { currentStep, isCover, progress } = controller
  const visualThemeId = getShellTheme(currentStep)
  const visualTheme = getKeynoteVisualTheme(visualThemeId)
  const themeStyle = useMemo(
    () => getKeynoteVisualThemeStyle(visualThemeId),
    [visualThemeId],
  )

  useKeynoteImagePreload(currentStep, isCover)

  useEffect(() => {
    if (!active || isCover) return
    rootRef.current
      ?.querySelector<HTMLElement>('[data-keynote-stage-heading="true"]')
      ?.focus({ preventScroll: true })
  }, [active, currentStep?.id, isCover])

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={cn(
        'keynote-shell',
        visualTheme.texture,
        presentationMode ? 'keynote-shell-presentation' : null,
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
          >
            {presentationMode ? 'Windowed' : 'Present'}
          </button>
          {!isCover ? (
            <button
              type="button"
              onClick={controller.showCover}
              className="keynote-secondary-button"
              aria-label="Exit presentation and return to keynote cover"
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

      <footer className="keynote-controls os-border">
        {progress ? <KeynoteProgressMeter progress={progress} /> : (
          <p className="keynote-key-hint">Arrow keys and Space navigate after the presentation begins.</p>
        )}
        <div className="keynote-control-row">
          <button
            type="button"
            onClick={controller.goPrevious}
            disabled={!controller.canGoPrevious}
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
            onClick={controller.goNext}
            disabled={!controller.canGoNext}
            aria-label="Next keynote step"
            className="keynote-primary-button"
          >
            {progress?.isFinalStep ? 'Complete' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  )
}

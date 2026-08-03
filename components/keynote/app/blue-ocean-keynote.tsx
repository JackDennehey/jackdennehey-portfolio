'use client'

import { useEffect, useRef } from 'react'
import { getKeynoteTransitionClassName } from '../animations/transitions'
import { getKeynoteAsset } from '../assets/keynote-assets'
import { getKeynoteTypography } from '../config/typography'
import { usePresentationController } from '../hooks/use-presentation-controller'
import type { KeynoteAssetId, KeynoteProgress, KeynoteStep } from '../types/keynote'
import { cn } from '@/lib/utils'

type BlueOceanKeynoteProps = {
  active: boolean
}

function KeynoteAssetFrame({ assetId }: { assetId: KeynoteAssetId }) {
  const asset = getKeynoteAsset(assetId)

  return (
    <figure className="keynote-media-frame os-border bg-secondary">
      <img
        src={asset.path}
        alt={asset.alt}
        className="h-full w-full object-cover"
      />
    </figure>
  )
}

function KeynoteCover({ onBegin }: { onBegin: () => void }) {
  const beginRef = useRef<HTMLButtonElement | null>(null)
  const typography = getKeynoteTypography('cover')

  useEffect(() => {
    beginRef.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby="blue-ocean-cover-title"
      className={cn('keynote-cover keynote-transition-fade', typography.frame)}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        <p className={typography.eyebrow}>A Jack OS Keynote</p>
        <h1
          id="blue-ocean-cover-title"
          className={typography.heading}
        >
          1984 Blue Ocean
        </h1>
        <div className="space-y-1">
          <p className={typography.body}>Presented by</p>
          <p className={typography.accent}>Jack Dennehey</p>
        </div>
        <button
          ref={beginRef}
          type="button"
          onClick={onBegin}
          className="os-border bg-foreground px-4 py-2 font-pixel text-[9px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Begin Presentation
        </button>
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
      className="space-y-2"
      aria-label={`${progress.chapterLabel}. ${progress.stageLabel}. Step ${progress.stepLabel}.`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 font-pixel text-[8px] leading-relaxed text-muted-foreground">
        <span>{progress.chapterLabel}</span>
        <span>{progress.stageLabel}</span>
        <span>{progress.stepLabel}</span>
      </div>
      <div
        aria-hidden
        className="h-2 border-2 border-border bg-secondary"
      >
        <div
          className="h-full bg-foreground"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

function KeynoteStage({ step, progress }: { step: KeynoteStep; progress: KeynoteProgress }) {
  const StageComponent = step.Component
  const transitionClassName = getKeynoteTransitionClassName(step.transition)
  const stepView = {
    id: step.id,
    chapter: step.chapter,
    chapterTitle: step.chapterTitle,
    chapterOrder: step.chapterOrder,
    stage: step.stage,
    title: step.title,
    image: step.image,
    transition: step.transition,
    typographyTheme: step.typographyTheme,
  }

  return (
    <div
      key={step.id}
      className={cn('keynote-stage', transitionClassName)}
    >
      {step.image ? <KeynoteAssetFrame assetId={step.image} /> : null}
      <StageComponent
        step={stepView}
        chapterStageCount={progress.stageTotal}
        totalSteps={progress.stepTotal}
        stepNumber={progress.stepNumber}
      />
    </div>
  )
}

export function BlueOceanKeynote({ active }: BlueOceanKeynoteProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const controller = usePresentationController({ active })
  const { currentStep, isCover, progress } = controller

  useEffect(() => {
    if (!active || isCover) return
    rootRef.current?.focus()
  }, [active, currentStep?.id, isCover])

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="keynote-shell flex h-full min-h-[480px] flex-col gap-4 outline-none"
      aria-label="1984 Blue Ocean keynote"
    >
      <main className="keynote-canvas os-border flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
        {isCover || !currentStep || !progress ? (
          <KeynoteCover onBegin={controller.begin} />
        ) : (
          <KeynoteStage
            step={currentStep}
            progress={progress}
          />
        )}
      </main>

      <footer className="keynote-controls os-border bg-card p-3">
        {progress ? <KeynoteProgressMeter progress={progress} /> : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={controller.showCover}
            aria-label="Show keynote cover"
            className="os-border bg-card px-3 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cover
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={controller.goPrevious}
              disabled={!controller.canGoPrevious}
              aria-label="Previous keynote step"
              className="os-border bg-card px-3 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50 disabled:hover:bg-card disabled:hover:text-foreground"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={controller.goNext}
              disabled={!controller.canGoNext}
              aria-label="Next keynote step"
              className="os-border bg-foreground px-3 py-1.5 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50 disabled:hover:bg-foreground disabled:hover:text-primary-foreground"
            >
              Next
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

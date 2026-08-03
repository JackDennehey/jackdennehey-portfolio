'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { KEYNOTE_CHAPTERS } from '../config/chapters'
import { KEYNOTE_STEPS } from '../config/steps'
import type { KeynoteProgress } from '../types/keynote'

type UsePresentationControllerOptions = {
  active: boolean
}

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  )
}

function isNativeActivationTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest('button, a, [role="button"]'),
  )
}

export function usePresentationController({ active }: UsePresentationControllerOptions) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const totalSteps = KEYNOTE_STEPS.length
  const currentStep = currentIndex === null ? null : KEYNOTE_STEPS[currentIndex]
  const isCover = currentIndex === null

  const begin = useCallback(() => {
    setCurrentIndex(0)
  }, [])

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => {
      if (index === null) return null
      if (index <= 0) return null
      return index - 1
    })
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((index) => {
      if (index === null) return 0
      if (index >= totalSteps - 1) return index
      return index + 1
    })
  }, [totalSteps])

  const goHome = useCallback(() => {
    setCurrentIndex(0)
  }, [])

  const goEnd = useCallback(() => {
    setCurrentIndex(Math.max(0, totalSteps - 1))
  }, [totalSteps])

  const showCover = useCallback(() => {
    setCurrentIndex(null)
  }, [])

  const progress = useMemo<KeynoteProgress | null>(() => {
    if (currentStep === null || currentIndex === null) return null

    const chapterIndex = KEYNOTE_CHAPTERS.findIndex(
      (chapter) => chapter.id === currentStep.chapter,
    )
    const chapter = KEYNOTE_CHAPTERS[chapterIndex]
    const chapterStageCount = chapter?.stageCount ?? 1

    return {
      chapterNumber: chapterIndex + 1,
      chapterTotal: KEYNOTE_CHAPTERS.length,
      stageNumber: currentStep.stage,
      stageTotal: chapterStageCount,
      stepNumber: currentIndex + 1,
      stepTotal: totalSteps,
      chapterLabel: `Chapter ${chapterIndex + 1} of ${KEYNOTE_CHAPTERS.length}`,
      stageLabel: `Stage ${currentStep.stage} of ${chapterStageCount}`,
      stepLabel: `${currentIndex + 1} / ${totalSteps}`,
    }
  }, [currentIndex, currentStep, totalSteps])

  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) return

      if (event.key === 'ArrowRight' || event.key === ' ') {
        if (event.key === ' ' && isNativeActivationTarget(event.target)) return
        event.preventDefault()
        event.stopPropagation()
        goNext()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        event.stopPropagation()
        goPrevious()
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        event.stopPropagation()
        goHome()
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        event.stopPropagation()
        goEnd()
        return
      }

      if (event.key === 'Escape' && !isCover) {
        event.preventDefault()
        event.stopPropagation()
        showCover()
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [active, goEnd, goHome, goNext, goPrevious, isCover, showCover])

  return {
    steps: KEYNOTE_STEPS,
    currentIndex,
    currentStep,
    isCover,
    progress,
    canGoPrevious: currentIndex !== null,
    canGoNext: currentIndex === null || currentIndex < totalSteps - 1,
    begin,
    goPrevious,
    goNext,
    goHome,
    goEnd,
    showCover,
  }
}

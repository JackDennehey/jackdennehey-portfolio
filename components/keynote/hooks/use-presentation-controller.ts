'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  KEYNOTE_NUMBERED_CHAPTER_TOTAL,
  getKeynoteChapter,
} from '../config/chapters'
import {
  KEYNOTE_STEPS,
} from '../config/steps'
import {
  getStoredPresentationResumeIndex,
  writeStoredPresentationSession,
} from '../config/session'
import type { KeynoteNavigationDirection, KeynoteProgress } from '../types/keynote'

type UsePresentationControllerOptions = {
  active: boolean
  presentationMode?: boolean
  onExitPresentationMode?: () => void
  onFinalNext?: () => void
  onInteraction?: () => void
  onSkipOverlay?: () => boolean
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

export function usePresentationController({
  active,
  presentationMode = false,
  onExitPresentationMode,
  onFinalNext,
  onInteraction,
  onSkipOverlay,
}: UsePresentationControllerOptions) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [resumeIndex, setResumeIndex] = useState<number | null>(null)
  const [navigationDirection, setNavigationDirection] =
    useState<KeynoteNavigationDirection>('initial')
  const totalSteps = KEYNOTE_STEPS.length
  const currentStep = currentIndex === null ? null : KEYNOTE_STEPS[currentIndex]
  const isCover = currentIndex === null

  useEffect(() => {
    setResumeIndex(getStoredPresentationResumeIndex())
  }, [])

  const moveToIndex = useCallback((
    nextIndex: number,
    returnedToCover = false,
    direction: KeynoteNavigationDirection = 'jump',
  ) => {
    const boundedIndex = Math.max(0, Math.min(totalSteps - 1, nextIndex))
    setNavigationDirection(direction)
    setCurrentIndex(boundedIndex)
    setResumeIndex(boundedIndex)
    writeStoredPresentationSession(boundedIndex, returnedToCover)
  }, [totalSteps])

  const begin = useCallback(() => {
    moveToIndex(0, false, 'forward')
  }, [moveToIndex])

  const resume = useCallback(() => {
    if (resumeIndex === null) {
      begin()
      return
    }

    moveToIndex(resumeIndex, false, 'jump')
  }, [begin, moveToIndex, resumeIndex])

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => {
      if (index === null) return null
      setNavigationDirection('backward')
      if (index <= 0) {
        setResumeIndex(0)
        writeStoredPresentationSession(0, true)
        return null
      }

      const nextIndex = index - 1
      setResumeIndex(nextIndex)
      writeStoredPresentationSession(nextIndex, false)
      return nextIndex
    })
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((index) => {
      const nextIndex = index === null ? 0 : Math.min(totalSteps - 1, index + 1)
      setNavigationDirection('forward')
      setResumeIndex(nextIndex)
      writeStoredPresentationSession(nextIndex, false)
      return nextIndex
    })
  }, [totalSteps])

  const goHome = useCallback(() => {
    moveToIndex(0, false, 'jump')
  }, [moveToIndex])

  const goEnd = useCallback(() => {
    moveToIndex(Math.max(0, totalSteps - 1), false, 'jump')
  }, [moveToIndex, totalSteps])

  const showCover = useCallback(() => {
    setCurrentIndex((index) => {
      if (index !== null) {
        setNavigationDirection('backward')
        setResumeIndex(index)
        writeStoredPresentationSession(index, true)
      }

      return null
    })
  }, [])

  const progress = useMemo<KeynoteProgress | null>(() => {
    if (currentStep === null || currentIndex === null) return null

    const chapter = getKeynoteChapter(currentStep.chapterId)
    const chapterStageCount = chapter?.stageCount ?? 1
    const isOpening = currentStep.chapterId === 'opening'
    const isFinalStep = currentIndex === totalSteps - 1
    const chapterName = chapter?.title ?? currentStep.title
    const chapterLabel = isOpening
      ? 'Opening'
      : `Chapter ${currentStep.chapterNumber} of ${KEYNOTE_NUMBERED_CHAPTER_TOTAL}`
    const spokenChapter = isOpening
      ? chapterLabel
      : `${chapterLabel}. ${chapterName}`
    const stageLabel = `Stage ${currentStep.stageNumber} of ${chapterStageCount}`
    const stepLabel = isFinalStep
      ? `${currentIndex + 1} / ${totalSteps} complete`
      : `${currentIndex + 1} / ${totalSteps}`

    return {
      chapterName,
      chapterNumber: currentStep.chapterNumber,
      chapterTotal: KEYNOTE_NUMBERED_CHAPTER_TOTAL,
      stageNumber: currentStep.stageNumber,
      stageTotal: chapterStageCount,
      stepNumber: currentIndex + 1,
      stepTotal: totalSteps,
      isOpening,
      isFinalStep,
      chapterLabel,
      stageLabel,
      stepLabel,
      spokenLabel: `${spokenChapter}. ${stageLabel}. Step ${stepLabel}.`,
    }
  }, [currentIndex, currentStep, totalSteps])

  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTextEntryTarget(event.target)) return

      if (event.key === 'ArrowRight' || event.key === ' ') {
        if (event.key === ' ' && isNativeActivationTarget(event.target)) return
        event.preventDefault()
        event.stopPropagation()
        onInteraction?.()
        if (onSkipOverlay?.()) return
        const currentStepForKey = currentIndex === null ? null : KEYNOTE_STEPS[currentIndex]
        if (currentStepForKey?.completionAction === 'power-down') {
          onFinalNext?.()
          return
        }
        goNext()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        event.stopPropagation()
        onInteraction?.()
        if (onSkipOverlay?.()) return
        goPrevious()
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        event.stopPropagation()
        onInteraction?.()
        if (onSkipOverlay?.()) return
        goHome()
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        event.stopPropagation()
        onInteraction?.()
        if (onSkipOverlay?.()) return
        goEnd()
        return
      }

      if (event.key === 'Escape') {
        if (presentationMode) {
          event.preventDefault()
          event.stopPropagation()
          onInteraction?.()
          onExitPresentationMode?.()
          return
        }

        if (!isCover) {
          event.preventDefault()
          event.stopPropagation()
          onInteraction?.()
          showCover()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [
    active,
    currentIndex,
    goEnd,
    goHome,
    goNext,
    goPrevious,
    isCover,
    onInteraction,
    onExitPresentationMode,
    onFinalNext,
    onSkipOverlay,
    presentationMode,
    showCover,
  ])

  return {
    steps: KEYNOTE_STEPS,
    currentIndex,
    currentStep,
    navigationDirection,
    isCover,
    progress,
    canResume: resumeIndex !== null && isCover,
    canGoPrevious: currentIndex !== null,
    canGoNext: currentIndex === null || currentIndex < totalSteps - 1,
    begin,
    resume,
    goPrevious,
    goNext,
    goHome,
    goEnd,
    showCover,
  }
}

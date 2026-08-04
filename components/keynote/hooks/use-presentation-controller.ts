'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  KEYNOTE_NUMBERED_CHAPTER_TOTAL,
  getKeynoteChapter,
} from '../config/chapters'
import {
  KEYNOTE_STEPS,
  getKeynoteStepById,
  getKeynoteStepIndexById,
} from '../config/steps'
import type { KeynoteProgress } from '../types/keynote'

const KEYNOTE_SESSION_KEY = 'jack-os:blue-ocean-session.v1'

type StoredPresentationSession = {
  version: 1
  currentStepId: string
  hasBegun: boolean
  returnedToCover: boolean
}

type UsePresentationControllerOptions = {
  active: boolean
  presentationMode?: boolean
  onExitPresentationMode?: () => void
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

function readSession(): StoredPresentationSession | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(KEYNOTE_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredPresentationSession>
    if (parsed.version !== 1 || parsed.hasBegun !== true || !parsed.currentStepId) return null
    if (!getKeynoteStepById(parsed.currentStepId)) return null

    return {
      version: 1,
      currentStepId: parsed.currentStepId,
      hasBegun: true,
      returnedToCover: parsed.returnedToCover === true,
    }
  } catch {
    return null
  }
}

function writeSession(index: number, returnedToCover: boolean) {
  if (typeof window === 'undefined') return
  const step = KEYNOTE_STEPS[index]
  if (!step) return

  try {
    const session: StoredPresentationSession = {
      version: 1,
      currentStepId: step.id,
      hasBegun: true,
      returnedToCover,
    }
    window.sessionStorage.setItem(KEYNOTE_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Session resume is an enhancement; presentation controls still work without storage.
  }
}

export function usePresentationController({
  active,
  presentationMode = false,
  onExitPresentationMode,
}: UsePresentationControllerOptions) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [resumeIndex, setResumeIndex] = useState<number | null>(null)
  const totalSteps = KEYNOTE_STEPS.length
  const currentStep = currentIndex === null ? null : KEYNOTE_STEPS[currentIndex]
  const isCover = currentIndex === null

  useEffect(() => {
    const session = readSession()
    if (!session) return
    const index = getKeynoteStepIndexById(session.currentStepId)
    setResumeIndex(index >= 0 ? index : null)
  }, [])

  const moveToIndex = useCallback((nextIndex: number, returnedToCover = false) => {
    const boundedIndex = Math.max(0, Math.min(totalSteps - 1, nextIndex))
    setCurrentIndex(boundedIndex)
    setResumeIndex(boundedIndex)
    writeSession(boundedIndex, returnedToCover)
  }, [totalSteps])

  const begin = useCallback(() => {
    moveToIndex(0)
  }, [moveToIndex])

  const resume = useCallback(() => {
    if (resumeIndex === null) {
      begin()
      return
    }

    moveToIndex(resumeIndex)
  }, [begin, moveToIndex, resumeIndex])

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => {
      if (index === null) return null
      if (index <= 0) {
        setResumeIndex(0)
        writeSession(0, true)
        return null
      }

      const nextIndex = index - 1
      setResumeIndex(nextIndex)
      writeSession(nextIndex, false)
      return nextIndex
    })
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((index) => {
      const nextIndex = index === null ? 0 : Math.min(totalSteps - 1, index + 1)
      setResumeIndex(nextIndex)
      writeSession(nextIndex, false)
      return nextIndex
    })
  }, [totalSteps])

  const goHome = useCallback(() => {
    moveToIndex(0)
  }, [moveToIndex])

  const goEnd = useCallback(() => {
    moveToIndex(Math.max(0, totalSteps - 1))
  }, [moveToIndex, totalSteps])

  const showCover = useCallback(() => {
    setCurrentIndex((index) => {
      if (index !== null) {
        setResumeIndex(index)
        writeSession(index, true)
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

      if (event.key === 'Escape') {
        if (presentationMode) {
          event.preventDefault()
          event.stopPropagation()
          onExitPresentationMode?.()
          return
        }

        if (!isCover) {
          event.preventDefault()
          event.stopPropagation()
          showCover()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [
    active,
    goEnd,
    goHome,
    goNext,
    goPrevious,
    isCover,
    onExitPresentationMode,
    presentationMode,
    showCover,
  ])

  return {
    steps: KEYNOTE_STEPS,
    currentIndex,
    currentStep,
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

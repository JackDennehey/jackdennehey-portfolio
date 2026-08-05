import { getKeynoteChapter } from './chapters'
import type { KeynoteMotionPreset, KeynoteStep } from '../types/keynote'

export const KEYNOTE_MOTION_TOKENS = {
  microMs: 140,
  revealMs: 260,
  buildMs: 420,
  chapterMs: 2200,
  launchMs: 1550,
  powerDownMs: 1900,
  reducedMs: 280,
  easingStandard: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easingClose: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const KEYNOTE_MOTION_PRESETS: Record<KeynoteMotionPreset, { className: string }> = {
  'fade-up': { className: 'keynote-motion-fade-up' },
  'fade-in': { className: 'keynote-motion-fade-in' },
  crossfade: { className: 'keynote-motion-crossfade' },
  'split-reveal': { className: 'keynote-motion-split-reveal' },
  'diagram-build': { className: 'keynote-motion-diagram-build' },
  'layer-stack': { className: 'keynote-motion-layer-stack' },
  'timeline-advance': { className: 'keynote-motion-timeline-advance' },
  'status-reveal': { className: 'keynote-motion-status-reveal' },
  'chapter-reset': { className: 'keynote-motion-chapter-reset' },
  'power-down': { className: 'keynote-motion-power-down' },
}

export type KeynoteChapterDivider = {
  chapterNumber: 1 | 2 | 3 | 4 | 5
  romanNumeral: string
  title: string
  motif: 'split' | 'ledger' | 'ocean' | 'version' | 'minimal'
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'] as const

function toChapterNumber(value: number): KeynoteChapterDivider['chapterNumber'] | null {
  if (value >= 1 && value <= 5) {
    return value as KeynoteChapterDivider['chapterNumber']
  }

  return null
}

export function formatKeynoteRomanNumeral(chapterNumber: number) {
  return ROMAN_NUMERALS[chapterNumber - 1] ?? String(chapterNumber)
}

export function getKeynoteMotionPresetForStep(step: KeynoteStep): KeynoteMotionPreset {
  if (step.motionPreset) return step.motionPreset
  if (step.completionAction === 'power-down') return 'power-down'
  if (step.chapterStart && step.chapterNumber > 0) return 'chapter-reset'
  if (step.renderer === 'split') return 'split-reveal'
  if (step.renderer === 'timeline') return 'timeline-advance'
  if (step.renderer === 'terminal' || step.renderer === 'quote') return 'status-reveal'

  if (step.renderer === 'diagram') {
    const variant = step.content.renderer === 'diagram' ? step.content.variant : undefined
    if (variant === 'layered') return 'layer-stack'
    return 'diagram-build'
  }

  if (step.transition === 'image') return 'crossfade'
  if (step.transition === 'fade') return 'fade-in'
  return 'fade-up'
}

export function getKeynoteMotionClassName(step: KeynoteStep) {
  return KEYNOTE_MOTION_PRESETS[getKeynoteMotionPresetForStep(step)].className
}

export function getKeynoteChapterDivider(step: KeynoteStep): KeynoteChapterDivider | null {
  const chapterNumber = toChapterNumber(step.chapterNumber)
  if (!chapterNumber || !step.chapterStart) return null
  const chapter = getKeynoteChapter(step.chapterId)
  if (!chapter) return null

  const motif: KeynoteChapterDivider['motif'] =
    step.chapterId === 'technical-divide'
      ? 'split'
      : step.chapterId === 'financial-friction'
        ? 'ledger'
        : step.chapterId === 'blue-ocean'
          ? 'ocean'
          : step.chapterId === 'living-proof'
            ? 'version'
            : 'minimal'

  return {
    chapterNumber,
    romanNumeral: formatKeynoteRomanNumeral(chapterNumber),
    title: chapter.title,
    motif,
  }
}

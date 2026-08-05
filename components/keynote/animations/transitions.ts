import type { KeynoteStep, KeynoteTransition, KeynoteTransitionScope } from '../types/keynote'

const BUILD_TRANSITIONS: Record<KeynoteTransition, string> = {
  fade: 'keynote-build-fade',
  slide: 'keynote-build-slide',
  reveal: 'keynote-build-reveal',
  image: 'keynote-build-image',
}

const CHAPTER_TRANSITIONS: Record<KeynoteTransition, string> = {
  fade: 'keynote-chapter-fade',
  slide: 'keynote-chapter-slide',
  reveal: 'keynote-chapter-reveal',
  image: 'keynote-chapter-image',
}

export function getKeynoteTransitionClassName(
  transition: KeynoteTransition,
  scope: KeynoteTransitionScope,
) {
  return scope === 'chapter'
    ? CHAPTER_TRANSITIONS[transition]
    : BUILD_TRANSITIONS[transition]
}

export function getKeynoteStepTransitionClassName(step: KeynoteStep) {
  return getKeynoteTransitionClassName(step.transition, step.transitionScope)
}

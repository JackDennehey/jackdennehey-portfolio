import type { KeynoteTransition } from '../types/keynote'

export const KEYNOTE_TRANSITIONS: Record<KeynoteTransition, string> = {
  fade: 'keynote-transition-fade',
  slide: 'keynote-transition-slide',
  reveal: 'keynote-transition-reveal',
  image: 'keynote-transition-image',
}

export function getKeynoteTransitionClassName(transition: KeynoteTransition) {
  return KEYNOTE_TRANSITIONS[transition]
}

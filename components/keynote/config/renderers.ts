import {
  KeynoteDiagramStage,
  KeynoteImageTextStage,
  KeynoteMetricStage,
  KeynoteQuoteStage,
  KeynoteSplitStage,
  KeynoteTerminalStage,
  KeynoteTimelineStage,
  KeynoteTitleStage,
} from '../chapters/storytelling-stages'
import type { KeynoteRendererKey, KeynoteStageComponent } from '../types/keynote'

export const KEYNOTE_RENDERERS: Record<KeynoteRendererKey, KeynoteStageComponent> = {
  title: KeynoteTitleStage,
  split: KeynoteSplitStage,
  metric: KeynoteMetricStage,
  quote: KeynoteQuoteStage,
  diagram: KeynoteDiagramStage,
  timeline: KeynoteTimelineStage,
  'image-text': KeynoteImageTextStage,
  terminal: KeynoteTerminalStage,
}

export function getKeynoteRenderer(renderer: KeynoteRendererKey) {
  return KEYNOTE_RENDERERS[renderer]
}

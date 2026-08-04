import type { ComponentType } from 'react'

export type KeynoteChapterId =
  | 'opening'
  | 'technical-divide'
  | 'financial-friction'
  | 'blue-ocean'
  | 'living-proof'
  | 'simplicity'

export type KeynoteRendererKey =
  | 'title'
  | 'split'
  | 'metric'
  | 'quote'
  | 'diagram'
  | 'timeline'
  | 'image-text'
  | 'terminal'

export type KeynoteTransition = 'fade' | 'slide' | 'reveal' | 'image'
export type KeynoteTransitionScope = 'build' | 'chapter'
export type KeynoteBuildMode = 'replace' | 'accumulate'
export type KeynoteTypographyTheme =
  | 'opening'
  | 'technical'
  | 'financial'
  | 'ocean'
  | 'documentary'
  | 'minimal'
export type KeynoteVisualTheme =
  | 'opening'
  | 'technical-divide'
  | 'financial-friction'
  | 'blue-ocean'
  | 'living-proof'
  | 'simplicity'
export type KeynoteAssetFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif'
export type KeynoteAssetId =
  | 'sailboats'
  | 'school-of-fish'
  | 'sharks'
  | 'sunlight'
  | 'ocean-floor'

export type KeynoteChapter = {
  id: KeynoteChapterId
  title: string
  order: number
  chapterNumber: 0 | 1 | 2 | 3 | 4 | 5
  stageCount: number
  typographyTheme: KeynoteTypographyTheme
  visualTheme: KeynoteVisualTheme
}

export type KeynoteTitleContent = {
  renderer: 'title'
  eyebrow?: string
  title: string
  subtitle?: string
  body?: string
}

export type KeynoteSplitContent = {
  renderer: 'split'
  leftTitle: string
  leftBody: string
  rightTitle: string
  rightBody: string
  summary?: string
}

export type KeynoteMetricContent = {
  renderer: 'metric'
  value: string
  label: string
  body: string
}

export type KeynoteQuoteContent = {
  renderer: 'quote'
  quote: string
  attribution?: string
  body?: string
}

export type KeynoteDiagramItem = {
  label: string
  description: string
}

export type KeynoteDiagramContent = {
  renderer: 'diagram'
  title: string
  summary: string
  items: KeynoteDiagramItem[]
}

export type KeynoteTimelineMilestone = {
  label: string
  title: string
  description: string
}

export type KeynoteTimelineContent = {
  renderer: 'timeline'
  title: string
  milestones: KeynoteTimelineMilestone[]
}

export type KeynoteImageTextContent = {
  renderer: 'image-text'
  headline: string
  body: string
  layout: 'image-left' | 'image-right' | 'image-background'
}

export type KeynoteTerminalContent = {
  renderer: 'terminal'
  title: string
  lines: string[]
}

export type KeynoteStepContent =
  | KeynoteTitleContent
  | KeynoteSplitContent
  | KeynoteMetricContent
  | KeynoteQuoteContent
  | KeynoteDiagramContent
  | KeynoteTimelineContent
  | KeynoteImageTextContent
  | KeynoteTerminalContent

export type KeynoteStep = {
  id: string
  chapterId: KeynoteChapterId
  chapterNumber: 0 | 1 | 2 | 3 | 4 | 5
  stageNumber: number
  title: string
  renderer: KeynoteRendererKey
  typographyTheme: KeynoteTypographyTheme
  visualTheme: KeynoteVisualTheme
  transition: KeynoteTransition
  transitionScope: KeynoteTransitionScope
  buildMode: KeynoteBuildMode
  imageAssetId?: KeynoteAssetId
  ariaLabel: string
  presenterNote?: string
  chapterStart?: boolean
  chapterEnd?: boolean
  content: KeynoteStepContent
}

export type KeynoteStageComponentProps = {
  step: KeynoteStep
  progress: KeynoteProgress
}

export type KeynoteStageComponent = ComponentType<KeynoteStageComponentProps>

export type KeynoteProgress = {
  chapterName: string
  chapterNumber: 0 | 1 | 2 | 3 | 4 | 5
  chapterTotal: 5
  stageNumber: number
  stageTotal: number
  stepNumber: number
  stepTotal: number
  isOpening: boolean
  isFinalStep: boolean
  chapterLabel: string
  stageLabel: string
  stepLabel: string
  spokenLabel: string
}

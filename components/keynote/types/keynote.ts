import type { ComponentType } from 'react'

export type KeynoteChapterId =
  | 'introduction'
  | 'chapter-1'
  | 'chapter-2'
  | 'chapter-3'
  | 'chapter-4'
  | 'chapter-5'

export type KeynoteTransition = 'fade' | 'slide' | 'reveal' | 'image'
export type KeynoteTypographyTheme = 'cover' | 'chapter' | 'terminal' | 'ocean'
export type KeynoteAssetFormat = 'png' | 'jpg' | 'webp' | 'avif'
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
  stageCount: number
}

export type KeynoteStepViewModel = {
  id: string
  chapter: KeynoteChapterId
  chapterTitle: string
  chapterOrder: number
  stage: number
  title: string
  image?: KeynoteAssetId
  transition: KeynoteTransition
  typographyTheme: KeynoteTypographyTheme
}

export type KeynoteStageComponentProps = {
  step: KeynoteStepViewModel
  chapterStageCount: number
  totalSteps: number
  stepNumber: number
}

export type KeynoteStageComponent = ComponentType<KeynoteStageComponentProps>

export type KeynoteStep = KeynoteStepViewModel & {
  Component: KeynoteStageComponent
}

export type KeynoteProgress = {
  chapterNumber: number
  chapterTotal: number
  stageNumber: number
  stageTotal: number
  stepNumber: number
  stepTotal: number
  chapterLabel: string
  stageLabel: string
  stepLabel: string
}

import type { KeynoteChapter } from '../types/keynote'

export const KEYNOTE_NUMBERED_CHAPTER_TOTAL = 5

export const KEYNOTE_CHAPTERS: KeynoteChapter[] = [
  {
    id: 'opening',
    title: 'Opening',
    order: 0,
    chapterNumber: 0,
    stageCount: 2,
    typographyTheme: 'opening',
    visualTheme: 'opening',
  },
  {
    id: 'technical-divide',
    title: 'The Technical Divide',
    order: 1,
    chapterNumber: 1,
    stageCount: 2,
    typographyTheme: 'technical',
    visualTheme: 'technical-divide',
  },
  {
    id: 'financial-friction',
    title: 'The Financial Cost of Friction',
    order: 2,
    chapterNumber: 2,
    stageCount: 2,
    typographyTheme: 'financial',
    visualTheme: 'financial-friction',
  },
  {
    id: 'blue-ocean',
    title: 'The Blue Ocean Mindset',
    order: 3,
    chapterNumber: 3,
    stageCount: 2,
    typographyTheme: 'ocean',
    visualTheme: 'blue-ocean',
  },
  {
    id: 'living-proof',
    title: 'The Living Proof',
    order: 4,
    chapterNumber: 4,
    stageCount: 2,
    typographyTheme: 'documentary',
    visualTheme: 'living-proof',
  },
  {
    id: 'simplicity',
    title: 'Simplicity is Sophistication',
    order: 5,
    chapterNumber: 5,
    stageCount: 2,
    typographyTheme: 'minimal',
    visualTheme: 'simplicity',
  },
]

export function getKeynoteChapter(id: KeynoteChapter['id']) {
  return KEYNOTE_CHAPTERS.find((chapter) => chapter.id === id)
}

import { PlaceholderChapter } from '../chapters/placeholder-chapter'
import { KEYNOTE_CHAPTERS } from './chapters'
import type { KeynoteStep, KeynoteTransition } from '../types/keynote'

const TRANSITION_SEQUENCE: KeynoteTransition[] = ['fade', 'slide', 'reveal']

export const KEYNOTE_STEPS: KeynoteStep[] = KEYNOTE_CHAPTERS.flatMap((chapter) =>
  Array.from({ length: chapter.stageCount }, (_, stageIndex) => {
    const stage = stageIndex + 1

    return {
      id: `${chapter.id}-stage-${stage}`,
      chapter: chapter.id,
      chapterTitle: chapter.title,
      chapterOrder: chapter.order,
      stage,
      title: chapter.title,
      transition: TRANSITION_SEQUENCE[(chapter.order + stageIndex) % TRANSITION_SEQUENCE.length],
      typographyTheme: chapter.id === 'introduction' ? 'ocean' : 'chapter',
      Component: PlaceholderChapter,
    }
  }),
)

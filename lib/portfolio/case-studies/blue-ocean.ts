import { BLUE_OCEAN_COPY } from '../../blue-ocean'
import type { CaseStudy } from './types'

export const BLUE_OCEAN_CASE_STUDY: CaseStudy = {
  projectId: 'blue-ocean',
  tone: 'editorial',
  kicker: BLUE_OCEAN_COPY.type,
  summary: BLUE_OCEAN_COPY.longDescription,
  sections: [
    {
      id: 'what',
      kind: 'prose',
      title: 'What it is',
      body: `${BLUE_OCEAN_COPY.longDescription} It is a presentation experience inside JackOS, not a standalone software product.`,
    },
    {
      id: 'why',
      kind: 'prose',
      title: 'Why it was built',
      body: BLUE_OCEAN_COPY.recruiterSummary,
    },
    {
      id: 'role',
      kind: 'prose',
      title: 'What Jack did',
      body: BLUE_OCEAN_COPY.authorship,
    },
    {
      id: 'chapters',
      kind: 'chapters',
      title: 'How the argument is structured',
      chapters: [...BLUE_OCEAN_COPY.chapters],
    },
    {
      id: 'how',
      kind: 'list',
      title: 'How it lives in JackOS',
      items: [
        '31-stage interactive keynote with a centralized ordered step registry',
        'Keyboard-driven presentation controller and full-screen presentation mode',
        'Chapter divider pacing across five named chapters',
        'Session resume for an in-progress keynote',
        'Reduced-motion support',
        'Launchable from desktop, Welcome, Recruiter Mode, Projects, search, and Ask BOCH.',
      ],
    },
    {
      id: 'result',
      kind: 'prose',
      title: 'What exists today',
      body: 'A 31-stage interactive keynote shipped as Jack OS V3B. The case study is the map; the keynote is the work. Launch it from here rather than reading a longer paraphrase.',
    },
  ],
}

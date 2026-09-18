import { POCKET_PIER_COPY } from '../../pocket-pier'
import type { CaseStudy } from './types'

export const POCKET_PIER_CASE_STUDY: CaseStudy = {
  projectId: 'pocket-pier',
  tone: 'game',
  kicker: 'JDen Studios',
  summary: POCKET_PIER_COPY.whatItIs,
  sections: [
    {
      id: 'what',
      kind: 'prose',
      title: 'What it is',
      body: `${POCKET_PIER_COPY.whatItIs} It is a cozy pixel-art harbor management game for iOS, created under JDen Studios.`,
    },
    {
      id: 'why',
      kind: 'prose',
      title: 'Why it was built',
      body: POCKET_PIER_COPY.whyItMatters,
    },
    {
      id: 'role',
      kind: 'prose',
      title: 'What Jack did',
      body: `${POCKET_PIER_COPY.role}. The project covers the core gameplay loop, progression systems, economy management, fish collection, worker automation, boat and harbor expansion concepts, mobile UI, and pixel-art asset integration.`,
    },
    {
      id: 'loop',
      kind: 'module',
      title: 'How the game plays',
      body: 'The documented loop is catch, sell, upgrade, automate, and expand. The Almanac collection screen is part of the shipped UI, shown in the product screenshots.',
      module: 'pocket-pier-loop',
    },
    {
      id: 'how',
      kind: 'prose',
      title: 'How it was built',
      body: POCKET_PIER_COPY.howItWasBuilt,
    },
    {
      id: 'systems',
      kind: 'list',
      title: 'What was implemented',
      items: [...POCKET_PIER_COPY.developmentHighlights],
    },
    {
      id: 'process',
      kind: 'process',
      title: 'Product lifecycle',
      steps: [...POCKET_PIER_COPY.lifecycle],
    },
    {
      id: 'media',
      kind: 'media',
      title: 'Shipped screens',
      body: 'Product captures from the Pocket Pier asset set. No mockups were added for this case study.',
      media: POCKET_PIER_COPY.assets.screenshots.map((screenshot) => ({
        src: screenshot.src,
        alt: screenshot.alt,
        caption: screenshot.title,
      })),
    },
    {
      id: 'result',
      kind: 'prose',
      title: 'What exists today',
      body: `${POCKET_PIER_COPY.status}. Pocket Pier expands JackOS beyond web experiences into original interactive product development for mobile. Player counts, revenue, and review scores are not published in this repository, so they are not shown here.`,
    },
  ],
}

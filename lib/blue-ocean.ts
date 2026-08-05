export const BLUE_OCEAN_COMPLETION_STORAGE_KEY =
  'jack-os:1984-blue-ocean:v1:completed'

export type BlueOceanLaunchContext =
  | 'desktop'
  | 'welcome'
  | 'recruiter'
  | 'simple'
  | 'projects'
  | 'search'
  | 'ask-jd'

export const BLUE_OCEAN_COPY = {
  title: '1984 Blue Ocean',
  type: 'Flagship interactive keynote',
  versionLabel: 'Jack OS V3B',
  shortDescription:
    'A guided interactive keynote connecting business strategy, technical execution, and the transparent AI-assisted development of Jack OS.',
  longDescription:
    '1984 Blue Ocean is a 31-stage interactive keynote exploring the communication gap between business and technical teams, the financial consequences of organizational friction, multidisciplinary differentiation, and the product-development workflow behind Jack OS.',
  metadata: '31 stages - guided interactive presentation',
  recruiterSummary:
    'A guided case study in business strategy, technical communication, AI-assisted product development, and the evolution of Jack OS.',
  authorship:
    "Jack conceived and directed the product vision, narrative, visual identity, requirements, priorities, testing, critique, and iteration. Codex and AI-assisted development tools handled much of the direct implementation code under Jack's direction.",
  themes: [
    'business strategy',
    'technical execution',
    'communication across disciplines',
    'organizational friction',
    'AI-assisted product development',
    'Jack OS product evolution',
  ],
  chapters: [
    {
      title: 'The Divide',
      summary:
        'Why business and technical teams often talk past each other even when they share the same goal.',
    },
    {
      title: 'The Cost',
      summary:
        'How unclear translation between strategy and implementation creates delay, waste, and avoidable risk.',
    },
    {
      title: 'The Blue Ocean',
      summary:
        'How multidisciplinary skill creates differentiation instead of competing in one crowded lane.',
    },
    {
      title: 'Jack OS as Proof',
      summary:
        'How Jack OS demonstrates product thinking, iteration, critique, testing, and implementation choices.',
    },
    {
      title: 'The Bridge',
      summary:
        'Why the strongest role is not only business or technical, but the ability to connect both.',
    },
  ],
} as const

export function readBlueOceanCompleted() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(BLUE_OCEAN_COMPLETION_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeBlueOceanCompleted() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(BLUE_OCEAN_COMPLETION_STORAGE_KEY, 'true')
  } catch {
    // Completion is a local enhancement; finishing the keynote must still work.
  }
}

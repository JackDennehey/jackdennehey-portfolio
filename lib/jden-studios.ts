export const JDEN_STUDIOS_URL = 'https://www.jdenstudios.com'
export const JDEN_STUDIOS_MARK_SRC = '/images/Jden/jden-studios-mark.jpg'
export const JDEN_TRANSITION_MS = 550

export const JDEN_STUDIOS_COPY = {
  title: 'JDEN STUDIOS',
  subtitle: 'Independent Digital Studio',
  intro:
    'JDEN Studios is an independent digital studio founded by Jack Dennehey, focused on shipping finished digital products and building professional websites for businesses.',
  relationship: [
    {
      label: 'JACK OS',
      detail: 'Personal identity, portfolio, experiments, and technical work.',
    },
    {
      label: 'JDEN STUDIOS',
      detail: 'The independent studio for commercial work and finished releases.',
    },
    {
      label: 'SHIPPED',
      detail: 'Products, websites, and digital experiences.',
    },
  ],
  clientWork: {
    title: 'Client Work',
    lead: 'Professional websites for businesses.',
    detail:
      'JDEN offers a $300 launch website package built from curated foundations, customized for the individual business and prepared for production launch.',
  },
  studioProducts: {
    title: 'Studio Products',
    lead: 'Original digital products released by JDEN Studios.',
    detail:
      "Pocket Pier is currently the studio's released product and is available on the App Store.",
  },
  facts: [
    ['Type', 'Independent digital studio'],
    ['Founder', 'Jack Dennehey'],
    ['Focus', 'Websites + digital products'],
    ['Website', 'jdenstudios.com'],
    ['Status', 'Active'],
    ['Released Product', 'Pocket Pier'],
  ] as const,
  enterLabel: 'Enter JDEN STUDIOS ↗',
  enterHint: 'Opens the independent JDEN Studios website and leaves Jack OS.',
  pocketPierLabel: 'View Pocket Pier',
} as const

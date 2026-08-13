export const POCKET_PIER_ASSET_BASE = '/images/Pocket%20Pier'

export const POCKET_PIER_COPY = {
  title: 'Pocket Pier',
  subtitle: 'Indie Mobile Game - JDen Studios',
  studio: 'JDen Studios',
  platform: 'iOS',
  engine: 'Godot 4',
  language: 'GDScript',
  role: 'Creator, designer, and developer',
  status: 'In development - App Store preparation',
  shortDescription:
    'A cozy pixel-art harbor management game developed with Godot for iOS. Pocket Pier represents the complete journey from product concept and gameplay design through iterative development, mobile packaging, and App Store preparation.',
  intro:
    'Pocket Pier is an independent mobile game created under JDen Studios. It expands Jack OS beyond web experiences into original interactive product development for mobile.',
  whatItIs:
    'Pocket Pier begins with a single wooden pier and grows into a layered harbor-management game about fishing, selling catches, upgrading the pier, and building a small coastal operation over time.',
  whatWasBuilt:
    'The project includes the core gameplay loop, progression systems, economy management, fish collection, worker automation, boat and harbor expansion concepts, mobile UI, and pixel-art asset integration.',
  howItWasBuilt:
    'Pocket Pier is built in Godot 4 with GDScript and prepared for iOS through the Xcode and App Store Connect workflow.',
  whyItMatters:
    'Pocket Pier demonstrates product execution: moving from an original concept through prototyping, gameplay iteration, polish, mobile packaging, and distribution preparation.',
  gameplayLoop: [
    'Catch fish from the pier',
    'Sell catches through the harbor economy',
    'Upgrade tools, capacity, and progression systems',
    'Automate repeat work through helpers and workers',
    'Expand from a tiny pier into a broader harbor',
    'Unlock markets, boats, exploration, and collection depth',
  ],
  developmentHighlights: [
    'Godot 4 project architecture',
    'GDScript gameplay systems',
    'Progression and economy balancing',
    'Worker automation loops',
    'Mobile-first interface design',
    'Pixel-art asset integration',
    'iOS packaging through Xcode',
    'App Store Connect distribution workflow',
  ],
  lifecycle: [
    'Concept',
    'Prototype',
    'Gameplay',
    'Polish',
    'iOS Build',
    'App Store Distribution Workflow',
  ],
  assets: {
    icon: {
      src: `${POCKET_PIER_ASSET_BASE}/PPICON.png`,
      alt: 'Pocket Pier pixel-art app icon showing a character fishing from a wooden pier.',
    },
    screenshots: [
      {
        id: 'early-gameplay',
        title: 'Early gameplay',
        src: `${POCKET_PIER_ASSET_BASE}/Gameplay1.png`,
        alt: 'Pocket Pier gameplay screen showing a tiny pier, ocean, fish counter, coins, and harbor controls.',
      },
      {
        id: 'fishing-system',
        title: 'Fishing system',
        src: `${POCKET_PIER_ASSET_BASE}/GamePlay2.png`,
        alt: 'Pocket Pier fishing interaction with landing and tension meters above the harbor.',
      },
      {
        id: 'collection-progression',
        title: 'Collection and progression',
        src: `${POCKET_PIER_ASSET_BASE}/Gameplay3.png`,
        alt: 'Pocket Pier Almanac screen showing discovered fish and collection progress.',
      },
    ],
  },
  links: [] as readonly {
    label: string
    href: string
    kind: 'app-store' | 'github' | 'website'
  }[],
} as const

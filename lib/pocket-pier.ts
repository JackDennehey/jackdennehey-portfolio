export const POCKET_PIER_ASSET_BASE = '/images/Pocket%20Pier'
export const POCKET_PIER_APP_STORE_URL =
  'https://apps.apple.com/us/app/pocket-pier/id6800466326'

export const POCKET_PIER_COPY = {
  title: 'Pocket Pier',
  subtitle: 'Indie Mobile Game - JDen Studios',
  studio: 'JDen Studios',
  platform: 'iOS',
  engine: 'Godot 4',
  language: 'GDScript',
  role: 'Creator, designer, and developer',
  status: 'Available on the App Store',
  shortDescription:
    'A cozy pixel-art harbor management game developed with Godot for iOS. Pocket Pier is now available on the App Store and represents the complete journey from product concept and gameplay design through iterative development, mobile packaging, and public release.',
  intro:
    'Pocket Pier is an independent mobile game created under JDen Studios. It is now live on the App Store and expands Jack OS beyond web experiences into original interactive product development for mobile.',
  whatItIs:
    'Pocket Pier begins with a single wooden pier and grows into a layered harbor-management game about fishing, selling catches, upgrading the pier, and building a small coastal operation over time.',
  whatWasBuilt:
    'The project includes the core gameplay loop, progression systems, economy management, fish collection, worker automation, boat and harbor expansion concepts, mobile UI, and pixel-art asset integration.',
  howItWasBuilt:
    'Pocket Pier is built in Godot 4 with GDScript and shipped for iOS through the Xcode and App Store Connect workflow.',
  whyItMatters:
    'Pocket Pier demonstrates product execution: moving from an original concept through prototyping, gameplay iteration, polish, mobile packaging, and a public App Store release.',
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
    'Public App Store release',
  ],
  lifecycle: [
    'Concept',
    'Prototype',
    'Gameplay',
    'Polish',
    'iOS Build',
    'App Store Release',
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
  links: [
    {
      label: 'View on App Store',
      href: POCKET_PIER_APP_STORE_URL,
      kind: 'app-store',
    },
  ] as const,
} as const

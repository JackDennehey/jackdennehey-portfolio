export const DEFAULT_WALLPAPER_ID = 'jack-os-default'

export type WallpaperCollection = 'current' | 'concept' | 'hidden'
export type WallpaperAssetType = 'css' | 'png' | 'svg'

export type WallpaperAsset = {
  id: string
  displayName: string
  description: string
  imagePath: string | null
  assetType: WallpaperAssetType
  collection: WallpaperCollection
  downloadable: boolean
  selectable: boolean
  className?: string
  backgroundPosition?: string
  phaseLabel?: string
  secretId?: string
  exclusiveLabel?: string
}

export const WALLPAPER_ASSETS = [
  {
    id: DEFAULT_WALLPAPER_ID,
    displayName: 'Jack OS Classic',
    description: 'The original desktop.',
    imagePath: null,
    assetType: 'css',
    collection: 'current',
    downloadable: false,
    selectable: true,
    className: 'wallpaper-jack-os-classic',
  },
  {
    id: 'sunset',
    displayName: 'Sunset',
    description: 'The final glow over the boardwalk.',
    imagePath: '/wallpapers/sunset.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'beacon',
    displayName: 'Beacon',
    description: 'A light through the storm.',
    imagePath: '/wallpapers/beacon.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-medium',
  },
  {
    id: 'kingdom',
    displayName: 'Kingdom',
    description: 'A world waiting beyond the horizon.',
    imagePath: '/wallpapers/kingdom.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'mountain',
    displayName: 'Mountain',
    description: 'The long way through the mountains.',
    imagePath: '/wallpapers/mountain.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'wasteland',
    displayName: 'Wasteland',
    description: 'It was rigged from the start.',
    imagePath: '/wallpapers/wasteland.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-medium',
  },
  {
    id: 'frutiger-aero',
    displayName: 'Frutiger Aero',
    description: 'Y2K',
    imagePath: '/wallpapers/frutiger-aero.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'bedlam',
    displayName: 'Bedlam',
    description: 'THE SWING OF HIS LIFE',
    imagePath: '/wallpapers/bedlam.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'tomorrow',
    displayName: 'Tomorrow',
    description: 'Beyond the edge of the known world.',
    imagePath: '/wallpapers/tomorrow.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-medium',
  },
  {
    id: 'stillwater',
    displayName: 'Stillwater',
    description: 'Boch. Brews. Trees.',
    imagePath: '/wallpapers/pond.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'winter',
    displayName: 'Winter',
    description: 'Warm light in a frozen valley.',
    imagePath: '/wallpapers/cabin.png',
    assetType: 'png',
    collection: 'current',
    downloadable: true,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
  },
  {
    id: 'signal-loss',
    displayName: 'Signal Loss',
    description: 'A damaged transmission from somewhere between memory and static.',
    imagePath: '/wallpapers/signal-loss.PNG',
    assetType: 'png',
    collection: 'hidden',
    downloadable: false,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
    secretId: 'signal-loss',
    exclusiveLabel: 'Jack OS Exclusive',
  },
  {
    id: 'orange-horizon',
    displayName: 'Orange Horizon',
    description: 'A warm engine, an empty street, and the last light of the day.',
    imagePath: '/wallpapers/orange-horizon.PNG',
    assetType: 'png',
    collection: 'hidden',
    downloadable: false,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
    secretId: 'orange-horizon',
    exclusiveLabel: 'Jack OS Exclusive',
  },
  {
    id: 'moonstep',
    displayName: 'Moonstep',
    description: 'Six movements preserved beneath the stage lights.',
    imagePath: '/wallpapers/moonstep.PNG',
    assetType: 'png',
    collection: 'hidden',
    downloadable: false,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-medium',
    secretId: 'moonstep',
    exclusiveLabel: 'Jack OS Exclusive',
  },
  {
    id: 'the-crossing',
    displayName: 'The Crossing',
    description: 'Four travelers crossing a quiet road with no destination listed.',
    imagePath: '/wallpapers/the-crossing.PNG',
    assetType: 'png',
    collection: 'hidden',
    downloadable: false,
    selectable: true,
    className: 'wallpaper-image wallpaper-contrast-soft',
    secretId: 'the-crossing',
    exclusiveLabel: 'Jack OS Exclusive',
  },
  {
    id: 'concept-retro-beach',
    displayName: 'Retro Beach',
    description: 'Original Phase 2 beach concept.',
    imagePath: '/wallpapers/retro-beach.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-storm-coast',
    displayName: 'Storm Coast',
    description: 'Original Phase 2 storm concept.',
    imagePath: '/wallpapers/storm-coast.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-night-ocean',
    displayName: 'Night Ocean',
    description: 'Original Phase 2 night ocean concept.',
    imagePath: '/wallpapers/night-ocean.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-mountain-terminal',
    displayName: 'Mountain Terminal',
    description: 'Original Phase 2 mountain concept.',
    imagePath: '/wallpapers/mountain-terminal.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-blueprint-grid',
    displayName: 'Blueprint Grid',
    description: 'Original Phase 2 blueprint concept.',
    imagePath: '/wallpapers/blueprint-grid.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-graphite',
    displayName: 'Graphite',
    description: 'Original Phase 2 graphite concept.',
    imagePath: '/wallpapers/graphite.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-paper-desktop',
    displayName: 'Paper Desktop',
    description: 'Original Phase 2 paper concept.',
    imagePath: '/wallpapers/paper-desktop.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-retro-geometry',
    displayName: 'Retro Geometry',
    description: 'Original Phase 2 geometry concept.',
    imagePath: '/wallpapers/retro-geometry.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
  {
    id: 'concept-jack-os-sunset',
    displayName: 'Jack OS Sunset',
    description: 'Original Phase 2 sunset concept.',
    imagePath: '/wallpapers/jack-os-sunset.svg',
    assetType: 'svg',
    collection: 'concept',
    downloadable: true,
    selectable: false,
    className: 'wallpaper-image',
    phaseLabel: 'Phase 2 Concept Art',
  },
] as const satisfies readonly WallpaperAsset[]

export const WALLPAPERS = WALLPAPER_ASSETS.filter((wallpaper) => wallpaper.collection === 'current')
export const CURRENT_WALLPAPERS = WALLPAPERS
export const CONCEPT_WALLPAPERS = WALLPAPER_ASSETS.filter(
  (wallpaper) => wallpaper.collection === 'concept',
)
export const HIDDEN_WALLPAPERS = WALLPAPER_ASSETS.filter(
  (wallpaper) => wallpaper.collection === 'hidden',
)
export const SELECTABLE_WALLPAPERS = WALLPAPER_ASSETS.filter((wallpaper) => wallpaper.selectable)
export const PUBLIC_SELECTABLE_WALLPAPERS = SELECTABLE_WALLPAPERS.filter(
  (wallpaper) => wallpaper.collection !== 'hidden',
)

export type Wallpaper = (typeof WALLPAPER_ASSETS)[number]
export type WallpaperId = Wallpaper['id']

export function isWallpaperId(value: unknown): value is WallpaperId {
  return typeof value === 'string' && WALLPAPER_ASSETS.some((wallpaper) => wallpaper.id === value)
}

export function isHiddenWallpaper(wallpaper: WallpaperAsset) {
  return wallpaper.collection === 'hidden'
}

export function isWallpaperUnlocked(
  wallpaper: WallpaperAsset,
  unlockedSecretIds: readonly string[] = [],
) {
  return (
    !isHiddenWallpaper(wallpaper) ||
    (typeof wallpaper.secretId === 'string' && unlockedSecretIds.includes(wallpaper.secretId))
  )
}

export function isSelectableWallpaperId(
  value: unknown,
  unlockedSecretIds: readonly string[] = [],
): value is WallpaperId {
  return (
    typeof value === 'string' &&
    SELECTABLE_WALLPAPERS.some(
      (wallpaper) => wallpaper.id === value && isWallpaperUnlocked(wallpaper, unlockedSecretIds),
    )
  )
}

export function getWallpaperAsset(id: string | null | undefined): Wallpaper {
  return WALLPAPER_ASSETS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPER_ASSETS[0]
}

export function getWallpaper(
  id: string | null | undefined,
  unlockedSecretIds: readonly string[] = [],
): Wallpaper {
  return (
    SELECTABLE_WALLPAPERS.find(
      (wallpaper) => wallpaper.id === id && isWallpaperUnlocked(wallpaper, unlockedSecretIds),
    ) ?? PUBLIC_SELECTABLE_WALLPAPERS[0]
  )
}

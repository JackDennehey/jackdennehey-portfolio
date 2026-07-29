export const DEFAULT_WALLPAPER_ID = 'jack-os-default'

export type WallpaperCollection = 'current' | 'concept'
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
    description: 'Echoes from a forgotten machine.',
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
    description: 'Tomorrow looked brighter once.',
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
    description: 'Summer crowds and open skies.',
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
    description: 'A quiet morning by the water.',
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
export const SELECTABLE_WALLPAPERS = WALLPAPER_ASSETS.filter((wallpaper) => wallpaper.selectable)

export type Wallpaper = (typeof WALLPAPER_ASSETS)[number]
export type WallpaperId = Wallpaper['id']

export function isWallpaperId(value: unknown): value is WallpaperId {
  return typeof value === 'string' && WALLPAPER_ASSETS.some((wallpaper) => wallpaper.id === value)
}

export function isSelectableWallpaperId(value: unknown): value is WallpaperId {
  return (
    typeof value === 'string' &&
    SELECTABLE_WALLPAPERS.some((wallpaper) => wallpaper.id === value)
  )
}

export function getWallpaperAsset(id: string | null | undefined): Wallpaper {
  return WALLPAPER_ASSETS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPER_ASSETS[0]
}

export function getWallpaper(id: string | null | undefined): Wallpaper {
  return SELECTABLE_WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? SELECTABLE_WALLPAPERS[0]
}

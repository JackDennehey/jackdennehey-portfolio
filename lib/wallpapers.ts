export const DEFAULT_WALLPAPER_ID = 'jack-os-default'

export const WALLPAPERS = [
  {
    id: DEFAULT_WALLPAPER_ID,
    name: 'Jack OS Default',
    className: 'wallpaper-jack-os-default',
  },
  {
    id: 'blueprint-grid',
    name: 'Blueprint Grid',
    className: 'wallpaper-blueprint-grid',
  },
  {
    id: 'paper-texture',
    name: 'Paper Texture',
    className: 'wallpaper-paper-texture',
  },
  {
    id: 'storm-clouds',
    name: 'Storm Clouds',
    className: 'wallpaper-storm-clouds',
  },
  {
    id: 'beach',
    name: 'Beach',
    className: 'wallpaper-beach',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    className: 'wallpaper-ocean',
  },
  {
    id: 'mountain-silhouette',
    name: 'Mountain',
    className: 'wallpaper-mountain-silhouette',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    className: 'wallpaper-graphite',
  },
  {
    id: 'soft-monochrome-gradient',
    name: 'Soft Gradient',
    className: 'wallpaper-soft-monochrome-gradient',
  },
  {
    id: 'retro-pixel-pattern',
    name: 'Pixel Pattern',
    className: 'wallpaper-retro-pixel-pattern',
  },
] as const

export type Wallpaper = (typeof WALLPAPERS)[number]
export type WallpaperId = Wallpaper['id']

export function isWallpaperId(value: unknown): value is WallpaperId {
  return typeof value === 'string' && WALLPAPERS.some((wallpaper) => wallpaper.id === value)
}

export function getWallpaper(id: string | null | undefined): Wallpaper {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPERS[0]
}

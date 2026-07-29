export const DEFAULT_WALLPAPER_ID = 'jack-os-default'

export const WALLPAPERS = [
  {
    id: DEFAULT_WALLPAPER_ID,
    name: 'Jack OS Classic',
    className: 'wallpaper-jack-os-classic',
  },
  {
    id: 'retro-beach',
    name: 'Retro Beach',
    className: 'wallpaper-retro-beach wallpaper-contrast-soft',
  },
  {
    id: 'storm-coast',
    name: 'Storm Coast',
    className: 'wallpaper-storm-coast wallpaper-contrast-medium',
  },
  {
    id: 'night-ocean',
    name: 'Night Ocean',
    className: 'wallpaper-night-ocean wallpaper-contrast-strong',
  },
  {
    id: 'mountain-terminal',
    name: 'Mountain Terminal',
    className: 'wallpaper-mountain-terminal wallpaper-contrast-soft',
  },
  {
    id: 'blueprint-grid',
    name: 'Blueprint Grid',
    className: 'wallpaper-blueprint-grid wallpaper-contrast-medium',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    className: 'wallpaper-graphite wallpaper-contrast-strong',
  },
  {
    id: 'paper-desktop',
    name: 'Paper Desktop',
    className: 'wallpaper-paper-desktop',
  },
  {
    id: 'retro-geometry',
    name: 'Retro Geometry',
    className: 'wallpaper-retro-geometry wallpaper-contrast-soft',
  },
  {
    id: 'jack-os-sunset',
    name: 'Jack OS Sunset',
    className: 'wallpaper-jack-os-sunset wallpaper-contrast-soft',
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

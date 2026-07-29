import {
  DEFAULT_WALLPAPER_ID,
  isSelectableWallpaperId,
  type WallpaperId,
} from './wallpapers'

export const DESKTOP_PREFERENCES_STORAGE_KEY = 'jack-os.desktop-preferences.v1'

export type DesktopPreferences = {
  wallpaperId: WallpaperId
  showClock: boolean
  showCalendar: boolean
}

export const DEFAULT_DESKTOP_PREFERENCES: DesktopPreferences = {
  wallpaperId: DEFAULT_WALLPAPER_ID,
  showClock: true,
  showCalendar: true,
}

export function parseDesktopPreferences(value: string | null): DesktopPreferences {
  if (!value) return DEFAULT_DESKTOP_PREFERENCES

  try {
    const parsed = JSON.parse(value) as Partial<DesktopPreferences>
    return {
      wallpaperId: isSelectableWallpaperId(parsed.wallpaperId)
        ? parsed.wallpaperId
        : DEFAULT_DESKTOP_PREFERENCES.wallpaperId,
      showClock:
        typeof parsed.showClock === 'boolean'
          ? parsed.showClock
          : DEFAULT_DESKTOP_PREFERENCES.showClock,
      showCalendar:
        typeof parsed.showCalendar === 'boolean'
          ? parsed.showCalendar
          : DEFAULT_DESKTOP_PREFERENCES.showCalendar,
    }
  } catch {
    return DEFAULT_DESKTOP_PREFERENCES
  }
}

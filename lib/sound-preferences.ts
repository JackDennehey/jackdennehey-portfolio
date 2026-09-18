import { JACK_OS_STORAGE_KEYS } from './os/storage'

export const SOUND_EFFECTS_STORAGE_KEY = JACK_OS_STORAGE_KEYS.soundEffectsEnabled
export const FIRST_WALLPAPER_SOUND_STORAGE_KEY =
  JACK_OS_STORAGE_KEYS.firstWallpaperSoundPlayed

export const DEFAULT_SOUND_EFFECTS_ENABLED = true

export function parseSoundEffectsPreference(value: string | null): boolean {
  if (value === null) {
    return DEFAULT_SOUND_EFFECTS_ENABLED
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'boolean'
      ? parsed
      : DEFAULT_SOUND_EFFECTS_ENABLED
  } catch {
    return DEFAULT_SOUND_EFFECTS_ENABLED
  }
}

export const SOUND_EFFECTS_STORAGE_KEY = 'jack-os:sound-effects-enabled'
export const FIRST_WALLPAPER_SOUND_STORAGE_KEY =
  'jack-os:first-wallpaper-sound-played'

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

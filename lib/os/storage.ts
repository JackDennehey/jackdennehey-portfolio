/**
 * Canonical JackOS persistence catalog.
 *
 * Keep existing key strings stable. New durable preferences should be added
 * here rather than inventing ad hoc localStorage names inside components.
 * Scanlines and window geometry are session UI state and are intentionally
 * not persisted.
 */
export const JACK_OS_STORAGE_KEYS = {
  desktopPreferences: 'jack-os.desktop-preferences.v1',
  interfaceTheme: 'jack-os:interface-theme',
  soundEffectsEnabled: 'jack-os:sound-effects-enabled',
  firstWallpaperSoundPlayed: 'jack-os:first-wallpaper-sound-played',
  unlockedSecrets: 'jack-os:unlocked-secrets.v1',
  achievements: 'jack-os:achievements.v1',
  interactiveAppsOpened: 'jack-os:interactive-apps-opened.v1',
  firewallPresetsCompleted: 'jack-os:firewall-presets-completed.v1',
  blueOceanCompleted: 'jack-os:1984-blue-ocean:v1:completed',
  blueOceanSession: 'jack-os:blue-ocean-session.v1',
  guestbookAdminToken: 'jack-os:guestbook-admin-token',
} as const

export type JackOsStorageKey =
  (typeof JACK_OS_STORAGE_KEYS)[keyof typeof JACK_OS_STORAGE_KEYS]

export type JackOsStorageArea = 'local' | 'session'

export const JACK_OS_STORAGE_CATALOG: readonly {
  name: keyof typeof JACK_OS_STORAGE_KEYS
  key: JackOsStorageKey
  area: JackOsStorageArea
  persistAcrossSessions: boolean
  notes: string
}[] = [
  {
    name: 'desktopPreferences',
    key: JACK_OS_STORAGE_KEYS.desktopPreferences,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Wallpaper, clock, calendar, hourly chime, first-visit flag.',
  },
  {
    name: 'interfaceTheme',
    key: JACK_OS_STORAGE_KEYS.interfaceTheme,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Light/dark interface theme. Hydrated by the layout bootstrap script.',
  },
  {
    name: 'soundEffectsEnabled',
    key: JACK_OS_STORAGE_KEYS.soundEffectsEnabled,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Global sound-effects mute.',
  },
  {
    name: 'firstWallpaperSoundPlayed',
    key: JACK_OS_STORAGE_KEYS.firstWallpaperSoundPlayed,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'One-shot first wallpaper personalization sound.',
  },
  {
    name: 'unlockedSecrets',
    key: JACK_OS_STORAGE_KEYS.unlockedSecrets,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Unlockable wallpaper secret IDs.',
  },
  {
    name: 'achievements',
    key: JACK_OS_STORAGE_KEYS.achievements,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Unlocked achievement IDs.',
  },
  {
    name: 'interactiveAppsOpened',
    key: JACK_OS_STORAGE_KEYS.interactiveAppsOpened,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Progress toward the interactive-explorer achievement.',
  },
  {
    name: 'firewallPresetsCompleted',
    key: JACK_OS_STORAGE_KEYS.firewallPresetsCompleted,
    area: 'local',
    persistAcrossSessions: true,
    notes: 'Network Firewall preset completion progress.',
  },
  {
    name: 'blueOceanCompleted',
    key: JACK_OS_STORAGE_KEYS.blueOceanCompleted,
    area: 'local',
    persistAcrossSessions: true,
    notes: '1984 Blue Ocean completion flag.',
  },
  {
    name: 'blueOceanSession',
    key: JACK_OS_STORAGE_KEYS.blueOceanSession,
    area: 'session',
    persistAcrossSessions: false,
    notes: 'In-progress keynote resume state. Session only.',
  },
  {
    name: 'guestbookAdminToken',
    key: JACK_OS_STORAGE_KEYS.guestbookAdminToken,
    area: 'session',
    persistAcrossSessions: false,
    notes: 'Guestbook admin auth token. Session only. Do not persist.',
  },
] as const

export function canUseLocalStorage() {
  return typeof window !== 'undefined' && 'localStorage' in window
}

export function canUseSessionStorage() {
  return typeof window !== 'undefined' && 'sessionStorage' in window
}

export function readLocalStorageItem(key: string): string | null {
  if (!canUseLocalStorage()) return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocalStorageItem(key: string, value: string): boolean {
  if (!canUseLocalStorage()) return false

  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function readSessionStorageItem(key: string): string | null {
  if (!canUseSessionStorage()) return null

  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSessionStorageItem(key: string, value: string): boolean {
  if (!canUseSessionStorage()) return false

  try {
    window.sessionStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

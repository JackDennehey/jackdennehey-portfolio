export const ACHIEVEMENTS_STORAGE_KEY = 'jack-os:achievements.v1'
export const INTERACTIVE_APPS_OPENED_STORAGE_KEY = 'jack-os:interactive-apps-opened.v1'

export type JackOsAchievementId = 'firewall-first-run' | 'interactive-update-explorer'
export type JackOsInteractiveAppId = 'timeline' | 'guestbook' | 'firewall'

export const ACHIEVEMENT_MESSAGES: Record<
  JackOsAchievementId,
  { title: string; message: string }
> = {
  'firewall-first-run': {
    title: 'Achievement Unlocked',
    message: 'First Rule Applied',
  },
  'interactive-update-explorer': {
    title: 'Achievement Unlocked',
    message: 'Interactive Explorer',
  },
}

export const JACK_OS_5B_APP_IDS: readonly JackOsInteractiveAppId[] = [
  'timeline',
  'guestbook',
  'firewall',
] as const

export function parseStoredIds<Id extends string>(
  rawValue: string | null,
  allowedIds: readonly Id[],
) {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is Id => allowedIds.includes(value))
  } catch {
    return []
  }
}

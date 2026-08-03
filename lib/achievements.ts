export const ACHIEVEMENTS_STORAGE_KEY = 'jack-os:achievements.v1'
export const INTERACTIVE_APPS_OPENED_STORAGE_KEY = 'jack-os:interactive-apps-opened.v1'
export const FIREWALL_PRESET_COMPLETIONS_STORAGE_KEY =
  'jack-os:firewall-presets-completed.v1'

export type JackOsAchievementId =
  | 'first-boot'
  | 'recruiter-mode-opened'
  | 'firewall-first-run'
  | 'interactive-update-explorer'
  | 'firewall-certified'
  | 'timeline-opened'
  | 'jd-first-question'
  | 'wallpaper-changed'
  | 'secret-discovered'
  | 'roadmap-opened'
  | 'simple-mode-opened'
export type JackOsInteractiveAppId = 'timeline' | 'guestbook' | 'firewall'

export type JackOsAchievementDefinition = {
  id: JackOsAchievementId
  title: string
  description: string
  lockedDescription?: string
  secret?: boolean
}

export const JACK_OS_ACHIEVEMENT_REGISTRY: readonly JackOsAchievementDefinition[] = [
  {
    id: 'first-boot',
    title: 'System Online',
    description: 'Started Jack OS for the first time on this device.',
  },
  {
    id: 'recruiter-mode-opened',
    title: 'Professional Access',
    description: 'Opened Recruiter Mode.',
  },
  {
    id: 'firewall-first-run',
    title: 'First Rule Applied',
    description: 'Completed a Network Firewall simulation preset.',
  },
  {
    id: 'interactive-update-explorer',
    title: 'Interactive Explorer',
    description: 'Opened Timeline, Guestbook, and Network Firewall.',
  },
  {
    id: 'firewall-certified',
    title: 'Firewall Certified',
    description: 'Completed every Network Firewall preset at least once.',
  },
  {
    id: 'timeline-opened',
    title: 'History Loaded',
    description: 'Opened the Jack OS Timeline.',
  },
  {
    id: 'jd-first-question',
    title: 'Asked J.D.',
    description: 'Submitted a valid question to the local portfolio assistant.',
  },
  {
    id: 'wallpaper-changed',
    title: 'Personalized',
    description: 'Set a non-default public wallpaper.',
  },
  {
    id: 'secret-discovered',
    title: 'Hidden File Found',
    description: 'Discovered a hidden part of Jack OS.',
    lockedDescription: 'Requirement hidden.',
    secret: true,
  },
  {
    id: 'roadmap-opened',
    title: 'Deployment Plan',
    description: 'Opened the Road Map application.',
  },
  {
    id: 'simple-mode-opened',
    title: 'Direct Access',
    description: 'Entered Simple Mode.',
  },
] as const

export const JACK_OS_ACHIEVEMENT_IDS = JACK_OS_ACHIEVEMENT_REGISTRY.map(
  (achievement) => achievement.id,
) as readonly JackOsAchievementId[]

export const ACHIEVEMENT_MESSAGES: Record<
  JackOsAchievementId,
  { title: string; message: string }
> = {
  'first-boot': {
    title: 'Achievement Unlocked',
    message: 'System Online',
  },
  'recruiter-mode-opened': {
    title: 'Achievement Unlocked',
    message: 'Professional Access',
  },
  'firewall-first-run': {
    title: 'Achievement Unlocked',
    message: 'First Rule Applied',
  },
  'interactive-update-explorer': {
    title: 'Achievement Unlocked',
    message: 'Interactive Explorer',
  },
  'firewall-certified': {
    title: 'Achievement Unlocked',
    message: '🏆 Firewall Certified',
  },
  'timeline-opened': {
    title: 'Achievement Unlocked',
    message: 'History Loaded',
  },
  'jd-first-question': {
    title: 'Achievement Unlocked',
    message: 'Asked J.D.',
  },
  'wallpaper-changed': {
    title: 'Achievement Unlocked',
    message: 'Personalized',
  },
  'secret-discovered': {
    title: 'Achievement Unlocked',
    message: 'Hidden File Found',
  },
  'roadmap-opened': {
    title: 'Achievement Unlocked',
    message: 'Deployment Plan',
  },
  'simple-mode-opened': {
    title: 'Achievement Unlocked',
    message: 'Direct Access',
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

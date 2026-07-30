import {
  HIDDEN_WALLPAPERS,
  type Wallpaper,
  type WallpaperId,
} from './wallpapers'

export const SECRET_UNLOCKS_STORAGE_KEY = 'jack-os:unlocked-secrets.v1'

export type SecretId =
  | 'signal-loss'
  | 'orange-horizon'
  | 'moonstep'
  | 'the-crossing'

type SecretDefinitionInput = {
  id: SecretId
  acceptedCodes: readonly string[]
  unlockAudioPath: string
  successMessage: string
  order: number
  volume: number
}

export type SecretDefinition = SecretDefinitionInput & {
  wallpaperId: WallpaperId
  wallpaperTitle: string
  description: string
  imagePath: string
  downloadable: false
}

const SECRET_IDS: readonly SecretId[] = [
  'signal-loss',
  'orange-horizon',
  'moonstep',
  'the-crossing',
]

const HIDDEN_WALLPAPERS_BY_ID = new Map(
  HIDDEN_WALLPAPERS.map((wallpaper) => [wallpaper.id, wallpaper] as const),
)

const SECRET_INPUTS: readonly SecretDefinitionInput[] = [
  {
    id: 'signal-loss',
    acceptedCodes: ['okcomputer'],
    unlockAudioPath: '/sounds/secret-signal-loss.mp3',
    successMessage: 'Signal detected. Check your Wallpapers.',
    order: 1,
    volume: 0.28,
  },
  {
    id: 'orange-horizon',
    acceptedCodes: ['prettysweet'],
    unlockAudioPath: '/sounds/secret-orange-horizon.mp3',
    successMessage: 'A new horizon has appeared. Check your Wallpapers.',
    order: 2,
    volume: 0.28,
  },
  {
    id: 'moonstep',
    acceptedCodes: ['moonwa1k'],
    unlockAudioPath: '/sounds/secret-moonstep.mp3',
    successMessage: 'The stage lights are on. Check your Wallpapers.',
    order: 3,
    volume: 0.28,
  },
  {
    id: 'the-crossing',
    acceptedCodes: ['51.532056,-0.177333'],
    unlockAudioPath: '/sounds/secret-the-crossing.mp3',
    successMessage: 'You found the crossing. Check your Wallpapers.',
    order: 4,
    volume: 0.28,
  },
]

function requireSecretWallpaper(id: SecretId): Wallpaper & { imagePath: string } {
  const wallpaper = HIDDEN_WALLPAPERS_BY_ID.get(id)
  if (!wallpaper || !wallpaper.imagePath) {
    throw new Error(`Missing hidden wallpaper metadata for ${id}`)
  }
  return wallpaper as Wallpaper & { imagePath: string }
}

export const SECRET_DEFINITIONS = SECRET_INPUTS.map((secret) => {
  const wallpaper = requireSecretWallpaper(secret.id)
  return {
    ...secret,
    wallpaperId: wallpaper.id,
    wallpaperTitle: wallpaper.displayName,
    description: wallpaper.description,
    imagePath: wallpaper.imagePath,
    downloadable: false,
  }
}) satisfies readonly SecretDefinition[]

export const SECRET_DEFINITIONS_BY_ID = new Map(
  SECRET_DEFINITIONS.map((secret) => [secret.id, secret] as const),
)

export function isSecretId(value: unknown): value is SecretId {
  return typeof value === 'string' && SECRET_IDS.includes(value as SecretId)
}

export function getSecretDefinition(id: SecretId) {
  return SECRET_DEFINITIONS_BY_ID.get(id) ?? null
}

function normalizeTextCode(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, '')
}

function normalizeCoordinateCode(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
}

export function normalizeSecretCode(input: string) {
  const coordinateCandidate = normalizeCoordinateCode(input)
  if (coordinateCandidate.includes(',')) {
    return coordinateCandidate
  }
  return normalizeTextCode(input)
}

export function findSecretByCode(input: string) {
  const normalized = normalizeSecretCode(input)
  return (
    SECRET_DEFINITIONS.find((secret) =>
      secret.acceptedCodes.some((code) => normalizeSecretCode(code) === normalized),
    ) ?? null
  )
}

export function parseUnlockedSecrets(value: string | null): SecretId[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    const ids: SecretId[] = []
    parsed.forEach((item) => {
      if (isSecretId(item) && !ids.includes(item)) {
        ids.push(item)
      }
    })
    return ids
  } catch {
    return []
  }
}

export function canUseBrowserStorage() {
  return typeof window !== 'undefined' && 'localStorage' in window
}

export function readStoredUnlockedSecrets() {
  if (!canUseBrowserStorage()) return []

  try {
    return parseUnlockedSecrets(window.localStorage.getItem(SECRET_UNLOCKS_STORAGE_KEY))
  } catch {
    return []
  }
}

export function writeStoredUnlockedSecrets(ids: readonly SecretId[]) {
  if (!canUseBrowserStorage()) return

  try {
    window.localStorage.setItem(SECRET_UNLOCKS_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // Unlocks are local-only and best-effort; the app should keep working.
  }
}

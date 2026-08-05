import {
  KEYNOTE_STEPS,
  getKeynoteStepById,
  getKeynoteStepIndexById,
} from './steps'

export const KEYNOTE_SESSION_KEY = 'jack-os:blue-ocean-session.v1'

export type StoredPresentationSession = {
  version: 1
  currentStepId: string
  hasBegun: boolean
  returnedToCover: boolean
}

export function readStoredPresentationSession(): StoredPresentationSession | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(KEYNOTE_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredPresentationSession>
    if (parsed.version !== 1 || parsed.hasBegun !== true || !parsed.currentStepId) {
      return null
    }
    if (!getKeynoteStepById(parsed.currentStepId)) return null

    return {
      version: 1,
      currentStepId: parsed.currentStepId,
      hasBegun: true,
      returnedToCover: parsed.returnedToCover === true,
    }
  } catch {
    return null
  }
}

export function writeStoredPresentationSession(index: number, returnedToCover: boolean) {
  if (typeof window === 'undefined') return
  const step = KEYNOTE_STEPS[index]
  if (!step) return

  try {
    const session: StoredPresentationSession = {
      version: 1,
      currentStepId: step.id,
      hasBegun: true,
      returnedToCover,
    }
    window.sessionStorage.setItem(KEYNOTE_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Session resume is an enhancement; presentation controls still work without storage.
  }
}

export function getStoredPresentationResumeIndex() {
  const session = readStoredPresentationSession()
  if (!session) return null
  const index = getKeynoteStepIndexById(session.currentStepId)
  return index >= 0 ? index : null
}

export function hasValidBlueOceanSession() {
  return getStoredPresentationResumeIndex() !== null
}

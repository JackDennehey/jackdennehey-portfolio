export const ONBOARDING_COMPLETE_STORAGE_KEY = 'jack-os:onboarding-complete.v1'
export const RETURNING_VISITOR_STORAGE_KEY = 'jack-os:returning-visitor.v1'

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && 'localStorage' in window
}

export function readOnboardingComplete() {
  if (!canUseBrowserStorage()) return false

  try {
    return window.localStorage.getItem(ONBOARDING_COMPLETE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeOnboardingComplete(complete: boolean) {
  if (!canUseBrowserStorage()) return

  try {
    window.localStorage.setItem(ONBOARDING_COMPLETE_STORAGE_KEY, String(complete))
  } catch {
    // Onboarding is a local convenience. Access failures should not block the desktop.
  }
}

export function clearOnboardingComplete() {
  if (!canUseBrowserStorage()) return

  try {
    window.localStorage.removeItem(ONBOARDING_COMPLETE_STORAGE_KEY)
  } catch {
    // Best effort only.
  }
}

export function readAndMarkReturningVisitor() {
  if (!canUseBrowserStorage()) return false

  try {
    const returning = window.localStorage.getItem(RETURNING_VISITOR_STORAGE_KEY) === 'true'
    window.localStorage.setItem(RETURNING_VISITOR_STORAGE_KEY, 'true')
    return returning
  } catch {
    return false
  }
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_DESKTOP_PREFERENCES,
  DESKTOP_PREFERENCES_STORAGE_KEY,
  parseDesktopPreferences,
  type DesktopPreferences,
} from '@/lib/desktop-preferences'
import { DEFAULT_WALLPAPER_ID } from '@/lib/wallpapers'

function readStoredPreferences() {
  try {
    return parseDesktopPreferences(window.localStorage.getItem(DESKTOP_PREFERENCES_STORAGE_KEY))
  } catch {
    return DEFAULT_DESKTOP_PREFERENCES
  }
}

function writeStoredPreferences(preferences: DesktopPreferences) {
  try {
    window.localStorage.setItem(DESKTOP_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // localStorage can be unavailable in private or locked-down browser contexts.
  }
}

export function useDesktopPreferences() {
  const [preferences, setPreferencesState] = useState<DesktopPreferences>(
    DEFAULT_DESKTOP_PREFERENCES,
  )

  useEffect(() => {
    setPreferencesState(readStoredPreferences())
  }, [])

  const updatePreferences = useCallback((patch: Partial<DesktopPreferences>) => {
    setPreferencesState((current) => {
      const next = { ...current, ...patch }
      writeStoredPreferences(next)
      return next
    })
  }, [])

  const resetWallpaper = useCallback(() => {
    updatePreferences({ wallpaperId: DEFAULT_WALLPAPER_ID })
  }, [updatePreferences])

  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_DESKTOP_PREFERENCES)
    writeStoredPreferences(DEFAULT_DESKTOP_PREFERENCES)
  }, [])

  return { preferences, updatePreferences, resetWallpaper, resetPreferences }
}

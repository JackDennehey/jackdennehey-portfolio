'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_DESKTOP_PREFERENCES,
  DESKTOP_PREFERENCES_STORAGE_KEY,
  parseDesktopPreferences,
  type DesktopPreferences,
} from '@/lib/desktop-preferences'
import { DEFAULT_WALLPAPER_ID, isSelectableWallpaperId } from '@/lib/wallpapers'

function readStoredPreferences(unlockedSecretIds: readonly string[]) {
  try {
    return parseDesktopPreferences(
      window.localStorage.getItem(DESKTOP_PREFERENCES_STORAGE_KEY),
      unlockedSecretIds,
    )
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

export function useDesktopPreferences(
  unlockedSecretIds: readonly string[] = [],
  unlocksLoaded = true,
) {
  const [preferences, setPreferencesState] = useState<DesktopPreferences>(
    DEFAULT_DESKTOP_PREFERENCES,
  )
  const preferencesRef = useRef(preferences)
  const loadedStoredPreferences = useRef(false)

  useEffect(() => {
    preferencesRef.current = preferences
  }, [preferences])

  useEffect(() => {
    if (!unlocksLoaded || loadedStoredPreferences.current) return

    const storedPreferences = readStoredPreferences(unlockedSecretIds)
    loadedStoredPreferences.current = true
    preferencesRef.current = storedPreferences
    setPreferencesState(storedPreferences)
  }, [unlockedSecretIds, unlocksLoaded])

  const updatePreferences = useCallback((patch: Partial<DesktopPreferences>) => {
    setPreferencesState((current) => {
      const wallpaperId =
        patch.wallpaperId === undefined
          ? current.wallpaperId
          : isSelectableWallpaperId(patch.wallpaperId, unlockedSecretIds)
            ? patch.wallpaperId
            : DEFAULT_WALLPAPER_ID
      const next = { ...current, ...patch, wallpaperId }
      preferencesRef.current = next
      writeStoredPreferences(next)
      return next
    })
  }, [unlockedSecretIds])

  const resetWallpaper = useCallback(() => {
    updatePreferences({ wallpaperId: DEFAULT_WALLPAPER_ID })
  }, [updatePreferences])

  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_DESKTOP_PREFERENCES)
    preferencesRef.current = DEFAULT_DESKTOP_PREFERENCES
    writeStoredPreferences(DEFAULT_DESKTOP_PREFERENCES)
  }, [])

  return { preferences, updatePreferences, resetWallpaper, resetPreferences }
}

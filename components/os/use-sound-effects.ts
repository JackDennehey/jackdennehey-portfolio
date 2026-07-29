'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SOUND_EFFECTS_ENABLED,
  FIRST_WALLPAPER_SOUND_STORAGE_KEY,
  SOUND_EFFECTS_STORAGE_KEY,
  parseSoundEffectsPreference,
} from '@/lib/sound-preferences'

export const SOUND_EFFECT_SOURCES = {
  appOpen: '/sounds/app-open.mp3',
  windowClose: '/sounds/window-close.mp3',
  firstWallpaperSet: '/sounds/wallpaper-first-set.mp3',
} as const

export type SoundEffectName = keyof typeof SOUND_EFFECT_SOURCES

const SOUND_VOLUME = 0.28

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && 'localStorage' in window
}

function readSoundEffectsEnabled() {
  if (!canUseBrowserStorage()) {
    return DEFAULT_SOUND_EFFECTS_ENABLED
  }

  try {
    return parseSoundEffectsPreference(
      window.localStorage.getItem(SOUND_EFFECTS_STORAGE_KEY),
    )
  } catch {
    return DEFAULT_SOUND_EFFECTS_ENABLED
  }
}

function writeSoundEffectsEnabled(enabled: boolean) {
  if (!canUseBrowserStorage()) {
    return
  }

  try {
    window.localStorage.setItem(SOUND_EFFECTS_STORAGE_KEY, String(enabled))
  } catch {
    // Preference persistence is best-effort; interaction must keep working.
  }
}

export function useSoundEffects() {
  const [soundEffectsEnabled, setSoundEffectsEnabledState] = useState(
    readSoundEffectsEnabled,
  )
  const audioElements = useRef<
    Partial<Record<SoundEffectName, HTMLAudioElement>>
  >({})
  const firstWallpaperFallbackPlayed = useRef(false)

  useEffect(() => {
    setSoundEffectsEnabledState(readSoundEffectsEnabled())
  }, [])

  const getAudio = useCallback((name: SoundEffectName) => {
    if (typeof Audio === 'undefined') {
      return null
    }

    const existing = audioElements.current[name]
    if (existing) {
      return existing
    }

    try {
      const audio = new Audio(SOUND_EFFECT_SOURCES[name])
      audio.preload = 'auto'
      audio.volume = SOUND_VOLUME
      audioElements.current[name] = audio
      return audio
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!soundEffectsEnabled) {
      return
    }

    (Object.keys(SOUND_EFFECT_SOURCES) as SoundEffectName[]).forEach((name) => {
      getAudio(name)?.load()
    })
  }, [getAudio, soundEffectsEnabled])

  const setSoundEffectsEnabled = useCallback((enabled: boolean) => {
    setSoundEffectsEnabledState(enabled)
    writeSoundEffectsEnabled(enabled)
  }, [])

  const playSound = useCallback(
    (name: SoundEffectName) => {
      if (!soundEffectsEnabled) {
        return
      }

      const audio = getAudio(name)
      if (!audio) {
        return
      }

      try {
        audio.pause()
        audio.currentTime = 0
        audio.volume = SOUND_VOLUME
        const playback = audio.play()
        if (playback) {
          void playback.catch(() => {
            // Browser autoplay policy or missing audio must not block UI work.
          })
        }
      } catch {
        // Audio is optional confirmation, never a dependency for the action.
      }
    },
    [getAudio, soundEffectsEnabled],
  )

  const playFirstWallpaperSet = useCallback(() => {
    let alreadyPlayed = false

    if (canUseBrowserStorage()) {
      try {
        alreadyPlayed =
          window.localStorage.getItem(FIRST_WALLPAPER_SOUND_STORAGE_KEY) ===
          'true'
        if (!alreadyPlayed) {
          window.localStorage.setItem(
            FIRST_WALLPAPER_SOUND_STORAGE_KEY,
            'true',
          )
        }
      } catch {
        alreadyPlayed = firstWallpaperFallbackPlayed.current
        firstWallpaperFallbackPlayed.current = true
      }
    } else {
      alreadyPlayed = firstWallpaperFallbackPlayed.current
      firstWallpaperFallbackPlayed.current = true
    }

    if (alreadyPlayed) {
      return
    }

    playSound('firstWallpaperSet')
  }, [playSound])

  return useMemo(
    () => ({
      soundEffectsEnabled,
      setSoundEffectsEnabled,
      appOpen: () => playSound('appOpen'),
      windowClose: () => playSound('windowClose'),
      firstWallpaperSet: playFirstWallpaperSet,
    }),
    [
      playFirstWallpaperSet,
      playSound,
      setSoundEffectsEnabled,
      soundEffectsEnabled,
    ],
  )
}

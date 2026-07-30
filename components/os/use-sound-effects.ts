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
  startup: '/sounds/boot-up.mp3',
  ambience: '/sounds/desktop-ambience.mp3',
} as const

export type SoundEffectName = 'appOpen' | 'windowClose' | 'firstWallpaperSet' | 'startup'
export type JackOsAudioName = keyof typeof SOUND_EFFECT_SOURCES

export const STARTUP_AUDIO_DURATION_MS = 5424

const SOUND_VOLUMES: Record<JackOsAudioName, number> = {
  appOpen: 0.28,
  windowClose: 0.28,
  firstWallpaperSet: 0.28,
  startup: 0.38,
  ambience: 0.08,
}
const AMBIENCE_FADE_MS = 900

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
    Partial<Record<JackOsAudioName, HTMLAudioElement>>
  >({})
  const firstWallpaperFallbackPlayed = useRef(false)
  const ambienceWanted = useRef(false)
  const ambienceFadeFrame = useRef<number | null>(null)
  const startupAttempted = useRef(false)
  const startupPlaying = useRef(false)

  useEffect(() => {
    setSoundEffectsEnabledState(readSoundEffectsEnabled())
  }, [])

  const getAudio = useCallback((name: JackOsAudioName) => {
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
      audio.volume = SOUND_VOLUMES[name]
      audio.loop = name === 'ambience'
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

    (Object.keys(SOUND_EFFECT_SOURCES) as JackOsAudioName[]).forEach((name) => {
      getAudio(name)?.load()
    })
  }, [getAudio, soundEffectsEnabled])

  const fadeAmbienceTo = useCallback((targetVolume: number, onDone?: () => void) => {
    if (ambienceFadeFrame.current) {
      cancelAnimationFrame(ambienceFadeFrame.current)
      ambienceFadeFrame.current = null
    }

    const ambience = audioElements.current.ambience
    if (!ambience) {
      onDone?.()
      return
    }

    const startVolume = ambience.volume
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / AMBIENCE_FADE_MS)
      ambience.volume = startVolume + (targetVolume - startVolume) * progress

      if (progress < 1) {
        ambienceFadeFrame.current = requestAnimationFrame(tick)
        return
      }

      ambienceFadeFrame.current = null
      onDone?.()
    }

    ambienceFadeFrame.current = requestAnimationFrame(tick)
  }, [])

  const playAmbience = useCallback(
    (allowPlayback: boolean) => {
      if (!allowPlayback || (typeof document !== 'undefined' && document.hidden)) {
        return
      }

      const ambience = getAudio('ambience')
      if (!ambience) {
        return
      }

      ambience.loop = true
      ambience.volume = ambience.paused ? 0 : ambience.volume

      try {
        const playback = ambience.play()
        if (playback) {
          void playback
            .then(() => fadeAmbienceTo(SOUND_VOLUMES.ambience))
            .catch(() => {
              // Ambient audio is optional and must not block the interface.
            })
        } else {
          fadeAmbienceTo(SOUND_VOLUMES.ambience)
        }
      } catch {
        // Audio is optional confirmation, never a dependency for the action.
      }
    },
    [fadeAmbienceTo, getAudio],
  )

  const stopAmbience = useCallback((fade = true, keepWanted = false) => {
    ambienceWanted.current = keepWanted
    const ambience = audioElements.current.ambience
    if (!ambience) return

    const pause = () => {
      ambience.pause()
      ambience.volume = SOUND_VOLUMES.ambience
    }

    if (fade) {
      fadeAmbienceTo(0, pause)
      return
    }

    if (ambienceFadeFrame.current) {
      cancelAnimationFrame(ambienceFadeFrame.current)
      ambienceFadeFrame.current = null
    }
    pause()
  }, [fadeAmbienceTo])

  const pauseAmbience = useCallback(() => {
    const ambience = audioElements.current.ambience
    if (!ambience || ambience.paused) return
    ambience.pause()
  }, [])

  const startAmbience = useCallback(() => {
    ambienceWanted.current = true
    playAmbience(soundEffectsEnabled)
  }, [playAmbience, soundEffectsEnabled])

  const resumeAmbience = useCallback(() => {
    if (!ambienceWanted.current) return
    playAmbience(soundEffectsEnabled)
  }, [playAmbience, soundEffectsEnabled])

  const setSoundEffectsEnabled = useCallback(
    (enabled: boolean) => {
      setSoundEffectsEnabledState(enabled)
      writeSoundEffectsEnabled(enabled)

      if (!enabled) {
        stopAmbience(true, true)
        return
      }

      if (ambienceWanted.current) {
        playAmbience(true)
      }
    },
    [playAmbience, stopAmbience],
  )

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
        audio.volume = SOUND_VOLUMES[name]
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

  const playStartup = useCallback(() => {
    if (startupAttempted.current) {
      return
    }

    startupAttempted.current = true
    if (!soundEffectsEnabled || startupPlaying.current) {
      return
    }

    const startup = getAudio('startup')
    if (!startup) {
      return
    }

    startupPlaying.current = true
    startup.loop = false
    startup.volume = SOUND_VOLUMES.startup

    try {
      startup.pause()
      startup.currentTime = 0
      const cleanup = () => {
        startupPlaying.current = false
        startup.removeEventListener('ended', cleanup)
      }
      startup.addEventListener('ended', cleanup)

      const playback = startup.play()
      if (playback) {
        void playback.catch(() => {
          cleanup()
        })
      }
    } catch {
      startupPlaying.current = false
    }
  }, [getAudio, soundEffectsEnabled])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        pauseAmbience()
        return
      }

      if (ambienceWanted.current && soundEffectsEnabled) {
        playAmbience(true)
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [pauseAmbience, playAmbience, soundEffectsEnabled])

  useEffect(() => {
    return () => {
      if (ambienceFadeFrame.current) {
        cancelAnimationFrame(ambienceFadeFrame.current)
      }
      Object.values(audioElements.current).forEach((audio) => {
        audio.pause()
      })
    }
  }, [])

  return useMemo(
    () => ({
      soundEffectsEnabled,
      setSoundEffectsEnabled,
      appOpen: () => playSound('appOpen'),
      windowClose: () => playSound('windowClose'),
      firstWallpaperSet: playFirstWallpaperSet,
      playStartup,
      startAmbience,
      stopAmbience,
      pauseAmbience,
      resumeAmbience,
    }),
    [
      playFirstWallpaperSet,
      playStartup,
      playSound,
      pauseAmbience,
      resumeAmbience,
      setSoundEffectsEnabled,
      soundEffectsEnabled,
      startAmbience,
      stopAmbience,
    ],
  )
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SOUND_EFFECTS_ENABLED,
  FIRST_WALLPAPER_SOUND_STORAGE_KEY,
  SOUND_EFFECTS_STORAGE_KEY,
  parseSoundEffectsPreference,
} from '@/lib/sound-preferences'
import type { SecretId } from '@/lib/secrets'
import {
  ACHIEVEMENTS_STORAGE_KEY,
  parseStoredIds,
  type JackOsAchievementId,
} from '@/lib/achievements'

export const SOUND_EFFECT_SOURCES = {
  appOpen: '/sounds/app-open.mp3',
  windowClose: '/sounds/window-close.mp3',
  firstWallpaperSet: '/sounds/wallpaper-first-set.mp3',
  startup: '/sounds/boot-up.mp3',
  ambience: '/sounds/desktop-ambience.mp3',
  secretSignalLoss: '/sounds/secret-signal-loss.mp3',
  secretOrangeHorizon: '/sounds/secret-orange-horizon.mp3',
  secretMoonstep: '/sounds/secret-moonstep.mp3',
  secretTheCrossing: '/sounds/secret-the-crossing.mp3',
  guestbookSign: '/sounds/guestbook-sign.mp3',
  achievementUnlocked: '/sounds/achievement-unlocked.mp3',
  hourlyChime: '/sounds/hourly-chime.mp3',
} as const

export type SoundEffectName = 'appOpen' | 'windowClose' | 'firstWallpaperSet' | 'startup'
export type JackOsAudioName = keyof typeof SOUND_EFFECT_SOURCES
const JACK_OS_ACHIEVEMENT_IDS: readonly JackOsAchievementId[] = [
  'firewall-first-run',
  'interactive-update-explorer',
  'firewall-certified',
] as const

const SECRET_UNLOCK_AUDIO_BY_ID: Record<SecretId, JackOsAudioName> = {
  'signal-loss': 'secretSignalLoss',
  'orange-horizon': 'secretOrangeHorizon',
  moonstep: 'secretMoonstep',
  'the-crossing': 'secretTheCrossing',
}

export const STARTUP_AUDIO_DURATION_MS = 5424

const SOUND_VOLUMES: Record<JackOsAudioName, number> = {
  appOpen: 0.28,
  windowClose: 0.28,
  firstWallpaperSet: 0.28,
  startup: 0.32,
  ambience: 0.08,
  secretSignalLoss: 0.28,
  secretOrangeHorizon: 0.28,
  secretMoonstep: 0.28,
  secretTheCrossing: 0.28,
  guestbookSign: 0.24,
  achievementUnlocked: 0.26,
  hourlyChime: 0.15,
}
const AMBIENCE_FADE_MS = 900
const AMBIENCE_LOOP_START_SECONDS = 0.048
const AMBIENCE_LOOP_END_TRIM_SECONDS = 0.32
const AMBIENCE_MAX_DETECTED_EDGE_SECONDS = 0.6
const AMBIENCE_MIN_LOOP_SECONDS = 4
const AMBIENCE_EDGE_WINDOW_SECONDS = 0.025
const AMBIENCE_SILENCE_RMS_THRESHOLD = 0.002

type AmbienceLoopPoints = {
  start: number
  end: number
}

type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext
}

function getAudioContextConstructor() {
  if (typeof window === 'undefined') return null
  return window.AudioContext ?? (window as WindowWithWebkitAudioContext).webkitAudioContext ?? null
}

function getWindowRms(buffer: AudioBuffer, startSample: number, endSample: number) {
  let total = 0
  let samples = 0
  const start = Math.max(0, startSample)
  const end = Math.min(buffer.length, endSample)

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel)
    for (let index = start; index < end; index += 1) {
      total += data[index] * data[index]
      samples += 1
    }
  }

  return samples > 0 ? Math.sqrt(total / samples) : 0
}

function detectEdgeSilence(buffer: AudioBuffer, edge: 'start' | 'end') {
  const windowSamples = Math.max(1, Math.floor(buffer.sampleRate * AMBIENCE_EDGE_WINDOW_SECONDS))
  const maxScanSamples = Math.min(
    buffer.length,
    Math.floor(buffer.sampleRate * AMBIENCE_MAX_DETECTED_EDGE_SECONDS),
  )

  if (edge === 'start') {
    for (let start = 0; start < maxScanSamples; start += windowSamples) {
      const rms = getWindowRms(buffer, start, start + windowSamples)
      if (rms > AMBIENCE_SILENCE_RMS_THRESHOLD) {
        return start / buffer.sampleRate
      }
    }
    return maxScanSamples / buffer.sampleRate
  }

  for (let end = buffer.length; end > buffer.length - maxScanSamples; end -= windowSamples) {
    const rms = getWindowRms(buffer, end - windowSamples, end)
    if (rms > AMBIENCE_SILENCE_RMS_THRESHOLD) {
      return (buffer.length - end) / buffer.sampleRate
    }
  }

  return maxScanSamples / buffer.sampleRate
}

function getAmbienceLoopPoints(buffer: AudioBuffer): AmbienceLoopPoints {
  const detectedStart = detectEdgeSilence(buffer, 'start')
  const detectedEndTrim = detectEdgeSilence(buffer, 'end')
  const start = Math.min(
    Math.max(detectedStart, AMBIENCE_LOOP_START_SECONDS),
    AMBIENCE_MAX_DETECTED_EDGE_SECONDS,
  )
  const endTrim = Math.min(
    Math.max(detectedEndTrim, AMBIENCE_LOOP_END_TRIM_SECONDS),
    AMBIENCE_MAX_DETECTED_EDGE_SECONDS,
  )
  const end = Math.max(start + AMBIENCE_MIN_LOOP_SECONDS, buffer.duration - endTrim)

  return {
    start,
    end: Math.min(end, buffer.duration),
  }
}

function normalizeAmbienceOffset(offset: number, loopPoints: AmbienceLoopPoints) {
  const loopDuration = loopPoints.end - loopPoints.start
  if (loopDuration <= 0) return loopPoints.start
  const relative = (offset - loopPoints.start) % loopDuration
  return loopPoints.start + (relative < 0 ? relative + loopDuration : relative)
}

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
  const soundEffectsEnabledRef = useRef(soundEffectsEnabled)
  const audioElements = useRef<
    Partial<Record<JackOsAudioName, HTMLAudioElement>>
  >({})
  const ambienceAudioContext = useRef<AudioContext | null>(null)
  const ambienceBuffer = useRef<AudioBuffer | null>(null)
  const ambienceBufferPromise = useRef<Promise<AudioBuffer | null> | null>(null)
  const ambienceGain = useRef<GainNode | null>(null)
  const ambienceSource = useRef<AudioBufferSourceNode | null>(null)
  const ambienceWebFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ambienceWebPlaying = useRef(false)
  const ambienceLoopPoints = useRef<AmbienceLoopPoints>({
    start: AMBIENCE_LOOP_START_SECONDS,
    end: STARTUP_AUDIO_DURATION_MS / 1000,
  })
  const ambienceOffset = useRef(AMBIENCE_LOOP_START_SECONDS)
  const ambienceOffsetAtStart = useRef(AMBIENCE_LOOP_START_SECONDS)
  const ambienceStartedAt = useRef(0)
  const firstWallpaperFallbackPlayed = useRef(false)
  const achievementFallbackIds = useRef<Set<JackOsAchievementId>>(new Set())
  const achievementGuard = useRef<Set<JackOsAchievementId>>(new Set())
  const ambienceWanted = useRef(false)
  const ambienceFadeFrame = useRef<number | null>(null)
  const startupAttempted = useRef(false)
  const startupPlaying = useRef(false)

  useEffect(() => {
    setSoundEffectsEnabledState(readSoundEffectsEnabled())
  }, [])

  useEffect(() => {
    soundEffectsEnabledRef.current = soundEffectsEnabled
  }, [soundEffectsEnabled])

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

    ;(Object.keys(SOUND_EFFECT_SOURCES) as JackOsAudioName[]).forEach((name) => {
      if (
        name === 'ambience' ||
        name === 'guestbookSign' ||
        name === 'achievementUnlocked' ||
        name === 'hourlyChime'
      ) {
        return
      }
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

  const getAmbienceContext = useCallback(() => {
    const ExistingAudioContext = getAudioContextConstructor()
    if (!ExistingAudioContext) {
      return null
    }

    if (ambienceAudioContext.current) {
      return ambienceAudioContext.current
    }

    try {
      const context = new ExistingAudioContext()
      const gain = context.createGain()
      gain.gain.value = 0
      gain.connect(context.destination)
      ambienceAudioContext.current = context
      ambienceGain.current = gain
      return context
    } catch {
      return null
    }
  }, [])

  const loadAmbienceBuffer = useCallback(async (context: AudioContext) => {
    if (ambienceBuffer.current) {
      return ambienceBuffer.current
    }

    if (ambienceBufferPromise.current) {
      return ambienceBufferPromise.current
    }

    ambienceBufferPromise.current = fetch(SOUND_EFFECT_SOURCES.ambience, {
      cache: 'force-cache',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ambience audio unavailable')
        }
        return response.arrayBuffer()
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        ambienceBuffer.current = buffer
        ambienceLoopPoints.current = getAmbienceLoopPoints(buffer)
        ambienceOffset.current = normalizeAmbienceOffset(
          ambienceOffset.current,
          ambienceLoopPoints.current,
        )
        return buffer
      })
      .catch(() => null)

    return ambienceBufferPromise.current
  }, [])

  const prepareWebAmbience = useCallback(() => {
    const context = getAmbienceContext()
    if (!context) {
      return
    }

    void context.resume().catch(() => {
      // Web Audio may remain suspended until a later eligible user gesture.
    })
    void loadAmbienceBuffer(context)
  }, [getAmbienceContext, loadAmbienceBuffer])

  const clearWebAmbienceFadeTimer = useCallback(() => {
    if (ambienceWebFadeTimer.current) {
      clearTimeout(ambienceWebFadeTimer.current)
      ambienceWebFadeTimer.current = null
    }
  }, [])

  const fadeWebAmbienceTo = useCallback(
    (targetVolume: number, onDone?: () => void) => {
      const context = ambienceAudioContext.current
      const gain = ambienceGain.current
      if (!context || !gain) {
        onDone?.()
        return
      }

      clearWebAmbienceFadeTimer()
      const now = context.currentTime
      const currentVolume = gain.gain.value
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(currentVolume, now)
      gain.gain.linearRampToValueAtTime(targetVolume, now + AMBIENCE_FADE_MS / 1000)

      if (onDone) {
        ambienceWebFadeTimer.current = setTimeout(() => {
          ambienceWebFadeTimer.current = null
          onDone()
        }, AMBIENCE_FADE_MS + 20)
      }
    },
    [clearWebAmbienceFadeTimer],
  )

  const updateWebAmbienceOffset = useCallback(() => {
    const context = ambienceAudioContext.current
    if (!context || !ambienceWebPlaying.current) {
      return
    }

    const elapsed = context.currentTime - ambienceStartedAt.current
    ambienceOffset.current = normalizeAmbienceOffset(
      ambienceOffsetAtStart.current + elapsed,
      ambienceLoopPoints.current,
    )
  }, [])

  const stopWebAmbience = useCallback(
    (fade = true) => {
      const source = ambienceSource.current
      if (!source) {
        return false
      }

      updateWebAmbienceOffset()

      const stop = () => {
        const activeSource = ambienceSource.current
        if (!activeSource) {
          return
        }

        activeSource.onended = null
        try {
          activeSource.stop()
        } catch {
          // Already stopped.
        }
        try {
          activeSource.disconnect()
        } catch {
          // Already disconnected.
        }
        ambienceSource.current = null
        ambienceWebPlaying.current = false
        const gain = ambienceGain.current
        if (gain) {
          gain.gain.value = 0
        }
      }

      if (fade) {
        fadeWebAmbienceTo(0, stop)
        return true
      }

      clearWebAmbienceFadeTimer()
      stop()
      return true
    },
    [clearWebAmbienceFadeTimer, fadeWebAmbienceTo, updateWebAmbienceOffset],
  )

  const playHtmlAmbience = useCallback(() => {
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
  }, [fadeAmbienceTo, getAudio])

  const playWebAmbience = useCallback(async () => {
    if (ambienceSource.current && ambienceWebPlaying.current) {
      fadeWebAmbienceTo(SOUND_VOLUMES.ambience)
      return true
    }

    const context = getAmbienceContext()
    if (!context) {
      return false
    }

    try {
      await context.resume()
    } catch {
      return false
    }

    const buffer = await loadAmbienceBuffer(context)
    if (!buffer) {
      return false
    }

    if (!ambienceWanted.current || !soundEffectsEnabledRef.current) {
      return true
    }

    if (typeof document !== 'undefined' && document.hidden) {
      return true
    }

    try {
      const source = context.createBufferSource()
      const gain = ambienceGain.current
      if (!gain) {
        return false
      }

      const loopPoints = getAmbienceLoopPoints(buffer)
      ambienceLoopPoints.current = loopPoints
      const offset = normalizeAmbienceOffset(ambienceOffset.current, loopPoints)
      source.buffer = buffer
      source.loop = true
      source.loopStart = loopPoints.start
      source.loopEnd = loopPoints.end
      source.connect(gain)
      source.onended = () => {
        if (ambienceSource.current === source) {
          ambienceSource.current = null
          ambienceWebPlaying.current = false
        }
      }

      ambienceSource.current = source
      ambienceWebPlaying.current = true
      ambienceOffset.current = offset
      ambienceOffsetAtStart.current = offset
      ambienceStartedAt.current = context.currentTime
      source.start(0, offset)
      const htmlAmbience = audioElements.current.ambience
      if (htmlAmbience && !htmlAmbience.paused) {
        htmlAmbience.pause()
      }
      fadeWebAmbienceTo(SOUND_VOLUMES.ambience)
      return true
    } catch {
      ambienceSource.current = null
      ambienceWebPlaying.current = false
      return false
    }
  }, [fadeWebAmbienceTo, getAmbienceContext, loadAmbienceBuffer])

  const playAmbience = useCallback(
    (allowPlayback: boolean) => {
      if (!allowPlayback || (typeof document !== 'undefined' && document.hidden)) {
        return
      }

      void playWebAmbience().then((webAudioStarted) => {
        if (
          !webAudioStarted &&
          ambienceWanted.current &&
          soundEffectsEnabledRef.current &&
          !(typeof document !== 'undefined' && document.hidden)
        ) {
          playHtmlAmbience()
        }
      })
    },
    [playHtmlAmbience, playWebAmbience],
  )

  const stopAmbience = useCallback((fade = true, keepWanted = false) => {
    ambienceWanted.current = keepWanted
    stopWebAmbience(fade)
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
  }, [fadeAmbienceTo, stopWebAmbience])

  const pauseAmbience = useCallback(() => {
    stopWebAmbience(false)
    const ambience = audioElements.current.ambience
    if (!ambience || ambience.paused) return
    ambience.pause()
  }, [stopWebAmbience])

  const startAmbience = useCallback(() => {
    ambienceWanted.current = true
    playAmbience(soundEffectsEnabledRef.current)
  }, [playAmbience])

  const resumeAmbience = useCallback(() => {
    if (!ambienceWanted.current) return
    playAmbience(soundEffectsEnabledRef.current)
  }, [playAmbience])

  const setSoundEffectsEnabled = useCallback(
    (enabled: boolean) => {
      soundEffectsEnabledRef.current = enabled
      setSoundEffectsEnabledState(enabled)
      writeSoundEffectsEnabled(enabled)
    },
    [],
  )

  useEffect(() => {
    if (!soundEffectsEnabled) {
      stopAmbience(true, true)
      return
    }

    if (ambienceWanted.current) {
      playAmbience(true)
    }
  }, [playAmbience, soundEffectsEnabled, stopAmbience])

  const playSound = useCallback(
    (name: JackOsAudioName) => {
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

  const playSecretUnlock = useCallback(
    (secretId: SecretId) => {
      playSound(SECRET_UNLOCK_AUDIO_BY_ID[secretId])
    },
    [playSound],
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

  const markAchievementUnlocked = useCallback((achievementId: JackOsAchievementId) => {
    if (!JACK_OS_ACHIEVEMENT_IDS.includes(achievementId)) {
      return false
    }

    if (canUseBrowserStorage()) {
      try {
        const current = parseStoredIds(
          window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY),
          JACK_OS_ACHIEVEMENT_IDS,
        )
        if (current.includes(achievementId)) {
          return false
        }
        window.localStorage.setItem(
          ACHIEVEMENTS_STORAGE_KEY,
          JSON.stringify([...current, achievementId]),
        )
        return true
      } catch {
        // Fall through to in-memory protection for locked-down browsers.
      }
    }

    if (achievementFallbackIds.current.has(achievementId)) {
      return false
    }
    achievementFallbackIds.current.add(achievementId)
    return true
  }, [])

  const playAchievementUnlocked = useCallback(
    (achievementId: JackOsAchievementId) => {
      const newlyUnlocked = markAchievementUnlocked(achievementId)
      if (!newlyUnlocked) {
        return false
      }

      if (!achievementGuard.current.has(achievementId)) {
        achievementGuard.current.add(achievementId)
        window.setTimeout(() => {
          achievementGuard.current.delete(achievementId)
        }, 1800)
        playSound('achievementUnlocked')
      }

      return true
    },
    [markAchievementUnlocked, playSound],
  )

  const playStartup = useCallback(() => {
    if (startupAttempted.current) {
      return
    }

    startupAttempted.current = true
    if (!soundEffectsEnabled || startupPlaying.current) {
      return
    }

    prepareWebAmbience()
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
  }, [getAudio, prepareWebAmbience, soundEffectsEnabled])

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
      clearWebAmbienceFadeTimer()
      const source = ambienceSource.current
      if (source) {
        source.onended = null
        try {
          source.stop()
        } catch {
          // Already stopped.
        }
        try {
          source.disconnect()
        } catch {
          // Already disconnected.
        }
      }
      Object.values(audioElements.current).forEach((audio) => {
        audio.pause()
      })
      void ambienceAudioContext.current?.close().catch(() => {
        // Cleanup is best-effort.
      })
    }
  }, [clearWebAmbienceFadeTimer])

  return useMemo(
    () => ({
      soundEffectsEnabled,
      setSoundEffectsEnabled,
      appOpen: () => playSound('appOpen'),
      windowClose: () => playSound('windowClose'),
      guestbookSign: () => playSound('guestbookSign'),
      playHourlyChime: () => playSound('hourlyChime'),
      firstWallpaperSet: playFirstWallpaperSet,
      achievementUnlocked: playAchievementUnlocked,
      playSecretUnlock,
      playStartup,
      startAmbience,
      stopAmbience,
      pauseAmbience,
      resumeAmbience,
    }),
    [
      playFirstWallpaperSet,
      playAchievementUnlocked,
      playSecretUnlock,
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

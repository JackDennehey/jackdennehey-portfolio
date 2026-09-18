import { spokenForm } from './vendor/contracts'

/** PUBLIC-safe voice. Hosted Aiden (or OpenAI stand-in) first; browser speechSynthesis is fallback only. */

const LIMITS = {
  rateMin: 0.42,
  rateMax: 0.58,
  pitchMin: 0.9,
  pitchMax: 1.08,
  volumeMin: 0.5,
  volumeMax: 1,
}

const EMOTION_DELIVERY: Record<string, { rate: number; pitch: number; speed: number; pause: boolean; energyBias: number }> =
  {
    neutral: { rate: 1, pitch: 1, speed: 1, pause: false, energyBias: 0 },
    happy: { rate: 1.06, pitch: 1.02, speed: 1.04, pause: false, energyBias: 0.08 },
    smug: { rate: 0.94, pitch: 1, speed: 0.94, pause: true, energyBias: -0.04 },
    annoyed: { rate: 1.05, pitch: 0.99, speed: 1.06, pause: false, energyBias: 0.04 },
    angry: { rate: 1.08, pitch: 1.01, speed: 1.08, pause: false, energyBias: 0.1 },
    surprised: { rate: 1.07, pitch: 1.03, speed: 1.06, pause: false, energyBias: 0.08 },
    confused: { rate: 0.96, pitch: 1.01, speed: 0.96, pause: true, energyBias: -0.03 },
    thinking: { rate: 0.97, pitch: 1, speed: 0.96, pause: true, energyBias: -0.04 },
    tired: { rate: 0.92, pitch: 0.98, speed: 0.92, pause: true, energyBias: -0.08 },
    excited: { rate: 1.08, pitch: 1.03, speed: 1.08, pause: false, energyBias: 0.1 },
    focused: { rate: 0.99, pitch: 1, speed: 0.98, pause: false, energyBias: -0.02 },
    sleepy: { rate: 0.9, pitch: 0.97, speed: 0.9, pause: true, energyBias: -0.1 },
    curious: { rate: 1.02, pitch: 1.01, speed: 1.02, pause: false, energyBias: 0.03 },
  }

const PREFERRED_VOICES = ['Daniel', 'Eddy', 'Reed', 'Alex']

export function normalizeForSpeech(text: string) {
  return spokenForm(text)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function shapeProsody(text: string, emotion: string) {
  let out = String(text || '').trim()
  const delivery = EMOTION_DELIVERY[emotion] || EMOTION_DELIVERY.neutral
  if (delivery?.pause) {
    if (emotion === 'smug') {
      out = out.replace(/\.\s+/g, '. ... ')
      if (/\.$/.test(out) && !out.includes('...')) out = out.replace(/\.$/, '...')
    } else if (emotion === 'confused') {
      out = out.replace(/\?$/, '? ...')
    } else if (emotion === 'tired' || emotion === 'thinking' || emotion === 'sleepy') {
      out = out.replace(/,\s+/g, '... ')
    }
  }
  return out.slice(0, 1000)
}

function deliveryFor(emotion: string, energy = 0.5) {
  const profile = EMOTION_DELIVERY[emotion] || EMOTION_DELIVERY.neutral
  const energyClamp = clamp(energy, 0, 1)
  return {
    rate: clamp(0.51 * profile.rate * (1 + (energyClamp - 0.5) * 0.06 + profile.energyBias * 0.05), LIMITS.rateMin, LIMITS.rateMax),
    pitch: clamp(0.97 * profile.pitch, LIMITS.pitchMin, LIMITS.pitchMax),
    volume: 1,
  }
}

export type SpeechHandlers = {
  onStart?: () => void
  onEnd?: () => void
  onError?: (message: string) => void
  onGenerating?: () => void
  onUnavailable?: (message: string) => void
}

let hostedAudio: HTMLAudioElement | null = null
let hostedAbort: AbortController | null = null
let hostedObjectUrl: string | null = null

function releaseHostedAudio() {
  hostedAbort?.abort()
  hostedAbort = null
  if (hostedAudio) {
    hostedAudio.pause()
    hostedAudio.src = ''
    hostedAudio = null
  }
  if (hostedObjectUrl) {
    URL.revokeObjectURL(hostedObjectUrl)
    hostedObjectUrl = null
  }
}

export function speakBoch(text: string, emotion: string, energy: number, handlers: SpeechHandlers = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    handlers.onError?.('No browser voice on this device.')
    return () => undefined
  }
  const spoken = normalizeForSpeech(shapeProsody(text, emotion.toLowerCase()))
  const delivery = deliveryFor(emotion.toLowerCase(), energy)
  let cancelled = false
  let started = false

  const play = () => {
    if (cancelled || started) return
    started = true
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(spoken)
    const voices = window.speechSynthesis.getVoices()
    const voice =
      PREFERRED_VOICES.map((name) => voices.find((item) => item.localService && item.name.includes(name))).find(Boolean) ||
      voices.find((item) => item.localService && item.lang.startsWith('en')) ||
      voices.find((item) => item.lang.startsWith('en'))
    if (voice) utterance.voice = voice
    utterance.pitch = delivery.pitch
    utterance.volume = delivery.volume
    utterance.rate = Math.min(1.15, Math.max(0.7, delivery.rate * 1.7))
    utterance.onstart = () => {
      if (!cancelled) handlers.onStart?.()
    }
    utterance.onend = () => {
      if (!cancelled) handlers.onEnd?.()
    }
    utterance.onerror = () => {
      if (!cancelled) handlers.onError?.('Voice playback failed.')
    }
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', play, { once: true })
    window.setTimeout(play, 250)
  } else {
    play()
  }

  return () => {
    cancelled = true
    window.speechSynthesis.cancel()
  }
}

export function speakPublicReply(text: string, spokenText: string, emotion: string, energy: number, handlers: SpeechHandlers = {}) {
  if (typeof window === 'undefined') {
    handlers.onError?.('No voice on this device.')
    return () => undefined
  }
  releaseHostedAudio()
  stopBochSpeech()
  const abort = new AbortController()
  hostedAbort = abort
  let cancelled = false
  let fellBack = false
  handlers.onGenerating?.()
  const spoken = spokenText || normalizeForSpeech(shapeProsody(text, emotion.toLowerCase()))
  const timeout = window.setTimeout(() => abort.abort(), 18_000)

  void fetch('/api/boch/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: spoken, spokenText: spoken, emotion, energy }),
    signal: abort.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('hosted-tts')
      const blob = await response.blob()
      if (blob.size < 500) throw new Error('empty-tts')
      if (cancelled) return
      const url = URL.createObjectURL(blob)
      hostedObjectUrl = url
      const audio = new Audio(url)
      hostedAudio = audio
      audio.onplaying = () => {
        if (!cancelled) handlers.onStart?.()
      }
      audio.onended = () => {
        if (hostedObjectUrl === url) {
          URL.revokeObjectURL(url)
          hostedObjectUrl = null
        }
        if (!cancelled) handlers.onEnd?.()
      }
      audio.onerror = () => {
        if (!cancelled) throwFallback()
      }
      await audio.play()
    })
    .catch(() => {
      if (cancelled) return
      throwFallback()
    })
    .finally(() => window.clearTimeout(timeout))

  function throwFallback() {
    if (cancelled || fellBack) return
    fellBack = true
    handlers.onUnavailable?.('Voice service unavailable. Using browser voice.')
    speakBoch(text, emotion, energy, handlers)
  }

  return () => {
    cancelled = true
    abort.abort()
    releaseHostedAudio()
    window.speechSynthesis.cancel()
  }
}

export function stopBochSpeech() {
  releaseHostedAudio()
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
}

function recognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const speechWindow = window as Window & {
    SpeechRecognition?: new () => RecognitionLike
    webkitSpeechRecognition?: new () => RecognitionLike
  }
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null
}

export function speechRecognitionAvailable() {
  return Boolean(recognitionCtor())
}

export function startBochListening(handlers: {
  onPartial?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (message: string) => void
  onEnd?: () => void
}) {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    handlers.onError?.('Voice input needs a browser that supports speech recognition. Type is ready.')
    return { stop: () => undefined }
  }
  const recognition = new Ctor()
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = true
  recognition.onresult = (event) => {
    let transcript = ''
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index]
      if (!result) continue
      transcript = result[0].transcript
      if (result.isFinal) handlers.onFinal?.(transcript.trim())
      else handlers.onPartial?.(transcript.trim())
    }
  }
  recognition.onerror = (event) => {
    if (event.error === 'aborted' || event.error === 'no-speech') {
      handlers.onEnd?.()
      return
    }
    handlers.onError?.(event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice input failed.')
  }
  recognition.onend = () => handlers.onEnd?.()
  try {
    recognition.start()
  } catch {
    handlers.onError?.('Could not start the microphone.')
  }
  return {
    stop: () => {
      try {
        recognition.stop()
      } catch {
        /* already stopped */
      }
    },
  }
}

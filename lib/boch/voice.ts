import { spokenForm } from './vendor/contracts'
import {
  disposeBochClientVoice,
  isVoiceEngineReady,
  speakBochClientVoice,
  stopBochClientVoice,
  type BochVoiceHandlers,
} from './client-voice'

/** PUBLIC JackOS voice. Fenrir runs in the visitor's browser. No TTS API. */

export function normalizeForSpeech(text: string) {
  return spokenForm(text)
}

export type SpeechHandlers = BochVoiceHandlers

export function speakPublicReply(text: string, spokenText: string, _emotion: string, _energy: number, handlers: SpeechHandlers = {}) {
  if (typeof window === 'undefined') {
    handlers.onError?.('No voice on this device.')
    return () => undefined
  }
  stopBochSpeech()
  let cancelled = false
  void speakBochClientVoice(text, spokenText, {
    onState: (state) => {
      if (cancelled) return
      if (state === 'loading-model') handlers.onState?.('loading-model')
      if (state === 'generating') handlers.onState?.('generating')
      if (state === 'speaking') handlers.onState?.('speaking')
      if (state === 'error') handlers.onState?.('error')
    },
    onStart: () => {
      if (!cancelled) handlers.onStart?.()
    },
    onEnd: () => {
      if (!cancelled) handlers.onEnd?.()
    },
    onUnavailable: (message) => {
      if (!cancelled) handlers.onUnavailable?.(message)
    },
    onError: (message) => {
      if (!cancelled) handlers.onError?.(message)
    },
  })
  return () => {
    cancelled = true
    stopBochClientVoice()
  }
}

export function stopBochSpeech() {
  stopBochClientVoice()
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}

export function disposeBochSpeech() {
  disposeBochClientVoice()
  stopBochSpeech()
}

export function bochVoiceReady() {
  return isVoiceEngineReady()
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

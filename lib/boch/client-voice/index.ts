import { spokenForm } from '../vendor/contracts'
import { MAX_SPOKEN_CHARS } from './config'
import { getVoiceEngineInfo, isVoiceEngineReady, loadVoiceEngine, synthesizeFenrir } from './engine'
import { cachedClip, disposeVoiceAudio, playPcm, rememberClip, stopPlayback } from './playback'

export type BochVoiceState = 'idle' | 'loading-model' | 'generating' | 'speaking' | 'error'

export type BochVoiceHandlers = {
  onState?: (state: BochVoiceState) => void
  onStart?: () => void
  onEnd?: () => void
  onError?: (message: string) => void
  onUnavailable?: (message: string) => void
}

export { isVoiceEngineReady, getVoiceEngineInfo }

export function preprocessForSpeech(text: string) {
  return spokenForm(String(text || '').trim()).slice(0, MAX_SPOKEN_CHARS)
}

let speakGen = 0

export function stopBochClientVoice() {
  speakGen += 1
  stopPlayback()
}

export function disposeBochClientVoice() {
  speakGen += 1
  disposeVoiceAudio()
}

export async function speakBochClientVoice(visibleText: string, spokenText: string, handlers: BochVoiceHandlers = {}) {
  if (typeof window === 'undefined') {
    handlers.onError?.('Voice needs a browser.')
    return
  }
  const spoken = preprocessForSpeech(spokenText || visibleText)
  if (!spoken) {
    handlers.onError?.('Nothing to say.')
    return
  }
  const token = speakGen + 1
  speakGen = token
  stopPlayback()
  const cached = cachedClip(spoken)
  try {
    if (!cached && !isVoiceEngineReady()) {
      handlers.onState?.('loading-model')
      await loadVoiceEngine(() => handlers.onState?.('loading-model'))
      if (token !== speakGen) return
    }
    let clip = cached
    if (!clip) {
      handlers.onState?.('generating')
      clip = await synthesizeFenrir(spoken)
      if (token !== speakGen) return
      rememberClip(spoken, clip)
    }
    if (token !== speakGen) return
    handlers.onState?.('speaking')
    handlers.onStart?.()
    await playPcm(clip, () => {
      if (token !== speakGen) return
      handlers.onState?.('idle')
      handlers.onEnd?.()
    })
  } catch (error) {
    if (token !== speakGen) return
    const message = error instanceof Error ? error.message : 'Voice is not available here.'
    handlers.onState?.('error')
    handlers.onUnavailable?.("BOCH's voice isn't available in this browser.")
    handlers.onError?.(message)
  }
}

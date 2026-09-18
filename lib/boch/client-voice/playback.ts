import { PCM_CACHE_LIMIT } from './config'
import type { PcmClip } from './pcm'

let audioCtx: AudioContext | null = null
let source: AudioBufferSourceNode | null = null
let playGen = 0
const clipCache = new Map<string, PcmClip>()

export function cachedClip(key: string) {
  const clip = clipCache.get(key)
  if (!clip) return null
  clipCache.delete(key)
  clipCache.set(key, clip)
  return clip
}

export function rememberClip(key: string, clip: PcmClip) {
  if (clipCache.has(key)) clipCache.delete(key)
  clipCache.set(key, clip)
  while (clipCache.size > PCM_CACHE_LIMIT) {
    const oldest = clipCache.keys().next().value
    if (oldest === undefined) break
    clipCache.delete(oldest)
  }
}

export function stopPlayback() {
  playGen += 1
  try {
    source?.stop()
  } catch {
    // already stopped
  }
  source?.disconnect()
  source = null
}

export async function playPcm(clip: PcmClip, onEnded?: () => void) {
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) throw new Error('This browser cannot play voice audio.')
  if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctx()
  if (audioCtx.state === 'suspended') await audioCtx.resume()
  const token = playGen + 1
  playGen = token
  try {
    source?.stop()
  } catch {
    // already stopped
  }
  source?.disconnect()
  const buffer = audioCtx.createBuffer(1, clip.samples.length, clip.sampleRate)
  buffer.copyToChannel(clip.samples, 0)
  const next = audioCtx.createBufferSource()
  next.buffer = buffer
  next.connect(audioCtx.destination)
  next.onended = () => {
    if (source === next) source = null
    if (playGen === token) onEnded?.()
  }
  source = next
  next.start()
  if (playGen !== token) {
    try {
      next.stop()
    } catch {
      // stopped during start
    }
    next.disconnect()
  }
}

export function disposeVoiceAudio() {
  stopPlayback()
  clipCache.clear()
  void audioCtx?.close()
  audioCtx = null
}

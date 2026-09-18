import {
  ENGINE_PUBLIC_PATH,
  KOKORO_MODEL_ID,
  MAX_UTTERANCE_CHARS,
  PRODUCTION_DTYPE,
  PRODUCTION_RATE,
  PRODUCTION_VOICE,
} from './config'
import { concatPcm, pcmFromKokoroAudio, type PcmClip } from './pcm'

export type VoiceDevice = 'webgpu' | 'wasm'

export type VoiceEngineInfo = {
  device: VoiceDevice
  dtype: 'q8' | 'fp32'
  webgpuAvailable: boolean
  modelId: string
  loadMs: number
}

type KokoroGenerate = {
  generate: (text: string, options: { voice: typeof PRODUCTION_VOICE; speed: number }) => Promise<unknown>
}

let engine: KokoroGenerate | null = null
let engineInfo: VoiceEngineInfo | null = null
let loadPromise: Promise<VoiceEngineInfo> | null = null

export function getVoiceEngineInfo() {
  return engineInfo
}

export function isVoiceEngineReady() {
  return Boolean(engine && engineInfo)
}

export async function detectWebGpu() {
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu
    if (!gpu) return false
    const adapter = await gpu.requestAdapter()
    return Boolean(adapter)
  } catch {
    return false
  }
}

function readKokoroCtor(mod: unknown) {
  if (!mod || typeof mod !== 'object') throw new Error('Voice runtime did not load.')
  const rec = mod as Record<string, unknown>
  const nested = rec.default && typeof rec.default === 'object' ? (rec.default as Record<string, unknown>) : null
  const ctor = rec.KokoroTTS || nested?.KokoroTTS
  if (!ctor || (typeof ctor !== 'object' && typeof ctor !== 'function')) {
    throw new Error('Voice runtime is missing.')
  }
  const fromPretrained = (ctor as { from_pretrained?: unknown }).from_pretrained
  if (typeof fromPretrained !== 'function') throw new Error('Voice runtime is missing.')
  const env = rec.env && typeof rec.env === 'object' ? (rec.env as { wasmPaths?: string }) : null
  if (env) env.wasmPaths = `${window.location.origin}${ENGINE_PUBLIC_PATH}`
  return ctor as {
    from_pretrained: (
      modelId: string,
      options: {
        device: VoiceDevice
        dtype: 'q8' | 'fp32'
        progress_callback?: (info: Record<string, unknown>) => void
      },
    ) => Promise<KokoroGenerate>
  }
}

async function importKokoroWeb() {
  const href = `${window.location.origin}${ENGINE_PUBLIC_PATH}kokoro.web.js`
  const loader = new Function('u', 'return import(u)') as (url: string) => Promise<unknown>
  return loader(href)
}

export async function loadVoiceEngine(
  onProgress?: (status: string) => void,
): Promise<VoiceEngineInfo> {
  if (engine && engineInfo) return engineInfo
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    const webgpuAvailable = await detectWebGpu()
    const started = performance.now()
    const KokoroTTS = readKokoroCtor(await importKokoroWeb())
    const progress_callback = (info: Record<string, unknown>) => {
      const file = typeof info.file === 'string' ? info.file : ''
      if (file) onProgress?.('Loading voice…')
    }
    let device: VoiceDevice = webgpuAvailable ? 'webgpu' : 'wasm'
    let dtype: 'q8' | 'fp32' = PRODUCTION_DTYPE
    let tts: KokoroGenerate
    try {
      tts = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, { device, dtype, progress_callback })
    } catch (error) {
      if (device !== 'webgpu') throw error
      device = 'wasm'
      dtype = PRODUCTION_DTYPE
      onProgress?.('Loading voice…')
      tts = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, { device, dtype, progress_callback })
    }
    engine = tts
    engineInfo = {
      device,
      dtype,
      webgpuAvailable,
      modelId: KOKORO_MODEL_ID,
      loadMs: Math.round(performance.now() - started),
    }
    return engineInfo
  })()
  try {
    return await loadPromise
  } finally {
    loadPromise = null
  }
}

export async function synthesizeFenrir(text: string): Promise<PcmClip> {
  if (!engine) throw new Error('Voice is not loaded.')
  const parts = packForModelLimit(text)
  const clips: PcmClip[] = []
  for (const part of parts) {
    const audio = await engine.generate(part, { voice: PRODUCTION_VOICE, speed: PRODUCTION_RATE })
    clips.push(pcmFromKokoroAudio(audio))
  }
  return concatPcm(clips)
}

function packForModelLimit(text: string) {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_UTTERANCE_CHARS) return [trimmed]
  const sentences = trimmed.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean)
  const packed: string[] = []
  let current = ''
  for (const sentence of sentences) {
    const pieces = sentence.length <= MAX_UTTERANCE_CHARS ? [sentence] : splitWords(sentence)
    for (const piece of pieces) {
      if (!current) {
        current = piece
        continue
      }
      if (`${current} ${piece}`.length <= MAX_UTTERANCE_CHARS) {
        current = `${current} ${piece}`
      } else {
        packed.push(current)
        current = piece
      }
    }
  }
  if (current) packed.push(current)
  return packed.length ? packed : [trimmed]
}

function splitWords(text: string) {
  const words = text.split(/\s+/).filter(Boolean)
  const parts: string[] = []
  let current = ''
  for (const word of words) {
    if (!current) {
      current = word.slice(0, MAX_UTTERANCE_CHARS)
      continue
    }
    if (`${current} ${word}`.length <= MAX_UTTERANCE_CHARS) {
      current = `${current} ${word}`
    } else {
      parts.push(current)
      current = word.slice(0, MAX_UTTERANCE_CHARS)
    }
  }
  if (current) parts.push(current)
  return parts
}

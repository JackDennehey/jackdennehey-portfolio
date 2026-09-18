/** Browser-only Kokoro-82M. Weights download to this device; synthesis never leaves the tab. */

import { VOICE_LAB_MODEL_ID, type KokoroMaleVoiceId } from './script'

export type KokoroDevice = 'webgpu' | 'wasm'
export type KokoroDtype = 'fp32' | 'q8'

export type LoadProgress = {
  status: string
  file?: string
  progress?: number
}

export type EngineInfo = {
  device: KokoroDevice
  dtype: KokoroDtype
  webgpuAvailable: boolean
  modelId: string
  loadMs: number
}

export type AudioDiagnostics = {
  ctor: string
  keys: string[]
  sampleType: string
  sampleCount: number
  sampleRate: number
  min: number
  max: number
  peak: number
  firstSamples: number[]
  durationSec: number
  format: string
}

export type PcmClip = {
  samples: Float32Array
  sampleRate: number
  diagnostics: AudioDiagnostics
}

type KokoroGenerate = {
  generate: (text: string, options: { voice: KokoroMaleVoiceId; speed: number }) => Promise<unknown>
}

let engine: KokoroGenerate | null = null
let engineInfo: EngineInfo | null = null
let loadPromise: Promise<EngineInfo> | null = null
let loggedFirstGeneration = false

export function getEngineInfo() {
  return engineInfo
}

function readKokoroCtor(mod: unknown) {
  if (!mod || typeof mod !== 'object') {
    throw new Error('kokoro-js did not export a module.')
  }
  const rec = mod as Record<string, unknown>
  const nested = rec.default && typeof rec.default === 'object' ? (rec.default as Record<string, unknown>) : null
  const ctor = rec.KokoroTTS || nested?.KokoroTTS
  if (!ctor || (typeof ctor !== 'object' && typeof ctor !== 'function')) {
    throw new Error('kokoro-js did not export KokoroTTS.')
  }
  const fromPretrained = (ctor as { from_pretrained?: unknown }).from_pretrained
  if (typeof fromPretrained !== 'function') {
    throw new Error('KokoroTTS.from_pretrained is missing.')
  }
  const env = rec.env && typeof rec.env === 'object' ? (rec.env as Record<string, unknown>) : null
  if (env) env.wasmPaths = `${window.location.origin}/boch-voice/`
  return ctor as {
    from_pretrained: (
      modelId: string,
      options: {
        device: KokoroDevice
        dtype: KokoroDtype
        progress_callback?: (info: Record<string, unknown>) => void
      },
    ) => Promise<KokoroGenerate>
  }
}

async function importKokoroWeb() {
  const href = `${window.location.origin}/boch-voice/kokoro.web.js`
  const loader = new Function('u', 'return import(u)') as (url: string) => Promise<unknown>
  return loader(href)
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

export async function loadKokoroEngine(
  preferWebGpu: boolean,
  onProgress?: (progress: LoadProgress) => void,
): Promise<EngineInfo> {
  if (engine && engineInfo && preferWebGpu === (engineInfo.device === 'webgpu')) {
    return engineInfo
  }
  if (loadPromise) return loadPromise
  engine = null
  engineInfo = null
  loadPromise = (async () => {
    const webgpuAvailable = await detectWebGpu()
    const wantedDevice: KokoroDevice = preferWebGpu && webgpuAvailable ? 'webgpu' : 'wasm'
    const started = performance.now()
    const KokoroTTS = readKokoroCtor(await importKokoroWeb())
    const progress_callback = (info: Record<string, unknown>) => {
      onProgress?.({
        status: String(info.status || ''),
        file: typeof info.file === 'string' ? info.file : undefined,
        progress: typeof info.progress === 'number' ? info.progress : undefined,
      })
    }
    let device = wantedDevice
    let dtype: KokoroDtype = device === 'webgpu' ? 'fp32' : 'q8'
    let tts: KokoroGenerate
    try {
      tts = await KokoroTTS.from_pretrained(VOICE_LAB_MODEL_ID, { device, dtype, progress_callback })
    } catch (error) {
      if (device !== 'webgpu') throw error
      device = 'wasm'
      dtype = 'q8'
      onProgress?.({ status: 'WebGPU failed; falling back to WASM q8' })
      tts = await KokoroTTS.from_pretrained(VOICE_LAB_MODEL_ID, { device, dtype, progress_callback })
    }
    engine = tts
    engineInfo = {
      device,
      dtype,
      webgpuAvailable,
      modelId: VOICE_LAB_MODEL_ID,
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

export async function synthesizeKokoro(text: string, voice: KokoroMaleVoiceId, speed: number) {
  if (!engine) throw new Error('Kokoro is not loaded.')
  const audio = await engine.generate(text, { voice, speed })
  const clip = pcmFromKokoroAudio(audio)
  if (!loggedFirstGeneration) {
    loggedFirstGeneration = true
    console.info('[voice-lab] first Kokoro audio object', {
      ctor: clip.diagnostics.ctor,
      keys: clip.diagnostics.keys,
      sampleType: clip.diagnostics.sampleType,
      sampleCount: clip.diagnostics.sampleCount,
      sampleRate: clip.diagnostics.sampleRate,
      min: clip.diagnostics.min,
      max: clip.diagnostics.max,
      peak: clip.diagnostics.peak,
      firstSamples: clip.diagnostics.firstSamples,
      durationSec: clip.diagnostics.durationSec,
      format: clip.diagnostics.format,
    })
  }
  return clip
}

export function concatPcm(clips: PcmClip[], gapMs: number): PcmClip {
  const sampleRate = clips[0]?.sampleRate || 24000
  const gap = new Float32Array(Math.round((gapMs / 1000) * sampleRate))
  let total = 0
  clips.forEach((clip, index) => {
    total += clip.samples.length
    if (index < clips.length - 1) total += gap.length
  })
  const samples = new Float32Array(total)
  let offset = 0
  clips.forEach((clip, index) => {
    samples.set(clip.samples, offset)
    offset += clip.samples.length
    if (index < clips.length - 1) {
      samples.set(gap, offset)
      offset += gap.length
    }
  })
  const diagnostics = diagnosticsFor(samples, sampleRate, clips[0]?.diagnostics.ctor || 'concat', clips[0]?.diagnostics.keys || [], clips[0]?.diagnostics.sampleType || 'Float32Array', clips[0]?.diagnostics.format || 'Float32 PCM [-1, 1]')
  return { samples, sampleRate, diagnostics }
}

function pcmFromKokoroAudio(audio: unknown): PcmClip {
  const rec = audio && typeof audio === 'object' ? (audio as Record<string, unknown>) : {}
  const keys = Object.keys(rec)
  const ctor = audio && typeof audio === 'object' ? Object.getPrototypeOf(audio)?.constructor?.name || typeof audio : typeof audio
  const sampleRate = numberish(rec.sampling_rate) || numberish(rec.samplingRate) || numberish(rec.sample_rate) || 24000
  const raw = unwrapSamples(rec.audio ?? rec.data ?? audio)
  const extracted = typedToFloat32(raw)
  const samples = maybeScaleToUnit(extracted.samples)
  const format = samples === extracted.samples ? extracted.format : `${extracted.format}; scaled into [-1, 1]`
  const diagnostics = diagnosticsFor(samples, sampleRate, ctor, keys, extracted.sampleType, format)
  if (samples.length < 16) {
    throw new Error(`Kokoro returned too few samples (${samples.length}).`)
  }
  return { samples, sampleRate, diagnostics }
}

function maybeScaleToUnit(samples: Float32Array) {
  let peak = 0
  for (let i = 0; i < samples.length; i += 1) {
    const abs = Math.abs(samples[i] ?? 0)
    if (abs > peak) peak = abs
  }
  if (peak <= 1.05) return samples
  const scale = peak > 2 ? (peak > 256 ? 0x8000 : peak) : peak
  const next = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i += 1) next[i] = (samples[i] ?? 0) / scale
  return next
}

function unwrapSamples(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  if (ArrayBuffer.isView(value)) return value
  const rec = value as Record<string, unknown>
  if (ArrayBuffer.isView(rec.data)) return rec.data
  if (ArrayBuffer.isView(rec.audio)) return rec.audio
  return value
}

function typedToFloat32(raw: unknown) {
  if (raw instanceof Float32Array) {
    return { samples: new Float32Array(raw), sampleType: 'Float32Array', format: 'Float32 PCM [-1, 1]' }
  }
  if (raw instanceof Float64Array) {
    return { samples: Float32Array.from(raw), sampleType: 'Float64Array', format: 'Float64 PCM converted to Float32' }
  }
  if (raw instanceof Int16Array) {
    const samples = new Float32Array(raw.length)
    for (let i = 0; i < raw.length; i += 1) samples[i] = (raw[i] ?? 0) / 0x8000
    return { samples, sampleType: 'Int16Array', format: 'Int16 PCM scaled to Float32' }
  }
  if (ArrayBuffer.isView(raw)) {
    const view = raw as ArrayBufferView
    return { samples: new Float32Array(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength)), sampleType: view.constructor.name, format: `ArrayBufferView ${view.constructor.name} copied as Float32` }
  }
  throw new Error(`Unsupported Kokoro sample type: ${raw == null ? 'null' : typeof raw}`)
}

function diagnosticsFor(
  samples: Float32Array,
  sampleRate: number,
  ctor: string,
  keys: string[],
  sampleType: string,
  format: string,
): AudioDiagnostics {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i] ?? 0
    if (value < min) min = value
    if (value > max) max = value
  }
  if (!samples.length) {
    min = 0
    max = 0
  }
  const peak = Math.max(Math.abs(min), Math.abs(max))
  return {
    ctor,
    keys,
    sampleType,
    sampleCount: samples.length,
    sampleRate,
    min,
    max,
    peak,
    firstSamples: Array.from(samples.subarray(0, 10)),
    durationSec: sampleRate ? samples.length / sampleRate : 0,
    format,
  }
}

function numberish(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

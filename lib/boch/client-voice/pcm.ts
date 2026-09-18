/** Float32 PCM from the installed kokoro-js RawAudio. Never treat toBlob() as Int16. */

export type PcmClip = {
  samples: Float32Array
  sampleRate: number
}

export function concatPcm(clips: PcmClip[]): PcmClip {
  if (!clips.length) throw new Error('Voice returned too little audio.')
  if (clips.length === 1) {
    const only = clips[0]
    if (!only) throw new Error('Voice returned too little audio.')
    return only
  }
  const sampleRate = clips[0]?.sampleRate || 24000
  let total = 0
  for (const clip of clips) total += clip.samples.length
  const samples = new Float32Array(total)
  let offset = 0
  for (const clip of clips) {
    samples.set(clip.samples, offset)
    offset += clip.samples.length
  }
  return { samples, sampleRate }
}

export function pcmFromKokoroAudio(audio: unknown): PcmClip {
  const rec = audio && typeof audio === 'object' ? (audio as Record<string, unknown>) : {}
  const sampleRate =
    numberish(rec.sampling_rate) || numberish(rec.samplingRate) || numberish(rec.sample_rate) || 24000
  const raw = unwrapSamples(rec.audio ?? rec.data ?? audio)
  const samples = maybeScaleToUnit(typedToFloat32(raw))
  if (samples.length < 16) {
    throw new Error('Voice returned too little audio.')
  }
  return { samples, sampleRate }
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
  if (raw instanceof Float32Array) return new Float32Array(raw)
  if (raw instanceof Float64Array) return Float32Array.from(raw)
  if (raw instanceof Int16Array) {
    const samples = new Float32Array(raw.length)
    for (let i = 0; i < raw.length; i += 1) samples[i] = (raw[i] ?? 0) / 0x8000
    return samples
  }
  throw new Error('Voice audio format is not supported in this browser.')
}

function maybeScaleToUnit(samples: Float32Array) {
  let peak = 0
  for (let i = 0; i < samples.length; i += 1) {
    const abs = Math.abs(samples[i] ?? 0)
    if (abs > peak) peak = abs
  }
  if (peak <= 1.05) return samples
  const scale = peak > 256 ? 0x8000 : peak
  const next = new Float32Array(samples.length)
  for (let i = 0; i < samples.length; i += 1) next[i] = (samples[i] ?? 0) / scale
  return next
}

function numberish(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/** Fenrir-only Voice Lab tuning. Not production BOCH. */

import { TEST_LINES, spokenForLab, splitSentences, type TestLineId } from './script'
import { concatPcm, synthesizeKokoro, type PcmClip } from './kokoro-client'

export const FENRIR_VOICE = 'am_fenrir' as const

export const FENRIR_TUNE_SPEEDS = [0.92, 1, 1.06] as const

export const FENRIR_SEGMENT_MODES = [
  { id: 'whole', split: false, gapMs: 0, label: 'Whole utterance' },
  { id: 'split-0', split: true, gapMs: 0, label: 'Split, 0 ms extra' },
  { id: 'split-160', split: true, gapMs: 160, label: 'Split, 160 ms gap' },
] as const

export type FenrirSegmentModeId = (typeof FENRIR_SEGMENT_MODES)[number]['id']

const SILENCE_THRESHOLD = 0.02
const MIN_INTERNAL_PAUSE_MS = 80

export type DeliveryTiming = {
  durationMs: number
  leadingMs: number
  trailingMs: number
  speechMs: number
  internalPauseCount: number
  longestInternalPauseMs: number
  totalInternalPauseMs: number
  junctionMs: number[]
  meanJunctionMs: number
  wpm: number
  peak: number
}

export type FenrirTuneRow = {
  key: string
  lineId: TestLineId
  label: string
  text: string
  spoken: string
  speed: number
  modeId: FenrirSegmentModeId
  modeLabel: string
  punctuation: 'stock' | 'hey-comma'
  latencyMs: number
  clip: PcmClip
  timing: DeliveryTiming
}

export function fenrirTuneKey(
  lineId: string,
  speed: number,
  modeId: string,
  punctuation: FenrirTuneRow['punctuation'] = 'stock',
) {
  return `fenrir:${lineId}:${speed.toFixed(2)}:${modeId}:${punctuation}`
}

export function greetingWithHeyComma(text: string) {
  return spokenForLab(text).replace(/^Hey\./, 'Hey,')
}

export function analyzeDelivery(samples: Float32Array, sampleRate: number, wordCount: number, junctionMs: number[]): DeliveryTiming {
  const threshold = SILENCE_THRESHOLD
  let lead = 0
  while (lead < samples.length && Math.abs(samples[lead] ?? 0) < threshold) lead += 1
  let trail = 0
  while (trail + lead < samples.length && Math.abs(samples[samples.length - 1 - trail] ?? 0) < threshold) trail += 1

  const minPause = Math.round((MIN_INTERNAL_PAUSE_MS / 1000) * sampleRate)
  const pauses: number[] = []
  let run = 0
  for (let i = lead; i < samples.length - trail; i += 1) {
    if (Math.abs(samples[i] ?? 0) < threshold) {
      run += 1
    } else {
      if (run >= minPause) pauses.push((run / sampleRate) * 1000)
      run = 0
    }
  }
  if (run >= minPause) pauses.push((run / sampleRate) * 1000)

  let peak = 0
  for (let i = 0; i < samples.length; i += 1) {
    const abs = Math.abs(samples[i] ?? 0)
    if (abs > peak) peak = abs
  }

  const durationMs = sampleRate ? (samples.length / sampleRate) * 1000 : 0
  const speechMs = sampleRate ? ((samples.length - lead - trail) / sampleRate) * 1000 : 0
  const meanJunctionMs = junctionMs.length ? junctionMs.reduce((sum, value) => sum + value, 0) / junctionMs.length : 0

  return {
    durationMs,
    leadingMs: sampleRate ? (lead / sampleRate) * 1000 : 0,
    trailingMs: sampleRate ? (trail / sampleRate) * 1000 : 0,
    speechMs,
    internalPauseCount: pauses.length,
    longestInternalPauseMs: pauses.reduce((max, value) => Math.max(max, value), 0),
    totalInternalPauseMs: pauses.reduce((sum, value) => sum + value, 0),
    junctionMs,
    meanJunctionMs,
    wpm: durationMs > 0 ? wordCount / (durationMs / 60000) : 0,
    peak,
  }
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function edgeMs(samples: Float32Array, sampleRate: number, fromStart: boolean) {
  const threshold = SILENCE_THRESHOLD
  let count = 0
  if (fromStart) {
    while (count < samples.length && Math.abs(samples[count] ?? 0) < threshold) count += 1
  } else {
    while (count < samples.length && Math.abs(samples[samples.length - 1 - count] ?? 0) < threshold) count += 1
  }
  return sampleRate ? (count / sampleRate) * 1000 : 0
}

export async function synthesizeFenrirTune(options: {
  lineId: TestLineId
  speed: number
  modeId: FenrirSegmentModeId
  punctuation?: FenrirTuneRow['punctuation']
}): Promise<FenrirTuneRow> {
  const line = TEST_LINES.find((item) => item.id === options.lineId)
  if (!line) throw new Error(`Unknown lab line ${options.lineId}`)
  const mode = FENRIR_SEGMENT_MODES.find((item) => item.id === options.modeId)
  if (!mode) throw new Error(`Unknown Fenrir mode ${options.modeId}`)
  const punctuation = options.punctuation || 'stock'
  const spoken = punctuation === 'hey-comma' ? greetingWithHeyComma(line.text) : spokenForLab(line.text)
  const started = performance.now()
  const chunks = mode.split ? splitSentences(spoken) : [spoken]
  const parts: PcmClip[] = []
  for (const chunk of chunks) {
    parts.push(await synthesizeKokoro(chunk, FENRIR_VOICE, options.speed))
  }
  const clip = parts.length === 1 ? parts[0]! : concatPcm(parts, mode.gapMs)
  const junctionMs: number[] = []
  for (let i = 0; i < parts.length - 1; i += 1) {
    const left = parts[i]
    const right = parts[i + 1]
    if (!left || !right) continue
    junctionMs.push(edgeMs(left.samples, left.sampleRate, false) + mode.gapMs + edgeMs(right.samples, right.sampleRate, true))
  }
  return {
    key: fenrirTuneKey(line.id, options.speed, mode.id, punctuation),
    lineId: line.id,
    label: line.label,
    text: line.text,
    spoken,
    speed: options.speed,
    modeId: mode.id,
    modeLabel: mode.label,
    punctuation,
    latencyMs: Math.round(performance.now() - started),
    clip,
    timing: analyzeDelivery(clip.samples, clip.sampleRate, wordCount(spoken), junctionMs),
  }
}

export function fenrirTuneJobs() {
  const jobs: Array<{
    lineId: TestLineId
    speed: number
    modeId: FenrirSegmentModeId
    punctuation: FenrirTuneRow['punctuation']
  }> = []
  for (const speed of FENRIR_TUNE_SPEEDS) {
    for (const mode of FENRIR_SEGMENT_MODES) {
      for (const line of TEST_LINES) {
        jobs.push({ lineId: line.id, speed, modeId: mode.id, punctuation: 'stock' })
      }
    }
  }
  for (const speed of FENRIR_TUNE_SPEEDS) {
    jobs.push({ lineId: 'hello', speed, modeId: 'whole', punctuation: 'hey-comma' })
  }
  return jobs
}

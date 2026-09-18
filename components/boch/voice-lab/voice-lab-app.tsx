'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SPEED,
  DEFAULT_SPLIT_SENTENCES,
  ENGLISH_MALE_VOICES,
  GAP_MS,
  SPEED_PRESETS,
  TEST_LINES,
  spokenForLab,
  splitSentences,
  type KokoroMaleVoiceId,
  type TestLineId,
} from '@/lib/boch/voice-lab/script'
import {
  concatPcm,
  detectWebGpu,
  getEngineInfo,
  loadKokoroEngine,
  synthesizeKokoro,
  type AudioDiagnostics,
  type EngineInfo,
  type LoadProgress,
  type PcmClip,
} from '@/lib/boch/voice-lab/kokoro-client'
import {
  FENRIR_VOICE,
  fenrirTuneJobs,
  synthesizeFenrirTune,
  type FenrirTuneRow,
} from '@/lib/boch/voice-lab/fenrir-tune'

type ClipKey = string

function clipKey(voice: KokoroMaleVoiceId, lineId: TestLineId, speed: number, split: boolean) {
  return `${voice}:${lineId}:${speed.toFixed(2)}:${split ? 'split' : 'whole'}`
}

function estimateDownloadMb(device: string, dtype: string) {
  if (device === 'webgpu' && dtype === 'fp32') return '~326 MB (fp32)'
  if (dtype === 'q8') return '~82 MB (q8)'
  return 'model weights'
}

export function VoiceLabApp() {
  const [webgpuAvailable, setWebgpuAvailable] = useState<boolean | null>(null)
  const [preferWebGpu, setPreferWebGpu] = useState(true)
  const [split, setSplit] = useState(DEFAULT_SPLIT_SENTENCES)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [engine, setEngine] = useState<EngineInfo | null>(null)
  const [loadError, setLoadError] = useState('')
  const [progress, setProgress] = useState<LoadProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeKey, setActiveKey] = useState('')
  const [status, setStatus] = useState('Load Kokoro in this browser. Speech stays on-device.')
  const [latencies, setLatencies] = useState<Record<string, number>>({})
  const [cached, setCached] = useState<Record<string, true>>({})
  const [diag, setDiag] = useState<AudioDiagnostics | null>(null)
  const [diagVoice, setDiagVoice] = useState('')
  const [fenrirRows, setFenrirRows] = useState<FenrirTuneRow[]>([])
  const [fenrirBusy, setFenrirBusy] = useState(false)
  const [fenrirProgress, setFenrirProgress] = useState('')
  const clips = useRef(new Map<ClipKey, PcmClip>())
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const playGen = useRef(0)

  useEffect(() => {
    void detectWebGpu().then((available) => {
      setWebgpuAvailable(available)
      setPreferWebGpu(available)
    })
    return () => {
      playGen.current += 1
      sourceRef.current?.stop()
      sourceRef.current?.disconnect()
      void audioCtxRef.current?.close()
    }
  }, [])

  const stop = useCallback(() => {
    playGen.current += 1
    try {
      sourceRef.current?.stop()
    } catch {
      // already stopped
    }
    sourceRef.current?.disconnect()
    sourceRef.current = null
    setActiveKey('')
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    setStatus('Loading Kokoro-82M into this browser…')
    try {
      const info = await loadKokoroEngine(preferWebGpu, (next) => setProgress(next))
      setEngine(info)
      setStatus(
        `Ready on ${info.device} / ${info.dtype} in ${(info.loadMs / 1000).toFixed(1)}s. Download ${estimateDownloadMb(info.device, info.dtype)}.`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kokoro failed to load.'
      setLoadError(message)
      setStatus('Load failed. Check WebGPU/WASM support and retry.')
    } finally {
      setLoading(false)
    }
  }, [preferWebGpu])

  const playClip = useCallback(async (clip: PcmClip, key: string, token: number) => {
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) throw new Error('Web Audio is not available in this browser.')
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new Ctx()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') await ctx.resume()
    const buffer = ctx.createBuffer(1, clip.samples.length, clip.sampleRate)
    buffer.copyToChannel(clip.samples, 0)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.onended = () => {
      if (playGen.current === token) {
        sourceRef.current = null
        setActiveKey('')
      }
    }
    sourceRef.current = source
    source.start()
    if (playGen.current !== token) {
      source.stop()
      source.disconnect()
      return
    }
    setActiveKey(key)
  }, [])

  const play = useCallback(
    async (voice: KokoroMaleVoiceId, lineId: TestLineId) => {
      if (!getEngineInfo()) {
        setStatus('Load the model first.')
        return
      }
      const line = TEST_LINES.find((item) => item.id === lineId)
      if (!line) return
      const key = clipKey(voice, lineId, speed, split)
      const token = playGen.current + 1
      playGen.current = token
      try {
        sourceRef.current?.stop()
      } catch {
        // already stopped
      }
      sourceRef.current?.disconnect()

      const cachedClip = clips.current.get(key)
      if (cachedClip) {
        setDiag(cachedClip.diagnostics)
        setDiagVoice(voice)
        setStatus(`Replaying ${voice} · cached PCM`)
        await playClip(cachedClip, key, token)
        return
      }

      setActiveKey(key)
      setStatus(`Generating ${voice}…`)
      const started = performance.now()
      try {
        const chunks = split ? splitSentences(line.text) : [spokenForLab(line.text)]
        const parts: PcmClip[] = []
        for (const chunk of chunks) {
          if (playGen.current !== token) return
          parts.push(await synthesizeKokoro(chunk, voice, speed))
        }
        const clip = parts.length === 1 ? parts[0]! : concatPcm(parts, GAP_MS)
        const ms = Math.round(performance.now() - started)
        clips.current.set(key, clip)
        setCached((current) => ({ ...current, [key]: true }))
        setLatencies((current) => ({ ...current, [key]: ms }))
        setDiag(clip.diagnostics)
        setDiagVoice(voice)
        if (playGen.current !== token) return
        setStatus(`${voice} · ${ms} ms · ${clip.diagnostics.sampleCount} samples`)
        await playClip(clip, key, token)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Generation failed.'
        setLoadError(message)
        setStatus(message)
        setActiveKey('')
      }
    },
    [playClip, speed, split],
  )

  const playFenrirRow = useCallback(
    async (row: FenrirTuneRow) => {
      const token = playGen.current + 1
      playGen.current = token
      try {
        sourceRef.current?.stop()
      } catch {
        // already stopped
      }
      sourceRef.current?.disconnect()
      setDiag(row.clip.diagnostics)
      setDiagVoice(FENRIR_VOICE)
      setStatus(`Fenrir ${row.speed.toFixed(2)} · ${row.modeLabel} · ${row.label}`)
      await playClip(row.clip, row.key, token)
    },
    [playClip],
  )

  const generateFenrirPass = useCallback(async () => {
    if (!getEngineInfo()) {
      setStatus('Load the model first.')
      return
    }
    const jobs = fenrirTuneJobs()
    setFenrirBusy(true)
    setFenrirRows([])
    const next: FenrirTuneRow[] = []
    try {
      for (let i = 0; i < jobs.length; i += 1) {
        const job = jobs[i]
        if (!job) continue
        setFenrirProgress(`Fenrir ${i + 1}/${jobs.length} · ${job.lineId} · ${job.speed.toFixed(2)} · ${job.modeId}`)
        next.push(await synthesizeFenrirTune(job))
        setFenrirRows([...next])
      }
      ;(window as Window & { __fenrirTune?: unknown }).__fenrirTune = next.map((row) => ({
        key: row.key,
        lineId: row.lineId,
        label: row.label,
        spoken: row.spoken,
        speed: row.speed,
        modeId: row.modeId,
        modeLabel: row.modeLabel,
        punctuation: row.punctuation,
        latencyMs: row.latencyMs,
        sampleCount: row.clip.diagnostics.sampleCount,
        sampleRate: row.clip.sampleRate,
        timing: row.timing,
      }))
      setFenrirProgress(`Fenrir matrix ready · ${next.length} clips`)
      setStatus('Fenrir tuning matrix ready. Play rows to audition.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fenrir pass failed.'
      setLoadError(message)
      setFenrirProgress(message)
    } finally {
      setFenrirBusy(false)
    }
  }, [])

  return (
    <main className="min-h-dvh bg-[#11110f] px-5 py-8 text-[#ece7db]">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2 border-b border-[#3a382f] pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#b7ae9a]">Developer only · not production BOCH</p>
          <h1 className="text-2xl font-semibold tracking-tight">BOCH Human Voice Lab</h1>
          <p className="max-w-3xl text-sm leading-6 text-[#cfc6b0]">
            Kokoro-82M runs in this tab. WebGPU is used when the browser exposes it; otherwise WASM.
            No TTS request leaves the browser. Production BOCH voice is unchanged.
          </p>
        </header>

        <section className="grid gap-3 rounded-lg border border-[#3a382f] bg-[#191714] p-4 text-sm md:grid-cols-2">
          <p>
            WebGPU:{' '}
            {webgpuAvailable === null ? 'checking…' : webgpuAvailable ? 'available' : 'not available'}
          </p>
          <p>Engine: {engine ? `${engine.device} / ${engine.dtype}` : 'not loaded'}</p>
          <p>Initial load: {engine ? `${(engine.loadMs / 1000).toFixed(1)}s` : '—'}</p>
          <p>Download: {engine ? estimateDownloadMb(engine.device, engine.dtype) : '—'}</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferWebGpu}
              disabled={loading}
              onChange={(event) => setPreferWebGpu(event.target.checked)}
            />
            Prefer WebGPU (fp32). Off uses WASM q8.
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={split} onChange={(event) => setSplit(event.target.checked)} />
            Split on sentence punctuation, {GAP_MS}ms gap
          </label>
          <label className="md:col-span-2">
            Speaking rate
            <select
              className="ml-2 rounded border border-[#3a382f] bg-[#11110f] px-2 py-1"
              value={String(speed)}
              onChange={(event) => setSpeed(Number(event.target.value))}
            >
              {SPEED_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="button"
              className="rounded border border-[#ece7db] px-3 py-1.5 text-[#11110f] bg-[#ece7db]"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? 'Loading…' : engine ? 'Reload model' : 'Load Kokoro'}
            </button>
            <button type="button" className="rounded border border-[#3a382f] px-3 py-1.5" onClick={stop}>
              Stop
            </button>
          </div>
          {progress ? (
            <p className="md:col-span-2 text-[#b7ae9a]">
              {progress.status}
              {progress.file ? ` · ${progress.file}` : ''}
              {typeof progress.progress === 'number' ? ` · ${Math.round(progress.progress)}%` : ''}
            </p>
          ) : null}
          <p className="md:col-span-2 text-[#cfc6b0]">{status}</p>
          {loadError ? <p className="md:col-span-2 text-[#e2a39a]">{loadError}</p> : null}
          {diag ? (
            <pre className="md:col-span-2 overflow-x-auto whitespace-pre-wrap rounded border border-[#2c2a24] bg-[#11110f] p-3 text-xs leading-5 text-[#cfc6b0]">
              {`engine ${engine ? `${engine.device}/${engine.dtype}` : '—'}
voice ${diagVoice}
sample rate ${diag.sampleRate} Hz
sample format ${diag.format} (${diag.sampleType})
sample count ${diag.sampleCount}
duration ${diag.durationSec.toFixed(3)} s
peak amplitude ${diag.peak.toFixed(4)}
min ${diag.min.toFixed(4)}  max ${diag.max.toFixed(4)}
ctor ${diag.ctor}
keys ${diag.keys.join(', ') || '—'}
first samples ${diag.firstSamples.map((value) => value.toFixed(4)).join(', ')}`}
            </pre>
          ) : null}
        </section>

        <section className="space-y-3 rounded-lg border border-[#3a382f] bg-[#191714] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-medium">Fenrir tuning pass</h2>
            <p className="text-xs uppercase tracking-[0.16em] text-[#b7ae9a]">am_fenrir · not production</p>
          </div>
          <p className="text-sm leading-6 text-[#cfc6b0]">
            Provisional BOCH voice. Compare 0.92 / 1.00 / 1.06 on all five lab lines, with whole-utterance
            synthesis versus sentence split at 0 ms and 160 ms extra gap. Greeting also has a single
            punctuation trial: <span className="text-[#ece7db]">Hey,</span> instead of{' '}
            <span className="text-[#ece7db]">Hey.</span>
          </p>
          <p className="rounded border border-[#3a382f] bg-[#11110f] p-3 text-sm leading-6 text-[#ece7db]">
            Recommended until you veto it: Fenrir at <strong>1.00</strong>,{' '}
            <strong>whole utterance</strong> (no split, no extra gap), BOCH→BOCK only. The 160 ms
            split gap stalls short lines; Kokoro already pauses on periods when the line is generated
            in one pass. Production is unchanged.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-[#ece7db] bg-[#ece7db] px-3 py-1.5 text-[#11110f]"
              onClick={() => void generateFenrirPass()}
              disabled={fenrirBusy || loading || !engine}
            >
              {fenrirBusy ? 'Generating Fenrir…' : 'Generate Fenrir matrix'}
            </button>
            <button type="button" className="rounded border border-[#3a382f] px-3 py-1.5" onClick={stop}>
              Stop
            </button>
          </div>
          {fenrirProgress ? <p className="text-sm text-[#b7ae9a]">{fenrirProgress}</p> : null}
          {fenrirRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-xs text-[#cfc6b0]">
                <thead>
                  <tr className="border-b border-[#2c2a24] text-[#b7ae9a]">
                    <th className="py-2 pr-3 font-medium">Line</th>
                    <th className="py-2 pr-3 font-medium">Rate</th>
                    <th className="py-2 pr-3 font-medium">Mode</th>
                    <th className="py-2 pr-3 font-medium">Punct</th>
                    <th className="py-2 pr-3 font-medium">Dur</th>
                    <th className="py-2 pr-3 font-medium">WPM</th>
                    <th className="py-2 pr-3 font-medium">Lead/trail</th>
                    <th className="py-2 pr-3 font-medium">Junction</th>
                    <th className="py-2 pr-3 font-medium">Internal pause</th>
                    <th className="py-2 pr-3 font-medium">Peak</th>
                    <th className="py-2 font-medium">Play</th>
                  </tr>
                </thead>
                <tbody>
                  {fenrirRows.map((row) => (
                    <tr key={row.key} className="border-b border-[#2c2a24]">
                      <td className="py-2 pr-3">{row.label}</td>
                      <td className="py-2 pr-3">{row.speed.toFixed(2)}</td>
                      <td className="py-2 pr-3">{row.modeLabel}</td>
                      <td className="py-2 pr-3">{row.punctuation}</td>
                      <td className="py-2 pr-3">{(row.timing.durationMs / 1000).toFixed(2)}s</td>
                      <td className="py-2 pr-3">{Math.round(row.timing.wpm)}</td>
                      <td className="py-2 pr-3">
                        {Math.round(row.timing.leadingMs)}/{Math.round(row.timing.trailingMs)} ms
                      </td>
                      <td className="py-2 pr-3">
                        {row.timing.junctionMs.length
                          ? `${row.timing.junctionMs.map((value) => Math.round(value)).join('+')} ms`
                          : '—'}
                        {row.timing.junctionMs.length
                          ? ` (mean ${Math.round(row.timing.meanJunctionMs)})`
                          : ''}
                      </td>
                      <td className="py-2 pr-3">
                        {row.timing.internalPauseCount
                          ? `${row.timing.internalPauseCount} · max ${Math.round(row.timing.longestInternalPauseMs)} ms`
                          : '—'}
                      </td>
                      <td className="py-2 pr-3">{row.timing.peak.toFixed(2)}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          className="rounded border border-[#ece7db] bg-[#ece7db] px-2 py-1 text-[#11110f]"
                          onClick={() => void playFenrirRow(row)}
                        >
                          {activeKey === row.key ? 'Playing' : 'Play'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <ol className="space-y-4">
          {ENGLISH_MALE_VOICES.map((voice) => (
            <li key={voice.id} className="rounded-lg border border-[#3a382f] bg-[#191714] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium">
                  {voice.name}{' '}
                  <span className="text-sm font-normal text-[#b7ae9a]">
                    {voice.id} · {voice.region} · grade {voice.grade}
                  </span>
                </h2>
              </div>
              <p className="mt-1 text-sm text-[#cfc6b0]">{voice.note}</p>
              <div className="mt-3 grid gap-2">
                {TEST_LINES.map((line) => {
                  const key = clipKey(voice.id, line.id, speed, split)
                  const playing = activeKey === key
                  const latency = latencies[key]
                  return (
                    <div
                      key={line.id}
                      className="flex flex-col gap-2 rounded border border-[#2c2a24] p-2 sm:flex-row sm:items-center"
                    >
                      <p className="min-w-0 flex-1 text-sm leading-6">
                        <span className="mr-2 text-xs uppercase tracking-wide text-[#b7ae9a]">{line.label}</span>
                        {line.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {latency ? <span className="text-xs text-[#b7ae9a]">{latency} ms</span> : null}
                        <button
                          type="button"
                          className="rounded border border-[#ece7db] px-2 py-1 text-xs text-[#11110f] bg-[#ece7db]"
                          onClick={() => void play(voice.id, line.id)}
                        >
                          {playing ? 'Playing' : cached[key] ? 'Replay' : 'Play'}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-[#3a382f] px-2 py-1 text-xs"
                          onClick={stop}
                          disabled={!playing}
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}

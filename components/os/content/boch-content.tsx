'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { BochFace } from '../boch/boch-face'
import {
  PUBLIC_CONTRACT_VERSION,
  type BochAction,
  type BochResponse,
  type PublicExpression,
} from '@/lib/boch'
import { mapBochActions, type JackOSBochDestination } from '@/lib/boch/actions'
import {
  ACTIVITY_STATUS,
  BOCH_EXPRESSION_LABELS,
  BOCH_MODES,
  PUBLIC_TO_FACE,
  nextNudgeExpression,
  type BochActivity,
  type BochPresenceMode,
} from '@/lib/boch/presence'
import {
  speakPublicReply,
  speechRecognitionAvailable,
  startBochListening,
  stopBochSpeech,
} from '@/lib/boch/voice'

type Props = {
  onExecuteDestinations: (destinations: JackOSBochDestination[]) => void
}

const INTRO = 'A face with a brain, opinions, and a voice.'
const MODE_ORDER: BochPresenceMode[] = ['NORMAL', 'CLEAN', 'WORK', 'SLEEP', 'MUTED']

export function BochContent({ onExecuteDestinations }: Props) {
  const inputId = useId()
  const logId = useId()
  const [mode, setMode] = useState<BochPresenceMode>('NORMAL')
  const [activity, setActivity] = useState<BochActivity>('idle')
  const [faceExpression, setFaceExpression] = useState<string>(BOCH_MODES.NORMAL.expression)
  const [publicExpression, setPublicExpression] = useState<PublicExpression>('NORMAL')
  const [inputMode, setInputMode] = useState<'type' | 'voice'>('type')
  const [speakReplies, setSpeakReplies] = useState(true)
  const [input, setInput] = useState('')
  const [reply, setReply] = useState(INTRO)
  const [hearingStatus, setHearingStatus] = useState('Type is ready. Microphone off.')
  const [notice, setNotice] = useState('')
  const [log, setLog] = useState<string[]>([`BOCH: ${INTRO}`])
  const [reducedMotion, setReducedMotion] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const sending = useRef(false)
  const listenStop = useRef<(() => void) | null>(null)
  const speakStop = useRef<(() => void) | null>(null)
  const nudgeSeq = useRef(1)
  const expressionTimer = useRef<number>(0)
  const sendRef = useRef<(text: string) => Promise<void>>(async () => undefined)
  const inputModeRef = useRef(inputMode)
  inputModeRef.current = inputMode

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    return () => {
      listenStop.current?.()
      speakStop.current?.()
      stopBochSpeech()
      window.clearTimeout(expressionTimer.current)
    }
  }, [])

  useEffect(() => {
    if (activity !== 'speaking' || reducedMotion) {
      setAudioLevel(activity === 'speaking' ? 0.45 : 0)
      return
    }
    let frame = 0
    const tick = (now: number) => {
      setAudioLevel(0.18 + 0.82 * Math.abs(Math.sin(now / 93) * Math.cos(now / 167)))
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [activity, reducedMotion])

  const scheduleModeFace = (nextMode: BochPresenceMode, holdMs = 2400) => {
    window.clearTimeout(expressionTimer.current)
    expressionTimer.current = window.setTimeout(() => {
      setFaceExpression(BOCH_MODES[nextMode].expression)
    }, holdMs)
  }

  const applyFace = (expression: string, holdMs = 2400) => {
    setFaceExpression(expression)
    scheduleModeFace(mode, holdMs)
  }

  const stopListen = () => {
    listenStop.current?.()
    listenStop.current = null
  }

  const stopSpeak = () => {
    speakStop.current?.()
    speakStop.current = null
    stopBochSpeech()
    setActivity((current) => (current === 'speaking' || current === 'voicing' ? 'idle' : current))
  }

  const speakReply = (text: string, spokenText: string, emotion: string, energy: number) => {
    if (!speakReplies || mode === 'MUTED' || mode === 'SLEEP') {
      setActivity('idle')
      return
    }
    stopSpeak()
    setActivity('voicing')
    setHearingStatus('Generating voice…')
    speakStop.current = speakPublicReply(text, spokenText, emotion, energy, {
      onGenerating: () => {
        setActivity('voicing')
        setHearingStatus('Generating voice…')
      },
      onStart: () => {
        setActivity('speaking')
        setHearingStatus('BOCH has something to say.')
      },
      onEnd: () => {
        setActivity('idle')
        setAudioLevel(0)
        setHearingStatus(inputModeRef.current === 'type' ? 'Type is ready. Microphone off.' : 'Voice is ready.')
      },
      onUnavailable: (message) => {
        setHearingStatus(message)
      },
      onError: (message) => {
        setHearingStatus(message)
        setActivity('idle')
        setAudioLevel(0)
      },
    })
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending.current) {
      if (!trimmed) setHearingStatus('Type something first.')
      return
    }
    sending.current = true
    stopListen()
    stopSpeak()
    setActivity('thinking')
    setFaceExpression('thinking')
    setPublicExpression('THINKING')
    setInput('')
    setReply('…')
    setNotice('')
    setLog((current) => [...current.slice(-8), `You: ${trimmed}`])

    try {
      const response = await fetch('/api/boch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractVersion: PUBLIC_CONTRACT_VERSION,
          requestId: `req_${Date.now().toString(36)}`,
          text: trimmed,
          timestamp: Date.now(),
          client: { name: 'jackos', version: '0.1.0' },
        }),
      })
      const payload = (await response.json()) as BochResponse
      const nextPublic = payload.expression || 'NORMAL'
      const nextFace = (
        payload.error?.code === 'MODEL_UNAVAILABLE'
          ? 'sleepy'
          : PUBLIC_TO_FACE[nextPublic] || String(payload.emotion || 'happy')
      ).toLowerCase()
      const textOut = payload.text || "Brain's offline. Face still works. Tragic."
      setPublicExpression(payload.error?.code === 'MODEL_UNAVAILABLE' ? 'SLEEP' : nextPublic)
      setFaceExpression(nextFace)
      setReply(textOut)
      setLog((current) => [...current.slice(-8), `BOCH: ${textOut}`])
      scheduleModeFace(mode, 4200)
      if (payload.actions?.length) {
        onExecuteDestinations(mapBochActions(payload.actions as BochAction[], { userText: trimmed }))
      }
      speakReply(
        textOut,
        payload.spokenText || textOut,
        String(payload.emotion || nextFace).toLowerCase(),
        typeof payload.energy === 'number' ? payload.energy : 0.55,
      )
      if (!speakReplies || mode === 'MUTED' || mode === 'SLEEP') setActivity('idle')
    } catch {
      const textOut = "Brain's offline. Face still works. Tragic."
      setPublicExpression('CONFUSED')
      setFaceExpression('confused')
      setReply(textOut)
      setLog((current) => [...current.slice(-8), `BOCH: ${textOut}`])
      setActivity('idle')
      scheduleModeFace(mode)
    } finally {
      sending.current = false
      if (inputModeRef.current === 'type') inputRef.current?.focus()
    }
  }
  sendRef.current = send

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send(input)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void send(input)
    }
  }

  const reset = async () => {
    stopListen()
    stopSpeak()
    await fetch('/api/boch/reset', { method: 'POST' })
    setReply(INTRO)
    setLog([`BOCH: ${INTRO}`])
    setPublicExpression('NORMAL')
    setFaceExpression(BOCH_MODES[mode].expression)
    setActivity('idle')
    setHearingStatus(inputMode === 'type' ? 'Type is ready. Microphone off.' : 'Voice is ready.')
    setNotice('Conversation cleared.')
    inputRef.current?.focus()
  }

  const changeMode = (next: BochPresenceMode) => {
    stopSpeak()
    if (next === 'SLEEP') stopListen()
    setMode(next)
    setFaceExpression(BOCH_MODES[next].expression)
    window.clearTimeout(expressionTimer.current)
    if (next === 'MUTED') setSpeakReplies(false)
    if (next === 'SLEEP') setActivity('idle')
    if (mode === 'MUTED' && next !== 'MUTED' && next !== 'SLEEP') setSpeakReplies(true)
  }

  const nudge = () => {
    if (mode === 'SLEEP') {
      changeMode('NORMAL')
      setReply('Up. Barely.')
      return
    }
    const next = nextNudgeExpression(nudgeSeq.current++, mode)
    applyFace(next)
  }

  const startVoice = () => {
    if (!speechRecognitionAvailable()) {
      setHearingStatus('Voice input needs a browser that supports speech recognition. Type is ready.')
      setInputMode('type')
      return
    }
    stopListen()
    setInputMode('voice')
    setHearingStatus('Listening…')
    setActivity('listening')
    applyFace('surprised', 1800)
    listenStop.current = startBochListening({
      onPartial: (text) => setHearingStatus(`Hearing: ${text}`),
      onFinal: (text) => {
        setHearingStatus(`Heard: ${text}`)
        void sendRef.current(text)
      },
      onError: (message) => {
        setHearingStatus(message)
        setInputMode('type')
        setActivity('idle')
      },
      onEnd: () => {
        listenStop.current = null
        if (!sending.current) setActivity((current) => (current === 'listening' ? 'idle' : current))
      },
    }).stop
  }

  const toggleInput = () => {
    if (inputMode === 'type') {
      startVoice()
      return
    }
    stopListen()
    setInputMode('type')
    setHearingStatus('Type is ready. Microphone off.')
    setActivity((current) => (current === 'listening' ? 'idle' : current))
  }

  const statusText =
    ACTIVITY_STATUS[activity] || (mode === 'SLEEP' ? BOCH_MODES.SLEEP.status : BOCH_MODES[mode].status)
  const caption = BOCH_EXPRESSION_LABELS[faceExpression] || BOCH_EXPRESSION_LABELS.happy
  const hint = mode === 'SLEEP' ? 'Click to wake up' : 'Click to say hello'

  return (
    <div
      className="boch-stage"
      data-mode={mode}
      data-activity={activity}
      data-hearing={inputMode === 'voice'}
      data-expression={publicExpression}
    >
      <header className="boch-wordmark-row">
        <div className="boch-wordmark">
          BOCH
          <span className="boch-edition">2.0 · ALIVE</span>
        </div>
      </header>

      <main className="boch-presence">
        <div className="boch-eyebrow">
          <span className="boch-dot" aria-hidden="true" />
          <span role="status">{statusText}</span>
        </div>
        <BochFace
          mode={mode}
          activity={activity}
          expression={faceExpression}
          audioLevel={audioLevel}
          reducedMotion={reducedMotion}
          onNudge={nudge}
        />
        <div className="boch-caption">
          <span>{caption}</span>
          <span className="boch-hint">{hint}</span>
        </div>
        <p className="sr-only" aria-live="polite">
          {activity === 'thinking' ? 'BOCH is thinking' : `BOCH looks ${faceExpression}. ${reply}`}
        </p>
      </main>

      <footer className="boch-footer">
        <section className="boch-input-panel" aria-label="Talk to BOCH">
          <div className="boch-input-tools">
            <button type="button" className="boch-utility" onClick={toggleInput} aria-label="Toggle Voice or Type input">
              {inputMode === 'voice' ? (
                <>
                  <strong>VOICE</strong> / TYPE
                </>
              ) : (
                <>
                  VOICE / <strong>TYPE</strong>
                </>
              )}
            </button>
            <label className="boch-speak-toggle">
              <input
                type="checkbox"
                checked={speakReplies && mode !== 'MUTED'}
                disabled={mode === 'MUTED'}
                onChange={(event) => setSpeakReplies(event.target.checked)}
              />{' '}
              Speak replies
            </label>
            <button type="button" className="boch-utility" onClick={() => void reset()}>
              Clear conversation
            </button>
            <button type="button" className="boch-utility boch-stop-audio" onClick={stopSpeak}>
              Stop audio
            </button>
          </div>

          {inputMode === 'type' ? (
            <form id={`${inputId}-form`} className="boch-type-form" onSubmit={onSubmit}>
              <label htmlFor={inputId} className="sr-only">
                Type to BOCH
              </label>
              <input
                id={inputId}
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                maxLength={2000}
                disabled={activity === 'thinking'}
                placeholder="Ask BOCH something…"
                autoComplete="off"
              />
              <button type="submit" disabled={activity === 'thinking'}>
                Send
              </button>
            </form>
          ) : (
            <p className="boch-voice-prompt">Listening in this browser. Speak, or switch back to Type.</p>
          )}

          <p className="boch-hearing" aria-live="polite">
            {hearingStatus}
            {notice ? ` · ${notice}` : ''}
          </p>
          <p id={logId} className="boch-reply" role="status">
            {reply}
          </p>
          <div className="sr-only" role="log" aria-live="polite" aria-relevant="additions">
            {log.map((line, index) => (
              <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>
            ))}
          </div>
        </section>

        <p className="boch-controls-label">
          CURRENT MOOD <span>local presence · PUBLIC stays PUBLIC</span>
        </p>
        <nav className="boch-moods" aria-label="BOCH mood">
          {MODE_ORDER.map((item, index) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => changeMode(item)}
            >
              <span>{index + 1}</span>
              {item}
            </button>
          ))}
        </nav>
        <p className="boch-shortcuts">
          <i>Click the face to nudge</i>
          <i>PUBLIC · family-friendly</i>
          <i>JackOS keeps the windows</i>
        </p>
      </footer>
    </div>
  )
}

/**
 * PERSONAL/local sidecar TTS helpers.
 * PUBLIC JackOS no longer hosts speech. Fenrir runs in the visitor's browser.
 * Keep this module for standalone PERSONAL deployments that still set BOCH_TTS_URL.
 */

import { isProductionBochRuntime } from './hosted-provider'

export const BOCH_BASE_INSTRUCT = [
  'Casual conversation with a friend in the room. Adult male, clear midrange, warm,',
  'slightly dry and sarcastic. Natural timing with short believable pauses.',
  'Not an announcer, not a podcast host, not a TikTok AI narrator, not robotic, not excessively deep.',
].join(' ')

const EMOTION_INSTRUCT: Record<string, string> = {
  neutral: BOCH_BASE_INSTRUCT,
  happy: `${BOCH_BASE_INSTRUCT} A bit more energy and brightness, still casual.`,
  smug: `${BOCH_BASE_INSTRUCT} Slightly slower dry timing; subtle pause before the punchline.`,
  annoyed: `${BOCH_BASE_INSTRUCT} Shorter, clipped delivery. Mildly impatient.`,
  angry: `${BOCH_BASE_INSTRUCT} More forceful, still the same guy — not monstrous or shouty.`,
  surprised: `${BOCH_BASE_INSTRUCT} Mild surprise, quick reaction, still conversational.`,
  confused: `${BOCH_BASE_INSTRUCT} Hesitant, thinking aloud.`,
  thinking: `${BOCH_BASE_INSTRUCT} Thoughtful pacing, quiet focus.`,
  tired: `${BOCH_BASE_INSTRUCT} Lower energy, slower, still clearly the same speaker.`,
  excited: `${BOCH_BASE_INSTRUCT} More lively, but not cartoonish.`,
  focused: `${BOCH_BASE_INSTRUCT} Calm and direct.`,
  sleepy: `${BOCH_BASE_INSTRUCT} Soft and low-energy.`,
  curious: `${BOCH_BASE_INSTRUCT} Interested, lightly questioning.`,
}

export type PublicTtsEngine = 'qwen-aiden' | 'openai-onyx'

export type PublicTtsResult = {
  audio: Uint8Array
  contentType: string
  engine: PublicTtsEngine
}

export function resolvePublicTtsEngine(): PublicTtsEngine | null {
  if (qwenSidecarUrl()) return 'qwen-aiden'
  if (process.env.AI_GATEWAY_API_KEY) return 'openai-onyx'
  return null
}

export async function synthesizePublicSpeech(
  text: string,
  emotion = 'neutral',
  energy = 0.5,
): Promise<PublicTtsResult | null> {
  const spoken = String(text || '').trim().slice(0, 1000)
  if (!spoken) return null
  const sidecar = qwenSidecarUrl()
  if (sidecar) {
    const audio = await qwenSpeak(sidecar, spoken, emotion, energy)
    if (audio) return audio
  }
  if (process.env.AI_GATEWAY_API_KEY) {
    return openaiSpeak(spoken, emotion, energy)
  }
  return null
}

function qwenSidecarUrl() {
  const explicit = process.env.BOCH_TTS_URL
  if (explicit === '0' || explicit === 'off') return null
  const url = (explicit || (!isProductionBochRuntime() ? 'http://127.0.0.1:7860' : '')).replace(/\/$/, '')
  if (!url) return null
  if (isProductionBochRuntime() && isLoopback(url)) return null
  return url
}

function isLoopback(url: string) {
  try {
    const host = new URL(url).hostname
    return host === '127.0.0.1' || host === 'localhost' || host === '::1'
  } catch {
    return true
  }
}

async function qwenSpeak(host: string, text: string, emotion: string, energy: number): Promise<PublicTtsResult | null> {
  const speed = clamp(1 + (0.5 - energy) * 0.08, 0.92, 1.08)
  const response = await fetch(`${host}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      engine: 'qwen',
      voice: process.env.BOCH_TTS_VOICE || 'Aiden',
      speed,
      emotion: emotion.toLowerCase(),
      instruct: EMOTION_INSTRUCT[emotion.toLowerCase()] || BOCH_BASE_INSTRUCT,
      lang_code: 'English',
      temperature: 0.65,
    }),
    signal: AbortSignal.timeout(40_000),
  })
  if (!response.ok) return null
  const buffer = new Uint8Array(await response.arrayBuffer())
  if (buffer.byteLength < 1000) return null
  return {
    audio: buffer,
    contentType: response.headers.get('content-type') || 'audio/wav',
    engine: 'qwen-aiden',
  }
}

async function openaiSpeak(text: string, emotion: string, energy: number): Promise<PublicTtsResult | null> {
  const key = process.env.AI_GATEWAY_API_KEY?.trim()
  if (!key) return null
  const model = process.env.BOCH_TTS_MODEL || 'openai/tts-1-hd'
  const speed = clamp(1 + (energy - 0.5) * 0.12 + (emotion === 'smug' ? -0.06 : 0), 0.85, 1.15)
  const response = await fetch('https://ai-gateway.vercel.sh/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice: process.env.BOCH_TTS_OPENAI_VOICE || 'onyx',
      input: text,
      speed,
      response_format: 'mp3',
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) {
    console.error(JSON.stringify({ boch: true, kind: 'tts', status: response.status }))
    return null
  }
  const buffer = new Uint8Array(await response.arrayBuffer())
  if (buffer.byteLength < 500) return null
  return { audio: buffer, contentType: 'audio/mpeg', engine: 'openai-onyx' }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

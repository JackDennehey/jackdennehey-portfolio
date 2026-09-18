/** Port of standalone `core/emotions.js` parse + CLEAN cleansing. PUBLIC always CLEAN. */

import { BOCH_BRAIN_EMOTIONS, type BochBrainEmotion } from './personality'
import type { BochAction } from './vendor/contracts'

const EMOTION_SET = new Set<string>(BOCH_BRAIN_EMOTIONS)

const CLEAN_BLOCK =
  /\b(fuck(?:ing|er|ed)?|shit(?:ty|s)?|asshole|bitch(?:es|y)?|bastard|dick(?:head)?|cock|cunt|piss(?:ed)?|damn(?:ed)?|goddamn|motherfuck(?:er|ing)?|bullshit|crap|hell|slut|whore|porn|sex(?:y|ual)?|nude|naked|boobs?|tits?|penis|vagina|horny)\b/gi

const CLEAN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bmotherfuck(?:er|ing)?\b/gi, 'ridiculous'],
  [/\bfuck(?:ing|er|ed)?\b/gi, 'really'],
  [/\bbullshit\b/gi, 'nonsense'],
  [/\bshit(?:ty|s)?\b/gi, 'mess'],
  [/\basshole\b/gi, 'jerk'],
  [/\bbitch(?:es|y)?\b/gi, 'jerk'],
  [/\bbastard\b/gi, 'jerk'],
  [/\bdick(?:head)?\b/gi, 'jerk'],
  [/\bcock\b/gi, 'jerk'],
  [/\bcunt\b/gi, 'jerk'],
  [/\bpiss(?:ed)?\b/gi, 'mad'],
  [/\bgoddamn\b/gi, 'goodness'],
  [/\bdamn(?:ed)?\b/gi, 'darn'],
  [/\bhell\b/gi, 'heck'],
  [/\bcrap\b/gi, 'mess'],
]

export type ParsedBrainReply = {
  reply: string
  emotion: BochBrainEmotion
  energy: number
  actions: BochAction[]
}

function stripDeliveryNoise(reply: string) {
  return String(reply || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`+/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractJson(raw: string): Record<string, unknown> | null {
  const text = String(raw || '').trim()
  if (!text) return null
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    /* continue */
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as Record<string, unknown>
    } catch {
      /* continue */
    }
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>
    } catch {
      return null
    }
  }
  return null
}

function cleanseForCleanMode(reply: string) {
  let out = String(reply || '')
  for (const [pattern, replacement] of CLEAN_REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  out = out.replace(/\s{2,}/g, ' ').trim()
  CLEAN_BLOCK.lastIndex = 0
  if (!out || CLEAN_BLOCK.test(out)) {
    return { reply: "Let's keep that G-rated. Ask me again, cleaner.", emotion: 'smug' as const, energy: 0.45 }
  }
  return { reply: out, emotion: null as BochBrainEmotion | null, energy: null as number | null }
}

function readActions(parsed: Record<string, unknown> | null): BochAction[] {
  if (!parsed || !Array.isArray(parsed.actions)) return []
  const out: BochAction[] = []
  for (const item of parsed.actions.slice(0, 3)) {
    if (!item || typeof item !== 'object') continue
    const rec = item as { type?: unknown; payload?: unknown }
    const type = String(rec.type || '')
    if (!type || /EXECUTE|EVAL|SHELL|SCRIPT|DOM|SQL/i.test(type)) continue
    const payload =
      rec.payload && typeof rec.payload === 'object'
        ? Object.fromEntries(
            Object.entries(rec.payload as Record<string, unknown>).map(([key, value]) => [key, String(value)]),
          )
        : {}
    out.push({ type: type as BochAction['type'], payload })
  }
  return out
}

export function parseBrainResponse(raw: string): ParsedBrainReply {
  const parsed = extractJson(raw)
  let reply = ''
  let emotion: BochBrainEmotion = 'neutral'
  let energy = 0.5
  if (parsed) {
    reply = String(parsed.reply ?? parsed.text ?? parsed.message ?? '').trim()
    const candidate = String(parsed.emotion || '').toLowerCase().trim()
    emotion = EMOTION_SET.has(candidate) ? (candidate as BochBrainEmotion) : 'neutral'
    const numeric = Number(parsed.energy)
    energy = Number.isFinite(numeric) ? Math.min(1, Math.max(0, numeric)) : 0.5
  } else {
    reply = String(raw || '')
      .replace(/```[\s\S]*?```/g, '')
      .trim()
  }
  if (!reply) reply = "I've got nothing. Try me again."
  reply = stripDeliveryNoise(reply)
  const cleaned = cleanseForCleanMode(reply)
  reply = cleaned.reply
  if (cleaned.emotion) emotion = cleaned.emotion
  if (cleaned.energy != null) energy = cleaned.energy
  return { reply: reply.slice(0, 1200), emotion, energy, actions: readActions(parsed) }
}

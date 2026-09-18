/** Standalone BOCH presence — modes, captions, and PUBLIC expression → face pose. */

export const BOCH_MODES = Object.freeze({
  NORMAL: {
    expression: 'happy',
    status: 'A little company.',
    description: 'Just hanging out. Poke at your own risk.',
  },
  CLEAN: {
    expression: 'happy',
    status: 'On my best behavior.',
    description: 'Friendly replies. Still me, housebroken.',
  },
  WORK: {
    expression: 'focused',
    status: 'Keeping you company. Quietly.',
    description: 'A steady face for getting things done.',
  },
  SLEEP: {
    expression: 'sleepy',
    status: 'Taking a little nothing break.',
    description: 'Tap or click BOCH to wake him up.',
  },
  MUTED: {
    expression: 'neutral',
    status: 'Comfortably quiet.',
    description: 'Audio off. Type still works.',
  },
} as const)

export type BochPresenceMode = keyof typeof BOCH_MODES

export const BOCH_EXPRESSION_LABELS: Record<string, string> = {
  happy: 'Perfectly innocent.',
  curious: 'You have my attention.',
  excited: 'Oh. OH. Hello!',
  annoyed: 'Really? Again?',
  surprised: 'Was not expecting that.',
  neutral: 'Enjoying the silence.',
  focused: 'You do your thing.',
  sleepy: 'Gone absolutely nowhere.',
  smug: 'Told you so.',
  angry: 'Absolutely not.',
  confused: 'Wait. What?',
  thinking: 'Processing…',
  tired: 'Running on fumes.',
}

export const PUBLIC_TO_FACE: Record<string, string> = {
  NORMAL: 'happy',
  HAPPY: 'happy',
  SMUG: 'smug',
  ANNOYED: 'annoyed',
  ANGRY: 'angry',
  SURPRISED: 'surprised',
  SUSPICIOUS: 'curious',
  DEADPAN: 'neutral',
  THINKING: 'thinking',
  SLEEP: 'sleepy',
  CURIOUS: 'curious',
  CONFUSED: 'confused',
}

export type BochActivity = 'idle' | 'listening' | 'thinking' | 'voicing' | 'speaking'

export const ACTIVITY_STATUS: Record<BochActivity, string> = {
  idle: '',
  listening: 'Listening. You have the floor.',
  thinking: 'Give me a tiny second.',
  voicing: 'Loading voice…',
  speaking: 'BOCH has something to say.',
}

const FACE_CYCLE = ['happy', 'curious', 'excited', 'annoyed', 'surprised', 'neutral'] as const

export function nextNudgeExpression(sequence: number, mode: BochPresenceMode) {
  const choices = mode === 'CLEAN' ? (['excited', 'curious', 'happy', 'surprised'] as const) : FACE_CYCLE
  return choices[sequence % choices.length] ?? 'happy'
}

export function spokenLength(text: string, max = 320) {
  const trimmed = String(text || '').trim()
  const sentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [trimmed]
  const short = sentences.slice(0, 3).join(' ').trim()
  if (short.length <= max) return short
  return `${short.slice(0, max - 1).trim()}…`
}

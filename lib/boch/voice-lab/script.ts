/** Developer-only Voice Lab copy. Not used by production BOCH. */

export const VOICE_LAB_MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX'

export const TEST_LINES = [
  {
    id: 'hello',
    label: 'Greeting',
    text: "Hey. I'm BOCH. What are we working on?",
  },
  {
    id: 'pocket-pier',
    label: 'Project',
    text: 'Pocket Pier was built in Godot. Jack designed the progression, economy, fishing systems, and the overall experience.',
  },
  {
    id: 'dry',
    label: 'Dry',
    text: "Yeah, that's probably not a great idea. But I've heard worse.",
  },
  {
    id: 'thinking',
    label: 'Thinking',
    text: "Give me a second. I'm looking through Jack's projects.",
  },
  {
    id: 'done',
    label: 'Close',
    text: 'Done. Anything else?',
  },
] as const

export type TestLineId = (typeof TEST_LINES)[number]['id']

export const ENGLISH_MALE_VOICES = [
  { id: 'am_michael', name: 'Michael', region: 'US', grade: 'C+', note: 'Standalone BOCH Kokoro fallback. Warm conversational male.' },
  { id: 'am_fenrir', name: 'Fenrir', region: 'US', grade: 'C+', note: 'Approved PUBLIC BOCH production voice. Lab only — not shown in the visitor UI.' },
  { id: 'am_puck', name: 'Puck', region: 'US', grade: 'C+', note: 'Same overall grade as Michael. Often a bit brighter.' },
  { id: 'am_echo', name: 'Echo', region: 'US', grade: 'D', note: 'Shorter training. Test for dryness vs thinness.' },
  { id: 'am_eric', name: 'Eric', region: 'US', grade: 'D', note: 'Shorter training. Compare against Michael.' },
  { id: 'am_liam', name: 'Liam', region: 'US', grade: 'D', note: 'Shorter training. Younger-leaning male.' },
  { id: 'am_onyx', name: 'Onyx', region: 'US', grade: 'D', note: 'Shorter training. Lower / drier possibility.' },
  { id: 'am_adam', name: 'Adam', region: 'US', grade: 'F+', note: 'Lowest official grade. Include so the floor is audible.' },
  { id: 'am_santa', name: 'Santa', region: 'US', grade: 'D-', note: 'Very short training. Likely novelty, not BOCH.' },
  { id: 'bm_george', name: 'George', region: 'UK', grade: 'C', note: 'British male. Check announcer vs conversation.' },
  { id: 'bm_fable', name: 'Fable', region: 'UK', grade: 'C', note: 'British male. Same grade as George.' },
  { id: 'bm_lewis', name: 'Lewis', region: 'UK', grade: 'D+', note: 'British male, longer training, lower grade.' },
  { id: 'bm_daniel', name: 'Daniel', region: 'UK', grade: 'D', note: 'British male. Overlap with macOS Daniel name only.' },
] as const

export type KokoroMaleVoiceId = (typeof ENGLISH_MALE_VOICES)[number]['id']

export const SPEED_PRESETS = [
  { id: '0.92', value: 0.92, label: '0.92 · slightly unhurried' },
  { id: '0.98', value: 0.98, label: '0.98 · previous lab default' },
  { id: '1.00', value: 1, label: '1.00 · Fenrir recommended' },
  { id: '1.06', value: 1.06, label: '1.06 · a bit snappier' },
] as const

export const DEFAULT_SPEED = 1
export const DEFAULT_SPLIT_SENTENCES = false
export const GAP_MS = 160

/** Display stays BOCH. Speech says BOCK. */
export function spokenForLab(text: string) {
  return String(text || '')
    .replace(/\bBOCH\b/g, 'BOCK')
    .replace(/\bBoch\b/g, 'Bock')
    .replace(/\bboch\b/g, 'bock')
}

export function splitSentences(text: string) {
  const parts = spokenForLab(text)
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length ? parts : [spokenForLab(text)]
}

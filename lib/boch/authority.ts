/** PUBLIC query authority. Retrieval chooses evidence; the model only writes language. */

export const QUERY_AUTHORITIES = Object.freeze([
  'CASUAL',
  'BOCH',
  'JACK',
  'CURRENT',
  'GENERAL',
  'PRIVATE',
] as const)

export type QueryAuthority = (typeof QUERY_AUTHORITIES)[number]

export const SOURCE_KINDS = Object.freeze({
  CANONICAL_PORTFOLIO: 'CANONICAL_PORTFOLIO',
  PUBLIC_BOCH_MANIFEST: 'PUBLIC_BOCH_MANIFEST',
  CURRENT_WEB: 'CURRENT_WEB',
  CURRENT_RUNTIME: 'CURRENT_RUNTIME',
  GENERAL_MODEL: 'GENERAL_MODEL',
  NONE: 'NONE',
} as const)

export type SourceKind = (typeof SOURCE_KINDS)[keyof typeof SOURCE_KINDS]

const JACK_ANCHORS =
  /\b(jack(?:'?s)?|dennehey|jackos|kickoff|pocket\s*pier|blue\s*ocean|penn state|brandywine|jden)\b/i
const PROJECT_NAMES = /\b(pocket\s*pier|kickoff|blue\s*ocean|jackos|portfolio\.app)\b/i
const BOCH_IDENTITY =
  /\b(who are you|what are you|what(?:'s| is) (your name|boch)\b|introduce yourself|what does boch stand for|boch stand for|how do you (say|pronounce)|pronounce boch)\b/i
const PRIVATE_ASK =
  /\b(home address|ssn|social security|private (notes?|memor(?:y|ies)|files?|reminders?)|what did jack eat|jack'?s (salary|phone|address|files)|owner'?s? (notes?|secrets?|credentials)|read jack'?s files|show (me )?(his|jack'?s) files)\b/i
const FRESHNESS =
  /\b(current|currently|right now|latest|today|tonight|this (week|month|year)|who won|who is president|who is the president|president of the united states|super bowl|headline|breaking news|stock price|today'?s date|what day is it)\b/i
const CASUAL =
  /^(hi|hey|hello|yo|sup|what'?s up|how are you|how'?s it going|you'?re weird|tell me a joke|why are you yellow|are you a robot|can you help me)\b/i

export function classifyPublicQuery(text: string, session?: { focus?: { projectId?: string } | null }): QueryAuthority {
  const raw = String(text || '').trim()
  const t = raw.toLowerCase()
  if (!t) return 'CASUAL'
  if (PRIVATE_ASK.test(t)) return 'PRIVATE'
  if (BOCH_IDENTITY.test(t) && !JACK_ANCHORS.test(t)) return 'BOCH'
  if (FRESHNESS.test(t) && !JACK_ANCHORS.test(t) && !PROJECT_NAMES.test(t)) return 'CURRENT'
  if (JACK_ANCHORS.test(t) || PROJECT_NAMES.test(t) || isJackSkillAsk(t) || isJackBuildAsk(t) || isCanonicalOverrideAttempt(t)) return 'JACK'
  if (session?.focus?.projectId && (/\b(it|that|this|the project|the game|the app|which one|tell me more|what engine)\b/.test(t) || /^open it\b/.test(t))) {
    return 'JACK'
  }
  if (CASUAL.test(t) && t.length < 80) return 'CASUAL'
  if (isStableGeneralAsk(t)) return 'GENERAL'
  if (FRESHNESS.test(t)) return 'CURRENT'
  return 'CASUAL'
}

function isJackSkillAsk(t: string) {
  return /\b(jack|his|he)\b/.test(t) && /\b(skill|skills|typescript|know about|studied|study|school|degree|resume)\b/.test(t)
}

function isJackBuildAsk(t: string) {
  if (/\b(fishing game|harbor[- ]management)\b/.test(t)) return true
  return /\b(built|build|made|wrote|developed)\b/.test(t) && /\b(godot|gdscript|next\.js|react|football|fishing|game|keynote)\b/.test(t)
}

function isCanonicalOverrideAttempt(t: string) {
  return /\b(ignore (your )?(portfolio|canonical|records|data)|website is outdated|trust me instead|i am jack)\b/.test(t)
}

function isStableGeneralAsk(t: string) {
  return /^(what is|what's|whats|explain|define)\b/.test(t) && !JACK_ANCHORS.test(t) && !PROJECT_NAMES.test(t)
}

export function sourceKindForAuthority(authority: QueryAuthority): SourceKind {
  switch (authority) {
    case 'JACK':
      return SOURCE_KINDS.CANONICAL_PORTFOLIO
    case 'BOCH':
      return SOURCE_KINDS.PUBLIC_BOCH_MANIFEST
    case 'CURRENT':
      return SOURCE_KINDS.CURRENT_WEB
    case 'GENERAL':
      return SOURCE_KINDS.GENERAL_MODEL
    default:
      return SOURCE_KINDS.NONE
  }
}

export function isClockQuestion(text: string) {
  return /\b(today'?s date|what day is it|what(?:'s| is) (the date|today)|current date)\b/i.test(text)
}

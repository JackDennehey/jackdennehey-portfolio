import {
  fuzzyDistance,
  includesPhrase,
  includesWord,
  normalizeSearchText,
  searchTokens,
} from './text'
import type { SpotlightEntry, SpotlightKind, SpotlightMatchField } from './types'

export type ScoredEntry = {
  entry: SpotlightEntry
  score: number
  matchField: SpotlightMatchField
}

const KIND_TIEBREAK: Record<SpotlightKind, number> = {
  app: 12,
  'case-study': 11,
  system: 10,
  project: 9,
  link: 8,
  'case-study-section': 7,
  'recruiter-section': 6,
  credential: 5,
  education: 4,
  skill: 4,
  experience: 3,
  timeline: 2,
}

function namedScore(kind: SpotlightKind, exact: boolean) {
  if (kind === 'app') return exact ? 1000 : 880
  if (kind === 'case-study') return exact ? 940 : 820
  if (kind === 'project') return exact ? 900 : 780
  if (kind === 'system') return exact ? 920 : 800
  return exact ? 860 : 740
}

function bestFuzzy(query: string, candidates: readonly string[]) {
  let best: number | null = null
  for (const candidate of candidates) {
    const distance = fuzzyDistance(query, candidate)
    if (distance == null) continue
    if (best == null || distance < best) best = distance
  }
  return best
}

export function scoreSpotlightEntry(entry: SpotlightEntry, query: string): ScoredEntry | null {
  const q = normalizeSearchText(query)
  if (!q) return null

  const title = normalizeSearchText(entry.title)
  const name = normalizeSearchText(entry.name ?? '')
  const subtitle = normalizeSearchText(entry.subtitle)
  const aliases = entry.aliases.map(normalizeSearchText).filter(Boolean)
  const keywords = entry.keywords.map(normalizeSearchText).filter(Boolean)
  const body = normalizeSearchText(entry.searchableText)
  const tokens = searchTokens(q)

  if (title === q) return { entry, score: namedScore(entry.kind, true) + 20, matchField: 'title' }
  if (name && name === q) return { entry, score: namedScore(entry.kind, true), matchField: 'name' }
  if (title.startsWith(q)) return { entry, score: namedScore(entry.kind, false) + 20, matchField: 'title' }
  if (name && name.startsWith(q)) return { entry, score: namedScore(entry.kind, false), matchField: 'name' }

  if (aliases.includes(q)) return { entry, score: 860, matchField: 'alias' }
  if (keywords.includes(q)) return { entry, score: 820, matchField: 'keyword' }
  if (aliases.some((alias) => alias.startsWith(q))) return { entry, score: 760, matchField: 'alias' }

  if (includesWord(title, q)) return { entry, score: 720, matchField: 'title' }
  if (name && includesWord(name, q)) return { entry, score: 700, matchField: 'name' }
  if (aliases.some((alias) => includesWord(alias, q))) return { entry, score: 680, matchField: 'alias' }
  if (keywords.some((keyword) => includesWord(keyword, q) || keyword.startsWith(q))) {
    return { entry, score: 650, matchField: 'keyword' }
  }

  if (includesPhrase(title, q)) return { entry, score: 610, matchField: 'title' }
  if (name && includesPhrase(name, q)) return { entry, score: 590, matchField: 'name' }
  if (aliases.some((alias) => includesPhrase(alias, q))) return { entry, score: 570, matchField: 'alias' }

  if (includesWord(subtitle, q) || includesPhrase(subtitle, q)) {
    return { entry, score: 480, matchField: 'subtitle' }
  }

  if (tokens.length > 1 && tokens.every((token) => includesWord(title, token) || includesWord(name, token))) {
    return { entry, score: 640, matchField: 'title' }
  }

  if (includesWord(body, q)) return { entry, score: 320, matchField: 'body' }
  if (includesPhrase(body, q)) return { entry, score: 260, matchField: 'body' }
  if (
    tokens.length > 1 &&
    tokens.every((token) => includesWord(body, token) || includesPhrase(body, token))
  ) {
    return { entry, score: 300, matchField: 'body' }
  }

  const fuzzyPool = [title, name, ...aliases, ...keywords].filter(Boolean)
  if (tokens.length === 1) {
    const distance = bestFuzzy(q, fuzzyPool)
    if (distance === 1) return { entry, score: 520, matchField: 'title' }
    if (distance === 2) return { entry, score: 380, matchField: 'title' }
  }

  return null
}

export function compareSpotlightScores(a: ScoredEntry, b: ScoredEntry) {
  if (b.score !== a.score) return b.score - a.score
  const kindDelta = (KIND_TIEBREAK[b.entry.kind] ?? 0) - (KIND_TIEBREAK[a.entry.kind] ?? 0)
  if (kindDelta !== 0) return kindDelta
  return a.entry.title.localeCompare(b.entry.title)
}

export function uniqueSearchTerms(values: readonly (string | undefined | null)[]) {
  const seen = new Set<string>()
  const next: string[] = []
  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed) continue
    const key = normalizeSearchText(trimmed)
    if (!key || seen.has(key)) continue
    seen.add(key)
    next.push(trimmed)
  }
  return next
}

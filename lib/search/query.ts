import { buildSpotlightIndex } from './build-index'
import { compareSpotlightScores, scoreSpotlightEntry } from './score'
import type {
  SpotlightEntry,
  SpotlightGroup,
  SpotlightKind,
  SpotlightQueryResult,
  SpotlightResult,
} from './types'

const RESULT_LIMIT = 24
const GROUP_LIMIT = 8
const GROUP_THRESHOLD = 5

const KIND_GROUP: Record<SpotlightKind, SpotlightGroup> = {
  app: 'apps',
  project: 'projects',
  link: 'projects',
  'case-study': 'case-studies',
  'case-study-section': 'case-studies',
  skill: 'content',
  experience: 'content',
  education: 'content',
  credential: 'content',
  timeline: 'content',
  'recruiter-section': 'content',
  system: 'system',
}

function toResult(entry: SpotlightEntry, score: number, matchField: SpotlightResult['matchField']): SpotlightResult {
  return {
    id: entry.id,
    kind: entry.kind,
    group: KIND_GROUP[entry.kind],
    title: entry.title,
    subtitle: entry.subtitle,
    action: entry.action,
    iconAppId: entry.iconAppId,
    sourceProjectId: entry.sourceProjectId,
    score,
    matchField,
  }
}

export function getSpotlightEmptyState(
  extraEntries: readonly SpotlightEntry[] = [],
): SpotlightQueryResult {
  const index = [...buildSpotlightIndex(), ...extraEntries]
  const results = index
    .filter((entry) => entry.emptyOrder != null)
    .sort((a, b) => (a.emptyOrder ?? 99) - (b.emptyOrder ?? 99))
    .map((entry) => toResult(entry, 0, 'title'))

  return {
    query: '',
    results,
    grouped: false,
  }
}

export function querySpotlight(
  query: string,
  extraEntries: readonly SpotlightEntry[] = [],
): SpotlightQueryResult {
  const trimmed = query.trim()
  if (!trimmed) return getSpotlightEmptyState(extraEntries)

  const scored = [...buildSpotlightIndex(), ...extraEntries]
    .map((entry) => scoreSpotlightEntry(entry, trimmed))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .sort(compareSpotlightScores)
    .slice(0, RESULT_LIMIT)

  const results = scored.map((item) => toResult(item.entry, item.score, item.matchField))
  const groups = new Set(results.map((result) => result.group))

  return {
    query: trimmed,
    results,
    grouped: results.length >= GROUP_THRESHOLD && groups.size >= 2,
  }
}

export function limitGroupedResults(results: readonly SpotlightResult[]) {
  const counts: Partial<Record<SpotlightGroup, number>> = {}
  return results.filter((result) => {
    const used = counts[result.group] ?? 0
    if (used >= GROUP_LIMIT) return false
    counts[result.group] = used + 1
    return true
  })
}

export function groupSpotlightResults(results: readonly SpotlightResult[]) {
  const groups: { id: SpotlightGroup; label: string; results: SpotlightResult[] }[] = [
    { id: 'apps', label: 'Apps', results: [] },
    { id: 'projects', label: 'Projects', results: [] },
    { id: 'case-studies', label: 'Case Studies', results: [] },
    { id: 'content', label: 'Content', results: [] },
    { id: 'system', label: 'System', results: [] },
  ]

  for (const result of results) {
    const group = groups.find((item) => item.id === result.group)
    group?.results.push(result)
  }

  return groups
    .filter((group) => group.results.length > 0)
    .sort((a, b) => (b.results[0]?.score ?? 0) - (a.results[0]?.score ?? 0))
}

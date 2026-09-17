const PUNCTUATION = /[^\p{L}\p{N}]+/gu

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replace(PUNCTUATION, ' ').replace(/\s+/g, ' ').trim()
}

export function searchTokens(value: string) {
  const normalized = normalizeSearchText(value)
  return normalized ? normalized.split(' ') : []
}

export function compactSearchText(parts: readonly (string | undefined | null)[]) {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshtein(a: string, b: string, maxDistance: number) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

  const rows = a.length + 1
  const cols = b.length + 1
  let previous = new Array<number>(cols)
  let current = new Array<number>(cols)

  for (let j = 0; j < cols; j += 1) previous[j] = j

  for (let i = 1; i < rows; i += 1) {
    current[0] = i
    let rowMin = current[0]
    const aChar = a.charCodeAt(i - 1)
    for (let j = 1; j < cols; j += 1) {
      const cost = aChar === b.charCodeAt(j - 1) ? 0 : 1
      const insertion = (current[j - 1] ?? 0) + 1
      const deletion = (previous[j] ?? 0) + 1
      const substitution = (previous[j - 1] ?? 0) + cost
      const value = Math.min(insertion, deletion, substitution)
      current[j] = value
      if (value < rowMin) rowMin = value
    }
    if (rowMin > maxDistance) return maxDistance + 1
    const swap = previous
    previous = current
    current = swap
  }

  return previous[b.length] ?? maxDistance + 1
}

export function fuzzyDistance(query: string, candidate: string) {
  if (query.length < 4 || candidate.length < 4) return null
  const maxDistance = query.length <= 5 ? 1 : 2
  const distance = levenshtein(query, candidate, maxDistance)
  return distance <= maxDistance ? distance : null
}

export function includesPhrase(haystack: string, needle: string) {
  if (!needle) return false
  if (!needle.includes(' ')) return includesWord(haystack, needle)
  return ` ${haystack} `.includes(` ${needle} `)
}

export function includesWord(haystack: string, needle: string) {
  if (!needle) return false
  return ` ${haystack} `.includes(` ${needle} `)
}

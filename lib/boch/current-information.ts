/** Approved PUBLIC live retrieval for time-sensitive world facts. Not arbitrary model web access. */

export type CurrentInformationHit = {
  title: string
  snippet: string
  url: string
}

export type CurrentInformationResult = {
  ok: boolean
  query: string
  results: CurrentInformationHit[]
  retrievedAt: number
  sources: string[]
  provider: string
  unavailableReason?: string
}

export interface PublicCurrentInformationProvider {
  retrieve(query: string): Promise<CurrentInformationResult>
}

export class UnavailableCurrentInformationProvider implements PublicCurrentInformationProvider {
  async retrieve(query: string): Promise<CurrentInformationResult> {
    return {
      ok: false,
      query,
      results: [],
      retrievedAt: Date.now(),
      sources: [],
      provider: 'unavailable',
      unavailableReason: 'Current-information retrieval is not configured.',
    }
  }
}

export class RuntimeClockCurrentInformationProvider implements PublicCurrentInformationProvider {
  async retrieve(query: string): Promise<CurrentInformationResult> {
    const now = new Date()
    return {
      ok: true,
      query,
      results: [
        {
          title: 'Server clock (UTC)',
          snippet: `Today's UTC date is ${now.toISOString().slice(0, 10)}. Local ISO timestamp: ${now.toISOString()}.`,
          url: 'runtime://clock',
        },
      ],
      retrievedAt: now.getTime(),
      sources: ['CURRENT_RUNTIME'],
      provider: 'runtime-clock',
    }
  }
}

/** DuckDuckGo Instant Answer — keyless, PUBLIC, not a general browser for the model. */
export class DuckDuckGoCurrentInformationProvider implements PublicCurrentInformationProvider {
  async retrieve(query: string): Promise<CurrentInformationResult> {
    const q = String(query || '').trim().slice(0, 180)
    const lookup = normalizeCurrentQuery(q)
    if (!lookup) return new UnavailableCurrentInformationProvider().retrieve(query)
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(lookup)}&format=json&no_html=1&skip_disambig=1`
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8_000),
      })
      if (!response.ok && response.status !== 202) {
        return new WikipediaCurrentInformationProvider().retrieve(lookup)
      }
      const data = (await response.json()) as {
        Heading?: string
        AbstractText?: string
        AbstractURL?: string
        Answer?: string
        Results?: Array<{ Text?: string; FirstURL?: string }>
        RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>
      }
      const results: CurrentInformationHit[] = []
      const abstract = String(data.AbstractText || data.Answer || '').trim()
      if (abstract) {
        results.push({
          title: String(data.Heading || q).slice(0, 160),
          snippet: abstract.slice(0, 500),
          url: String(data.AbstractURL || 'https://duckduckgo.com').slice(0, 300),
        })
      }
      for (const item of [...(data.Results || []), ...(data.RelatedTopics || [])].slice(0, 4)) {
        const snippet = String(item.Text || '').trim()
        if (!snippet) continue
        results.push({
          title: snippet.slice(0, 80),
          snippet: snippet.slice(0, 400),
          url: String(item.FirstURL || '').slice(0, 300),
        })
      }
      if (results.length) {
        return {
          ok: true,
          query: q,
          results: results.slice(0, 5),
          retrievedAt: Date.now(),
          sources: results.map((hit) => hit.url).filter(Boolean),
          provider: 'duckduckgo',
        }
      }
      return new WikipediaCurrentInformationProvider().retrieve(lookup)
    } catch {
      return new WikipediaCurrentInformationProvider().retrieve(lookup)
    }
  }
}

/** Keyless Wikimedia API — still live retrieval, never model memory. */
export class WikipediaCurrentInformationProvider implements PublicCurrentInformationProvider {
  async retrieve(query: string): Promise<CurrentInformationResult> {
    const q = String(query || '').trim().slice(0, 180)
    const lookup = normalizeCurrentQuery(q)
    const timeout = Number(process.env.BOCH_RETRIEVAL_TIMEOUT_MS) || 8_000
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(lookup)}&limit=3&namespace=0&format=json`
      const search = await fetch(searchUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'JackOS-BOCH/1.0 (public portfolio assistant)' },
        signal: AbortSignal.timeout(timeout),
      })
      if (!search.ok) return unavailable(q, 'wikipedia', 'Live lookup failed.')
      const data = (await search.json()) as [string, string[], string[], string[]]
      const titles = Array.isArray(data[1]) ? data[1] : []
      const urls = Array.isArray(data[3]) ? data[3] : []
      const title = titles[0]
      if (!title) return unavailable(q, 'wikipedia', 'No live result for that.')
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'JackOS-BOCH/1.0 (public portfolio assistant)' },
        signal: AbortSignal.timeout(timeout),
      })
      if (!summaryRes.ok) return unavailable(q, 'wikipedia', 'Live lookup failed.')
      const summary = (await summaryRes.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } }
      const snippet = String(summary.extract || '').trim()
      if (!snippet) return unavailable(q, 'wikipedia', 'No live result for that.')
      const url = String(summary.content_urls?.desktop?.page || urls[0] || '')
      return {
        ok: true,
        query: q,
        results: [{ title, snippet: snippet.slice(0, 500), url: url.slice(0, 300) }],
        retrievedAt: Date.now(),
        sources: [url].filter(Boolean),
        provider: 'wikipedia',
      }
    } catch {
      return unavailable(q, 'wikipedia', 'Live lookup timed out.')
    }
  }
}

function unavailable(query: string, provider: string, reason: string): CurrentInformationResult {
  return {
    ok: false,
    query,
    results: [],
    retrievedAt: Date.now(),
    sources: [],
    provider,
    unavailableReason: reason,
  }
}

export class BraveCurrentInformationProvider implements PublicCurrentInformationProvider {
  constructor(private apiKey: string) {}

  async retrieve(query: string): Promise<CurrentInformationResult> {
    const q = String(query || '').trim().slice(0, 180)
    try {
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=5`, {
        headers: { Accept: 'application/json', 'X-Subscription-Token': this.apiKey },
        signal: AbortSignal.timeout(8_000),
      })
      if (!response.ok) {
        return new DuckDuckGoCurrentInformationProvider().retrieve(q)
      }
      const data = (await response.json()) as {
        web?: { results?: Array<{ title?: string; description?: string; url?: string }> }
      }
      const results = (data.web?.results || []).slice(0, 5).map((item) => ({
        title: String(item.title || '').slice(0, 160),
        snippet: String(item.description || '').slice(0, 400),
        url: String(item.url || '').slice(0, 300),
      }))
      return {
        ok: results.length > 0,
        query: q,
        results,
        retrievedAt: Date.now(),
        sources: results.map((hit) => hit.url),
        provider: 'brave',
      }
    } catch {
      return new DuckDuckGoCurrentInformationProvider().retrieve(q)
    }
  }
}

export function createCurrentInformationProvider(): PublicCurrentInformationProvider {
  const mode = (process.env.BOCH_CURRENT_PROVIDER || 'auto').toLowerCase()
  if (mode === 'off' || mode === '0' || mode === 'unavailable') return new UnavailableCurrentInformationProvider()
  if (mode === 'brave' || process.env.BRAVE_SEARCH_API_KEY) {
    const key = process.env.BRAVE_SEARCH_API_KEY
    if (key) return new BraveCurrentInformationProvider(key)
  }
  if (mode === 'clock') return new RuntimeClockCurrentInformationProvider()
  return new DuckDuckGoCurrentInformationProvider()
}

export function formatCurrentEvidence(result: CurrentInformationResult | null) {
  if (!result) return 'CURRENT INFORMATION: not requested.'
  if (!result.ok || !result.results.length) {
    return [
      'CURRENT INFORMATION: unavailable.',
      result.unavailableReason || 'Live lookup did not return evidence.',
      'You MUST NOT answer from pretrained memory. Say you cannot verify current information.',
    ].join(' ')
  }
  const retrieved = new Date(result.retrievedAt).toISOString()
  const lines = result.results.map((hit) => `- ${hit.title}: ${hit.snippet} (${hit.url})`)
  return [
    `CURRENT INFORMATION (retrieved ${retrieved} via ${result.provider}). This is the only allowed source for time-sensitive world facts this turn.`,
    ...lines,
    'If this evidence is insufficient, say you cannot verify. Do not substitute training-set memory (for example a former president).',
  ].join('\n')
}

function normalizeCurrentQuery(query: string) {
  return String(query || '')
    .replace(/[?!.,]+$/g, '')
    .replace(/^(who is|who'?s|what is|what'?s|whats|tell me)\s+/i, '')
    .trim()
    .slice(0, 180)
}

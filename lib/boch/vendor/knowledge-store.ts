const SCHEMA = 1

export const PUBLIC_KNOWLEDGE_TYPES = Object.freeze([
  'PROJECT',
  'SKILL',
  'EXPERIENCE',
  'EDUCATION',
  'BIO',
  'JACKOS_FEATURE',
  'BOCH_LORE',
  'FAQ',
  'LINK',
  'OTHER',
] as const)

export type PublicKnowledgeType = (typeof PUBLIC_KNOWLEDGE_TYPES)[number]

export type PublicKnowledgeRecord = {
  id: string
  type: PublicKnowledgeType
  title: string
  content: string
  tags: string[]
  aliases: string[]
  source: string
  updatedAt: number
  visibility: 'PUBLIC_SAFE'
  fields: Record<string, unknown>
  jackos: Record<string, unknown> | null
}

export type KnowledgeSearchHit = {
  id: string
  title: string
  type: PublicKnowledgeType
  excerpt: string
  source: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  record?: PublicKnowledgeRecord
}

export type PublicKnowledgeBundle = {
  schemaVersion: number
  records: unknown[]
}

export class PublicKnowledgeStore {
  private _byId = new Map<string, PublicKnowledgeRecord>()
  private _aliases = new Map<string, string>()
  status: 'READY' | 'ERROR' = 'READY'

  constructor({ records }: { records?: unknown[] } = {}) {
    if (records) this.importBundle({ schemaVersion: SCHEMA, records })
  }

  importBundle(bundle: PublicKnowledgeBundle) {
    if (!bundle || typeof bundle !== 'object') {
      this.status = 'ERROR'
      return { ok: false, imported: 0, error: 'Invalid bundle' }
    }
    const version = Number(bundle.schemaVersion || 1)
    if (version > SCHEMA) {
      return { ok: false, imported: 0, error: `Unsupported knowledge schemaVersion ${version}` }
    }
    const list = Array.isArray(bundle.records) ? bundle.records : []
    let imported = 0
    for (const raw of list) {
      const rec = normalizeRecord(raw)
      if (!rec) continue
      this._byId.set(rec.id, rec)
      for (const alias of rec.aliases) {
        this._aliases.set(alias.toLowerCase(), rec.id)
      }
      this._aliases.set(rec.title.toLowerCase(), rec.id)
      this._aliases.set(rec.id.toLowerCase(), rec.id)
      imported++
    }
    this.status = 'READY'
    return { ok: true, imported, schemaVersion: version }
  }

  clear() {
    this._byId.clear()
    this._aliases.clear()
  }

  getById(id: string) {
    return this._byId.get(String(id || '')) || null
  }

  getByType(type: string) {
    const t = String(type || '').toUpperCase()
    return [...this._byId.values()].filter((r) => r.type === t)
  }

  getByTag(tag: string) {
    const q = String(tag || '').toLowerCase()
    return [...this._byId.values()].filter((r) => r.tags.some((item) => item.toLowerCase() === q))
  }

  findNamed(text: string): PublicKnowledgeRecord[] {
    const hay = String(text || '').toLowerCase()
    if (!hay) return []
    const found: PublicKnowledgeRecord[] = []
    for (const rec of this._byId.values()) {
      const names = [rec.title, rec.id.replace(/^project-/, '').replace(/-/g, ' '), rec.id, ...(rec.aliases || [])]
      if (names.some((name) => {
        const n = String(name || '').toLowerCase().trim()
        if (n.length < 4) return false
        try {
          return new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(hay)
        } catch {
          return hay.includes(n)
        }
      })) {
        found.push(rec)
      }
    }
    return found
  }

  resolveAlias(alias: string) {
    const id = this._aliases.get(String(alias || '').toLowerCase().trim())
    return id ? this.getById(id) : null
  }

  search(query: string, { limit = 5, type = null as string | null } = {}): KnowledgeSearchHit[] {
    const q = String(query || '').toLowerCase().trim()
    if (!q) return []
    const tokens = tokenize(q)
    if (!tokens.length && q.length <= 3) return []
    const pool = type ? this.getByType(type) : [...this._byId.values()]
    const scored: Array<KnowledgeSearchHit & { _score: number; record: PublicKnowledgeRecord }> = []

    for (const rec of pool) {
      if (rec.visibility !== 'PUBLIC_SAFE') continue
      let score = 0
      const hay = [rec.title, rec.content, ...(rec.tags || []), ...(rec.aliases || []), rec.id]
        .join(' ')
        .toLowerCase()
      if (phraseMatch(hay, q)) score += 10
      for (const tok of tokens) {
        if (tokenMatch(hay, tok)) score += 2
        if (tokenMatch(rec.title.toLowerCase(), tok)) score += 3
        if ((rec.aliases || []).some((alias) => alias.toLowerCase() === tok || tokenMatch(alias.toLowerCase(), tok))) score += 4
        if ((rec.tags || []).some((tag) => tag.toLowerCase() === tok)) score += 6
      }
      if (score > 0) {
        scored.push({
          id: rec.id,
          title: rec.title,
          type: rec.type,
          excerpt: excerpt(rec.content, 220),
          source: rec.source || 'public-knowledge',
          confidence: score >= 10 ? 'HIGH' : score >= 5 ? 'MEDIUM' : 'LOW',
          record: rec,
          _score: score,
        })
      }
    }

    return scored
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score: _ignored, ...rest }) => rest)
  }

  getField(idOrAlias: string, field: string) {
    const rec = this.getById(idOrAlias) || this.resolveAlias(idOrAlias)
    if (!rec) return { ok: false, found: false as const }
    if (Object.prototype.hasOwnProperty.call(rec.fields || {}, field)) {
      return { ok: true, found: true as const, value: rec.fields[field], record: rec }
    }
    return { ok: false, found: false as const, record: rec, field }
  }

  list() {
    return [...this._byId.values()]
  }

  snapshot() {
    return { status: this.status, count: this._byId.size, types: PUBLIC_KNOWLEDGE_TYPES.slice() }
  }
}

function normalizeRecord(raw: unknown): PublicKnowledgeRecord | null {
  if (!raw || typeof raw !== 'object' || !('id' in raw)) return null
  const rec = raw as Record<string, unknown>
  const type = String(rec.type || 'OTHER').toUpperCase()
  if (!(PUBLIC_KNOWLEDGE_TYPES as readonly string[]).includes(type)) return null
  const visibility = String(rec.visibility || 'PUBLIC_SAFE')
  if (visibility !== 'PUBLIC_SAFE') return null
  return {
    id: String(rec.id).slice(0, 80),
    type: type as PublicKnowledgeType,
    title: String(rec.title || rec.id).slice(0, 160),
    content: String(rec.content || '').slice(0, 4000),
    tags: Array.isArray(rec.tags) ? rec.tags.map((t) => String(t).slice(0, 40)).slice(0, 20) : [],
    aliases: Array.isArray(rec.aliases) ? rec.aliases.map((a) => String(a).slice(0, 80)).slice(0, 20) : [],
    source: String(rec.source || 'fixture').slice(0, 80),
    updatedAt: Number(rec.updatedAt || Date.now()),
    visibility: 'PUBLIC_SAFE',
    fields: rec.fields && typeof rec.fields === 'object' ? (JSON.parse(JSON.stringify(rec.fields)) as Record<string, unknown>) : {},
    jackos: rec.jackos && typeof rec.jackos === 'object' ? (JSON.parse(JSON.stringify(rec.jackos)) as Record<string, unknown>) : null,
  }
}

const STOP_TOKENS = new Set([
  'hi',
  'hey',
  'hello',
  'yo',
  'sup',
  'ok',
  'okay',
  'please',
  'thanks',
  'thank',
  'the',
  'a',
  'an',
  'is',
  'are',
  'am',
  'was',
  'were',
  'be',
  'to',
  'of',
  'and',
  'or',
  'for',
  'on',
  'in',
  'it',
  'this',
  'that',
  'me',
  'my',
  'you',
  'your',
  'we',
  'what',
  'whats',
  'who',
  'how',
  'why',
  'when',
  'where',
  'do',
  'does',
  'did',
  'can',
  'could',
  'would',
  'should',
  'up',
  'so',
  'just',
  'like',
  'about',
  'tell',
])

function tokenize(q: string) {
  return q
    .replace(/[^a-z0-9\s+-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_TOKENS.has(token))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tokenMatch(hay: string, tok: string) {
  if (!tok) return false
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(tok)}([^a-z0-9]|$)`).test(hay)
}

function phraseMatch(hay: string, phrase: string) {
  if (phrase.length <= 3) return tokenMatch(hay, phrase)
  return hay.includes(phrase)
}

function excerpt(text: string, n: number) {
  const s = String(text || '')
  if (s.length <= n) return s
  return `${s.slice(0, n - 1).trim()}…`
}

export const PUBLIC_KNOWLEDGE_SCHEMA = SCHEMA

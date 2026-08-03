'use client'

import { useCallback, useEffect, useState } from 'react'
import type { GuestbookAdminEntry } from '@/lib/guestbook'

type ModerationStatus = GuestbookAdminEntry['status']

const STATUSES: ModerationStatus[] = ['pending', 'approved', 'rejected', 'blocked']
const TOKEN_KEY = 'jack-os:guestbook-admin-token'

export function GuestbookAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<ModerationStatus>('pending')
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState<GuestbookAdminEntry[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      setToken(window.sessionStorage.getItem(TOKEN_KEY) ?? '')
    } catch {
      setToken('')
    }
  }, [])

  const loadEntries = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setMessage('')
    try {
      const query = new URLSearchParams({ status, search })
      const response = await fetch(`/api/guestbook/admin?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const data = (await response.json()) as
        | { ok: true; entries: GuestbookAdminEntry[] }
        | { ok: false; message: string }
      if (!data.ok) {
        throw new Error(data.message)
      }
      setEntries(data.entries)
    } catch {
      setEntries([])
      setMessage('Unable to load moderation entries.')
    } finally {
      setLoading(false)
    }
  }, [search, status, token])

  useEffect(() => {
    void loadEntries()
  }, [loadEntries])

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabaseUrl || !supabaseAnonKey) {
      setMessage('Admin authentication is not configured.')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = (await response.json()) as { access_token?: string; error_description?: string }
      if (!response.ok || !data.access_token) {
        throw new Error(data.error_description ?? 'Sign in failed')
      }
      window.sessionStorage.setItem(TOKEN_KEY, data.access_token)
      setToken(data.access_token)
      setPassword('')
    } catch {
      setMessage('Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    try {
      window.sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      // Session storage is best-effort.
    }
    setToken('')
    setEntries([])
  }

  const moderate = async (entry: GuestbookAdminEntry, action: 'approve' | 'reject' | 'block') => {
    if (
      action !== 'approve' &&
      !window.confirm(`Confirm ${action} for ${entry.displayName}?`)
    ) {
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/guestbook/admin', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: entry.id, action }),
      })
      const data = (await response.json()) as { ok: boolean; message?: string }
      if (!data.ok) {
        throw new Error(data.message ?? 'Moderation failed')
      }
      setMessage(`Entry ${action}d.`)
      await loadEntries()
    } catch {
      setMessage('Moderation action failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-dvh bg-desktop p-6 text-foreground paper-texture">
        <section className="mx-auto mt-16 max-w-md overflow-hidden bg-paper os-border os-shadow-lg">
          <header className="flex h-8 items-center border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
            <span className="font-pixel text-[10px] leading-none">Guestbook Admin</span>
            <span aria-hidden className="titlebar-lines ml-3 h-3 flex-1 opacity-60" />
          </header>
          <form onSubmit={login} className="space-y-4 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Private moderation access for Jack OS.
            </p>
            <label className="block space-y-1.5">
              <span className="font-pixel text-[8px] leading-relaxed">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full os-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="font-pixel text-[8px] leading-relaxed">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full os-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </label>
            {message ? (
              <p role="status" className="text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="os-border w-full bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-desktop p-4 text-foreground paper-texture sm:p-6">
      <section className="mx-auto max-w-6xl overflow-hidden bg-paper os-border os-shadow-lg">
        <header className="flex h-8 items-center border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
          <span className="font-pixel text-[10px] leading-none">Guestbook Moderation</span>
          <span aria-hidden className="titlebar-lines ml-3 h-3 flex-1 opacity-60" />
          <button
            type="button"
            onClick={signOut}
            className="font-pixel text-[8px] leading-none hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign Out
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5">
              <span className="block font-pixel text-[8px] leading-relaxed">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ModerationStatus)}
                className="os-border bg-card px-2 py-2 font-pixel text-[8px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[220px] flex-1 space-y-1.5">
              <span className="block font-pixel text-[8px] leading-relaxed">Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full os-border bg-card px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <button
              type="button"
              onClick={() => loadEntries()}
              disabled={loading}
              className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground hover:bg-foreground hover:text-primary-foreground disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
            >
              Refresh
            </button>
          </div>

          {message ? (
            <p role="status" className="os-border bg-secondary p-2 text-sm leading-relaxed">
              {message}
            </p>
          ) : null}

          <div className="space-y-3">
            {entries.map((entry) => (
              <article key={entry.id} className="os-border bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-pixel text-[9px] leading-relaxed">{entry.displayName}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {entry.organization || 'No organization'} / {entry.userAgentCategory ?? 'unknown'}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{entry.message}</p>
                <details className="mt-3">
                  <summary className="cursor-pointer font-pixel text-[8px] leading-relaxed">
                    Review details
                  </summary>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
                        Original submitted text
                      </p>
                      <pre className="mt-1 max-h-36 overflow-auto os-border bg-paper p-2 text-xs leading-relaxed">
                        {entry.originalText}
                      </pre>
                    </div>
                    <div>
                      <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
                        Moderation flags
                      </p>
                      <pre className="mt-1 max-h-36 overflow-auto os-border bg-paper p-2 text-xs leading-relaxed">
                        {entry.moderationReason || 'None'}
                      </pre>
                    </div>
                  </div>
                </details>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moderate(entry, 'approve')}
                    className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed hover:bg-foreground hover:text-primary-foreground"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => moderate(entry, 'reject')}
                    className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed hover:bg-foreground hover:text-primary-foreground"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => moderate(entry, 'block')}
                    className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed hover:bg-foreground hover:text-primary-foreground"
                  >
                    Block
                  </button>
                </div>
              </article>
            ))}
            {!loading && entries.length === 0 ? (
              <p className="os-border bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">
                No entries found.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

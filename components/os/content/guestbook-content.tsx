'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GUESTBOOK_DISPLAY_NAME_LIMIT,
  GUESTBOOK_MESSAGE_LIMIT,
  GUESTBOOK_ORGANIZATION_LIMIT,
  GUESTBOOK_PUBLIC_GUIDELINES,
  type GuestbookEntriesResponse,
  type GuestbookFieldErrors,
  type GuestbookPublicEntry,
  type GuestbookSubmitResponse,
} from '@/lib/guestbook'
import { cn } from '@/lib/utils'

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
      theme?: 'light' | 'dark' | 'auto'
    },
  ) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export function GuestbookContent({ onSigned }: { onSigned: () => void }) {
  const [entries, setEntries] = useState<GuestbookPublicEntry[]>([])
  const [entryQuery, setEntryQuery] = useState('')
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [entriesError, setEntriesError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [organization, setOrganization] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitDetail, setSubmitDetail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<GuestbookFieldErrors>({})
  const signSoundPlayedForSubmission = useRef(false)

  const loadEntries = useCallback(async (page = 0, mode: 'replace' | 'append' = 'replace') => {
    setLoadingEntries(true)
    setEntriesError('')
    try {
      const response = await fetch(`/api/guestbook/entries?page=${page}`, {
        cache: 'no-store',
      })
      const data = (await response.json()) as GuestbookEntriesResponse
      if (!data.ok) {
        throw new Error(data.message)
      }
      setEntries((current) => (mode === 'append' ? [...current, ...data.entries] : data.entries))
      setNextPage(data.nextPage)
    } catch {
      setEntriesError('The Guestbook is temporarily unavailable. Please try again later.')
    } finally {
      setLoadingEntries(false)
    }
  }, [])

  useEffect(() => {
    void loadEntries()
  }, [loadEntries])

  const canSubmit = useMemo(
    () =>
      displayName.trim().length >= 2 &&
      message.trim().length >= 5 &&
      consent &&
      Boolean(turnstileToken) &&
      !submitting,
    [consent, displayName, message, submitting, turnstileToken],
  )
  const visibleEntries = useMemo(() => {
    const query = entryQuery.trim().toLowerCase()
    if (!query) return entries
    return entries.filter((entry) =>
      [entry.displayName, entry.organization ?? '', entry.message]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [entries, entryQuery])

  const resetTurnstile = () => {
    setTurnstileToken('')
    setTurnstileResetKey((value) => value + 1)
  }
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])
  const handleTurnstileReset = useCallback(() => {
    setTurnstileToken('')
  }, [])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitMessage('')
    setSubmitDetail('')
    setFieldErrors({})
    signSoundPlayedForSubmission.current = false

    try {
      const response = await fetch('/api/guestbook/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          organization,
          message,
          consent,
          turnstileToken,
        }),
      })
      const data = (await response.json()) as GuestbookSubmitResponse
      if (!data.ok) {
        setSubmitMessage(data.message)
        setSubmitDetail('')
        setFieldErrors(data.fieldErrors ?? {})
        resetTurnstile()
        return
      }

      setSubmitMessage(data.message)
      setSubmitDetail(data.detail)
      setDisplayName('')
      setOrganization('')
      setMessage('')
      setConsent(false)
      resetTurnstile()
      if (!signSoundPlayedForSubmission.current) {
        signSoundPlayedForSubmission.current = true
        onSigned()
      }
    } catch {
      setSubmitMessage('The Guestbook is temporarily unavailable. Please try again later.')
      resetTurnstile()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col gap-4">
      <header className="os-border bg-secondary p-3">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Jack OS Guestbook
        </p>
        <h3 className="mt-1 font-pixel text-[13px] leading-relaxed text-foreground">
          Visitor Log
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Leave a message in the Jack OS visitor log. Entries appear after review.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
          Messages are reviewed before publication. Jack OS does not publicly display IP
          addresses or require a visitor account.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3" aria-labelledby="guestbook-approved-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              id="guestbook-approved-heading"
              className="font-pixel text-[10px] leading-relaxed text-foreground"
            >
              Approved Entries
            </h4>
            <button
              type="button"
              onClick={() => loadEntries()}
              className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              Refresh
            </button>
          </div>

          <label className="block space-y-1.5">
            <span className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Search loaded entries
            </span>
            <input
              value={entryQuery}
              onChange={(event) => setEntryQuery(event.target.value)}
              className="w-full os-border bg-card px-2 py-2 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          {entriesError ? (
            <p className="os-border bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">
              {entriesError}
            </p>
          ) : null}

          {loadingEntries && entries.length === 0 ? (
            <p className="os-border bg-secondary p-3 font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Reading visitor log...
            </p>
          ) : null}

          {!loadingEntries && entries.length === 0 && !entriesError ? (
            <p className="os-border bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">
              No approved entries are visible yet.
            </p>
          ) : null}

          <ol className="space-y-3">
            {visibleEntries.map((entry) => (
              <li key={entry.id} className="os-border bg-card p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-border pb-2">
                  <div className="min-w-0">
                    <p className="font-pixel text-[9px] leading-relaxed text-foreground">
                      {entry.displayName}
                    </p>
                    {entry.organization ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {entry.organization}
                      </p>
                    ) : null}
                  </div>
                  <time className="text-xs leading-relaxed text-muted-foreground">
                    {formatGuestbookDate(entry.signedAt)}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground text-pretty">
                  {entry.message}
                </p>
              </li>
            ))}
          </ol>

          {entryQuery && visibleEntries.length === 0 ? (
            <p className="os-border bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">
              No loaded entries match that search.
            </p>
          ) : null}

          {nextPage !== null ? (
            <button
              type="button"
              onClick={() => loadEntries(nextPage, 'append')}
              disabled={loadingEntries}
              className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
            >
              {loadingEntries ? 'Loading...' : 'Load More'}
            </button>
          ) : null}
        </section>

        <aside className="space-y-3">
          <section className="os-border bg-secondary p-3">
            <h4 className="font-pixel text-[10px] leading-relaxed text-foreground">
              Guidelines
            </h4>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {GUESTBOOK_PUBLIC_GUIDELINES.map((guideline) => (
                <li key={guideline} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 bg-current" />
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </section>

          <form onSubmit={submit} className="os-border space-y-3 bg-card p-3">
            <h4 className="font-pixel text-[10px] leading-relaxed text-foreground">
              Sign the Log
            </h4>
            <GuestbookField
              id="guestbook-display-name"
              label="Display name"
              value={displayName}
              maxLength={GUESTBOOK_DISPLAY_NAME_LIMIT}
              error={fieldErrors.displayName}
              onChange={setDisplayName}
              required
            />
            <GuestbookField
              id="guestbook-organization"
              label="Organization or role"
              value={organization}
              maxLength={GUESTBOOK_ORGANIZATION_LIMIT}
              error={fieldErrors.organization}
              onChange={setOrganization}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="guestbook-message"
                className="block font-pixel text-[8px] leading-relaxed text-foreground"
              >
                Message
              </label>
              <textarea
                id="guestbook-message"
                value={message}
                maxLength={GUESTBOOK_MESSAGE_LIMIT}
                rows={5}
                required
                onChange={(event) => setMessage(event.target.value)}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'guestbook-message-error' : undefined}
                className="w-full resize-none os-border bg-paper px-2 py-2 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {message.length}/{GUESTBOOK_MESSAGE_LIMIT}
              </p>
              {fieldErrors.message ? (
                <p id="guestbook-message-error" className="text-xs leading-relaxed text-destructive">
                  {fieldErrors.message}
                </p>
              ) : null}
            </div>

            <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-foreground"
              />
              <span>
                I understand that approved entries may appear publicly in the Jack OS Guestbook.
              </span>
            </label>
            {fieldErrors.consent ? (
              <p className="text-xs leading-relaxed text-destructive">{fieldErrors.consent}</p>
            ) : null}

            <TurnstileBox
              resetKey={turnstileResetKey}
              onToken={handleTurnstileToken}
              onReset={handleTurnstileReset}
            />

            <div aria-live="polite" className="min-h-10">
              {submitMessage ? (
                <div
                  className={cn(
                    'os-border p-2 text-sm leading-relaxed',
                    submitMessage === 'Message received.'
                      ? 'bg-secondary text-foreground'
                      : 'bg-paper text-muted-foreground',
                  )}
                >
                  <p className="font-pixel text-[8px] leading-relaxed">{submitMessage}</p>
                  {submitDetail ? <p className="mt-1 text-xs">{submitDetail}</p> : null}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="os-border w-full bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}

function GuestbookField({
  id,
  label,
  value,
  maxLength,
  error,
  required = false,
  onChange,
}: {
  id: string
  label: string
  value: string
  maxLength: number
  error?: string
  required?: boolean
  onChange: (value: string) => void
}) {
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-pixel text-[8px] leading-relaxed text-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full os-border bg-paper px-2 py-2 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {value.length}/{maxLength}
      </p>
      {error ? (
        <p id={errorId} className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function TurnstileBox({
  resetKey,
  onToken,
  onReset,
}: {
  resetKey: number
  onToken: (token: string) => void
  onReset: () => void
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetId = useRef<string | null>(null)
  const [readyMessage, setReadyMessage] = useState('')

  useEffect(() => {
    if (!siteKey) {
      setReadyMessage(
        process.env.NODE_ENV !== 'production'
          ? 'Turnstile site key required for local signing.'
          : 'Guestbook signing is temporarily unavailable.',
      )
      onReset()
      return
    }

    if (process.env.NODE_ENV !== 'production' && siteKey === 'dev-bypass') {
      setReadyMessage('Local verification bypass enabled.')
      onToken('dev-bypass-token')
      return
    }

    let cancelled = false

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      if (widgetId.current) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'auto',
        callback: onToken,
        'expired-callback': onReset,
        'error-callback': onReset,
      })
      setReadyMessage('')
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-jack-os-turnstile="true"]',
      )
      const script = existingScript ?? document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.dataset.jackOsTurnstile = 'true'
      script.addEventListener('load', renderWidget, { once: true })
      script.addEventListener(
        'error',
        () => {
          setReadyMessage('Verification could not load. Try again later.')
          onReset()
        },
        { once: true },
      )
      if (!existingScript) {
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
      }
      widgetId.current = null
    }
  }, [onReset, onToken, resetKey, siteKey])

  return (
    <div className="space-y-2">
      <p className="font-pixel text-[8px] leading-relaxed text-foreground">
        Verification
      </p>
      <div ref={containerRef} className="min-h-[70px] max-w-full overflow-hidden os-border bg-paper p-2" />
      {readyMessage ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{readyMessage}</p>
      ) : null}
    </div>
  )
}

function formatGuestbookDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Reviewed'

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

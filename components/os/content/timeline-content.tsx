'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { WindowId } from '../apps'
import {
  TIMELINE_CATEGORIES,
  TIMELINE_ENTRIES,
  type TimelineCategory,
  type TimelineEntry,
} from '@/lib/timeline-data'
import { cn } from '@/lib/utils'

type TimelineFilter = 'All' | TimelineCategory
type TimelineSortOrder = 'oldest' | 'newest'

export function TimelineContent({ onOpen }: { onOpen: (id: WindowId) => void }) {
  const [filter, setFilter] = useState<TimelineFilter>('All')
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>('oldest')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(TIMELINE_ENTRIES.filter((entry) => entry.featured).map((entry) => entry.id)),
  )

  const entries = useMemo(() => {
    const filteredEntries =
      filter === 'All'
        ? TIMELINE_ENTRIES
        : TIMELINE_ENTRIES.filter((entry) => entry.category === filter)
    const direction = sortOrder === 'oldest' ? 1 : -1

    return [...filteredEntries].sort((a, b) => {
      return (a.order - b.order) * direction
    })
  }, [filter, sortOrder])

  const toggleEntry = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1040px] flex-col gap-4">
      <header className="os-border bg-secondary p-3">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          SYSTEM HISTORY
        </p>
        <h3 className="mt-1 font-pixel text-[13px] leading-relaxed text-foreground">
          Timeline
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          A chronological system history of Jack OS and the public work, credentials, and
          milestones behind it.
        </p>
      </header>

      <section
        aria-label="Timeline controls"
        className="flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-wrap gap-2" aria-label="Timeline filters">
          {(['All', ...TIMELINE_CATEGORIES] as const).map((item) => {
            const selected = item === filter
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item)}
                className={cn(
                  'os-border px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'bg-foreground text-primary-foreground'
                    : 'bg-card text-foreground hover:bg-foreground hover:text-primary-foreground',
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          aria-pressed={sortOrder === 'newest'}
          onClick={() => setSortOrder((current) => (current === 'oldest' ? 'newest' : 'oldest'))}
          className="os-border bg-card px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {sortOrder === 'oldest' ? '↑ Oldest First' : '↓ Newest First'}
        </button>
      </section>

      <p role="status" className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
        Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}.
      </p>

      <ol
        className="space-y-3"
        aria-label={`Jack OS system history, ${sortOrder === 'oldest' ? 'oldest first' : 'newest first'}`}
      >
        {entries.map((entry) => (
          <TimelineCard
            key={entry.id}
            entry={entry}
            expanded={expandedIds.has(entry.id)}
            onToggle={() => toggleEntry(entry.id)}
            onOpen={onOpen}
          />
        ))}
      </ol>
    </div>
  )
}

function TimelineCard({
  entry,
  expanded,
  onToggle,
  onOpen,
}: {
  entry: TimelineEntry
  expanded: boolean
  onToggle: () => void
  onOpen: (id: WindowId) => void
}) {
  const detailsId = `timeline-entry-${entry.id}`
  const actions = entry.actions ?? (entry.action ? [entry.action] : [])

  return (
    <li className="grid gap-2 sm:grid-cols-[90px_minmax(0,1fr)]">
      <div className="os-border flex items-center justify-between bg-secondary px-2 py-2 sm:block">
        <p className="font-pixel text-[10px] leading-relaxed text-foreground">{entry.year}</p>
        {entry.month ? (
          <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">
            {entry.month}
          </p>
        ) : null}
      </div>

      <article
        className={cn(
          'os-border bg-card p-3',
          entry.featured ? 'outline outline-2 outline-offset-[-6px] outline-border' : null,
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {entry.category}
            </p>
            <h4 className="mt-1 font-pixel text-[10px] leading-relaxed text-foreground">
              {entry.title}
            </h4>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {entry.badge ? (
              <span className="os-border bg-foreground px-2 py-1 font-pixel text-[7px] leading-none text-primary-foreground">
                {entry.badge}
              </span>
            ) : null}
            {entry.featured ? (
              <span className="os-border bg-secondary px-2 py-1 font-pixel text-[7px] leading-none text-foreground">
                Featured
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {entry.summary}
        </p>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
          className="os-border mt-3 bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>

        <div
          id={detailsId}
          hidden={!expanded}
          className="mt-3 border-t-2 border-border pt-3 motion-safe:animate-fade-in"
        >
          <p className="text-sm leading-relaxed text-foreground text-pretty">
            {entry.description}
          </p>

          {entry.releaseHighlights ? (
            <section className="mt-3 os-border bg-secondary p-3">
              <h5 className="font-pixel text-[8px] leading-relaxed text-foreground">
                Release Highlights
              </h5>
              <div className="mt-2 grid gap-3 lg:grid-cols-3">
                {entry.releaseHighlights.map((group) => (
                  <article key={group.title} className="min-w-0">
                    <p className="font-pixel text-[7px] leading-relaxed text-foreground">
                      {group.title}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                      {group.items.map((item) => (
                        <li key={item} className="flex min-w-0 gap-2">
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                          <span className="min-w-0 break-words">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {actions.length > 0 || entry.externalLink ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action) => (
                <button
                  key={`${entry.id}-${action.target}`}
                  type="button"
                  onClick={() => onOpen(action.target as WindowId)}
                  className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
                >
                  {action.label}
                </button>
              ))}
              {entry.externalLink ? (
                <a
                  href={entry.externalLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="os-border inline-flex items-center gap-1.5 bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
                >
                  <span>{entry.externalLink.label}</span>
                  <ExternalLink aria-hidden className="size-3" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </li>
  )
}

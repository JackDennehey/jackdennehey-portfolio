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

export function TimelineContent({ onOpen }: { onOpen: (id: WindowId) => void }) {
  const [filter, setFilter] = useState<TimelineFilter>('All')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(TIMELINE_ENTRIES.filter((entry) => entry.featured).map((entry) => entry.id)),
  )

  const entries = useMemo(
    () => (filter === 'All' ? TIMELINE_ENTRIES : TIMELINE_ENTRIES.filter((entry) => entry.category === filter)),
    [filter],
  )

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
          A chronological visitor log of Jack&apos;s public education, credentials, projects, and
          Jack OS milestones.
        </p>
      </header>

      <section aria-label="Timeline filters" className="flex flex-wrap gap-2">
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
      </section>

      <p role="status" className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
        Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}.
      </p>

      <ol className="space-y-3" aria-label="Jack OS system history, newest first">
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
          {entry.featured ? (
            <span className="os-border shrink-0 bg-secondary px-2 py-1 font-pixel text-[7px] leading-none text-foreground">
              Featured
            </span>
          ) : null}
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
          {entry.action || entry.externalLink ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.action ? (
                <button
                  type="button"
                  onClick={() => onOpen(entry.action!.target as WindowId)}
                  className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
                >
                  {entry.action.label}
                </button>
              ) : null}
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

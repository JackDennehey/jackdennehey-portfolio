'use client'

import { useMemo, useState } from 'react'
import type { WindowId } from '../apps'
import { ROADMAP_SECTIONS, ROADMAP_TRACK, type RoadmapSection } from '@/lib/roadmap-data'
import { cn } from '@/lib/utils'

type RoadmapContentProps = {
  onOpen: (id: WindowId) => void
  onAskAssistant: (question: string) => void
}

export function RoadmapContent({ onOpen, onAskAssistant }: RoadmapContentProps) {
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<RoadmapSection['id']>>(
    () => new Set(),
  )
  const [refreshCount, setRefreshCount] = useState(0)
  const refreshLabel = useMemo(
    () => (refreshCount === 0 ? 'Ready' : `Display refreshed ${refreshCount}x`),
    [refreshCount],
  )

  const toggleSection = (id: RoadmapSection['id']) => {
    setCollapsedSectionIds((current) => {
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
    <div className="mx-auto flex min-h-full w-full max-w-[980px] flex-col gap-4">
      <header className="os-border bg-secondary p-3">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          ACTIVE TRACK: {ROADMAP_TRACK.label}
        </p>
        <h3 className="mt-1 font-pixel text-[13px] leading-relaxed text-foreground">
          ROADMAP.EXE
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          A professional deployment track for Jack&apos;s current studies, planned learning,
          and long-term technology direction.
        </p>
        <dl className="mt-3 grid gap-2 text-xs leading-relaxed sm:grid-cols-2">
          <div className="os-border bg-card px-2 py-1.5">
            <dt className="font-pixel text-[7px] text-muted-foreground">STATUS</dt>
            <dd className="mt-1 text-foreground">{ROADMAP_TRACK.status}</dd>
          </div>
          <div className="os-border bg-card px-2 py-1.5">
            <dt className="font-pixel text-[7px] text-muted-foreground">LOG</dt>
            <dd className="mt-1 text-foreground">{refreshLabel}</dd>
          </div>
        </dl>
      </header>

      <nav
        aria-label="Road Map actions"
        className="flex flex-wrap gap-2 os-border bg-card p-2"
      >
        <RoadmapAction onClick={() => onOpen('certifications')}>Open Credentials</RoadmapAction>
        <RoadmapAction onClick={() => onOpen('projects')}>Open Projects</RoadmapAction>
        <RoadmapAction onClick={() => onOpen('timeline')}>Open Timeline</RoadmapAction>
        <RoadmapAction onClick={() => onOpen('recruiter')}>Open Recruiter Mode</RoadmapAction>
        <RoadmapAction onClick={() => onAskAssistant('What is Jack working toward?')}>
          Ask J.D. about goals
        </RoadmapAction>
        <RoadmapAction onClick={() => setRefreshCount((count) => count + 1)}>
          Refresh Log
        </RoadmapAction>
      </nav>

      <div className="grid gap-3">
        {ROADMAP_SECTIONS.map((section, index) => {
          const sectionPanelId = `roadmap-section-${section.id}`
          const collapsed = collapsedSectionIds.has(section.id)

          return (
            <section key={section.id} className="os-border bg-card">
              <button
                type="button"
                aria-expanded={!collapsed}
                aria-controls={sectionPanelId}
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-start gap-3 border-b-2 border-border bg-secondary px-3 py-3 text-left transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                <span className="os-border grid size-8 shrink-0 place-items-center bg-paper font-pixel text-[9px] text-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-pixel text-[9px] leading-relaxed">
                    {section.label}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed opacity-80">
                    {section.summary}
                  </span>
                </span>
                <span className="font-pixel text-[8px] leading-relaxed">
                  {collapsed ? 'Open' : 'Close'}
                </span>
              </button>

              <div
                id={sectionPanelId}
                hidden={collapsed}
                className="grid gap-2 p-3 motion-safe:animate-fade-in md:grid-cols-2"
              >
                {section.items.map((item) => (
                  <article
                    key={item.id}
                    className="os-border flex min-h-40 min-w-0 flex-col bg-secondary p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="min-w-0 font-pixel text-[9px] leading-relaxed text-foreground">
                        {item.title}
                      </h4>
                      <span
                        className={cn(
                          'os-border shrink-0 px-2 py-1 font-pixel text-[7px] leading-none',
                          item.status === 'Planned'
                            ? 'bg-card text-muted-foreground'
                            : 'bg-foreground text-primary-foreground',
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 ? (
                      <ul className="mt-auto flex flex-wrap gap-1.5 pt-3" aria-label="Related areas">
                        {item.tags.map((tag) => (
                          <li
                            key={tag}
                            className="os-border bg-card px-2 py-1 font-pixel text-[7px] leading-none text-foreground"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function RoadmapAction({
  children,
  onClick,
}: {
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="os-border bg-card px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}

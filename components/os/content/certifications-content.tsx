'use client'

import { useState } from 'react'
import { CREDENTIALS, type Credential } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

export function CertificationsContent() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const completedCount = CREDENTIALS.filter((credential) =>
    credential.status.startsWith('Earned'),
  ).length
  const inProgressCount = CREDENTIALS.filter(
    (credential) => credential.status === 'In Progress',
  ).length
  const plannedCount = CREDENTIALS.filter((credential) => credential.status === 'Planned').length

  const toggleCredential = (id: string) => {
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
    <div className="space-y-4">
      <section className="os-border bg-secondary p-4">
        <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'> credentials'}
        </p>
        <h2 className="mt-3 font-pixel text-base leading-relaxed text-foreground">
          Credentials
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Completed credentials are separated from current study paths and planned milestones.
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs leading-relaxed">
          <div className="os-border bg-card p-2">
            <dt className="font-pixel text-[7px] text-muted-foreground">Completed</dt>
            <dd className="mt-1 font-semibold text-foreground">{completedCount}</dd>
          </div>
          <div className="os-border bg-card p-2">
            <dt className="font-pixel text-[7px] text-muted-foreground">In Progress</dt>
            <dd className="mt-1 font-semibold text-foreground">{inProgressCount}</dd>
          </div>
          <div className="os-border bg-card p-2">
            <dt className="font-pixel text-[7px] text-muted-foreground">Planned</dt>
            <dd className="mt-1 font-semibold text-foreground">{plannedCount}</dd>
          </div>
        </dl>
      </section>
      {CREDENTIALS.map((credential) => (
        <CredentialCard
          key={credential.id}
          credential={credential}
          expanded={expandedIds.has(credential.id)}
          onToggle={() => toggleCredential(credential.id)}
        />
      ))}
    </div>
  )
}

function CredentialCard({
  credential,
  expanded,
  onToggle,
}: {
  credential: Credential
  expanded: boolean
  onToggle: () => void
}) {
  const panelId = `credential-panel-${credential.id}`
  const isFeatured = Boolean(credential.featured)
  const statusClass =
    credential.status === 'Planned'
      ? 'bg-secondary text-muted-foreground'
      : credential.status === 'In Progress'
        ? 'bg-card text-foreground'
        : 'bg-foreground text-primary-foreground'

  return (
    <article
      className={cn(
        'os-border bg-card p-3 text-foreground',
        isFeatured ? 'credential-featured p-4 sm:p-5' : null,
      )}
    >
      <div className="flex min-w-0 gap-3">
        <div
          aria-hidden
          className={cn(
            'os-border flex size-10 shrink-0 items-center justify-center bg-secondary font-pixel text-[8px] leading-none',
            isFeatured ? 'credential-honors-marker size-12 text-[8px]' : null,
          )}
        >
          {credential.marker}
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="group flex w-full min-w-0 items-start justify-between gap-3 text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0 space-y-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-pixel text-[10px] leading-relaxed text-foreground sm:text-[11px]">
                  {credential.title}
                </span>
                <span className={cn('os-border px-1.5 py-0.5 text-[10px] font-medium', statusClass)}>
                  {credential.status}
                </span>
              </span>
              {credential.honor ? (
                <span className="block font-pixel text-[8px] leading-relaxed text-muted-foreground">
                  {credential.honor}
                </span>
              ) : null}
              <span className="block text-xs font-medium leading-relaxed text-muted-foreground">
                {credential.issuer}
              </span>
              {credential.context ? (
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {credential.context}
                </span>
              ) : null}
              {credential.date ? (
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {credential.date}
                </span>
              ) : null}
            </span>

            <span
              aria-hidden
              className={cn(
                'os-border mt-0.5 flex size-7 shrink-0 items-center justify-center bg-secondary font-pixel text-[12px] leading-none transition-transform group-hover:bg-foreground group-hover:text-primary-foreground',
                expanded ? 'rotate-45' : null,
              )}
            >
              +
            </span>
          </button>

          {isFeatured && credential.verification ? (
            <a
              href={credential.verification.url}
              target="_blank"
              rel="noopener noreferrer"
              className="os-border mt-3 inline-flex max-w-full bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              <span className="truncate">{credential.verification.label}</span>
            </a>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div
          id={panelId}
          className="animate-credential-reveal mt-4 space-y-3 border-t-2 border-border pt-3"
        >
          {credential.sections.map((section) => (
            <section key={section.heading} className="space-y-1.5">
              <h4 className="font-pixel text-[8px] leading-relaxed text-foreground">
                {section.heading}
              </h4>
              {section.body ? (
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {section.body}
                </p>
              ) : null}
              {section.items ? (
                <ul className="grid gap-1 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex min-w-0 gap-2">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {!isFeatured && credential.verification ? (
            <a
              href={credential.verification.url}
              target="_blank"
              rel="noopener noreferrer"
              className="os-border inline-flex max-w-full bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              <span className="truncate">{credential.verification.label}</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

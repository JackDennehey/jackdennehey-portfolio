'use client'

import type { MouseEvent } from 'react'
import { JDEN_STUDIOS_COPY } from '@/lib/jden-studios'
import { JdenDestinationLink, JdenOwlMark } from '../jden-launch'

export function JdenStudiosContent({
  onEnterStudio,
  onOpenPocketPier,
}: {
  onEnterStudio: (event: MouseEvent<HTMLAnchorElement>) => void
  onOpenPocketPier: () => void
}) {
  return (
    <div className="mx-auto grid w-full max-w-[720px] gap-4">
      <section className="os-border bg-secondary p-3">
        <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-start">
          <div className="os-border mx-auto grid size-24 place-items-center overflow-hidden bg-foreground sm:mx-0">
            <JdenOwlMark size="artifact" className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <h3 className="font-pixel text-[15px] leading-relaxed text-foreground">
              {JDEN_STUDIOS_COPY.title}
            </h3>
            <p className="mt-1 font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {JDEN_STUDIOS_COPY.subtitle}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {JDEN_STUDIOS_COPY.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="os-border bg-card p-3" aria-label="Jack OS to JDEN STUDIOS relationship">
        <ol className="grid gap-2">
          {JDEN_STUDIOS_COPY.relationship.map((item, index) => (
            <li key={item.label}>
              {index > 0 ? (
                <p aria-hidden className="mb-2 text-center font-pixel text-[8px] text-muted-foreground">
                  ↓
                </p>
              ) : null}
              <div className="os-border bg-secondary px-2 py-1.5">
                <p className="font-pixel text-[8px] leading-relaxed text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="os-border bg-card p-3">
          <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
            {JDEN_STUDIOS_COPY.clientWork.title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
            {JDEN_STUDIOS_COPY.clientWork.lead}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {JDEN_STUDIOS_COPY.clientWork.detail}
          </p>
        </article>
        <article className="os-border bg-card p-3">
          <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
            {JDEN_STUDIOS_COPY.studioProducts.title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
            {JDEN_STUDIOS_COPY.studioProducts.lead}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {JDEN_STUDIOS_COPY.studioProducts.detail}
          </p>
        </article>
      </section>

      <section className="os-border bg-secondary p-3">
        <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {JDEN_STUDIOS_COPY.facts.map(([label, value]) => (
            <div key={label} className="os-border min-w-0 bg-card px-2 py-1.5">
              <dt className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="os-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <JdenDestinationLink
            onLaunch={onEnterStudio}
            className="os-border inline-flex min-h-10 items-center bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:bg-background focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {JDEN_STUDIOS_COPY.enterLabel}
          </JdenDestinationLink>
          <button
            type="button"
            onClick={onOpenPocketPier}
            className="os-border inline-flex min-h-10 items-center bg-secondary px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            {JDEN_STUDIOS_COPY.pocketPierLabel}
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {JDEN_STUDIOS_COPY.enterHint}
        </p>
      </section>
    </div>
  )
}

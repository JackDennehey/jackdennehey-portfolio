'use client'

import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { POCKET_PIER_COPY } from '@/lib/pocket-pier'

type MediaImageProps = {
  src: string
  alt: string
  className: string
}

function MediaImage({ src, alt, className }: MediaImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="grid h-full min-h-32 w-full place-items-center bg-secondary px-3 text-center font-pixel text-[8px] leading-relaxed text-muted-foreground">
        Media unavailable
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}

export function PocketPierContent() {
  return (
    <div className="mx-auto grid w-full max-w-[1040px] gap-4">
      <section className="os-border bg-secondary p-3">
        <div className="grid gap-4 md:grid-cols-[164px_minmax(0,1fr)]">
          <div className="os-border grid aspect-square place-items-center overflow-hidden bg-card p-2">
            <MediaImage
              src={POCKET_PIER_COPY.assets.icon.src}
              alt={POCKET_PIER_COPY.assets.icon.alt}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {POCKET_PIER_COPY.subtitle}
            </p>
            <h3 className="mt-1 font-pixel text-[15px] leading-relaxed text-foreground">
              {POCKET_PIER_COPY.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {POCKET_PIER_COPY.intro}
            </p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Platform', POCKET_PIER_COPY.platform],
                ['Engine', POCKET_PIER_COPY.engine],
                ['Language', POCKET_PIER_COPY.language],
                ['Studio', POCKET_PIER_COPY.studio],
                ['Role', POCKET_PIER_COPY.role],
                ['Status', POCKET_PIER_COPY.status],
              ].map(([label, value]) => (
                <div key={label} className="os-border bg-card px-2 py-1.5">
                  <dt className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4">
          <InfoSection title="What is it?">
            {POCKET_PIER_COPY.whatItIs}
          </InfoSection>
          <InfoSection title="What was built?">
            {POCKET_PIER_COPY.whatWasBuilt}
          </InfoSection>
          <InfoSection title="How was it built?">
            {POCKET_PIER_COPY.howItWasBuilt}
          </InfoSection>
          <InfoSection title="Why is it important?">
            {POCKET_PIER_COPY.whyItMatters}
          </InfoSection>
        </div>

        <section className="os-border bg-card p-3">
          <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
            From Idea to Product
          </h4>
          <ol className="mt-3 grid gap-2" aria-label="Pocket Pier development lifecycle">
            {POCKET_PIER_COPY.lifecycle.map((step, index) => (
              <li key={step} className="flex min-w-0 items-center gap-2">
                <span className="os-border grid size-6 shrink-0 place-items-center bg-secondary font-pixel text-[8px] text-foreground">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <section className="os-border bg-card p-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Pocket Pier Media
            </p>
            <h4 className="font-pixel text-[10px] leading-relaxed text-foreground">
              Gameplay Screens
            </h4>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Color artwork is shown as project media inside the Jack OS interface.
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {POCKET_PIER_COPY.assets.screenshots.map((screenshot) => (
            <figure key={screenshot.id} className="min-w-0">
              <div className="os-border mx-auto aspect-[9/16] max-h-[420px] overflow-hidden bg-secondary p-1">
                <MediaImage
                  src={screenshot.src}
                  alt={screenshot.alt}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <figcaption className="mt-2 text-center font-pixel text-[8px] leading-relaxed text-muted-foreground">
                {screenshot.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListSection title="The Project" items={POCKET_PIER_COPY.gameplayLoop} />
        <ListSection title="Development" items={POCKET_PIER_COPY.developmentHighlights} />
      </section>

      {POCKET_PIER_COPY.links.length > 0 ? (
        <section className="os-border flex flex-wrap gap-2 bg-card p-3" aria-label="Pocket Pier links">
          {POCKET_PIER_COPY.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="os-border inline-flex items-center gap-1.5 bg-background px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              {link.label}
              <ExternalLink aria-hidden className="size-3" />
            </a>
          ))}
        </section>
      ) : null}
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: string }) {
  return (
    <section className="os-border bg-card p-3">
      <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
        {children}
      </p>
    </section>
  )
}

function ListSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="os-border bg-card p-3">
      <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">{title}</h4>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

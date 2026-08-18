'use client'

import { ExternalLink } from 'lucide-react'
import { KICKOFF_COPY, KICKOFF_URL } from '@/lib/kickoff'

export function KickoffContent() {
  return (
    <div className="kickoff-shell mx-auto grid w-full max-w-[1040px] gap-4">
      <section className="os-border bg-secondary p-3">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          {KICKOFF_COPY.subtitle}
        </p>
        <h3 className="mt-1 font-pixel text-[15px] leading-relaxed text-foreground">
          {KICKOFF_COPY.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {KICKOFF_COPY.intro}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {KICKOFF_COPY.overview}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={KICKOFF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="os-border inline-flex min-h-10 items-center gap-1.5 bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:bg-background focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Launch Kickoff
            <ExternalLink aria-hidden className="size-3" />
          </a>
          <p className="self-center text-xs leading-relaxed text-muted-foreground">
            Opens the live product in a new tab and leaves Jack OS.
          </p>
        </div>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Product', KICKOFF_COPY.version],
            ['Model', KICKOFF_COPY.modelVersion],
            ['Role', KICKOFF_COPY.role],
            ['Status', KICKOFF_COPY.status],
            ['Evaluation', KICKOFF_COPY.evaluation.sample],
            ['Live URL', 'kickoff.jackdennehey.com'],
          ].map(([label, value]) => (
            <div key={label} className="os-border min-w-0 bg-card px-2 py-1.5">
              <dt className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 break-words text-xs leading-relaxed text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="kickoff-metrics-heading">
        <h4
          id="kickoff-metrics-heading"
          className="font-pixel text-[9px] leading-relaxed text-foreground"
        >
          Key Project Metrics
        </h4>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KICKOFF_COPY.metrics.map((metric) => (
            <article key={metric.label} className="os-border min-w-0 bg-card p-3">
              <p className="kickoff-metric font-mono text-lg leading-none tracking-tight text-foreground sm:text-xl">
                {metric.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                {metric.label}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="os-border bg-card p-3">
        <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">Live Product</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {KICKOFF_COPY.liveProduct}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid min-w-0 gap-4">
          <section className="os-border bg-card p-3">
            <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">The Model</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {KICKOFF_COPY.model}
            </p>
            <h5 className="mt-3 font-pixel text-[8px] leading-relaxed text-foreground">
              Evaluation
            </h5>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Accuracy', KICKOFF_COPY.evaluation.accuracy],
                ['Brier', KICKOFF_COPY.evaluation.brier],
                ['Log loss', KICKOFF_COPY.evaluation.logLoss],
                ['ECE', KICKOFF_COPY.evaluation.ece],
              ].map(([label, value]) => (
                <div key={label} className="os-border min-w-0 bg-secondary px-2 py-1.5">
                  <dt className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="kickoff-metric mt-0.5 font-mono text-sm text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-foreground text-pretty">
              {KICKOFF_COPY.modelHonesty}
            </p>
          </section>

          <section className="os-border bg-card p-3">
            <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">Ask Kickoff</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {KICKOFF_COPY.ask}
            </p>
            <ol className="mt-3 grid gap-2" aria-label="Ask Kickoff architecture">
              {KICKOFF_COPY.askFlow.map((step, index) => (
                <li key={step} className="flex min-w-0 items-center gap-2">
                  <span className="os-border grid size-6 shrink-0 place-items-center bg-secondary font-pixel text-[8px] text-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 text-sm leading-relaxed text-muted-foreground">
                    {step}
                    {index < KICKOFF_COPY.askFlow.length - 1 ? (
                      <span className="sr-only">, then</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2" aria-label="Ask Kickoff research support">
              {KICKOFF_COPY.askCapabilities.map((item) => (
                <li
                  key={item}
                  className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {KICKOFF_COPY.askUnsupported}
            </p>
          </section>
        </div>

        <section className="os-border bg-card p-3">
          <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
            From Idea to Production
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {KICKOFF_COPY.lifecycleNote}
          </p>
          <ol className="mt-3 grid gap-2" aria-label="Kickoff project lifecycle">
            {KICKOFF_COPY.lifecycle.map((step, index) => (
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

      <section aria-labelledby="kickoff-engineering-heading">
        <h4
          id="kickoff-engineering-heading"
          className="font-pixel text-[9px] leading-relaxed text-foreground"
        >
          Engineering
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {KICKOFF_COPY.engineering}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {KICKOFF_COPY.engineeringGroups.map((group) => (
            <section key={group.title} className="os-border bg-card p-3">
              <h5 className="font-pixel text-[8px] leading-relaxed text-foreground">
                {group.title}
              </h5>
              <ul className="mt-2 grid gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <section className="os-border bg-card p-3">
          <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">Data</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {KICKOFF_COPY.data}
          </p>
        </section>
        <section className="os-border bg-card p-3">
          <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
            Production Engineering
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {KICKOFF_COPY.production}
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {KICKOFF_COPY.productionControls.map((item) => (
              <li
                key={item}
                className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="os-border bg-card p-3">
        <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">Technology</h4>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Kickoff technologies">
          {KICKOFF_COPY.technologies.map((tech) => (
            <li
              key={tech}
              className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>

      <section className="os-border bg-card p-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Kickoff Media
            </p>
            <h4 className="font-pixel text-[10px] leading-relaxed text-foreground">
              Product Screens
            </h4>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Screenshots are shown as project media inside the Jack OS interface.
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {KICKOFF_COPY.screenshots.map((screenshot, index) => (
            <figure
              key={screenshot.id}
              className={index === 0 || index === 3 ? 'min-w-0 sm:col-span-2' : 'min-w-0'}
            >
              <a
                href={screenshot.src}
                target="_blank"
                rel="noopener noreferrer"
                className="os-border block overflow-hidden bg-secondary p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View full screenshot: ${screenshot.title}`}
              >
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-contain"
                />
              </a>
              <figcaption className="mt-2 text-center font-pixel text-[8px] leading-relaxed text-muted-foreground">
                {screenshot.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="os-border bg-card p-3">
        <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
          Limitations / Transparency
        </h4>
        <ul className="mt-3 grid gap-2">
          {KICKOFF_COPY.limitations.map((item) => (
            <li
              key={item}
              className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="os-border flex flex-wrap items-center justify-between gap-3 bg-card p-3">
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground text-pretty">
          {KICKOFF_COPY.independence}
        </p>
        <a
          href={KICKOFF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="os-border inline-flex min-h-10 items-center gap-1.5 bg-background px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Launch Kickoff
          <ExternalLink aria-hidden className="size-3" />
        </a>
      </section>
    </div>
  )
}

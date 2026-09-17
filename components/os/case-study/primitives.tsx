'use client'

import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { GithubIcon } from '@/components/os/brand-icons'
import type {
  CaseStudyChapter,
  CaseStudyDecision,
  CaseStudyDiagram,
  CaseStudyMedia,
  CaseStudyMetric,
} from '@/lib/portfolio/case-studies'
import type { Project, ResolvedProjectAction } from '@/lib/portfolio'
import { cn } from '@/lib/utils'

export function CaseStudyKicker({ children }: { children: string }) {
  return <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{children}</p>
}

export function CaseStudyHeader({
  project,
  kicker,
  summary,
}: {
  project: Project
  kicker: string
  summary: string
}) {
  return (
    <header className="case-study-header">
      <CaseStudyKicker>{kicker}</CaseStudyKicker>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 text-2xl font-semibold tracking-tight text-foreground text-balance">
          {project.name}
        </h2>
        {project.statusLabel ? (
          <span className="os-border max-w-[12rem] shrink-0 bg-secondary px-1.5 py-0.5 text-right text-[10px] font-medium leading-snug text-muted-foreground">
            {project.statusLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">
        {summary}
      </p>
    </header>
  )
}

export function ProjectMeta({ project }: { project: Project }) {
  const items = [
    project.role ? ['Role', project.role] : null,
    project.platform ? ['Platform', project.platform] : null,
    project.dates?.label ? ['When', project.dates.label] : null,
  ].filter((item): item is [string, string] => Boolean(item))

  if (items.length === 0 && project.technologies.length === 0) return null

  return (
    <section className="case-study-meta" aria-label="Project facts">
      {items.length > 0 ? (
        <dl className="grid gap-3 @min-[420px]:grid-cols-3">
          {items.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-foreground text-pretty">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {project.technologies.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${project.name} technologies`}>
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export function CaseStudySection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      className="case-study-section min-w-0 scroll-mt-3 outline-none"
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="font-pixel text-[10px] leading-relaxed text-foreground">
        {title}
      </h3>
      <div className="mt-3 min-w-0 space-y-3">{children}</div>
    </section>
  )
}

export function CaseStudyProse({ children }: { children: string }) {
  return <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">{children}</p>
}

export function CaseStudyList({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ul className="grid gap-1.5" aria-label={label}>
      {items.map((item) => (
        <li key={item} className="flex min-w-0 gap-2 text-sm leading-relaxed text-muted-foreground">
          <span aria-hidden className="mt-1.5 size-1 shrink-0 bg-current" />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function MetricStrip({ metrics }: { metrics: readonly CaseStudyMetric[] }) {
  return (
    <ul className="metric-strip grid gap-2 @min-[420px]:grid-cols-2 @min-[720px]:grid-cols-3">
      {metrics.map((metric) => (
        <li key={metric.label} className="metric-chip os-border min-w-0 bg-card p-3">
          <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{metric.label}</p>
          <p className="mt-1 font-mono text-lg tracking-tight text-foreground">{metric.value}</p>
          {metric.note ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">{metric.note}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function MediaFrame({
  item,
  priority = false,
}: {
  item: CaseStudyMedia
  priority?: boolean
}) {
  return (
    <figure className="media-frame os-border min-w-0 overflow-hidden bg-secondary">
      <div className="grid place-items-center p-2">
        <img
          src={item.src}
          alt={item.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="max-h-72 w-full object-contain"
        />
      </div>
      {item.caption ? (
        <figcaption className="border-t-2 border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {item.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function MediaGallery({ media }: { media: readonly CaseStudyMedia[] }) {
  return (
    <div className="grid gap-3 @min-[560px]:grid-cols-2">
      {media.map((item, index) => (
        <MediaFrame key={item.src} item={item} priority={index === 0} />
      ))}
    </div>
  )
}

export function DecisionBlock({ decisions }: { decisions: readonly CaseStudyDecision[] }) {
  return (
    <div className="grid gap-3">
      {decisions.map((decision) => (
        <article key={decision.title} className="os-border bg-card p-4">
          <h4 className="text-sm font-semibold text-foreground text-pretty">{decision.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {decision.body}
          </p>
        </article>
      ))}
    </div>
  )
}

export function ProcessStrip({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="process-strip grid gap-2">
      {steps.map((step, index) => (
        <li key={step} className="flex min-w-0 gap-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-pixel text-[8px] leading-relaxed text-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-pretty">{step}</span>
        </li>
      ))}
    </ol>
  )
}

export function ArchitectureFlow({ diagram }: { diagram: CaseStudyDiagram }) {
  return (
    <div className="architecture-flow">
      <p className="sr-only">{diagram.textEquivalent}</p>
      <ol className="grid gap-2" aria-label={diagram.caption}>
        {diagram.nodes.map((node, index) => (
          <li key={node.id} className="min-w-0">
            {index > 0 ? (
              <p className="architecture-flow-arrow px-1 py-0.5 font-pixel text-[8px] text-muted-foreground" aria-hidden>
                ↓
              </p>
            ) : null}
            <div className="os-border bg-card p-3">
              <p className="font-pixel text-[8px] leading-relaxed text-foreground">{node.label}</p>
              {node.detail ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {node.detail}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ChapterList({ chapters }: { chapters: readonly CaseStudyChapter[] }) {
  return (
    <ol className="grid gap-3">
      {chapters.map((chapter, index) => (
        <li key={chapter.title} className="os-border bg-card p-4">
          <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
            Chapter {String(index + 1).padStart(2, '0')}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-foreground">{chapter.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {chapter.summary}
          </p>
        </li>
      ))}
    </ol>
  )
}

export function ProjectActions({
  actions,
  onOpenApp,
  onOpenCaseStudy,
}: {
  actions: readonly ResolvedProjectAction[]
  onOpenApp: (id: string) => void
  onOpenCaseStudy?: (projectId: string) => void
}) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        if (action.kind === 'case-study') {
          if (!onOpenCaseStudy) return null
          return (
            <button
              key={`case-study-${action.projectId}`}
              type="button"
              onClick={() => onOpenCaseStudy(action.projectId)}
              className="os-border inline-flex min-h-11 items-center bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none"
            >
              {action.label}
            </button>
          )
        }
        if (action.kind === 'internal-app') {
          return (
            <button
              key={`app-${action.appId}`}
              type="button"
              onClick={() => onOpenApp(action.appId)}
              className="os-border inline-flex min-h-11 items-center bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              {action.label}
            </button>
          )
        }
        return (
          <a
            key={action.href}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="os-border inline-flex min-h-11 items-center gap-1.5 bg-background px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            {action.label.toLowerCase().includes('github') ? (
              <GithubIcon className="size-3" />
            ) : (
              <ExternalLink className="size-3" />
            )}
            {action.label}
          </a>
        )
      })}
    </div>
  )
}

export function CaseStudyNav({
  returnLabel,
  nextLabel,
  onReturn,
  onNext,
}: {
  returnLabel: string
  nextLabel: string
  onReturn: () => void
  onNext: () => void
}) {
  return (
    <nav className="case-study-nav flex flex-wrap gap-2 border-t-2 border-border pt-4" aria-label="Case study">
      <button
        type="button"
        onClick={onReturn}
        className="os-border inline-flex min-h-11 items-center bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        {returnLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="os-border inline-flex min-h-11 items-center bg-background px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        {nextLabel}
      </button>
    </nav>
  )
}

export function CaseStudySectionNav({
  sections,
}: {
  sections: readonly { id: string; title: string }[]
}) {
  if (sections.length < 5) return null

  return (
    <nav className="case-study-toc" aria-label="On this page">
      <ul className="flex flex-wrap gap-1.5">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => {
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                document.getElementById(section.id)?.scrollIntoView({
                  behavior: reduceMotion ? 'auto' : 'smooth',
                  block: 'start',
                })
              }}
              className={cn(
                'os-border inline-flex min-h-8 items-center bg-background px-2 py-1 font-pixel text-[8px] leading-relaxed text-muted-foreground',
                'hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none',
              )}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

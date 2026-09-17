'use client'

import { useEffect } from 'react'
import { ExternalLink, Mail } from 'lucide-react'
import type { WindowId } from '../apps'
import { GithubIcon, LinkedinIcon } from '@/components/os/brand-icons'
import {
  CREDENTIALS,
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROFILE_LINKS,
  SKILL_GROUPS,
  getFeaturedProjectActions,
  getFeaturedProjects,
  type Project,
} from '@/lib/portfolio'
import { PORTFOLIO_SECTION_DOM_IDS, type PortfolioSectionId } from '@/lib/search'
import { cn } from '@/lib/utils'
import { scrollJackOsSectionIntoView } from '../spotlight/scroll-to-section'

export function PortfolioContent({
  onOpen,
  onOpenCaseStudy,
  focusSectionId,
  focusNonce = 0,
}: {
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
  focusSectionId?: PortfolioSectionId | null
  focusNonce?: number
}) {
  const featured = getFeaturedProjects()

  useEffect(() => {
    if (!focusSectionId) return
    scrollJackOsSectionIntoView(PORTFOLIO_SECTION_DOM_IDS[focusSectionId])
  }, [focusNonce, focusSectionId])

  return (
    <div className="portfolio-app @container min-w-0 space-y-7">
      <header className="os-border bg-secondary p-4">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Portfolio.app
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">
          {PROFILE.name}
        </h2>
        <p className="mt-1 text-sm font-medium text-foreground">{PROFILE.headline}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">
          {PROFILE.summary}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground text-pretty">
          {PROFILE.professionalDirection}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AppButton primary onClick={() => onOpen('recruiter')}>
            Recruiter Path
          </AppButton>
          <AppButton onClick={() => onOpen('resume')}>Resume</AppButton>
          <AppButton onClick={() => onOpen('contact')}>Contact</AppButton>
        </div>
      </header>

      <section aria-labelledby="portfolio-featured-heading">
        <SectionKicker id="portfolio-featured-heading">Featured Work</SectionKicker>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">
          Public products and platform work. Case studies go deeper; live and App Store actions stay
          on the card when they exist.
        </p>
        <div className="mt-4 grid gap-3 @min-[560px]:grid-cols-2">
          {featured.map((project) => (
            <FeaturedProjectCard
              key={project.id}
              project={project}
              onOpen={onOpen}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ))}
        </div>
        <div className="mt-3">
          <AppButton onClick={() => onOpen('projects')}>View all projects</AppButton>
        </div>
      </section>

      <section aria-labelledby="portfolio-experience-heading">
        <SectionKicker id="portfolio-experience-heading">Experience</SectionKicker>
        <div className="mt-3 space-y-3">
          {EXPERIENCE.map((entry) => (
            <article key={entry.id} className="os-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-pixel text-[11px] leading-relaxed text-foreground">
                  {entry.role}
                </h3>
                <span className="text-xs font-medium text-muted-foreground">{entry.period}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{entry.organization}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {entry.description}
              </p>
              {entry.technologies ? (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Related technologies">
                  {entry.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="portfolio-skills-heading">
        <SectionKicker id="portfolio-skills-heading">Skills and Technologies</SectionKicker>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Represented through categories and project work, not percentage ratings.
        </p>
        <div className="mt-3 grid gap-3 @min-[520px]:grid-cols-2">
          {SKILL_GROUPS.map((group) => (
            <article key={group.id} className="os-border bg-card p-4">
              <h3 className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
                {group.group}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="portfolio-education-heading"
        className="grid gap-3 @min-[640px]:grid-cols-2"
      >
        <div>
          <SectionKicker id="portfolio-education-heading">Education</SectionKicker>
          <div className="mt-3 space-y-3">
            {EDUCATION.map((entry) => (
              <article key={entry.id} className="os-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{entry.school}</h3>
                  <span className="text-xs font-medium text-muted-foreground">{entry.period}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{entry.program}</p>
                {entry.honors ? (
                  <p className="mt-1 font-pixel text-[8px] leading-relaxed text-muted-foreground">
                    {entry.honors}
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {entry.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <SectionKicker id="portfolio-credentials-heading">Credentials</SectionKicker>
          <div className="mt-3 space-y-3">
            {CREDENTIALS.map((credential) => (
              <article key={credential.id} className="os-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{credential.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground">
                    {credential.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">{credential.issuer}</p>
                {credential.date ? (
                  <p className="mt-1 text-xs text-muted-foreground">{credential.date}</p>
                ) : null}
              </article>
            ))}
            <AppButton onClick={() => onOpen('certifications')}>Open Credentials</AppButton>
          </div>
        </div>
      </section>

      <section aria-labelledby="portfolio-contact-heading">
        <SectionKicker id="portfolio-contact-heading">Contact</SectionKicker>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {PROFILE.opportunityStatement}
        </p>
        <ul className="mt-3 grid gap-2 @min-[520px]:grid-cols-2">
          {PROFILE_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="os-border flex min-h-11 items-center justify-between gap-3 bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className="block font-pixel text-[8px] leading-relaxed text-muted-foreground">
                    {link.label}
                  </span>
                  <span className="block truncate">{link.value}</span>
                </span>
                {link.id === 'github' ? (
                  <GithubIcon className="size-4 shrink-0" />
                ) : link.id === 'linkedin' ? (
                  <LinkedinIcon className="size-4 shrink-0" />
                ) : link.id === 'email' ? (
                  <Mail className="size-4 shrink-0" />
                ) : (
                  <ExternalLink className="size-4 shrink-0" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function FeaturedProjectCard({
  project,
  onOpen,
  onOpenCaseStudy,
}: {
  project: Project
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
}) {
  const actions = getFeaturedProjectActions(project)

  return (
    <article className="os-border flex min-w-0 flex-col bg-card p-4">
      {project.featuredLabel ? (
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          {project.featuredLabel}
        </p>
      ) : null}
      <div className="mt-1 flex items-start justify-between gap-2">
        <h3 className="font-pixel text-[11px] leading-relaxed text-foreground">{project.name}</h3>
        {project.statusLabel ? (
          <span className="os-border max-w-[9rem] shrink-0 bg-secondary px-1.5 py-0.5 text-right text-[10px] font-medium leading-snug text-muted-foreground">
            {project.statusLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
        {project.whyExists ?? project.shortDescription}
      </p>
      {project.role ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Role:</span> {project.role}
        </p>
      ) : null}
      {project.result ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Result:</span> {project.result}
        </p>
      ) : null}
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${project.name} technologies`}>
        {project.technologies.slice(0, 6).map((tech) => (
          <li
            key={tech}
            className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>
      {actions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => {
            if (action.kind === 'case-study') {
              return (
                <AppButton
                  key={`case-study-${action.projectId}`}
                  primary
                  onClick={() => onOpenCaseStudy(action.projectId)}
                >
                  {action.label}
                </AppButton>
              )
            }
            if (action.kind === 'internal-app') {
              return (
                <AppButton key={action.appId} onClick={() => onOpen(action.appId as WindowId)}>
                  {action.label}
                </AppButton>
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
                {action.label}
                <ExternalLink className="size-3" />
              </a>
            )
          })}
        </div>
      ) : null}
    </article>
  )
}

function SectionKicker({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      className="scroll-mt-3 font-pixel text-[10px] leading-relaxed text-foreground outline-none"
    >
      {children}
    </h2>
  )
}

function AppButton({
  children,
  onClick,
  primary = false,
}: {
  children: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'os-border inline-flex min-h-11 items-center px-3 py-2 font-pixel text-[8px] leading-relaxed transition-colors focus-visible:outline-none',
        primary
          ? 'bg-foreground text-primary-foreground hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground'
          : 'bg-card text-foreground hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground',
      )}
    >
      {children}
    </button>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { Copy, ExternalLink, Mail } from 'lucide-react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import type { WindowId } from '../apps'
import {
  PORTFOLIO_KNOWLEDGE,
  RECRUITER_SECTIONS,
  type RecruiterSectionId,
} from '@/lib/portfolio-knowledge'
import { GithubIcon, LinkedinIcon } from '@/components/os/brand-icons'
import { cn } from '@/lib/utils'

type Props = {
  activeSection: RecruiterSectionId
  onSectionChange: (section: RecruiterSectionId) => void
  onOpen: (id: WindowId) => void
  onCopyEmail: () => void
}

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

export function RecruiterModeContent({
  activeSection,
  onSectionChange,
  onOpen,
  onCopyEmail,
}: Props) {
  const activeIndex = RECRUITER_SECTIONS.findIndex((section) => section.id === activeSection)
  const safeIndex = activeIndex >= 0 ? activeIndex : 0
  const section = RECRUITER_SECTIONS[safeIndex]
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    contentRef.current?.focus()
  }, [activeSection])

  const goToPrevious = () => {
    if (safeIndex > 0) {
      onSectionChange(RECRUITER_SECTIONS[safeIndex - 1].id)
    }
  }

  const goToNext = () => {
    if (safeIndex < RECRUITER_SECTIONS.length - 1) {
      onSectionChange(RECRUITER_SECTIONS[safeIndex + 1].id)
    }
  }

  return (
    <div className="grid min-h-full gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
      <nav aria-label="Recruiter Mode sections" className="min-w-0">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Guided Overview
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
          {RECRUITER_SECTIONS.map((item, index) => {
            const selected = item.id === section.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                aria-current={selected ? 'step' : undefined}
                className={cn(
                  'os-border flex min-w-[9rem] items-center gap-2 bg-card px-2 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none md:w-full md:min-w-0',
                  selected
                    ? 'border-[var(--credential-gold)] bg-secondary'
                    : 'hover:bg-foreground hover:text-primary-foreground',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid size-5 shrink-0 place-items-center border-2 border-current text-[7px]',
                    selected ? 'recruiter-accent-marker' : null,
                  )}
                >
                  {selected ? '>' : index + 1}
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <section
        ref={contentRef}
        tabIndex={-1}
        aria-labelledby={`recruiter-section-${section.id}`}
        className="min-w-0 space-y-4 focus-visible:outline-none"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border pb-2">
          <div className="min-w-0">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Recruiter Mode
            </p>
            <h3
              id={`recruiter-section-${section.id}`}
              className="font-pixel text-[12px] leading-relaxed text-foreground"
            >
              {section.label}
            </h3>
          </div>
          <p
            aria-live="polite"
            className="recruiter-accent-marker os-border shrink-0 px-2 py-1 font-pixel text-[8px] leading-none"
          >
            {safeIndex + 1} of {RECRUITER_SECTIONS.length}
          </p>
        </header>

        <RecruiterSection
          section={section.id}
          onOpen={onOpen}
          onCopyEmail={onCopyEmail}
        />

        <footer className="flex flex-wrap justify-between gap-2 border-t-2 border-border pt-3">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={safeIndex === 0}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={safeIndex === RECRUITER_SECTIONS.length - 1}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
          >
            Next
          </button>
        </footer>
      </section>
    </div>
  )
}

function RecruiterSection({
  section,
  onOpen,
  onCopyEmail,
}: {
  section: RecruiterSectionId
  onOpen: (id: WindowId) => void
  onCopyEmail: () => void
}) {
  switch (section) {
    case 'overview':
      return <OverviewSection onOpen={onOpen} />
    case 'education':
      return <EducationSection />
    case 'credentials':
      return <CredentialsSection onOpen={onOpen} />
    case 'projects':
      return <ProjectsSection onOpen={onOpen} />
    case 'skills':
      return <SkillsSection />
    case 'contact':
      return <ContactSection onCopyEmail={onCopyEmail} />
  }
}

function OverviewSection({ onOpen }: { onOpen: (id: WindowId) => void }) {
  return (
    <div className="space-y-4">
      <InfoBlock>
        {PORTFOLIO_KNOWLEDGE.person.overview} Jack OS was created as an interactive
        alternative to a traditional portfolio, combining professional content with a retro desktop
        experience.
      </InfoBlock>
      <div className="grid gap-3 sm:grid-cols-2">
        <FactCard label="Current Focus" value="Business studies at Penn State Brandywine" />
        <FactCard label="Foundation" value="Cybersecurity, networking, and hands-on projects" />
      </div>
      <ActionRow>
        <ActionButton onClick={() => onOpen('about')}>View About</ActionButton>
        <ActionButton onClick={() => onOpen('projects')}>View Projects</ActionButton>
        <ActionButton onClick={() => onOpen('contact')}>Contact Jack</ActionButton>
      </ActionRow>
    </div>
  )
}

function EducationSection() {
  return (
    <div className="space-y-4">
      <InfoBlock>
        Jack is currently studying Business at Penn State Brandywine. His prior cybersecurity
        education at Delaware County Community College led to a Cyber Security Certificate of
        Competency earned with Honors.
      </InfoBlock>
      <div className="grid gap-3">
        {[...PORTFOLIO_KNOWLEDGE.education.current, ...PORTFOLIO_KNOWLEDGE.education.prior].map(
          (item) => (
            <article key={item.school} className="os-border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
                  {item.school}
                </h4>
                <span className="text-xs font-medium text-muted-foreground">{item.period}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">{item.degree}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.detail}
              </p>
            </article>
          ),
        )}
      </div>
    </div>
  )
}

function CredentialsSection({ onOpen }: { onOpen: (id: WindowId) => void }) {
  return (
    <div className="space-y-4">
      <CredentialGroup title="Completed" credentials={PORTFOLIO_KNOWLEDGE.credentials.completed} />
      <CredentialGroup
        title="In Progress"
        credentials={PORTFOLIO_KNOWLEDGE.credentials.inProgress}
      />
      <CredentialGroup title="Planned" credentials={PORTFOLIO_KNOWLEDGE.credentials.planned} />
      <ActionRow>
        <ActionButton onClick={() => onOpen('certifications')}>Open Credentials</ActionButton>
      </ActionRow>
    </div>
  )
}

function ProjectsSection({ onOpen }: { onOpen: (id: WindowId) => void }) {
  const featuredProject = PORTFOLIO_KNOWLEDGE.projects.featured

  return (
    <div className="space-y-4">
      <article className="os-border bg-card p-3">
        <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
          Primary Project
        </p>
        <h4 className="mt-1 font-pixel text-[11px] leading-relaxed text-foreground">
          Jack OS
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {featuredProject.description}
        </p>
        <ul className="mt-3 grid gap-1 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
          {PORTFOLIO_KNOWLEDGE.projects.jackOsSystems.map((system) => (
            <li key={system} className="flex min-w-0 gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
              <span className="min-w-0 capitalize">{system}</span>
            </li>
          ))}
        </ul>
      </article>

      <div className="grid gap-3 sm:grid-cols-2">
        {PORTFOLIO_KNOWLEDGE.projects.all.slice(1).map((project) => (
          <article key={project.title} className="os-border bg-card p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
                {project.title}
              </h4>
              {project.status ? (
                <span className="text-xs font-medium text-muted-foreground">
                  {project.status}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {project.description}
            </p>
          </article>
        ))}
      </div>

      <ActionRow>
        <ActionButton onClick={() => onOpen('projects')}>Open Projects</ActionButton>
        {featuredProject.github ? (
          <ActionLink href={featuredProject.github} Icon={GithubIcon}>
            View Jack OS Source
          </ActionLink>
        ) : null}
        {featuredProject.demo ? (
          <ActionLink href={featuredProject.demo} Icon={ExternalLink}>
            Visit Live Project
          </ActionLink>
        ) : null}
      </ActionRow>
    </div>
  )
}

function SkillsSection() {
  return (
    <div className="space-y-4">
      <InfoBlock>{PORTFOLIO_KNOWLEDGE.person.professionalDirection}</InfoBlock>
      <div className="grid gap-3 sm:grid-cols-2">
        {PORTFOLIO_KNOWLEDGE.skills.areas.map((area) => (
          <div key={area} className="os-border bg-card p-3">
            <p className="font-pixel text-[9px] leading-relaxed text-foreground">{area}</p>
          </div>
        ))}
      </div>
      <section className="os-border bg-secondary p-3">
        <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
          How the areas connect
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Business provides the decision-making frame, cybersecurity and networking build the
          systems foundation, cloud and AI expand the toolkit, and front-end/product thinking turns
          that work into interfaces people can understand and use.
        </p>
      </section>
    </div>
  )
}

function ContactSection({ onCopyEmail }: { onCopyEmail: () => void }) {
  return (
    <div className="space-y-4">
      <InfoBlock>
        Open to internships, entry-level opportunities, professional connections, and projects that
        combine business and technology.
      </InfoBlock>
      <div className="os-border bg-card p-3">
        <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
          Email
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-foreground">
          {PORTFOLIO_KNOWLEDGE.contact.email}
        </p>
      </div>
      <ActionRow>
        <ActionLink
          href={`mailto:${PORTFOLIO_KNOWLEDGE.contact.email}`}
          external={false}
          Icon={Mail}
        >
          Send Email
        </ActionLink>
        <ActionButton onClick={onCopyEmail} Icon={Copy}>
          Copy Email
        </ActionButton>
        <ActionLink href={PORTFOLIO_KNOWLEDGE.contact.linkedin} Icon={LinkedinIcon}>
          LinkedIn
        </ActionLink>
        <ActionLink href={PORTFOLIO_KNOWLEDGE.contact.github} Icon={GithubIcon}>
          GitHub
        </ActionLink>
        <ActionLink href={PORTFOLIO_KNOWLEDGE.contact.portfolio} Icon={ExternalLink}>
          Portfolio URL
        </ActionLink>
      </ActionRow>
    </div>
  )
}

function CredentialGroup({
  title,
  credentials,
}: {
  title: string
  credentials: typeof PORTFOLIO_KNOWLEDGE.credentials.all
}) {
  return (
    <section className="space-y-2">
      <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">{title}</h4>
      <div className="grid gap-2">
        {credentials.map((credential) => (
          <article key={credential.id} className="os-border bg-card p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-pixel text-[9px] leading-relaxed text-foreground">
                  {credential.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {credential.issuer}
                </p>
              </div>
              <span className="os-border shrink-0 bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {credential.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {credential.summary}
            </p>
            {credential.verification ? (
              <a
                href={credential.verification.url}
                target="_blank"
                rel="noopener noreferrer"
                className="os-border mt-2 inline-flex max-w-full items-center gap-1.5 bg-background px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                <ExternalLink className="size-3" />
                <span className="truncate">{credential.verification.label}</span>
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="os-border bg-card p-3">
      <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">{value}</p>
    </article>
  )
}

function InfoBlock({ children }: { children: ReactNode }) {
  return (
    <p className="os-border bg-secondary p-3 text-sm leading-relaxed text-foreground text-pretty">
      {children}
    </p>
  )
}

function ActionRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

function ActionButton({
  children,
  onClick,
  Icon,
}: {
  children: string
  onClick: () => void
  Icon?: IconType
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="os-border inline-flex items-center gap-1.5 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
    >
      {Icon ? <Icon aria-hidden className="size-3.5" /> : null}
      <span>{children}</span>
    </button>
  )
}

function ActionLink({
  children,
  href,
  Icon,
  external = true,
}: {
  children: string
  href: string
  Icon: IconType
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="os-border inline-flex items-center gap-1.5 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
    >
      <Icon aria-hidden className="size-3.5" />
      <span>{children}</span>
      {external ? <ExternalLink aria-hidden className="size-3" /> : null}
    </a>
  )
}

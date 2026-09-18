'use client'

import { useEffect, useRef } from 'react'
import { Copy, Download, ExternalLink, Mail } from 'lucide-react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import type { WindowId } from '../apps'
import {
  EDUCATION,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
  getCompletedCredentials,
  getInProgressCredentials,
  getPlannedCredentials,
  getProjectById,
  getFeaturedProjects,
  getProjectEvidence,
  type Credential,
  type ResolvedProjectAction,
} from '@/lib/portfolio'
import {
  RECRUITER_SECTIONS,
  type RecruiterSectionId,
} from '@/lib/portfolio-knowledge'
import { GithubIcon, LinkedinIcon } from '@/components/os/brand-icons'
import { cn } from '@/lib/utils'

type Props = {
  activeSection: RecruiterSectionId
  onSectionChange: (section: RecruiterSectionId) => void
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
  onCopyEmail: () => void
  onOpenSimpleMode: () => void
}

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

export function RecruiterModeContent({
  activeSection,
  onSectionChange,
  onOpen,
  onOpenCaseStudy,
  onCopyEmail,
  onOpenSimpleMode,
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
    <div className="recruiter-mode-shell mx-auto grid min-h-full w-full max-w-[1180px] gap-5 md:grid-cols-[210px_minmax(0,1fr)]">
      <nav aria-label="Recruiter Mode sections" className="min-w-0">
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Evidence brief
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
                  'os-border flex min-h-11 min-w-[11rem] items-center gap-2 bg-card px-2.5 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none md:min-h-0 md:w-full md:min-w-0',
                  selected
                    ? 'border-[var(--credential-gold)] bg-secondary outline outline-2 outline-offset-[-5px] outline-[var(--credential-gold-muted)]'
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
                <span className="min-w-0 whitespace-normal">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <section
        ref={contentRef}
        tabIndex={-1}
        aria-labelledby={`recruiter-section-${section.id}`}
        className="min-w-0 space-y-5 focus-visible:outline-none"
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
          onOpenCaseStudy={onOpenCaseStudy}
          onCopyEmail={onCopyEmail}
          onOpenSimpleMode={onOpenSimpleMode}
          onContinue={() => onSectionChange('education')}
        />

        <footer className="sticky bottom-0 flex flex-wrap justify-between gap-2 border-t-2 border-border bg-paper/95 pt-3">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={safeIndex === 0}
            className="os-border min-h-11 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={safeIndex === RECRUITER_SECTIONS.length - 1}
            className="os-border min-h-11 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
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
  onOpenCaseStudy,
  onCopyEmail,
  onOpenSimpleMode,
  onContinue,
}: {
  section: RecruiterSectionId
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
  onCopyEmail: () => void
  onOpenSimpleMode: () => void
  onContinue: () => void
}) {
  switch (section) {
    case 'overview':
      return (
        <OverviewSection
          onOpen={onOpen}
          onOpenCaseStudy={onOpenCaseStudy}
          onOpenSimpleMode={onOpenSimpleMode}
          onContinue={onContinue}
        />
      )
    case 'education':
      return <EducationSection />
    case 'credentials':
      return <CredentialsSection onOpen={onOpen} />
    case 'projects':
      return <ProjectsSection onOpen={onOpen} />
    case 'skills':
      return <SkillsSection />
    case 'contact':
      return <ContactSection onOpen={onOpen} onCopyEmail={onCopyEmail} />
  }
}

function OverviewSection({
  onOpen,
  onOpenCaseStudy,
  onOpenSimpleMode,
  onContinue,
}: {
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
  onOpenSimpleMode: () => void
  onContinue: () => void
}) {
  const featured = getFeaturedProjects()

  return (
    <div className="space-y-4">
      <InfoBlock>
        {PROFILE.shortIntro} {PROFILE.opportunityStatement}
      </InfoBlock>
      <div className="grid gap-3 sm:grid-cols-2">
        <FactCard label="Current focus" value="Business studies at Penn State Brandywine" />
        <FactCard
          label="Public work"
          value="Kickoff, Pocket Pier, JackOS, and 1984 Blue Ocean"
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {featured.map((project) => (
          <EvidenceCard
            key={project.id}
            projectId={project.id}
            onOpen={onOpen}
            onOpenCaseStudy={onOpenCaseStudy}
          />
        ))}
      </div>
      <ActionRow>
        <ActionButton onClick={() => onOpen('resume')}>Open Resume</ActionButton>
        <ActionLink href="/jack-dennehey-resume.txt" Icon={Download} download>
          Download Resume
        </ActionLink>
        <ActionButton onClick={() => onOpen('contact')}>Contact</ActionButton>
        <ActionButton onClick={() => onOpen('boch')}>Ask BOCH</ActionButton>
        <ActionButton onClick={onOpenSimpleMode}>Simple Mode</ActionButton>
        <ActionButton onClick={onContinue}>Continue</ActionButton>
      </ActionRow>
    </div>
  )
}

function EvidenceCard({
  projectId,
  onOpen,
  onOpenCaseStudy,
}: {
  projectId: string
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
}) {
  const project = getProjectById(projectId)
  if (!project) return null
  const evidence = getProjectEvidence(project)

  return (
    <article className="os-border bg-card p-3">
      {evidence.label ? (
        <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
          {evidence.label}
        </p>
      ) : null}
      <h4 className="mt-1 font-pixel text-[11px] leading-relaxed text-foreground">
        {evidence.name}
      </h4>
      <dl className="mt-2 space-y-1.5 text-[14px] leading-6 text-muted-foreground">
        <EvidenceField term="What" definition={evidence.what} />
        {evidence.role ? <EvidenceField term="Role" definition={evidence.role} /> : null}
        {evidence.result ? <EvidenceField term="Result" definition={evidence.result} /> : null}
      </dl>
      {evidence.technologies.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${evidence.name} technologies`}>
          {evidence.technologies.map((tech) => (
            <li
              key={tech}
              className="border border-border/40 bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      ) : null}
      {evidence.actions.length > 0 ? (
        <div className="mt-3">
          <ActionRow>
            {evidence.actions.map((action) => (
              <ProofAction
                key={`${action.kind}-${action.kind === 'external' ? action.href : action.kind === 'case-study' ? action.projectId : action.appId}`}
                action={action}
                onOpen={onOpen}
                onOpenCaseStudy={onOpenCaseStudy}
              />
            ))}
          </ActionRow>
        </div>
      ) : null}
    </article>
  )
}

function EvidenceField({ term, definition }: { term: string; definition: string }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-pretty">{definition}</dd>
    </div>
  )
}

function ProofAction({
  action,
  onOpen,
  onOpenCaseStudy,
}: {
  action: ResolvedProjectAction
  onOpen: (id: WindowId) => void
  onOpenCaseStudy: (projectId: string) => void
}) {
  if (action.kind === 'case-study') {
    return (
      <ActionButton onClick={() => onOpenCaseStudy(action.projectId)}>{action.label}</ActionButton>
    )
  }
  if (action.kind === 'internal-app') {
    return (
      <ActionButton onClick={() => onOpen(action.appId as WindowId)}>{action.label}</ActionButton>
    )
  }
  return (
    <ActionLink href={action.href} Icon={ExternalLink}>
      {action.label}
    </ActionLink>
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
        {EDUCATION.map((item) => (
          <article key={item.id} className="os-border bg-card p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
                {item.school}
              </h4>
              <span className="text-xs font-medium text-muted-foreground">{item.period}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{item.program}</p>
            <p className="mt-1 text-[15px] leading-7 text-muted-foreground text-pretty">
              {item.detail}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

function CredentialsSection({ onOpen }: { onOpen: (id: WindowId) => void }) {
  return (
    <div className="space-y-4">
      <CredentialGroup title="Completed" credentials={getCompletedCredentials()} />
      <CredentialGroup title="In Progress" credentials={getInProgressCredentials()} />
      <CredentialGroup title="Planned" credentials={getPlannedCredentials()} />
      <ActionRow>
        <ActionButton onClick={() => onOpen('certifications')}>Open Credentials</ActionButton>
      </ActionRow>
    </div>
  )
}

function ProjectsSection({ onOpen }: { onOpen: (id: WindowId) => void }) {
  const otherProjects = PROJECTS.filter((project) => !project.featured)

  return (
    <div className="space-y-4">
      <InfoBlock>
        Kickoff, Pocket Pier, JackOS, and 1984 Blue Ocean are on Overview with proof actions. This
        section is the remaining public work.
      </InfoBlock>
      <div className="grid gap-3 sm:grid-cols-2">
        {otherProjects.map((project) => (
          <article key={project.id} className="os-border bg-card p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
                {project.name}
              </h4>
              {project.statusLabel ? (
                <span className="text-xs font-medium text-muted-foreground">
                  {project.statusLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-[15px] leading-7 text-muted-foreground text-pretty">
              {project.shortDescription}
            </p>
          </article>
        ))}
      </div>
      <ActionRow>
        <ActionButton onClick={() => onOpen('projects')}>Open Projects</ActionButton>
        <ActionButton onClick={() => onOpen('portfolio')}>Open Portfolio</ActionButton>
      </ActionRow>
    </div>
  )
}

function SkillsSection() {
  return (
    <div className="space-y-4">
      <InfoBlock>
        Skills are grouped by work already in this portfolio, not as a dump of every technology
        name.
      </InfoBlock>
      <div className="grid gap-3 sm:grid-cols-2">
        {SKILL_GROUPS.map((group) => {
          const related = (group.relatedProjectIds ?? [])
            .map((id) => getProjectById(id)?.name)
            .filter((name): name is string => Boolean(name))
          return (
            <article key={group.id} className="os-border bg-card p-3">
              <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
                {group.group}
              </h4>
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
              {related.length > 0 ? (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Seen in {related.join(', ')}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function ContactSection({
  onOpen,
  onCopyEmail,
}: {
  onOpen: (id: WindowId) => void
  onCopyEmail: () => void
}) {
  return (
    <div className="space-y-4">
      <InfoBlock>{PROFILE.opportunityStatement}</InfoBlock>
      <div className="os-border bg-card p-3">
        <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">Email</p>
        <p className="mt-1 break-all text-sm font-semibold text-foreground">
          {PROFILE.contact.email}
        </p>
      </div>
      <ActionRow>
        <ActionButton onClick={() => onOpen('resume')}>Open Resume</ActionButton>
        <ActionLink href="/jack-dennehey-resume.txt" Icon={Download} download>
          Download Resume
        </ActionLink>
        <ActionLink href={`mailto:${PROFILE.contact.email}`} external={false} Icon={Mail}>
          Send Email
        </ActionLink>
        <ActionButton onClick={onCopyEmail} Icon={Copy}>
          Copy Email
        </ActionButton>
        <ActionLink href={PROFILE.contact.linkedin} Icon={LinkedinIcon}>
          LinkedIn
        </ActionLink>
        <ActionLink href={PROFILE.contact.github} Icon={GithubIcon}>
          GitHub
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
  credentials: readonly Credential[]
}) {
  if (credentials.length === 0) return null
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
            <p className="mt-2 text-[15px] leading-7 text-muted-foreground text-pretty">
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
      <p className="mt-1 text-[15px] font-semibold leading-7 text-foreground">{value}</p>
    </article>
  )
}

function InfoBlock({ children }: { children: ReactNode }) {
  return (
    <p className="os-border bg-secondary p-3 text-[15px] leading-7 text-foreground text-pretty">
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
      className="os-border inline-flex min-h-11 items-center gap-1.5 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
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
  download = false,
}: {
  children: string
  href: string
  Icon: IconType
  external?: boolean
  download?: boolean
}) {
  return (
    <a
      href={href}
      {...(download ? { download: true } : {})}
      {...(external && !download ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="os-border inline-flex min-h-11 items-center gap-1.5 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
    >
      <Icon aria-hidden className="size-3.5" />
      <span>{children}</span>
      {external && !download ? <ExternalLink aria-hidden className="size-3" /> : null}
    </a>
  )
}

'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  CONTACT,
  CREDENTIALS,
  EDUCATION,
  PROJECTS,
  SKILLS,
} from '@/lib/portfolio-data'
import type { WindowId } from '../apps'

type RecruiterViewContentProps = {
  onOpen: (id: WindowId) => void
  onOpenProject: (slug: string) => void
  onCopyEmail: () => void
  onCopyPortfolioLink: () => void
  onExit: () => void
}

const STEPS = [
  'Introduction',
  'Education',
  'Credentials',
  'Projects',
  'Skills',
  'Contact',
] as const

export function RecruiterViewContent({
  onOpen,
  onOpenProject,
  onCopyEmail,
  onCopyPortfolioLink,
  onExit,
}: RecruiterViewContentProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = STEPS[stepIndex]
  const featuredCredentials = useMemo(
    () => CREDENTIALS.filter((credential) => credential.status !== 'Planned').slice(0, 3),
    [],
  )
  const featuredProject = PROJECTS.find((project) => project.slug === 'jack-os') ?? PROJECTS[0]

  const next = () => setStepIndex((index) => Math.min(STEPS.length - 1, index + 1))
  const back = () => setStepIndex((index) => Math.max(0, index - 1))

  return (
    <div className="grid min-h-full gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="os-border bg-secondary p-2 lg:sticky lg:top-0 lg:self-start">
        <p className="px-2 py-1 font-pixel text-[8px] leading-relaxed text-muted-foreground">
          Recruiter View
        </p>
        <nav aria-label="Recruiter View sections" className="mt-2 grid gap-1">
          {STEPS.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setStepIndex(index)}
              aria-current={index === stepIndex ? 'step' : undefined}
              className={`os-border px-2 py-2 text-left font-pixel text-[8px] leading-relaxed transition-colors focus-visible:outline-none ${
                index === stepIndex
                  ? 'bg-foreground text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground'
              }`}
            >
              {index + 1}. {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="space-y-4">
        <div className="os-border bg-secondary p-4">
          <p className="font-pixel text-[9px] leading-relaxed text-muted-foreground">
            {stepIndex + 1} of {STEPS.length}
          </p>
          <h2 className="mt-2 font-pixel text-base leading-relaxed text-foreground">
            {step}
          </h2>
        </div>

        {step === 'Introduction' ? (
          <Panel>
            <p className="text-sm leading-relaxed text-foreground text-pretty">
              Jack Dennehey is a business student with a technical background in cybersecurity,
              networking, cloud computing, and artificial intelligence.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              Jack OS is built to make that professional direction easy to understand while still
              showing personality, product thinking, and front-end execution.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => onOpen('about')} className={buttonClass}>
                About Jack
              </button>
              <button type="button" onClick={() => onOpenProject('jack-os')} className={buttonClass}>
                Jack OS Case Study
              </button>
            </div>
          </Panel>
        ) : null}

        {step === 'Education' ? (
          <Panel>
            <p className="text-sm leading-relaxed text-foreground text-pretty">
              Jack is studying business at Penn State while continuing to build technical knowledge
              across security, networking, cloud services, and AI.
            </p>
            <div className="mt-4 grid gap-3">
              {EDUCATION.map((item) => (
                <article key={item.school} className="os-border bg-secondary p-3">
                  <p className="font-pixel text-[9px] leading-relaxed text-foreground">
                    {item.school}
                  </p>
                  <p className="text-sm text-foreground">{item.degree}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </Panel>
        ) : null}

        {step === 'Credentials' ? (
          <Panel>
            <div className="grid gap-3">
              {featuredCredentials.map((credential) => (
                <article key={credential.id} className="os-border bg-secondary p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-pixel text-[9px] leading-relaxed text-foreground">
                      {credential.title}
                    </p>
                    <span className="os-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {credential.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {credential.summary}
                  </p>
                </article>
              ))}
            </div>
            <button type="button" onClick={() => onOpen('certifications')} className={`${buttonClass} mt-4`}>
              View Credentials
            </button>
          </Panel>
        ) : null}

        {step === 'Projects' ? (
          <Panel>
            <p className="text-sm leading-relaxed text-foreground text-pretty">
              The featured project is Jack OS, the portfolio experience you are using now.
            </p>
            <article className="os-border mt-4 bg-secondary p-3">
              <p className="font-pixel text-[10px] leading-relaxed text-foreground">
                {featuredProject.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {featuredProject.description}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
                {featuredProject.technologies.map((tech) => (
                  <li key={tech} className="border border-border/40 bg-card px-1.5 py-0.5 text-[11px]">
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => onOpenProject(featuredProject.slug)} className={buttonClass}>
                Open Case Study
              </button>
              <button type="button" onClick={() => onOpen('projects')} className={buttonClass}>
                Explore Projects
              </button>
            </div>
          </Panel>
        ) : null}

        {step === 'Skills' ? (
          <Panel>
            <div className="grid gap-3 sm:grid-cols-2">
              {SKILLS.map((skill) => (
                <article key={skill.group} className="os-border bg-secondary p-3">
                  <p className="font-pixel text-[9px] leading-relaxed text-foreground">
                    {skill.group}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {skill.items.map((item) => (
                      <li key={item} className="border border-border/40 bg-card px-1.5 py-0.5 text-[11px]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Panel>
        ) : null}

        {step === 'Contact' ? (
          <Panel>
            <p className="text-sm leading-relaxed text-foreground text-pretty">
              Open to internships, entry-level opportunities, collaboration, and professional
              connections.
            </p>
            <p className="mt-3 font-pixel text-[9px] leading-relaxed text-foreground">
              {CONTACT.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${CONTACT.email}`} className={buttonClass}>
                Email Jack
              </a>
              <button type="button" onClick={onCopyEmail} className={buttonClass}>
                Copy Email
              </button>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                LinkedIn
              </a>
              <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                GitHub
              </a>
              <button type="button" onClick={onCopyPortfolioLink} className={buttonClass}>
                Copy Portfolio Link
              </button>
              <button type="button" onClick={onExit} className={buttonClass}>
                Exit to Desktop
              </button>
            </div>
          </Panel>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0}
            className={`${buttonClass} disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={stepIndex === STEPS.length - 1}
            className={`${buttonClass} disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground`}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

const buttonClass =
  'os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none'

function Panel({ children }: { children: ReactNode }) {
  return <div className="os-border bg-card p-4">{children}</div>
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { CopyEmailButton, SimpleModeAchievementMarker } from '@/components/simple/simple-mode-client'
import {
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROFILE_LINKS,
  SKILL_GROUPS,
  getCaseStudyHash,
  getCompletedCredentials,
  getFeaturedProjects,
  getInProgressCredentials,
  getPlannedCredentials,
  getProjectById,
  getProjectEvidence,
  isCaseStudyProjectId,
  type Credential,
  type ResolvedProjectAction,
} from '@/lib/portfolio'
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site-metadata'

const simpleDescription = `${PROFILE.name}'s conventional portfolio: Kickoff, Pocket Pier, JackOS, education, resume, and contact — without the desktop interface.`

export const metadata: Metadata = {
  title: {
    absolute: `${PROFILE.name} | Simple Mode`,
  },
  description: simpleDescription,
  alternates: {
    canonical: `${SITE_URL}/simple`,
  },
  openGraph: {
    type: 'profile',
    url: `${SITE_URL}/simple`,
    title: `${PROFILE.name} — Simple Mode`,
    description: simpleDescription,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROFILE.name} — Simple Mode`,
    description: simpleDescription,
  },
}

const TOC = [
  { href: '#intro', label: 'Intro' },
  { href: '#work', label: 'Featured work' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#education', label: 'Education' },
  { href: '#resume', label: 'Resume' },
  { href: '#contact', label: 'Contact' },
] as const

export default function SimpleModePage() {
  const featured = getFeaturedProjects()
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${PROFILE.name} Simple Mode`,
    url: `${SITE_URL}/simple`,
    description: simpleDescription,
    mainEntity: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      email: PROFILE.contact.email,
      url: SITE_URL,
      sameAs: [PROFILE.contact.github, PROFILE.contact.linkedin],
      alumniOf: EDUCATION.map((entry) => ({
        '@type': 'CollegeOrUniversity',
        name: entry.school,
      })),
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Penn State Brandywine',
      },
      knowsAbout: SKILL_GROUPS.flatMap((group) => [...group.items]),
    },
  }

  return (
    <main className="simple-mode-page min-h-screen bg-[#f8f6ef] text-[#171713]">
      <SimpleModeAchievementMarker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <a href="#simple-content" className="simple-skip-link">
        Skip to portfolio
      </a>
      <Link href="/" className="simple-return">
        Return to JackOS
      </Link>

      <div id="simple-content" className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:py-20">
        <header id="intro" className="border-b-2 border-[#171713] pb-8">
          <p className="simple-kicker">JackOS Simple Mode</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#171713]">
            {PROFILE.name}
          </h1>
          <p className="mt-3 max-w-3xl text-xl leading-8 text-[#3c382f]">{PROFILE.headline}</p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#3c382f]">
            {PROFILE.shortIntro} This page is the conventional reading of the same work shown in
            JackOS.
          </p>
          <nav aria-label="Simple Mode sections" className="simple-toc mt-6">
            {TOC.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="simple-actions mt-6 flex flex-wrap gap-3">
            <a className="simple-action-primary" href="#work">
              Featured work
            </a>
            <a className="simple-action" href="/jack-dennehey-resume.txt" download>
              Download Resume
            </a>
            <a className="simple-action" href={`mailto:${PROFILE.contact.email}`}>
              Email Jack
            </a>
            <Link href="/#boch" className="simple-action">
              Ask BOCH
            </Link>
            <Link href="/#recruiter" className="simple-action">
              Recruiter Mode
            </Link>
          </div>
        </header>

        <section id="work" aria-labelledby="work-heading" className="simple-section">
          <h2 id="work-heading">Featured work</h2>
          <p className="mb-6 max-w-3xl text-base leading-8 text-[#3c382f]">
            Four public pieces of evidence. Case studies and live products stay linked; facts are
            not rewritten here.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {featured.map((project) => (
              <SimpleEvidenceCard key={project.id} projectId={project.id} />
            ))}
          </div>
        </section>

        <section id="experience" aria-labelledby="experience-heading" className="simple-section">
          <h2 id="experience-heading">Experience</h2>
          <div className="space-y-4">
            {EXPERIENCE.map((entry) => (
              <article key={entry.id} className="simple-card">
                <p className="simple-label">{entry.period}</p>
                <h3>{entry.role}</h3>
                <p className="font-semibold">{entry.organization}</p>
                <p>{entry.description}</p>
                {entry.technologies ? (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Related technologies">
                    {entry.technologies.map((tech) => (
                      <li key={tech} className="simple-pill">
                        {tech}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section id="skills" aria-labelledby="skills-heading" className="simple-section">
          <h2 id="skills-heading">Skills</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SKILL_GROUPS.map((group) => {
              const related = (group.relatedProjectIds ?? [])
                .map((id) => getProjectById(id)?.name)
                .filter((name): name is string => Boolean(name))
              return (
                <article key={group.id} className="simple-card">
                  <h3>{group.group}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="simple-pill">
                        {item}
                      </li>
                    ))}
                  </ul>
                  {related.length > 0 ? (
                    <p className="mt-3 text-sm leading-7 text-[#4d473d]">
                      Seen in {related.join(', ')}
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        <section id="education" aria-labelledby="education-heading" className="simple-section">
          <h2 id="education-heading">Education and credentials</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {EDUCATION.map((entry) => (
              <article key={entry.id} className="simple-card">
                <p className="simple-label">{entry.period}</p>
                <h3>{entry.school}</h3>
                <p className="font-semibold">{entry.program}</p>
                <p>{entry.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              ...getCompletedCredentials(),
              ...getInProgressCredentials(),
              ...getPlannedCredentials(),
            ].map((credential) => (
              <SimpleCredentialCard key={credential.id} credential={credential} />
            ))}
          </div>
        </section>

        <section id="resume" aria-labelledby="resume-heading" className="simple-section">
          <h2 id="resume-heading">Resume</h2>
          <article className="simple-card">
            <p>
              A plain-text resume is available to download. Resume.app inside JackOS presents the
              same education, skills, and independent project work.
            </p>
            <div className="simple-actions mt-5 flex flex-wrap gap-3">
              <a className="simple-action-primary" href="/jack-dennehey-resume.txt" download>
                Download Resume
              </a>
              <Link href="/#resume" className="simple-action">
                Open Resume.app
              </Link>
            </div>
          </article>
        </section>

        <section id="contact" aria-labelledby="contact-heading" className="simple-section">
          <h2 id="contact-heading">Contact</h2>
          <p className="max-w-3xl text-base leading-8 text-[#3c382f]">
            {PROFILE.opportunityStatement}
          </p>
          <div className="simple-actions mt-5 flex flex-wrap gap-3">
            <a className="simple-action-primary" href={`mailto:${PROFILE.contact.email}`}>
              Email Jack
            </a>
            <CopyEmailButton email={PROFILE.contact.email} />
            {PROFILE_LINKS.filter((link) => link.id !== 'email').map((link) => (
              <a
                key={link.id}
                className="simple-action"
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
            ))}
            <Link href="/" className="simple-action">
              Return to JackOS
            </Link>
          </div>
        </section>

        <footer className="mt-14 border-t-2 border-[#171713] pt-6 text-sm leading-7 text-[#4d473d]">
          <p>
            Simple Mode is JackOS without the desktop metaphor. Portfolio.app remains the overview
            inside the operating system. Remaining public work lives in{' '}
            <Link href="/#projects" className="simple-text-link mt-0">
              Projects
            </Link>
            .
          </p>
          <p className="mt-2">{SITE_DESCRIPTION}</p>
        </footer>
      </div>
    </main>
  )
}

function SimpleEvidenceCard({ projectId }: { projectId: string }) {
  const project = getProjectById(projectId)
  if (!project) return null
  const evidence = getProjectEvidence(project)
  const actions = evidence.actions.filter((action) => {
    if (action.kind === 'internal-app' && action.appId === 'portfolio') return false
    if (action.kind === 'external' && action.href === SITE_URL) return false
    return true
  })

  return (
    <article className="simple-card">
      {evidence.label ? <p className="simple-label">{evidence.label}</p> : null}
      <h3>{evidence.name}</h3>
      <dl className="simple-evidence">
        <div>
          <dt>What</dt>
          <dd>{evidence.what}</dd>
        </div>
        {evidence.role ? (
          <div>
            <dt>Role</dt>
            <dd>{evidence.role}</dd>
          </div>
        ) : null}
        {evidence.result ? (
          <div>
            <dt>Result</dt>
            <dd>{evidence.result}</dd>
          </div>
        ) : null}
      </dl>
      {evidence.technologies.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${evidence.name} technologies`}>
          {evidence.technologies.map((tech) => (
            <li key={tech} className="simple-pill">
              {tech}
            </li>
          ))}
        </ul>
      ) : null}
      {actions.length > 0 ? (
        <div className="simple-actions mt-5 flex flex-wrap gap-3">
          {actions.map((action, index) => (
            <SimpleProofAction
              key={`${action.kind}-${index}`}
              action={action}
              primary={index === 0}
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}

function SimpleProofAction({
  action,
  primary,
}: {
  action: ResolvedProjectAction
  primary: boolean
}) {
  const className = primary ? 'simple-action-primary' : 'simple-action'
  if (action.kind === 'external') {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
        {action.label}
      </a>
    )
  }
  if (action.kind === 'internal-app') {
    const href =
      action.appId === 'blue-ocean' ? '/?from=simple#1984-blue-ocean' : `/#${action.appId}`
    return (
      <Link href={href} className={className}>
        {action.label}
      </Link>
    )
  }
  if (action.kind === 'case-study' && isCaseStudyProjectId(action.projectId)) {
    return (
      <Link href={`/${getCaseStudyHash(action.projectId)}`} className={className}>
        {action.label}
      </Link>
    )
  }
  return null
}

function SimpleCredentialCard({ credential }: { credential: Credential }) {
  return (
    <article className="simple-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="simple-label">{credential.issuer}</p>
          <h3>{credential.title}</h3>
        </div>
        <span className="simple-status">{credential.status}</span>
      </div>
      <p>{credential.summary}</p>
      {credential.verification ? (
        <a
          href={credential.verification.url}
          target="_blank"
          rel="noopener noreferrer"
          className="simple-text-link"
        >
          {credential.verification.label}
        </a>
      ) : null}
    </article>
  )
}

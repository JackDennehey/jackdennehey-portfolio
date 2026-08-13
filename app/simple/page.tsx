import type { Metadata } from 'next'
import Link from 'next/link'
import { CopyEmailButton, SimpleModeAchievementMarker } from '@/components/simple/simple-mode-client'
import { PORTFOLIO_KNOWLEDGE } from '@/lib/portfolio-knowledge'
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site-metadata'

const simpleDescription =
  'Professional overview of Jack Dennehey, a Penn State Brandywine Business student with a background in cybersecurity and networking and interests in cloud computing, artificial intelligence, front-end development, and product development.'

export const metadata: Metadata = {
  title: {
    absolute: 'Jack Dennehey | Business, Cybersecurity and Technology Portfolio',
  },
  description: simpleDescription,
  alternates: {
    canonical: `${SITE_URL}/simple`,
  },
  openGraph: {
    type: 'profile',
    url: `${SITE_URL}/simple`,
    title: 'Jack Dennehey | Professional Portfolio',
    description: simpleDescription,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jack Dennehey | Professional Portfolio',
    description: simpleDescription,
  },
}

export default function SimpleModePage() {
  const knowledge = PORTFOLIO_KNOWLEDGE
  const blueOceanProject = knowledge.projects.all.find(
    (project) => project.internalApp === 'blue-ocean',
  )
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Jack Dennehey professional portfolio',
    url: `${SITE_URL}/simple`,
    description: simpleDescription,
    mainEntity: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      email: knowledge.contact.email,
      url: SITE_URL,
      sameAs: [knowledge.contact.github, knowledge.contact.linkedin],
      alumniOf: [
        {
          '@type': 'CollegeOrUniversity',
          name: 'Delaware County Community College',
        },
      ],
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Penn State Brandywine',
      },
      knowsAbout: knowledge.skills.areas,
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
        Skip to professional overview
      </a>
      <Link href="/" className="simple-return">
        Return to Jack OS V3B
      </Link>

      <div id="simple-content" className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:py-20">
        <header className="border-b-2 border-[#171713] pb-8">
          <p className="text-xs font-semibold uppercase text-[#555047]">
            Jack OS Simple Mode
          </p>
          <h1 className="mt-4 text-4xl font-bold text-[#171713]">
            Jack Dennehey
          </h1>
          <p className="mt-3 max-w-3xl text-xl leading-8 text-[#3c382f]">
            Business student at Penn State Brandywine with a background in cybersecurity and
            networking, currently building toward cloud computing, artificial intelligence,
            front-end development, and product/interface thinking.
          </p>
          <div className="simple-actions mt-6 flex flex-wrap gap-3">
            <a className="simple-action-primary" href={`mailto:${knowledge.contact.email}`}>
              Email Jack
            </a>
            <CopyEmailButton email={knowledge.contact.email} />
            <a
              className="simple-action"
              href={knowledge.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              View LinkedIn
            </a>
            <a
              className="simple-action"
              href={knowledge.contact.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub
            </a>
          </div>
        </header>

        <section aria-labelledby="snapshot-heading" className="simple-section">
          <h2 id="snapshot-heading">Professional Snapshot</h2>
          <div className="simple-grid">
            <SimpleFact label="Current Education" value="Business studies at Penn State Brandywine" />
            <SimpleFact label="Technical Foundation" value="Cybersecurity and networking" />
            <SimpleFact label="Public Email" value={knowledge.contact.email} />
            <SimpleFact label="Live Project" value="Jack OS interactive portfolio" />
          </div>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#3c382f]">
            {knowledge.person.professionalDirection}
          </p>
        </section>

        {blueOceanProject ? (
          <section aria-labelledby="blue-ocean-heading" className="simple-section">
            <div className="simple-card">
              <p className="simple-label">Featured Interactive Case Study</p>
              <h2 id="blue-ocean-heading">{blueOceanProject.title}</h2>
              <p>{blueOceanProject.description}</p>
              <p className="mt-4 text-sm leading-7 text-[#4d473d]">
                Best viewed inside Jack OS as a guided keynote presentation.
              </p>
              <div className="simple-actions mt-5 flex flex-wrap gap-3">
                <Link href="/?from=simple#1984-blue-ocean" className="simple-action-primary">
                  Open Interactive Keynote
                </Link>
                <Link href="/#projects" className="simple-action">
                  View in Projects
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="education-heading" className="simple-section">
          <h2 id="education-heading">Education</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[...knowledge.education.current, ...knowledge.education.prior].map((education) => (
              <article key={education.school} className="simple-card">
                <p className="simple-label">{education.period}</p>
                <h3>{education.school}</h3>
                <p className="font-semibold">{education.degree}</p>
                <p>{education.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="credentials-heading" className="simple-section">
          <h2 id="credentials-heading">Credentials</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {knowledge.credentials.all.map((credential) => (
              <article key={credential.id} className="simple-card">
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
            ))}
          </div>
        </section>

        <section aria-labelledby="projects-heading" className="simple-section">
          <h2 id="projects-heading">Projects</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {knowledge.projects.all.map((project) => (
              <article key={project.title} className="simple-card">
                <p className="simple-label">{project.status ?? 'Project'}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${project.title} technologies`}>
                  {project.technologies.map((technology) => (
                    <li key={technology} className="simple-pill">
                      {technology}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-[#4d473d]">
            Network Firewall is a local educational simulation, not a claim of professional
            firewall deployment or real network monitoring.
          </p>
        </section>

        <section aria-labelledby="skills-heading" className="simple-section">
          <h2 id="skills-heading">Skills and Direction</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knowledge.skills.groups.map((group) => (
              <article key={group.group} className="simple-card">
                <h3>{group.group}</h3>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="contact-heading" className="simple-section">
          <h2 id="contact-heading">Contact and Jack OS</h2>
          <p className="max-w-3xl text-base leading-8 text-[#3c382f]">
            {knowledge.career.opportunityStatement} Jack OS remains the live interactive version
            of this portfolio.
          </p>
          <div className="simple-actions mt-5 flex flex-wrap gap-3">
            <Link href="/" className="simple-action-primary">
              Open Jack OS
            </Link>
            <Link href="/#projects" className="simple-action">
              View Projects
            </Link>
            <Link href="/#credentials" className="simple-action">
              View Credentials
            </Link>
            <Link href="/#resume" className="simple-action">
              Open Resume App
            </Link>
          </div>
        </section>

        <footer className="mt-14 border-t-2 border-[#171713] pt-6 text-sm leading-7 text-[#4d473d]">
          <p>
            Jack OS V3B - 1984 Blue Ocean. Simple Mode is an alternate presentation of the
            same portfolio content, not a separate website.
          </p>
          <p className="mt-2">{SITE_DESCRIPTION}</p>
        </footer>
      </div>
    </main>
  )
}

function SimpleFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="simple-card">
      <p className="simple-label">{label}</p>
      <p className="mt-2 text-base font-semibold leading-7 text-[#171713]">{value}</p>
    </div>
  )
}

import { Desktop } from '@/components/os/desktop'
import {
  CREDENTIALS,
  CONTACT,
  EDUCATION,
  INTERESTS,
  PROJECTS,
} from '@/lib/portfolio-data'
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site-metadata'

const SITE_PAGE_URL = `${SITE_URL}/`
const PERSON_ID = `${SITE_PAGE_URL}#jack-dennehey`
const WEBSITE_ID = `${SITE_PAGE_URL}#website`
const JACK_OS_ID = `${SITE_PAGE_URL}#jack-os`

const profileJsonLd = {
  '@type': 'ProfilePage',
  '@id': `${SITE_PAGE_URL}#profile`,
  url: SITE_PAGE_URL,
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-US',
  mainEntity: {
    '@id': PERSON_ID,
  },
}

const personJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE_AUTHOR,
  url: SITE_PAGE_URL,
  email: `mailto:${CONTACT.email}`,
  jobTitle: 'Business Student',
  description:
    'Penn State Brandywine business student focused on cybersecurity, networking, cloud computing, artificial intelligence, business, and product development.',
  sameAs: [CONTACT.linkedin, CONTACT.github],
  mainEntityOfPage: {
    '@id': `${SITE_PAGE_URL}#profile`,
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Delaware County Community College',
    sameAs: 'https://www.dccc.edu/',
  },
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'Penn State Brandywine',
    sameAs: 'https://www.psu.edu/',
  },
  award: CREDENTIALS.filter((credential) => credential.status.startsWith('Earned')).map(
    (credential) => `${credential.title}, ${credential.issuer}`,
  ),
  knowsAbout: [
    'Cybersecurity',
    'Computer networking',
    'Firewall rules',
    'Packet inspection',
    'Cloud computing',
    'Artificial intelligence',
    'Business',
    'Technology projects',
    'Mobile product development',
    'Godot game development',
    'Football intelligence systems',
    'Machine learning evaluation',
    'Interactive portfolio design',
  ],
}

const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  alternateName: ['Jack Dennehey Portfolio', 'Jack OS Portfolio'],
  url: SITE_PAGE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-US',
  publisher: {
    '@id': PERSON_ID,
  },
  creator: {
    '@id': PERSON_ID,
  },
  about: [
    { '@id': PERSON_ID },
    { '@id': JACK_OS_ID },
  ],
}

const jackOsJsonLd = {
  '@type': 'WebApplication',
  '@id': JACK_OS_ID,
  name: SITE_NAME,
  url: SITE_PAGE_URL,
  applicationCategory: 'PortfolioApplication',
  operatingSystem: 'Web browser',
  browserRequirements: 'Requires JavaScript for the full interactive desktop experience.',
  author: {
    '@id': PERSON_ID,
  },
  description: SITE_DESCRIPTION,
  featureList: [
    'Network Firewall packet simulation',
    'Recruiter Mode guided professional overview',
    'Timeline of education, credentials, and projects',
    'Road Map of confirmed professional goals',
    'Local Jack OS achievement milestones',
    'Simple Mode professional portfolio view',
    'Reviewed public Guestbook',
    'Interactive desktop portfolio interface',
    'Kickoff football intelligence platform',
    'Pocket Pier mobile game project overview',
  ],
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [personJsonLd, websiteJsonLd, profileJsonLd, jackOsJsonLd],
}

// Server-rendered, screen-reader/crawler-friendly summary of the portfolio.
// Visually hidden, but ensures content is available without JavaScript.
function SeoContent() {
  return (
    <div id="portfolio-content" className="sr-only">
      <h1>Jack Dennehey — Business Student at Penn State Brandywine</h1>
      <p>
        Jack Dennehey is a business student at Penn State Brandywine passionate about
        technology, cybersecurity, networking, cloud computing, artificial intelligence, and
        product development.
      </p>

      <h2>Interests</h2>
      <ul>
        {INTERESTS.map((interest) => (
          <li key={interest}>{interest}</li>
        ))}
      </ul>

      <h2>Projects</h2>
      <ul>
        {PROJECTS.map((project) => (
          <li key={project.title}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p>Technologies: {project.technologies.join(', ')}</p>
          </li>
        ))}
      </ul>

      <h2>Interactive Jack OS Applications</h2>
      <ul>
        <li>
          Kickoff: a football intelligence platform with a walk-forward prediction model, historical
          evaluation, structured research tools, and a live public deployment.
        </li>
        <li>
          Network Firewall: a local educational packet simulation showing protocols, services,
          firewall rules, allowed traffic, blocked traffic, inspected traffic, and plain-English
          explanations. It does not inspect visitor devices or display real IP addresses.
        </li>
        <li>
          Recruiter Mode: a guided professional overview designed for fast access to Jack&apos;s
          education, credentials, projects, skills, and contact information.
        </li>
        <li>
          Timeline: a structured history of Jack&apos;s education, credentials, projects, and current
          learning path.
        </li>
        <li>
          Road Map: a centralized view of confirmed current studies, planned cloud learning, and
          professional direction without unsupported percentages or dates.
        </li>
        <li>
          Achievements: local browser milestones for meaningful Jack OS interactions.
        </li>
        <li>
          Simple Mode: a conventional professional portfolio view using the same verified content
          as Jack OS.
        </li>
        <li>
          Guestbook: a reviewed visitor message system with moderation before public display.
        </li>
        <li>
          J.D.: a local portfolio assistant that answers questions about Jack&apos;s background,
          projects, credentials, and contact information.
        </li>
      </ul>

      <h2>Recruiter Access</h2>
      <p>
        Recruiter Mode provides a fast guided overview of Jack&apos;s education, credentials,
        technical direction, featured projects, resume access, and contact workflow.
      </p>

      <h2>Credentials</h2>
      <ul>
        {CREDENTIALS.map((cert) => (
          <li key={cert.title}>
            {cert.title} — {cert.issuer} ({cert.status})
          </li>
        ))}
      </ul>

      <h2>Education</h2>
      <ul>
        {EDUCATION.map((item) => (
          <li key={item.school}>
            {item.degree}, {item.school}
          </li>
        ))}
      </ul>

      <h2>Contact</h2>
      <ul>
        <li>Email: {CONTACT.email}</li>
        <li>GitHub: {CONTACT.github}</li>
        <li>LinkedIn: {CONTACT.linkedin}</li>
        <li>Website: {CONTACT.domain}</li>
      </ul>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <SeoContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <Desktop />
    </>
  )
}

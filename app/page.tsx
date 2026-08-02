import { Desktop } from '@/components/os/desktop'
import {
  CREDENTIALS,
  CONTACT,
  EDUCATION,
  INTERESTS,
  PROJECTS,
} from '@/lib/portfolio-data'
import { SITE_TITLE, SITE_URL } from '@/lib/site-metadata'

const SITE_PAGE_URL = `${SITE_URL}/`
const PAGE_DESCRIPTION =
  'Jack Dennehey’s interactive portfolio covering cybersecurity, networking, cloud computing, artificial intelligence, business, and technical projects.'

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_PAGE_URL}#profile`,
  url: SITE_PAGE_URL,
  name: SITE_TITLE,
  description: PAGE_DESCRIPTION,
  mainEntity: {
    '@type': 'Person',
    '@id': `${SITE_PAGE_URL}#jack-dennehey`,
    name: 'Jack Dennehey',
    url: SITE_PAGE_URL,
    jobTitle: 'Student',
    description:
      'Penn State Brandywine business student with interests in cybersecurity, networking, cloud computing, artificial intelligence, and technology.',
    sameAs: [CONTACT.linkedin, CONTACT.github],
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
    knowsAbout: [
      'Cybersecurity',
      'Computer networking',
      'Cloud computing',
      'Artificial intelligence',
      'Business',
      'Technology',
    ],
  },
}

// Server-rendered, screen-reader/crawler-friendly summary of the portfolio.
// Visually hidden, but ensures content is available without JavaScript.
function SeoContent() {
  return (
    <div id="portfolio-content" className="sr-only">
      <h1>Jack Dennehey — Business Student at Penn State Brandywine</h1>
      <p>
        Jack Dennehey is a business student at Penn State Brandywine passionate about
        technology, cybersecurity, networking, cloud computing, and artificial intelligence.
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
          __html: JSON.stringify(profileJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Desktop />
    </>
  )
}

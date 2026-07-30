import { Desktop } from '@/components/os/desktop'
import {
  CREDENTIALS,
  CONTACT,
  EDUCATION,
  INTERESTS,
  PROJECTS,
} from '@/lib/portfolio-data'

// Server-rendered, screen-reader/crawler-friendly summary of the portfolio.
// Visually hidden, but ensures content is available without JavaScript.
function SeoContent() {
  return (
    <div className="sr-only">
      <h1>Jack Dennehey — Business Student at Penn State</h1>
      <p>
        Jack Dennehey is a business student at The Pennsylvania State University passionate about
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
      <Desktop />
    </>
  )
}

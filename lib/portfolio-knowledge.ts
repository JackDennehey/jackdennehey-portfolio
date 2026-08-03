import {
  CONTACT,
  CREDENTIALS,
  EDUCATION,
  INTERESTS,
  PROJECTS,
  SKILLS,
} from './portfolio-data'

export const RECRUITER_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'education', label: 'Education' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills and Direction' },
  { id: 'contact', label: 'Contact' },
] as const

export type RecruiterSectionId = (typeof RECRUITER_SECTIONS)[number]['id']

export function isRecruiterSectionId(value: string): value is RecruiterSectionId {
  return RECRUITER_SECTIONS.some((section) => section.id === value)
}

const completedCredentials = CREDENTIALS.filter(
  (credential) =>
    credential.status === 'Earned' || credential.status === 'Earned with Honors',
)
const inProgressCredentials = CREDENTIALS.filter(
  (credential) => credential.status === 'In Progress',
)
const plannedCredentials = CREDENTIALS.filter((credential) => credential.status === 'Planned')
const currentEducation = EDUCATION.filter((education) =>
  education.period.toLowerCase().includes('current'),
)
const priorEducation = EDUCATION.filter(
  (education) => !education.period.toLowerCase().includes('current'),
)
const jackOsProject = PROJECTS.find((project) => project.title === 'Portfolio Website') ?? PROJECTS[0]

export const PORTFOLIO_KNOWLEDGE = {
  person: {
    name: 'Jack Dennehey',
    headline: 'Business student at Penn State Brandywine',
    overview:
      'Jack Dennehey is a Business student at Penn State Brandywine with a background in cybersecurity and networking and growing interests in cloud computing, artificial intelligence, and front-end development.',
    professionalDirection:
      'Jack is developing a path that connects business judgment with technical understanding, especially where cybersecurity, networking, cloud, AI, front-end development, and product/interface thinking meet.',
  },
  contact: {
    email: CONTACT.email,
    github: CONTACT.github,
    linkedin: CONTACT.linkedin,
    portfolio: `https://${CONTACT.domain}`,
    domain: CONTACT.domain,
  },
  career: {
    opportunityStatement:
      'Open to internships, entry-level opportunities, professional connections, and projects that combine business and technology.',
    businessTechnology:
      "Jack's direction is the overlap between business judgment and technical understanding. Cybersecurity and networking explain how systems behave, cloud and AI expand what tools are available, and business helps decide when those tools solve a real problem.",
    managementLeadership:
      'The public portfolio supports business studies, communication, analysis, and project-management interests. It does not claim formal management employment or leadership roles beyond those approved public skills and educational direction.',
    navigationSummary:
      'For a quick professional path, open Recruiter Mode. For proof points, open Credentials or Projects. For direct outreach, open Contact or copy the public email.',
    navigationTargets: ['Recruiter Mode', 'Projects', 'Credentials', 'Contact'],
  },
  education: {
    current: currentEducation,
    prior: priorEducation,
  },
  credentials: {
    completed: completedCredentials,
    inProgress: inProgressCredentials,
    planned: plannedCredentials,
    all: CREDENTIALS,
  },
  projects: {
    featured: jackOsProject,
    all: PROJECTS,
    jackOsSystems: [
      'window management',
      'personalization',
      'wallpapers',
      'themes',
      'sound management',
      'Secrets',
      'Command Palette',
      'Timeline',
      'moderated Guestbook',
      'Network Firewall simulation',
      'responsive behavior',
      'accessibility',
      'persistence',
    ],
  },
  skills: {
    groups: SKILLS,
    areas: [
      'Cybersecurity',
      'Networking',
      'Business',
      'Cloud computing',
      'Artificial intelligence',
      'Front-end development',
      'Product and interface thinking',
    ],
    interests: INTERESTS,
  },
  resume: {
    publicAvailable: false,
    message:
      'A public resume is not currently available through J.D.; visitors can review Projects, Credentials, Contact, and Recruiter Mode for the approved portfolio overview.',
  },
} as const

export type PortfolioKnowledge = typeof PORTFOLIO_KNOWLEDGE

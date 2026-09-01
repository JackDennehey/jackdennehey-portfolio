import {
  CONTACT,
  CREDENTIALS,
  EDUCATION,
  INTERESTS,
  PROJECTS,
  SKILLS,
} from './portfolio-data'
import { BLUE_OCEAN_COPY } from './blue-ocean'
import { KICKOFF_COPY, KICKOFF_URL } from './kickoff'
import { POCKET_PIER_APP_STORE_URL, POCKET_PIER_COPY } from './pocket-pier'

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
const pocketPierProject = PROJECTS.find((project) => project.title === POCKET_PIER_COPY.title)

export const PORTFOLIO_KNOWLEDGE = {
  person: {
    name: 'Jack Dennehey',
    headline: 'Business student at Penn State Brandywine',
    overview:
      'Jack Dennehey is a Business student at Penn State Brandywine with a background in cybersecurity and networking and growing interests in cloud computing, artificial intelligence, front-end development, and product development.',
    professionalDirection:
      'Jack is developing a path that connects business judgment with technical understanding, especially where cybersecurity, networking, cloud, AI, front-end development, mobile product development, and product/interface thinking meet.',
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
      "Jack's direction is the overlap between business judgment and technical understanding. Cybersecurity and networking explain how systems behave, cloud and AI expand what tools are available, and product work like Kickoff, Jack OS, and Pocket Pier shows how ideas become usable systems.",
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
      'Road Map',
      'Achievements',
      'Simple Mode',
      'moderated Guestbook',
      'Network Firewall simulation',
      '1984 Blue Ocean keynote',
      'responsive behavior',
      'accessibility',
      'persistence',
    ],
    keynote: {
      type: BLUE_OCEAN_COPY.type,
      title: BLUE_OCEAN_COPY.title,
      shortDescription: BLUE_OCEAN_COPY.shortDescription,
      longDescription: BLUE_OCEAN_COPY.longDescription,
      themes: BLUE_OCEAN_COPY.themes,
      authorship: BLUE_OCEAN_COPY.authorship,
      chapters: BLUE_OCEAN_COPY.chapters,
      stageCount: 31,
      release: BLUE_OCEAN_COPY.versionLabel,
    },
    pocketPier: {
      title: POCKET_PIER_COPY.title,
      studio: POCKET_PIER_COPY.studio,
      shortDescription: POCKET_PIER_COPY.shortDescription,
      status: pocketPierProject?.status ?? POCKET_PIER_COPY.status,
      platform: POCKET_PIER_COPY.platform,
      engine: POCKET_PIER_COPY.engine,
      language: POCKET_PIER_COPY.language,
      url: POCKET_PIER_APP_STORE_URL,
      gameplayLoop: POCKET_PIER_COPY.gameplayLoop,
      lifecycle: POCKET_PIER_COPY.lifecycle,
      distinction:
        'Jack OS is the web/software platform; Pocket Pier is the independent mobile product built under JDen Studios and now available on the App Store.',
    },
    kickoff: {
      title: KICKOFF_COPY.title,
      subtitle: KICKOFF_COPY.subtitle,
      shortDescription: KICKOFF_COPY.shortDescription,
      status: KICKOFF_COPY.status,
      url: KICKOFF_URL,
      modelVersion: KICKOFF_COPY.modelVersion,
      evaluation: KICKOFF_COPY.evaluation,
      technologies: KICKOFF_COPY.technologies,
      distinction:
        'Kickoff is the deployed football intelligence product; Jack OS is the portfolio platform that presents it.',
    },
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
      'Mobile product development',
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

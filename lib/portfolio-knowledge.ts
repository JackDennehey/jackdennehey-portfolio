import {
  getCompletedCredentials,
  getCurrentEducation,
  getInProgressCredentials,
  getPlannedCredentials,
  getPriorEducation,
  getProjectById,
} from './portfolio'
import {
  CONTACT,
  CREDENTIALS,
  INTERESTS,
  PROJECTS,
  SKILLS,
} from './portfolio-data'
import { BLUE_OCEAN_COPY } from './blue-ocean'
import { KICKOFF_COPY, KICKOFF_URL } from './kickoff'
import { POCKET_PIER_APP_STORE_URL, POCKET_PIER_COPY } from './pocket-pier'
import { PROFILE } from './portfolio'

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

const jackOsProject = PROJECTS.find((project) => project.id === 'jackos') ?? PROJECTS[0]
const pocketPierProject = PROJECTS.find((project) => project.id === 'pocket-pier')
const canonicalJackOs = getProjectById('jackos')

export const PORTFOLIO_KNOWLEDGE = {
  person: {
    name: PROFILE.name,
    headline: PROFILE.headline,
    overview: PROFILE.summary,
    professionalDirection: PROFILE.professionalDirection,
  },
  contact: {
    email: CONTACT.email,
    github: CONTACT.github,
    linkedin: CONTACT.linkedin,
    portfolio: `https://${CONTACT.domain}`,
    domain: CONTACT.domain,
  },
  career: {
    opportunityStatement: PROFILE.opportunityStatement,
    businessTechnology:
      "Jack's direction is the overlap between business judgment and technical understanding. Cybersecurity and networking explain how systems behave, cloud and AI expand what tools are available, and product work like Kickoff, JackOS, and Pocket Pier shows how ideas become usable systems.",
    managementLeadership:
      'The public portfolio supports business studies, communication, analysis, and project-management interests. It does not claim formal management employment or leadership roles beyond those approved public skills and educational direction.',
    navigationSummary:
      'For a conventional full-site reading, open Simple Mode. Inside JackOS, Portfolio.app is the overview. Recruiter Mode is the short evidence brief. Resume.app and Contact are one click away.',
    navigationTargets: ['Portfolio', 'Simple Mode', 'Recruiter Mode', 'Resume', 'Contact'],
  },
  education: {
    current: getCurrentEducation().map((entry) => ({
      school: entry.school,
      degree: entry.program,
      period: entry.period,
      detail: entry.detail,
    })),
    prior: getPriorEducation().map((entry) => ({
      school: entry.school,
      degree: entry.program,
      period: entry.period,
      detail: entry.detail,
    })),
  },
  credentials: {
    completed: getCompletedCredentials(),
    inProgress: getInProgressCredentials(),
    planned: getPlannedCredentials(),
    all: CREDENTIALS,
  },
  projects: {
    featured: jackOsProject,
    all: PROJECTS,
    jackOsSystems: canonicalJackOs?.keySystems ?? [],
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
        'JackOS is the web/software platform; Pocket Pier is the independent mobile product built under JDen Studios and now available on the App Store.',
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
        'Kickoff is the deployed football intelligence product; JackOS is the portfolio platform that presents it.',
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
    publicAvailable: true,
    href: '/jack-dennehey-resume.txt',
    message:
      'A downloadable resume is available in Resume.app and Simple Mode. It covers education, skills, and independent project work. Portfolio.app and Recruiter Mode are the interactive overviews.',
  },
} as const

export type PortfolioKnowledge = typeof PORTFOLIO_KNOWLEDGE

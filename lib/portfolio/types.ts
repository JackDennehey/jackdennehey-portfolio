export type ProjectStatus = 'live' | 'in-progress' | 'ongoing' | 'planned'

export type ProjectCategory =
  | 'product'
  | 'platform'
  | 'game'
  | 'keynote'
  | 'study'
  | 'lab'

export type ProjectLinkKind = 'website' | 'github' | 'app-store' | 'demo'

export type PortfolioInternalAppId = 'kickoff' | 'pocket-pier' | 'blue-ocean' | 'portfolio'

export type ProjectMedia = {
  src: string
  alt: string
}

export type ProjectMetric = {
  label: string
  value: string
}

export type ProjectLink = {
  label: string
  href: string
  kind: ProjectLinkKind
}

export type ProjectAction =
  | {
      kind: 'case-study'
      projectId: string
      label: string
    }
  | {
      kind: 'internal-app'
      appId: PortfolioInternalAppId
      label: string
    }
  | {
      kind: 'external'
      href: string
      label: string
    }

export type Project = {
  id: string
  name: string
  alsoKnownAs?: readonly string[]
  shortDescription: string
  longDescription?: string
  status: ProjectStatus
  statusLabel?: string
  category: ProjectCategory
  technologies: readonly string[]
  platform?: string
  role?: string
  dates?: {
    label: string
    start?: string
    end?: string
  }
  links?: readonly ProjectLink[]
  media?: {
    thumbnail?: ProjectMedia
    gallery?: readonly ProjectMedia[]
  }
  highlights?: readonly string[]
  challenges?: readonly string[]
  outcomes?: readonly string[]
  lessons?: readonly string[]
  metrics?: readonly ProjectMetric[]
  featured?: boolean
  featuredOrder?: number
  featuredLabel?: string
  whyExists?: string
  result?: string
  caseStudyAvailable?: boolean
  implementation?: string
  keySystems?: readonly string[]
  internalApp?: PortfolioInternalAppId
  internalActionLabel?: string
  spotlight?: boolean
}

export type ContactInfo = {
  email: string
  github: string
  linkedin: string
  domain: string
}

export type Profile = {
  name: string
  headline: string
  role: string
  summary: string
  shortIntro: string
  professionalDirection: string
  opportunityStatement: string
  productName: 'JackOS'
  productDisplayName: 'JackOS'
  focusAreas: readonly string[]
  contact: ContactInfo
}

export type EducationStatus = 'current' | 'completed'

export type EducationEntry = {
  id: string
  school: string
  program: string
  period: string
  status: EducationStatus
  honors?: string
  detail: string
  coursework?: readonly string[]
}

export type ExperienceEntry = {
  id: string
  role: string
  organization: string
  period: string
  description: string
  achievements?: readonly string[]
  technologies?: readonly string[]
}

export type SkillGroup = {
  id: string
  group: string
  items: readonly string[]
  relatedProjectIds?: readonly string[]
}

export type CredentialStatus = 'Earned' | 'Earned with Honors' | 'In Progress' | 'Planned'

export type CredentialSection = {
  heading: string
  body?: string
  items?: string[]
}

export type Credential = {
  id: string
  title: string
  issuer: string
  status: CredentialStatus
  marker: string
  summary: string
  date?: string
  honor?: string
  context?: string
  featured?: boolean
  verification?: {
    label: string
    url: string
  }
  sections: CredentialSection[]
}

export type SeoCopy = {
  siteName: string
  title: string
  ogTitle: string
  description: string
  ogAlt: string
  ogSubtitle: string
  keywords: readonly string[]
}

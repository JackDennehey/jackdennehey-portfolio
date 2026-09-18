import {
  CREDENTIALS as CANONICAL_CREDENTIALS,
  EDUCATION as CANONICAL_EDUCATION,
  EXPERIENCE as CANONICAL_EXPERIENCE,
  PROFILE,
  PROJECTS as CANONICAL_PROJECTS,
  SKILL_GROUPS,
  type Credential as CanonicalCredential,
  type PortfolioInternalAppId,
  type Project as CanonicalProject,
} from './portfolio'

export const CONTACT = PROFILE.contact

export type Project = {
  id: string
  title: string
  status?: string
  description: string
  technologies: string[]
  github?: string
  demo?: string
  featured?: boolean
  featuredLabel?: string
  internalApp?: PortfolioInternalAppId
  internalActionLabel?: string
  thumbnail?: {
    src: string
    alt: string
  }
  role?: string
  implementation?: string
  keySystems?: string[]
}

function toLegacyProject(project: CanonicalProject): Project {
  const github = project.links?.find((link) => link.kind === 'github')?.href
  const demo = project.links?.find((link) => link.kind !== 'github')?.href

  return {
    id: project.id,
    title: project.name,
    status: project.statusLabel ?? project.status,
    description:
      project.id === 'blue-ocean'
        ? (project.longDescription ?? project.shortDescription)
        : project.shortDescription,
    technologies: [...project.technologies],
    github,
    demo,
    featured: project.spotlight,
    featuredLabel: project.featuredLabel,
    internalApp: project.internalApp,
    internalActionLabel: project.internalActionLabel,
    thumbnail: project.id === 'pocket-pier' ? project.media?.thumbnail : undefined,
    role: project.role,
    implementation: project.implementation,
    keySystems: project.keySystems ? [...project.keySystems] : undefined,
  }
}

export const PROJECTS: Project[] = CANONICAL_PROJECTS.map(toLegacyProject)

export type CredentialStatus = CanonicalCredential['status']
export type CredentialSection = CanonicalCredential['sections'][number]
export type Credential = CanonicalCredential

export const CREDENTIALS: Credential[] = [...CANONICAL_CREDENTIALS]
export const CERTIFICATIONS = CREDENTIALS

export const SKILLS = SKILL_GROUPS.map((group) => ({
  group: group.group,
  items: [...group.items],
}))

export const EDUCATION = CANONICAL_EDUCATION.map((entry) => ({
  school: entry.school,
  degree: entry.program,
  period: entry.period,
  detail: entry.detail,
}))

export const EXPERIENCE = CANONICAL_EXPERIENCE.map((entry) => ({
  role: entry.role,
  org: entry.organization,
  period: entry.period,
  detail: entry.description,
}))

export const INTERESTS = [...PROFILE.focusAreas]

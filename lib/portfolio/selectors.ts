import { CREDENTIALS } from './credentials'
import { EDUCATION } from './education'
import { PROJECTS } from './projects'
import { SKILL_GROUPS } from './skills'
import type { Credential, EducationEntry, Project, SkillGroup } from './types'

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}

export function getFeaturedProjects(): Project[] {
  return PROJECTS.filter((project) => project.featured)
    .slice()
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
}

export function getSpotlightProjects(): Project[] {
  return PROJECTS.filter((project) => project.spotlight)
}

export function getProjectsWithInternalApps(): Project[] {
  return PROJECTS.filter((project) => project.internalApp)
}

export function getCredentialById(id: string): Credential | undefined {
  return CREDENTIALS.find((credential) => credential.id === id)
}

export function getCompletedCredentials(): Credential[] {
  return CREDENTIALS.filter(
    (credential) =>
      credential.status === 'Earned' || credential.status === 'Earned with Honors',
  )
}

export function getInProgressCredentials(): Credential[] {
  return CREDENTIALS.filter((credential) => credential.status === 'In Progress')
}

export function getPlannedCredentials(): Credential[] {
  return CREDENTIALS.filter((credential) => credential.status === 'Planned')
}

export function getCurrentEducation(): EducationEntry[] {
  return EDUCATION.filter((entry) => entry.status === 'current')
}

export function getPriorEducation(): EducationEntry[] {
  return EDUCATION.filter((entry) => entry.status !== 'current')
}

export function getSkillAreas(): string[] {
  return SKILL_GROUPS.flatMap((group) => [...group.items])
}

export type ResolvedProjectAction =
  | {
      kind: 'case-study'
      label: string
      projectId: string
    }
  | {
      kind: 'internal-app'
      label: string
      appId: NonNullable<Project['internalApp']>
    }
  | {
      kind: 'external'
      label: string
      href: string
    }

export function getProjectActions(project: Project): ResolvedProjectAction[] {
  const actions: ResolvedProjectAction[] = []

  if (project.caseStudyAvailable) {
    actions.push({
      kind: 'case-study',
      label: 'Case Study',
      projectId: project.id,
    })
  }

  if (project.internalApp) {
    actions.push({
      kind: 'internal-app',
      label: project.internalActionLabel ?? 'View project',
      appId: project.internalApp,
    })
  }

  for (const link of project.links ?? []) {
    if (project.internalApp === 'portfolio' && link.kind === 'website') continue
    if (project.internalApp && link.kind === 'demo') continue
    actions.push({
      kind: 'external',
      label: link.label,
      href: link.href,
    })
  }

  return actions
}

export function getFeaturedProjectActions(project: Project): ResolvedProjectAction[] {
  return getProjectActions(project).filter((action) => {
    if (action.kind === 'internal-app' && action.appId === 'portfolio') return false
    if (
      action.kind === 'internal-app' &&
      project.caseStudyAvailable &&
      action.appId !== 'blue-ocean'
    ) {
      return false
    }
    return true
  })
}

export function getProjectEvidence(project: Project) {
  return {
    id: project.id,
    name: project.name,
    label: project.featuredLabel,
    what: project.shortDescription,
    role: project.role,
    result: project.result,
    technologies: project.technologies.slice(0, 5),
    actions: getFeaturedProjectActions(project),
  }
}

export function listUniqueTechnologies(): string[] {
  return [...new Set(PROJECTS.flatMap((project) => [...project.technologies]))]
}

export function findSkillGroup(id: string): SkillGroup | undefined {
  return SKILL_GROUPS.find((group) => group.id === id)
}

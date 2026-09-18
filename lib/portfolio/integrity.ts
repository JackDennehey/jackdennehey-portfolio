import { CASE_STUDIES, isCaseStudyProjectId } from './case-studies'
import { CREDENTIALS } from './credentials'
import { EDUCATION } from './education'
import { EXPERIENCE } from './experience'
import { PROJECTS } from './projects'
import { SKILL_GROUPS } from './skills'
import { getFeaturedProjects, getProjectById } from './selectors'

const HTTP_URL = /^https?:\/\//i

function collectIssues() {
  const issues: string[] = []
  const projectIds = new Set<string>()
  const featuredOrders = new Set<number>()

  for (const project of PROJECTS) {
    if (!project.id.trim()) issues.push('Project is missing an id.')
    if (projectIds.has(project.id)) issues.push(`Duplicate project id: ${project.id}`)
    projectIds.add(project.id)

    if (!project.name.trim()) issues.push(`Project ${project.id} is missing a name.`)
    if (!project.shortDescription.trim()) {
      issues.push(`Project ${project.id} is missing a short description.`)
    }
    if (project.technologies.length === 0) {
      issues.push(`Project ${project.id} has no technologies.`)
    }

    if (project.featured) {
      if (project.featuredOrder == null) {
        issues.push(`Featured project ${project.id} is missing featuredOrder.`)
      } else if (featuredOrders.has(project.featuredOrder)) {
        issues.push(`Duplicate featuredOrder ${project.featuredOrder} on ${project.id}.`)
      } else {
        featuredOrders.add(project.featuredOrder)
      }
    }

    for (const link of project.links ?? []) {
      if (!HTTP_URL.test(link.href)) {
        issues.push(`Project ${project.id} has an invalid link: ${link.href}`)
      }
    }

    if (project.caseStudyAvailable) {
      if (!isCaseStudyProjectId(project.id) || !CASE_STUDIES[project.id]) {
        issues.push(`Project ${project.id} is marked caseStudyAvailable without a case study.`)
      }
    }
  }

  for (const study of Object.values(CASE_STUDIES)) {
    if (!getProjectById(study.projectId)) {
      issues.push(`Case study references missing project: ${study.projectId}`)
    }
    if (study.sections.length === 0) {
      issues.push(`Case study ${study.projectId} has no sections.`)
    }
  }

  for (const project of getFeaturedProjects()) {
    if (!getProjectById(project.id)) {
      issues.push(`Featured project reference is missing: ${project.id}`)
    }
  }

  const credentialIds = new Set<string>()
  for (const credential of CREDENTIALS) {
    if (credentialIds.has(credential.id)) {
      issues.push(`Duplicate credential id: ${credential.id}`)
    }
    credentialIds.add(credential.id)
    if (credential.verification && !HTTP_URL.test(credential.verification.url)) {
      issues.push(`Credential ${credential.id} has an invalid verification URL.`)
    }
  }

  const educationIds = new Set<string>()
  for (const entry of EDUCATION) {
    if (educationIds.has(entry.id)) issues.push(`Duplicate education id: ${entry.id}`)
    educationIds.add(entry.id)
  }

  const experienceIds = new Set<string>()
  for (const entry of EXPERIENCE) {
    if (experienceIds.has(entry.id)) issues.push(`Duplicate experience id: ${entry.id}`)
    experienceIds.add(entry.id)
  }

  for (const group of SKILL_GROUPS) {
    for (const projectId of group.relatedProjectIds ?? []) {
      if (!getProjectById(projectId)) {
        issues.push(`Skill group ${group.id} references missing project ${projectId}.`)
      }
    }
  }

  return issues
}

export function assertPortfolioIntegrity() {
  const issues = collectIssues()
  if (issues.length === 0) return
  throw new Error(`Portfolio content integrity failed:\n- ${issues.join('\n- ')}`)
}

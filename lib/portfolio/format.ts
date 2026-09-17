import { CREDENTIALS } from './credentials'
import { EDUCATION } from './education'
import { EXPERIENCE } from './experience'
import { PROFILE } from './profile'
import { PROJECTS } from './projects'
import { SKILL_GROUPS } from './skills'
import { getCompletedCredentials, getFeaturedProjects } from './selectors'
import type { Project } from './types'

export function formatProfileBrief() {
  return [
    `${PROFILE.name} — ${PROFILE.headline}.`,
    PROFILE.summary,
    PROFILE.professionalDirection,
    PROFILE.opportunityStatement,
  ].join(' ')
}

export function formatProjectBrief(project: Project) {
  const parts = [
    `${project.name}: ${project.shortDescription}`,
    project.role ? `Role: ${project.role}.` : null,
    project.result ? `Result: ${project.result}` : null,
    `Technologies: ${project.technologies.join(', ')}.`,
  ]
  return parts.filter(Boolean).join(' ')
}

export function formatFeaturedProjectsBrief() {
  return getFeaturedProjects().map(formatProjectBrief).join('\n')
}

export function formatExperienceBrief() {
  return EXPERIENCE.map((entry) => {
    const tech = entry.technologies?.length ? ` Technologies: ${entry.technologies.join(', ')}.` : ''
    return `${entry.role} / ${entry.organization} (${entry.period}). ${entry.description}${tech}`
  }).join('\n')
}

export function formatEducationBrief() {
  return EDUCATION.map((entry) => {
    const honors = entry.honors ? ` Honors: ${entry.honors}.` : ''
    return `${entry.program}, ${entry.school} (${entry.period}). ${entry.detail}${honors}`
  }).join('\n')
}

export function formatCredentialsBrief() {
  return CREDENTIALS.map((credential) => {
    const date = credential.date ? ` ${credential.date}.` : ''
    return `${credential.title} — ${credential.issuer} (${credential.status}).${date} ${credential.summary}`
  }).join('\n')
}

export function formatSkillsBrief() {
  return SKILL_GROUPS.map((group) => `${group.group}: ${group.items.join(', ')}`).join('\n')
}

export function formatAssistantKnowledgeContext() {
  const earned = getCompletedCredentials()
    .map((credential) => `${credential.title} (${credential.issuer})`)
    .join('; ')

  return [
    '## Profile',
    formatProfileBrief(),
    '',
    '## Featured projects',
    formatFeaturedProjectsBrief(),
    '',
    '## All projects',
    PROJECTS.map((project) => `- ${formatProjectBrief(project)}`).join('\n'),
    '',
    '## Experience',
    formatExperienceBrief(),
    '',
    '## Education',
    formatEducationBrief(),
    '',
    '## Credentials',
    formatCredentialsBrief(),
    `Completed: ${earned}.`,
    '',
    '## Skills',
    formatSkillsBrief(),
    '',
    '## Contact',
    `Email: ${PROFILE.contact.email}`,
    `GitHub: ${PROFILE.contact.github}`,
    `LinkedIn: ${PROFILE.contact.linkedin}`,
    `Site: https://${PROFILE.contact.domain}`,
  ].join('\n')
}

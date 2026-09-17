import { isWindowId } from '@/components/os/apps'
import { isRecruiterSectionId } from '@/lib/portfolio-knowledge'
import { getCaseStudy, isCaseStudyProjectId } from '@/lib/portfolio/case-studies'
import { getProjectById } from '@/lib/portfolio/selectors'
import { buildSpotlightIndex } from './build-index'
import {
  PORTFOLIO_SECTION_IDS,
  SPOTLIGHT_SYSTEM_COMMANDS,
  type PortfolioSectionId,
  type SpotlightAction,
  type SpotlightEntry,
} from './types'

const HTTP_URL = /^https?:\/\//i

function isPortfolioSectionId(value: string): value is PortfolioSectionId {
  return (PORTFOLIO_SECTION_IDS as readonly string[]).includes(value)
}

function actionIssues(entry: SpotlightEntry) {
  const issues: string[] = []
  const action = entry.action

  switch (action.type) {
    case 'open-app':
      if (!isWindowId(action.appId)) {
        issues.push(`${entry.id} opens unknown app ${action.appId}`)
      }
      break
    case 'open-case-study':
      if (!isCaseStudyProjectId(action.projectId) || !getCaseStudy(action.projectId)) {
        issues.push(`${entry.id} opens missing case study ${action.projectId}`)
      }
      break
    case 'open-case-study-section': {
      const study = isCaseStudyProjectId(action.projectId)
        ? getCaseStudy(action.projectId)
        : undefined
      if (!study) {
        issues.push(`${entry.id} opens missing case study ${action.projectId}`)
        break
      }
      if (!study.sections.some((section) => section.id === action.sectionId)) {
        issues.push(`${entry.id} opens missing section ${action.sectionId}`)
      }
      break
    }
    case 'open-portfolio-section':
      if (!isPortfolioSectionId(action.sectionId)) {
        issues.push(`${entry.id} opens unknown portfolio section ${action.sectionId}`)
      }
      break
    case 'open-recruiter-section':
      if (!isRecruiterSectionId(action.sectionId)) {
        issues.push(`${entry.id} opens unknown recruiter section ${action.sectionId}`)
      }
      break
    case 'open-external':
      if (!HTTP_URL.test(action.href)) {
        issues.push(`${entry.id} has invalid external URL ${action.href}`)
      }
      break
    case 'system':
      if (!(SPOTLIGHT_SYSTEM_COMMANDS as readonly string[]).includes(action.command)) {
        issues.push(`${entry.id} has unknown system command ${action.command}`)
      }
      break
    default: {
      const _never: never = action
      issues.push(`${entry.id} has unsupported action ${JSON.stringify(_never)}`)
    }
  }

  if (entry.sourceProjectId && !getProjectById(entry.sourceProjectId)) {
    issues.push(`${entry.id} references missing project ${entry.sourceProjectId}`)
  }
  if (entry.iconAppId && !isWindowId(entry.iconAppId)) {
    issues.push(`${entry.id} uses unknown icon app ${entry.iconAppId}`)
  }

  return issues
}

export function collectSpotlightIntegrityIssues(entries: readonly SpotlightEntry[] = buildSpotlightIndex()) {
  const issues: string[] = []
  const ids = new Set<string>()

  for (const entry of entries) {
    if (!entry.id.trim()) issues.push('Spotlight entry is missing an id.')
    if (ids.has(entry.id)) issues.push(`Duplicate Spotlight id: ${entry.id}`)
    ids.add(entry.id)
    if (!entry.title.trim()) issues.push(`Spotlight entry ${entry.id} is missing a title.`)
    issues.push(...actionIssues(entry))
  }

  return issues
}

export function assertSpotlightIntegrity() {
  const issues = collectSpotlightIntegrityIssues()
  if (issues.length === 0) return
  throw new Error(`Spotlight index integrity failed:\n- ${issues.join('\n- ')}`)
}

export function describeSpotlightAction(action: SpotlightAction) {
  switch (action.type) {
    case 'open-app':
      return 'Open application'
    case 'open-case-study':
      return 'Open case study'
    case 'open-case-study-section':
      return 'Open case-study section'
    case 'open-portfolio-section':
      return 'Open Portfolio section'
    case 'open-recruiter-section':
      return 'Open Recruiter section'
    case 'open-external':
      return 'Open external link'
    case 'system':
      return 'Run system action'
  }
}

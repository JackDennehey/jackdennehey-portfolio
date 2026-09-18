import { BLUE_OCEAN_CASE_STUDY } from './blue-ocean'
import { JACKOS_CASE_STUDY } from './jackos'
import { KICKOFF_CASE_STUDY } from './kickoff'
import { POCKET_PIER_CASE_STUDY } from './pocket-pier'
import {
  CASE_STUDY_PROJECT_IDS,
  isCaseStudyProjectId,
  type CaseStudy,
  type CaseStudyOrigin,
  type CaseStudyProjectId,
} from './types'

export const CASE_STUDIES: Record<CaseStudyProjectId, CaseStudy> = {
  jackos: JACKOS_CASE_STUDY,
  'pocket-pier': POCKET_PIER_CASE_STUDY,
  kickoff: KICKOFF_CASE_STUDY,
  'blue-ocean': BLUE_OCEAN_CASE_STUDY,
}

export function getCaseStudy(projectId: string): CaseStudy | undefined {
  if (!isCaseStudyProjectId(projectId)) return undefined
  return CASE_STUDIES[projectId]
}

export function getNextCaseStudyId(projectId: CaseStudyProjectId): CaseStudyProjectId {
  const index = CASE_STUDY_PROJECT_IDS.indexOf(projectId)
  const nextIndex = (index + 1) % CASE_STUDY_PROJECT_IDS.length
  return CASE_STUDY_PROJECT_IDS[nextIndex] ?? 'jackos'
}

export function parseCaseStudyHash(hash: string): CaseStudyProjectId | null {
  const slug = hash.replace(/^#/, '').trim().toLowerCase()
  const prefixes = ['case-study/', 'project/'] as const
  for (const prefix of prefixes) {
    if (!slug.startsWith(prefix)) continue
    const id = slug.slice(prefix.length)
    if (isCaseStudyProjectId(id)) return id
    if (id === '1984-blue-ocean' || id === 'jack-os' || id === 'jack-os-portfolio') {
      return id.includes('blue') ? 'blue-ocean' : 'jackos'
    }
  }
  if (slug === 'case-study') return 'jackos'
  return null
}

export function getCaseStudyHash(projectId: CaseStudyProjectId) {
  return `case-study/${projectId}`
}

export function getCaseStudySectionDomId(projectId: string, sectionId: string) {
  return `case-study-${projectId}-${sectionId}`
}

export function defaultCaseStudyReturnTarget(origin: CaseStudyOrigin): 'portfolio' | 'projects' {
  return origin === 'projects' ? 'projects' : 'portfolio'
}

export {
  CASE_STUDY_PROJECT_IDS,
  isCaseStudyProjectId,
  type CaseStudy,
  type CaseStudyOrigin,
  type CaseStudyProjectId,
} from './types'

export type {
  CaseStudyChapter,
  CaseStudyDecision,
  CaseStudyDiagram,
  CaseStudyDiagramNode,
  CaseStudyMedia,
  CaseStudyMetric,
  CaseStudySection,
  CaseStudyTone,
} from './types'

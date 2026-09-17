import type { ProjectMedia, ProjectMetric } from '../types'

export const CASE_STUDY_PROJECT_IDS = [
  'jackos',
  'pocket-pier',
  'kickoff',
  'blue-ocean',
] as const

export type CaseStudyProjectId = (typeof CASE_STUDY_PROJECT_IDS)[number]

export type CaseStudyTone = 'system' | 'game' | 'data' | 'editorial'

export type CaseStudyOrigin =
  | 'portfolio'
  | 'projects'
  | 'hash'
  | 'search'
  | 'next'
  | 'desktop'

export type CaseStudyMetric = ProjectMetric & {
  note?: string
}

export type CaseStudyMedia = ProjectMedia & {
  caption?: string
}

export type CaseStudyDecision = {
  title: string
  body: string
}

export type CaseStudyDiagramNode = {
  id: string
  label: string
  detail: string
}

export type CaseStudyDiagram = {
  caption: string
  textEquivalent: string
  nodes: readonly CaseStudyDiagramNode[]
}

export type CaseStudyChapter = {
  title: string
  summary: string
}

export type CaseStudySection =
  | {
      id: string
      kind: 'prose'
      title: string
      body: string
    }
  | {
      id: string
      kind: 'list'
      title: string
      items: readonly string[]
    }
  | {
      id: string
      kind: 'metrics'
      title: string
      body?: string
      metrics: readonly CaseStudyMetric[]
    }
  | {
      id: string
      kind: 'media'
      title: string
      body?: string
      media: readonly CaseStudyMedia[]
    }
  | {
      id: string
      kind: 'decisions'
      title: string
      decisions: readonly CaseStudyDecision[]
    }
  | {
      id: string
      kind: 'process'
      title: string
      body?: string
      steps: readonly string[]
    }
  | {
      id: string
      kind: 'diagram'
      title: string
      body?: string
      diagram: CaseStudyDiagram
    }
  | {
      id: string
      kind: 'chapters'
      title: string
      chapters: readonly CaseStudyChapter[]
    }
  | {
      id: string
      kind: 'module'
      title: string
      body?: string
      module: 'jackos-architecture' | 'pocket-pier-loop' | 'kickoff-evaluation'
    }

export type CaseStudy = {
  projectId: CaseStudyProjectId
  tone: CaseStudyTone
  kicker: string
  summary: string
  sections: readonly CaseStudySection[]
}

export function isCaseStudyProjectId(value: string): value is CaseStudyProjectId {
  return (CASE_STUDY_PROJECT_IDS as readonly string[]).includes(value)
}

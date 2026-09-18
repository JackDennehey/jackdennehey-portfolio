'use client'

import { useEffect, useRef } from 'react'
import {
  defaultCaseStudyReturnTarget,
  getCaseStudy,
  getCaseStudySectionDomId,
  getFeaturedProjectActions,
  getNextCaseStudyId,
  getProjectById,
  type CaseStudyOrigin,
  type CaseStudyProjectId,
} from '@/lib/portfolio'
import {
  ArchitectureFlow,
  CaseStudyHeader,
  CaseStudyList,
  CaseStudyNav,
  CaseStudyProse,
  CaseStudySection,
  CaseStudySectionNav,
  ChapterList,
  DecisionBlock,
  MediaGallery,
  MetricStrip,
  ProcessStrip,
  ProjectActions,
  ProjectMeta,
} from './primitives'
import { JackOsArchitectureMap } from './jackos-architecture'
import { KickoffEvaluation } from './kickoff-evaluation'
import { PocketPierLoop } from './pocket-pier-loop'
import { scrollJackOsSectionIntoView } from '../spotlight/scroll-to-section'

type CaseStudyContentProps = {
  projectId: CaseStudyProjectId
  origin: CaseStudyOrigin
  focusSectionId?: string | null
  focusNonce?: number
  onOpenApp: (id: string) => void
  onOpenCaseStudy: (projectId: CaseStudyProjectId, origin?: CaseStudyOrigin) => void
  onReturn: (target: 'portfolio' | 'projects') => void
}

export function CaseStudyContent({
  projectId,
  origin,
  focusSectionId,
  focusNonce = 0,
  onOpenApp,
  onOpenCaseStudy,
  onReturn,
}: CaseStudyContentProps) {
  const rootRef = useRef<HTMLElement>(null)
  const study = getCaseStudy(projectId)
  const project = getProjectById(projectId)
  const nextId = getNextCaseStudyId(projectId)
  const nextProject = getProjectById(nextId)

  useEffect(() => {
    if (focusSectionId) {
      scrollJackOsSectionIntoView(getCaseStudySectionDomId(projectId, focusSectionId))
      return
    }
    rootRef.current?.focus()
  }, [focusNonce, focusSectionId, projectId])

  if (!study || !project) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">This case study is not available.</p>
      </div>
    )
  }

  const productActions = getFeaturedProjectActions(project).filter(
    (action) => action.kind !== 'case-study',
  )
  const returnTarget = defaultCaseStudyReturnTarget(origin)

  return (
    <article
      ref={rootRef}
      tabIndex={-1}
      className="case-study @container min-w-0 space-y-6 outline-none"
      data-tone={study.tone}
      data-project={study.projectId}
      aria-labelledby="case-study-title"
    >
      <div className="sr-only" id="case-study-title">
        {project.name} case study
      </div>
      <CaseStudyHeader project={project} kicker={study.kicker} summary={study.summary} />
      <ProjectMeta project={project} />
      <ProjectActions actions={productActions} onOpenApp={onOpenApp} />
      <CaseStudySectionNav
        sections={study.sections.map((section) => ({
          id: getCaseStudySectionDomId(projectId, section.id),
          title: section.title,
        }))}
      />

      {study.sections.map((section) => {
        const sectionDomId = getCaseStudySectionDomId(projectId, section.id)
        return (
        <CaseStudySection key={section.id} id={sectionDomId} title={section.title}>
          {section.kind === 'prose' ? <CaseStudyProse>{section.body}</CaseStudyProse> : null}
          {section.kind === 'list' ? (
            <CaseStudyList items={section.items} label={section.title} />
          ) : null}
          {section.kind === 'metrics' ? (
            <>
              {section.body ? <CaseStudyProse>{section.body}</CaseStudyProse> : null}
              <MetricStrip metrics={section.metrics} />
            </>
          ) : null}
          {section.kind === 'media' ? (
            <>
              {section.body ? <CaseStudyProse>{section.body}</CaseStudyProse> : null}
              <MediaGallery media={section.media} />
            </>
          ) : null}
          {section.kind === 'decisions' ? <DecisionBlock decisions={section.decisions} /> : null}
          {section.kind === 'process' ? (
            <>
              {section.body ? <CaseStudyProse>{section.body}</CaseStudyProse> : null}
              <ProcessStrip steps={section.steps} />
            </>
          ) : null}
          {section.kind === 'diagram' ? (
            <>
              {section.body ? <CaseStudyProse>{section.body}</CaseStudyProse> : null}
              <ArchitectureFlow diagram={section.diagram} />
            </>
          ) : null}
          {section.kind === 'chapters' ? <ChapterList chapters={section.chapters} /> : null}
          {section.kind === 'module' ? (
            <>
              {section.body ? <CaseStudyProse>{section.body}</CaseStudyProse> : null}
              {section.module === 'jackos-architecture' ? <JackOsArchitectureMap /> : null}
              {section.module === 'pocket-pier-loop' ? <PocketPierLoop /> : null}
              {section.module === 'kickoff-evaluation' ? <KickoffEvaluation /> : null}
            </>
          ) : null}
        </CaseStudySection>
        )
      })}

      <CaseStudyNav
        returnLabel={returnTarget === 'projects' ? 'Back to Projects' : 'Back to Portfolio'}
        nextLabel={nextProject ? `Next: ${nextProject.name}` : 'Next project'}
        onReturn={() => onReturn(returnTarget)}
        onNext={() => onOpenCaseStudy(nextId, 'next')}
      />
    </article>
  )
}

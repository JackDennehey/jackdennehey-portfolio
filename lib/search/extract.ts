import { KICKOFF_COPY } from '../kickoff'
import { POCKET_PIER_COPY } from '../pocket-pier'
import { JACKOS_ARCHITECTURE } from '../portfolio/case-studies/architecture'
import type { CaseStudySection } from '../portfolio/case-studies/types'
import { compactSearchText } from './text'

function moduleSearchText(module: 'jackos-architecture' | 'pocket-pier-loop' | 'kickoff-evaluation') {
  if (module === 'jackos-architecture') {
    return compactSearchText([
      JACKOS_ARCHITECTURE.caption,
      JACKOS_ARCHITECTURE.textEquivalent,
      ...JACKOS_ARCHITECTURE.nodes.flatMap((node) => [node.label, node.detail]),
    ])
  }

  if (module === 'pocket-pier-loop') {
    return compactSearchText(['gameplay loop', ...POCKET_PIER_COPY.gameplayLoop])
  }

  return compactSearchText([
    'calibration',
    'brier',
    'log loss',
    'accuracy',
    'walk-forward',
    KICKOFF_COPY.modelHonesty,
    KICKOFF_COPY.evaluation.sample,
    KICKOFF_COPY.evaluation.accuracy,
    KICKOFF_COPY.evaluation.brier,
    KICKOFF_COPY.evaluation.logLoss,
    KICKOFF_COPY.evaluation.ece,
    ...KICKOFF_COPY.metrics.map((metric) => `${metric.label} ${metric.value}`),
  ])
}

export function caseStudySectionSearchText(section: CaseStudySection) {
  switch (section.kind) {
    case 'prose':
      return section.body
    case 'list':
      return compactSearchText(section.items)
    case 'metrics':
      return compactSearchText([
        section.body,
        ...section.metrics.map((metric) => `${metric.label} ${metric.value} ${metric.note ?? ''}`),
      ])
    case 'media':
      return compactSearchText([
        section.body,
        ...section.media.map((item) => `${item.alt} ${item.caption ?? ''}`),
      ])
    case 'decisions':
      return compactSearchText(section.decisions.map((decision) => `${decision.title} ${decision.body}`))
    case 'process':
      return compactSearchText([section.body, ...section.steps])
    case 'diagram':
      return compactSearchText([
        section.body,
        section.diagram.caption,
        section.diagram.textEquivalent,
        ...section.diagram.nodes.flatMap((node) => [node.label, node.detail]),
      ])
    case 'chapters':
      return compactSearchText(section.chapters.map((chapter) => `${chapter.title} ${chapter.summary}`))
    case 'module':
      return compactSearchText([section.body, moduleSearchText(section.module)])
  }
}

export function caseStudySectionKeywords(section: CaseStudySection) {
  const keywords = [section.title]
  if (section.kind === 'module' && section.module === 'jackos-architecture') {
    keywords.push(...JACKOS_ARCHITECTURE.nodes.map((node) => node.label))
  }
  if (section.kind === 'module' && section.module === 'kickoff-evaluation') {
    keywords.push('calibration', 'brier', 'log loss', 'accuracy', 'ece')
  }
  if (section.kind === 'module' && section.module === 'pocket-pier-loop') {
    keywords.push('gameplay loop', 'catch', 'sell', 'upgrade')
  }
  if (section.kind === 'diagram') {
    keywords.push(...section.diagram.nodes.map((node) => node.label))
  }
  if (section.kind === 'metrics') {
    keywords.push(...section.metrics.map((metric) => metric.label))
  }
  return keywords
}

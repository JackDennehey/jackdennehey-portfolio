import { KICKOFF_COPY } from '../../kickoff'
import type { CaseStudy } from './types'

export const KICKOFF_CASE_STUDY: CaseStudy = {
  projectId: 'kickoff',
  tone: 'data',
  kicker: KICKOFF_COPY.version,
  summary: `${KICKOFF_COPY.intro} ${KICKOFF_COPY.overview}`,
  sections: [
    {
      id: 'what',
      kind: 'prose',
      title: 'What it is',
      body: `${KICKOFF_COPY.shortDescription} ${KICKOFF_COPY.liveProduct}`,
    },
    {
      id: 'why',
      kind: 'prose',
      title: 'Why it was built',
      body: `${KICKOFF_COPY.lifecycleNote} ${KICKOFF_COPY.independence}`,
    },
    {
      id: 'role',
      kind: 'prose',
      title: 'What Jack did',
      body: `${KICKOFF_COPY.role}. ${KICKOFF_COPY.engineering}`,
    },
    {
      id: 'evaluation',
      kind: 'module',
      title: 'How the model is judged',
      body: 'Walk-forward evaluation on decided regular-season games. Accuracy is reported beside a simple baseline. Proper scoring rules are the more informative comparison.',
      module: 'kickoff-evaluation',
    },
    {
      id: 'model',
      kind: 'prose',
      title: 'How the prediction system works',
      body: KICKOFF_COPY.model,
    },
    {
      id: 'ask',
      kind: 'diagram',
      title: 'Ask Kickoff',
      body: `${KICKOFF_COPY.ask} ${KICKOFF_COPY.askUnsupported}`,
      diagram: {
        caption: 'Ask Kickoff request path',
        textEquivalent:
          'A user question is interpreted by the language model, then deterministic tools retrieve structured football or model data. Evidence from those tools is used to generate the answer. Unsupported questions are rejected instead of being answered from model memory.',
        nodes: KICKOFF_COPY.askFlow.map((label, index) => ({
          id: `ask-${index}`,
          label,
          detail:
            index === 0
              ? 'Natural-language football question from the visitor.'
              : index === 1
                ? 'The language model interprets the question. It is not treated as the source of football facts.'
                : index === 2
                  ? 'Deterministic application tools run against normalized data.'
                  : index === 3
                    ? 'Historical games, player statistics, roster snapshots, postseason information, and model artifacts.'
                    : index === 4
                      ? 'Retrieved records become the evidence for the answer.'
                      : 'Final response stays inside supported structured research.',
        })),
      },
    },
    {
      id: 'data',
      kind: 'prose',
      title: 'Data',
      body: KICKOFF_COPY.data,
    },
    {
      id: 'engineering',
      kind: 'list',
      title: 'Production controls',
      items: [...KICKOFF_COPY.productionControls],
    },
    {
      id: 'process',
      kind: 'process',
      title: 'What changed during development',
      body: 'The published lifecycle is the documented path from concept to public deployment.',
      steps: [...KICKOFF_COPY.lifecycle],
    },
    {
      id: 'limits',
      kind: 'list',
      title: 'Known limits',
      items: [...KICKOFF_COPY.limitations],
    },
    {
      id: 'media',
      kind: 'media',
      title: 'Product surfaces',
      media: KICKOFF_COPY.screenshots.map((screenshot) => ({
        src: screenshot.src,
        alt: screenshot.alt,
        caption: screenshot.title,
      })),
    },
    {
      id: 'result',
      kind: 'prose',
      title: 'What exists today',
      body: `${KICKOFF_COPY.production} Model ${KICKOFF_COPY.modelVersion} is the production prediction model. The live product is at kickoff.jackdennehey.com; this case study does not clone that application inside JackOS.`,
    },
  ],
}

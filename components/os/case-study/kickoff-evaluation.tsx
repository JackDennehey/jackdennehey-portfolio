import { KICKOFF_COPY } from '@/lib/kickoff'
import { MetricStrip } from './primitives'

const EVALUATION_METRICS = [
  {
    label: 'Historical games evaluated',
    value: '1,865',
    note: KICKOFF_COPY.evaluation.sample,
  },
  {
    label: 'Walk-forward accuracy',
    value: KICKOFF_COPY.evaluation.accuracy,
    note: `Straight-up winners. An entering-record baseline reached ${KICKOFF_COPY.evaluation.baseline} on the same sample. Kickoff does not beat that baseline on accuracy.`,
  },
  {
    label: 'Brier score',
    value: KICKOFF_COPY.evaluation.brier,
    note: 'Lower is better. Kickoff scores better than the entering-record baseline on this proper scoring rule.',
  },
  {
    label: 'Log loss',
    value: KICKOFF_COPY.evaluation.logLoss,
    note: 'Lower is better. Another proper scoring rule used with Brier instead of treating accuracy as the whole story.',
  },
  {
    label: 'Expected calibration error',
    value: KICKOFF_COPY.evaluation.ece,
    note: 'How closely predicted probabilities match observed outcomes on the evaluation sample. Lower is better.',
  },
  {
    label: 'Automated tests',
    value: '133+',
    note: 'Covers core product behavior in the published Kickoff copy.',
  },
] as const

export function KickoffEvaluation() {
  return (
    <div className="kickoff-evaluation space-y-3">
      <MetricStrip metrics={EVALUATION_METRICS} />
      <p className="max-w-3xl text-sm leading-relaxed text-foreground text-pretty">
        {KICKOFF_COPY.modelHonesty}
      </p>
      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground text-pretty">
        Accuracy answers “how often did the favorite win?” Brier score and log loss answer “how good
        were the probabilities?” Calibration error asks whether 60% predictions happened about 60% of
        the time. Kickoff publishes all four because accuracy alone would hide the baseline comparison.
      </p>
    </div>
  )
}

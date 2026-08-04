import { getKeynoteTypography } from '../config/typography'
import type { KeynoteStageComponentProps } from '../types/keynote'

export function PlaceholderChapter({
  step,
  progress,
}: KeynoteStageComponentProps) {
  const typography = getKeynoteTypography(step.typographyTheme)

  return (
    <section
      aria-labelledby={`${step.id}-title`}
      className={`keynote-stage-frame ${typography.frame}`}
    >
      <p className={typography.eyebrow}>
        {`Stage ${progress.stageNumber} of ${progress.stageTotal}`}
      </p>
      <h2
        id={`${step.id}-title`}
        className={typography.heading}
      >
        {step.title}
      </h2>
    </section>
  )
}

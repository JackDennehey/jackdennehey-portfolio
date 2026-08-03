import { getKeynoteTypography } from '../config/typography'
import type { KeynoteStageComponentProps } from '../types/keynote'

export function PlaceholderChapter({
  step,
  chapterStageCount,
}: KeynoteStageComponentProps) {
  const typography = getKeynoteTypography(step.typographyTheme)

  return (
    <section
      aria-labelledby={`${step.id}-title`}
      className={`keynote-stage-frame ${typography.frame}`}
    >
      <p className={typography.eyebrow}>
        {`Stage ${step.stage} of ${chapterStageCount}`}
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

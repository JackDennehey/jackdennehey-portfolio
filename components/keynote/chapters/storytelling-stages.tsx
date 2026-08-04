import { getKeynoteAsset } from '../assets/keynote-assets'
import { getKeynoteTypography } from '../config/typography'
import { getKeynoteVisualTheme } from '../config/visual-themes'
import type { KeynoteAssetId, KeynoteStageComponentProps } from '../types/keynote'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

function StageHeading({
  id,
  children,
  className,
}: {
  id: string
  children: string
  className: string
}) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      data-keynote-stage-heading="true"
      className={cn('outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      {children}
    </h2>
  )
}

function KeynoteStageImage({
  assetId,
  className,
  decorative = false,
}: {
  assetId: KeynoteAssetId
  className?: string
  decorative?: boolean
}) {
  const asset = getKeynoteAsset(assetId)

  return (
    <figure className={cn('keynote-image-frame os-border overflow-hidden bg-secondary', className)}>
      <img
        src={asset.path}
        alt={decorative ? '' : asset.alt}
        aria-hidden={decorative}
        loading={asset.preloadPriority === 'cover' ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition: asset.focalPosition }}
      />
      {asset.caption && !decorative ? (
        <figcaption className="border-t-2 border-[var(--keynote-border)] bg-[var(--keynote-bg)] px-3 py-2 font-pixel text-[7px] leading-relaxed text-[var(--keynote-muted)]">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function KeynoteTitleStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'title') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className={cn('keynote-title-stage', typography.frame)}
    >
      {step.imageAssetId ? (
        <KeynoteStageImage
          assetId={step.imageAssetId}
          className="keynote-title-stage-image"
          decorative
        />
      ) : null}
      <div className="keynote-stage-panel">
        {content.eyebrow ? <p className={typography.eyebrow}>{content.eyebrow}</p> : null}
        <StageHeading
          id={`${step.id}-heading`}
          className={typography.heading}
        >
          {content.title}
        </StageHeading>
        {content.subtitle ? <p className={typography.subheading}>{content.subtitle}</p> : null}
        {content.body ? <p className={typography.body}>{content.body}</p> : null}
        {content.labels?.length ? (
          <ul className="keynote-label-list" aria-label={`${content.title} supporting labels`}>
            {content.labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ) : null}
        {content.closingLine ? <p className={typography.accent}>{content.closingLine}</p> : null}
      </div>
    </section>
  )
}

export function KeynoteSplitStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'split') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className="keynote-stage-panel"
    >
      <p className={typography.eyebrow}>{step.title}</p>
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.heading}
      >
        {content.summary ?? step.title}
      </StageHeading>
      <div
        className="keynote-split-grid"
        data-keynote-bridge={content.bridgeLabel ? 'true' : 'false'}
      >
        <div className="keynote-comparison-panel">
          <h3 className={typography.subheading}>{content.leftTitle}</h3>
          <p className={typography.body}>{content.leftBody}</p>
        </div>
        {content.bridgeLabel ? (
          <div
            className="keynote-bridge-label"
            aria-label={`Bridge: ${content.bridgeLabel}`}
          >
            {content.bridgeLabel}
          </div>
        ) : null}
        <div className="keynote-comparison-panel">
          <h3 className={typography.subheading}>{content.rightTitle}</h3>
          <p className={typography.body}>{content.rightBody}</p>
        </div>
      </div>
      {content.closingLine ? <p className={typography.accent}>{content.closingLine}</p> : null}
    </section>
  )
}

export function KeynoteMetricStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'metric') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className="keynote-stage-panel keynote-metric-panel"
    >
      <p className={typography.eyebrow}>{step.title}</p>
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.data}
      >
        {content.value}
      </StageHeading>
      <p className={typography.subheading}>{content.label}</p>
      <p className={typography.body}>{content.body}</p>
      {content.labels?.length ? (
        <ul className="keynote-label-list" aria-label={`${content.value} supporting labels`}>
          {content.labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      {step.imageAssetId ? (
        <KeynoteStageImage
          assetId={step.imageAssetId}
          className="keynote-metric-media"
        />
      ) : null}
      {content.closingLine ? <p className={typography.accent}>{content.closingLine}</p> : null}
    </section>
  )
}

export function KeynoteQuoteStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'quote') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className="keynote-stage-panel keynote-quote-panel"
    >
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.quote}
      >
        {content.quote}
      </StageHeading>
      {content.attribution ? <p className={typography.accent}>{content.attribution}</p> : null}
      {content.body ? <p className={typography.body}>{content.body}</p> : null}
      {content.lines?.length ? (
        <ul className="keynote-status-list" aria-label={`${step.title} status lines`}>
          {content.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export function KeynoteDiagramStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'diagram') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const visualTheme = getKeynoteVisualTheme(step.visualTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className="keynote-stage-panel"
    >
      <p className={typography.eyebrow}>{step.title}</p>
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.heading}
      >
        {content.title}
      </StageHeading>
      <p className={typography.body}>{content.summary}</p>
      <ul className={cn(
        'keynote-diagram-grid',
        content.variant ? `keynote-diagram-${content.variant}` : null,
        visualTheme.diagramStyle,
      )}
      >
        {content.items.map((item) => (
          <li
            key={item.label}
            className="keynote-diagram-node"
          >
            <h3 className={typography.accent}>{item.label}</h3>
            <p className={typography.body}>{item.description}</p>
          </li>
        ))}
      </ul>
      {content.closingLine ? <p className={typography.accent}>{content.closingLine}</p> : null}
    </section>
  )
}

export function KeynoteTimelineStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'timeline') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className="keynote-stage-panel"
    >
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.heading}
      >
        {content.title}
      </StageHeading>
      <ol className="keynote-timeline-list">
        {content.milestones.map((milestone, index) => (
          <li
            key={milestone.label}
            className="keynote-timeline-item"
            style={{ '--keynote-build-index': index } as CSSProperties}
          >
            <p className={typography.accent}>{milestone.label}</p>
            <h3 className={typography.subheading}>{milestone.title}</h3>
            <p className={typography.body}>{milestone.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function KeynoteImageTextStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'image-text') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content
  const image = step.imageAssetId ? (
    <KeynoteStageImage
      assetId={step.imageAssetId}
      className="keynote-image-text-media"
    />
  ) : null
  const copy = (
    <div className="keynote-stage-panel">
      <p className={typography.eyebrow}>{step.title}</p>
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.heading}
      >
        {content.headline}
      </StageHeading>
      {content.secondaryLine ? <p className={typography.subheading}>{content.secondaryLine}</p> : null}
      <p className={typography.body}>{content.body}</p>
      {content.labels?.length ? (
        <ul className="keynote-label-list" aria-label={`${content.headline} supporting labels`}>
          {content.labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      {content.closingLine ? <p className={typography.accent}>{content.closingLine}</p> : null}
    </div>
  )

  if (content.layout === 'image-background') {
    return (
      <section
        aria-labelledby={`${step.id}-heading`}
        className="keynote-image-background-stage"
      >
        {image}
        {copy}
      </section>
    )
  }

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className={cn(
        'keynote-image-text-stage',
        content.layout === 'image-right' ? 'keynote-image-right' : null,
      )}
    >
      {image}
      {copy}
    </section>
  )
}

export function KeynoteTerminalStage({ step }: KeynoteStageComponentProps) {
  if (step.content.renderer !== 'terminal') return null
  const typography = getKeynoteTypography(step.typographyTheme)
  const content = step.content

  return (
    <section
      aria-labelledby={`${step.id}-heading`}
      className="keynote-stage-panel"
    >
      <StageHeading
        id={`${step.id}-heading`}
        className={typography.heading}
      >
        {content.title}
      </StageHeading>
      <div
        className="keynote-terminal os-border"
        role="list"
        aria-label={`${content.title} lines`}
      >
        {content.lines.map((line) => (
          <p
            key={line}
            role="listitem"
          >
            {line}
          </p>
        ))}
      </div>
      {content.footer ? <p className={typography.accent}>{content.footer}</p> : null}
    </section>
  )
}

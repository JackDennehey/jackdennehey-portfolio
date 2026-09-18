'use client'

import { useEffect, useId, useRef } from 'react'
import { FaceRenderer } from '@/lib/boch/face-renderer'
import type { BochActivity } from '@/lib/boch/presence'
import type { BochPresenceMode } from '@/lib/boch/presence'

type Props = {
  mode: BochPresenceMode
  activity: BochActivity
  expression: string
  audioLevel?: number
  reducedMotion?: boolean
  onNudge: () => void
}

export function BochFace({
  mode,
  activity,
  expression,
  audioLevel = 0,
  reducedMotion = false,
  onNudge,
}: Props) {
  const rawId = useId()
  const id = rawId.replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement | null>(null)
  const rendererRef = useRef<FaceRenderer | null>(null)
  const stateRef = useRef({ mode, activity, expression, audioLevel, reducedMotion })
  stateRef.current = { mode, activity, expression, audioLevel, reducedMotion }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const node = (suffix: string) => svg.querySelector(`#${suffix}-${id}`)
    const head = node('head')
    const features = node('features')
    const leftEye = node('left-eye')
    const rightEye = node('right-eye')
    const leftBrow = node('left-brow')
    const rightBrow = node('right-brow')
    const mouth = node('mouth')
    const corners = node('corners')
    if (
      !(head instanceof SVGElement) ||
      !(features instanceof SVGGElement) ||
      !(leftEye instanceof SVGEllipseElement) ||
      !(rightEye instanceof SVGEllipseElement) ||
      !(leftBrow instanceof SVGElement) ||
      !(rightBrow instanceof SVGElement) ||
      !(mouth instanceof SVGPathElement) ||
      !(corners instanceof SVGElement)
    ) {
      return
    }
    rendererRef.current = new FaceRenderer({
      head,
      features,
      leftEye,
      rightEye,
      leftBrow,
      rightBrow,
      mouth,
      corners,
    })
    let frame = 0
    const tick = (now: number) => {
      const current = stateRef.current
      rendererRef.current?.render(
        now,
        {
          mode: current.mode,
          activity: current.activity,
          expression: current.expression,
          audioLevel: current.audioLevel,
        },
        current.reducedMotion,
      )
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      rendererRef.current = null
    }
  }, [id])

  return (
    <button
      type="button"
      className="boch-face"
      data-mode={mode}
      data-activity={activity}
      aria-label="React with BOCH"
      title="Give BOCH a nudge"
      onClick={onNudge}
    >
      <svg ref={svgRef} viewBox="0 0 400 400" aria-hidden="true" className="boch-face-svg">
        <g id={`head-${id}`}>
          <circle cx="200" cy="200" r="184" fill="#f7d400" />
          <g id={`features-${id}`} fill="#17170e" stroke="#17170e" strokeLinecap="round">
            <ellipse id={`left-eye-${id}`} cx="151" cy="167" rx="13" ry="23" stroke="none" />
            <ellipse id={`right-eye-${id}`} cx="249" cy="167" rx="13" ry="23" stroke="none" />
            <path id={`left-brow-${id}`} d="M132 129 L166 129" fill="none" strokeWidth="7" opacity="0" />
            <path id={`right-brow-${id}`} d="M234 129 L268 129" fill="none" strokeWidth="7" opacity="0" />
            <path
              id={`mouth-${id}`}
              d="M82 224 C140 315 260 315 318 224 C264 291 136 291 82 224"
              strokeWidth="4"
            />
            <path
              id={`corners-${id}`}
              d="M77 228 Q80 216 90 222 M310 222 Q320 216 323 228"
              fill="none"
              strokeWidth="7"
            />
          </g>
        </g>
      </svg>
      <span className="boch-zzz" aria-hidden="true">
        z z Z
      </span>
    </button>
  )
}

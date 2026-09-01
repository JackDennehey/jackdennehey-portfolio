'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  JDEN_STUDIOS_MARK_SRC,
  JDEN_STUDIOS_URL,
  JDEN_TRANSITION_MS,
} from '@/lib/jden-studios'
import { cn } from '@/lib/utils'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    setPrefersReducedMotion(query.matches)
    const handleChange = () => setPrefersReducedMotion(query.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

export function useJdenLaunch() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const launch = useCallback(
    (event?: MouseEvent<HTMLAnchorElement>) => {
      if (
        prefersReducedMotion ||
        active ||
        event?.metaKey ||
        event?.ctrlKey ||
        event?.shiftKey ||
        event?.altKey
      ) {
        return
      }

      event?.preventDefault()
      setActive(true)
      timerRef.current = window.setTimeout(() => {
        window.location.assign(JDEN_STUDIOS_URL)
      }, JDEN_TRANSITION_MS)
    },
    [active, prefersReducedMotion],
  )

  return { active, launch }
}

export function JdenWindowTrigger({
  children,
  className,
  onOpen,
}: {
  children: ReactNode
  className?: string
  onOpen: () => void
}) {
  return (
    <a
      href={JDEN_STUDIOS_URL}
      data-desktop-interactive="true"
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return
        }
        event.preventDefault()
        onOpen()
      }}
      className={className}
      aria-label="Open JDEN STUDIOS, independent digital studio"
    >
      {children}
    </a>
  )
}

export function JdenDestinationLink({
  children,
  className,
  onLaunch,
  ariaLabel = 'Enter JDEN STUDIOS, opens jdenstudios.com and leaves Jack OS',
}: {
  children: ReactNode
  className?: string
  onLaunch: (event: MouseEvent<HTMLAnchorElement>) => void
  ariaLabel?: string
}) {
  return (
    <a
      href={JDEN_STUDIOS_URL}
      onClick={onLaunch}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}

export function JdenOwlMark({
  className,
  size = 'menu',
}: {
  className?: string
  size?: 'menu' | 'artifact'
}) {
  return (
    <img
      src={JDEN_STUDIOS_MARK_SRC}
      alt=""
      aria-hidden="true"
      width={size === 'menu' ? 16 : 148}
      height={size === 'menu' ? 13 : 120}
      decoding="async"
      className={cn('block bg-foreground object-cover', className)}
    />
  )
}

export function JdenTransitionOverlay({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div
      className="jden-transition-overlay fixed inset-0 z-[200] grid place-items-center bg-background/90 paper-texture"
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="os-border bg-paper px-5 py-4 text-center os-shadow-lg">
        <JdenOwlMark size="artifact" className="mx-auto h-16 w-auto" />
        <p className="mt-3 font-pixel text-[10px] leading-relaxed text-foreground">
          JDEN STUDIOS
        </p>
        <p className="mt-1 font-pixel text-[8px] leading-relaxed text-muted-foreground">
          EXTERNAL SYSTEM
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Independent digital studio.
        </p>
        <p className="mt-3 font-pixel text-[8px] leading-relaxed text-foreground">
          Entering studio...
        </p>
      </div>
    </div>
  )
}

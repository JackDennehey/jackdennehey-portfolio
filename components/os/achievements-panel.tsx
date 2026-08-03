'use client'

import { useEffect, useRef } from 'react'
import {
  JACK_OS_ACHIEVEMENT_REGISTRY,
  type JackOsAchievementId,
} from '@/lib/achievements'
import { cn } from '@/lib/utils'

type AchievementsPanelProps = {
  open: boolean
  earnedIds: readonly JackOsAchievementId[]
  onClose: () => void
}

export function AchievementsPanel({ open, earnedIds, onClose }: AchievementsPanelProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const earnedSet = new Set(earnedIds)
  const earnedCount = earnedIds.length
  const totalCount = JACK_OS_ACHIEVEMENT_REGISTRY.length

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => closeRef.current?.focus(), 0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      data-desktop-interactive="true"
      className="fixed right-3 top-10 z-[85] w-[min(420px,calc(100vw-1.5rem))] os-border bg-paper text-foreground os-shadow-lg"
      role="dialog"
      aria-label="Jack OS achievements"
    >
      <header className="flex items-center gap-2 border-b-2 border-border bg-titlebar px-3 py-2 text-titlebar-foreground">
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[9px] leading-relaxed">Achievements</p>
          <p className="font-pixel text-[7px] leading-relaxed opacity-80">
            {earnedCount}/{totalCount} unlocked
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="grid size-5 place-items-center border-2 border-current font-pixel text-[8px] leading-none transition-colors hover:bg-paper hover:text-foreground focus-visible:bg-paper focus-visible:text-foreground focus-visible:outline-none"
          aria-label="Close achievements"
        >
          x
        </button>
      </header>

      <div className="max-h-[min(70dvh,520px)] overflow-y-auto p-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Local Jack OS milestones saved on this browser.
        </p>
        <div className="mt-3 h-3 os-border bg-secondary p-0.5" aria-hidden>
          <div
            className="h-full bg-foreground"
            style={{ width: `${Math.round((earnedCount / totalCount) * 100)}%` }}
          />
        </div>

        <ul className="mt-3 grid gap-2">
          {JACK_OS_ACHIEVEMENT_REGISTRY.map((achievement) => {
            const earned = earnedSet.has(achievement.id)
            return (
              <li
                key={achievement.id}
                className={cn(
                  'os-border bg-card p-3',
                  earned ? 'outline outline-2 outline-offset-[-6px] outline-border' : 'opacity-80',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-pixel text-[9px] leading-relaxed text-foreground">
                      {achievement.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {earned
                        ? achievement.description
                        : achievement.secret
                          ? (achievement.lockedDescription ?? 'Requirement hidden.')
                          : achievement.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'os-border shrink-0 px-2 py-1 font-pixel text-[7px] leading-none',
                      earned
                        ? 'bg-foreground text-primary-foreground'
                        : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {earned ? 'Earned' : 'Locked'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

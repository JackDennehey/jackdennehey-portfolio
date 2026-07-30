'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { JackNotification } from './use-jack-notifications'

type NotificationCenterProps = {
  notifications: readonly JackNotification[]
  onDismiss: (id: string) => void
}

const AUTO_DISMISS_MS = 4000

export function NotificationCenter({ notifications, onDismiss }: NotificationCenterProps) {
  if (notifications.length === 0) return null

  return (
    <aside
      aria-label="Jack OS notifications"
      aria-live="polite"
      aria-atomic="false"
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[calc(2.5rem+env(safe-area-inset-top))] z-[75] flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 sm:right-4"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </aside>
  )
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: JackNotification
  onDismiss: (id: string) => void
}) {
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (paused) return

    timer.current = setTimeout(() => onDismiss(notification.id), AUTO_DISMISS_MS)
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [notification.id, onDismiss, paused])

  return (
    <section
      role="status"
      data-notification-type={notification.type}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false)
        }
      }}
      className={cn(
        'animate-notification-in os-border bg-paper p-3 text-foreground os-shadow',
        notification.type === 'success' ? 'outline outline-2 outline-offset-[-6px] outline-current' : null,
        notification.type === 'warning' ? 'bg-secondary' : null,
      )}
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className="mt-0.5 grid size-5 shrink-0 place-items-center border-2 border-current bg-secondary font-pixel text-[8px] leading-none"
        >
          {notification.type === 'success' ? '*' : notification.type === 'warning' ? '!' : 'i'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[8px] leading-relaxed text-foreground">
            {notification.title}
          </p>
          {notification.message ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {notification.message}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`Dismiss notification: ${notification.title}`}
          onClick={() => onDismiss(notification.id)}
          className="grid size-6 shrink-0 place-items-center border-2 border-transparent font-pixel text-[9px] leading-none transition-colors hover:border-border hover:bg-secondary focus-visible:border-border focus-visible:bg-secondary focus-visible:outline-none"
        >
          x
        </button>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function formatClock(date: Date) {
  const period = date.getHours() >= 12 ? 'PM' : 'AM'
  const hours = date.getHours() % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${hours}:${minutes}:${seconds} ${period}`
}

export function DesktopClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    update()

    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <time
      aria-label="Desktop Clock"
      data-desktop-widget="clock"
      dateTime={now?.toISOString()}
      className={cn(
        'os-border block bg-paper/85 px-2.5 py-2 font-pixel text-[10px] leading-none text-foreground',
        className,
      )}
      suppressHydrationWarning
    >
      {now ? formatClock(now) : '--:--:-- --'}
    </time>
  )
}

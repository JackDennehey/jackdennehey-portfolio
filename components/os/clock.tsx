'use client'

import { useEffect, useState } from 'react'

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function Clock({
  showDate = false,
  dateVisibility = 'desktop',
}: {
  showDate?: boolean
  dateVisibility?: 'desktop' | 'always'
}) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    update()
    const interval = setInterval(update, 1000 * 15)
    return () => clearInterval(interval)
  }, [])

  const time = now ? formatTime(now) : '--:--'
  const date = now ? formatDate(now) : ''

  return (
    <span className="flex items-baseline gap-2 font-pixel text-[9px] leading-none tabular-nums sm:text-[10px]">
      {showDate ? (
        <time
          className={dateVisibility === 'always' ? 'text-muted-foreground' : 'hidden text-muted-foreground md:inline'}
          dateTime={now?.toISOString()}
          suppressHydrationWarning
        >
          {date}
        </time>
      ) : null}
      <time dateTime={now?.toISOString()} suppressHydrationWarning>
        {time}
      </time>
    </span>
  )
}

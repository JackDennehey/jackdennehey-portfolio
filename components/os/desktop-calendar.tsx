'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]

function getMonthCells(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const cells: Array<number | null> = Array.from({ length: firstWeekday }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function DesktopCalendar({
  className,
  onOpenCalendar,
}: {
  className?: string
  onOpenCalendar?: () => void
}) {
  const [today, setToday] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setToday(new Date())
    update()

    const interval = window.setInterval(update, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const cells = useMemo(() => (today ? getMonthCells(today) : []), [today])
  const monthLabel = today ? `${MONTHS[today.getMonth()]} ${today.getFullYear()}` : '--- ----'

  return (
    <button
      type="button"
      onClick={onOpenCalendar}
      className={cn(
        'os-border block w-[178px] bg-paper/85 p-2 text-left text-foreground outline-none transition-colors hover:bg-paper focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label="Open Calendar"
      data-desktop-widget="calendar"
      title="Open Calendar"
    >
      <span className="block border-b-2 border-border pb-1 text-center font-pixel text-[9px] leading-none">
        {monthLabel}
      </span>

      <span className="mt-2 grid grid-cols-7 gap-1 text-center font-pixel text-[7px] leading-none text-muted-foreground">
        {WEEKDAYS.map((weekday, index) => (
          <span key={`${weekday}-${index}`}>{weekday}</span>
        ))}
      </span>

      <span className="mt-1 grid grid-cols-7 gap-1 text-center font-pixel text-[7px] leading-none">
        {cells.map((day, index) => {
          const isToday = Boolean(today && day === today.getDate())
          return (
            <span
              key={`${day ?? 'empty'}-${index}`}
              className={cn(
                'grid h-4 place-items-center',
                isToday ? 'bg-foreground text-primary-foreground' : 'text-foreground',
                day === null ? 'text-transparent' : '',
              )}
              aria-hidden={day === null}
            >
              {day ?? ''}
            </span>
          )
        })}
      </span>
    </button>
  )
}

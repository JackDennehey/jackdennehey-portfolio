'use client'

import { useEffect, useState } from 'react'

function format(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function Clock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setTime(format(new Date()))
    update()
    const interval = setInterval(update, 1000 * 15)
    return () => clearInterval(interval)
  }, [])

  return (
    <time className="font-pixel text-[9px] leading-none tabular-nums sm:text-[10px]" suppressHydrationWarning>
      {time ?? '--:--'}
    </time>
  )
}

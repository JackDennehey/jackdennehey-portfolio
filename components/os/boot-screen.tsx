'use client'

import { useEffect, useState } from 'react'

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [powering, setPowering] = useState(false)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const holdMs = reduce ? 300 : 1000
    const offMs = reduce ? 0 : 500

    const t1 = setTimeout(() => setPowering(true), holdMs)
    const t2 = setTimeout(onDone, holdMs + offMs)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div
      role="status"
      aria-label="Starting Jack OS"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background paper-texture ${
        powering ? 'animate-crt-off' : ''
      }`}
    >
      <div className="animate-boot-flicker flex flex-col items-center gap-6 px-6 text-center">
        <div
          aria-hidden
          className="os-border grid size-16 place-items-center bg-foreground text-primary-foreground"
        >
          <span className="font-pixel text-lg">J</span>
        </div>
        <p className="font-pixel text-sm leading-relaxed text-foreground sm:text-base">
          Starting Jack OS<span className="blink">_</span>
        </p>
        <div className="os-border h-3 w-56 max-w-[70vw] overflow-hidden bg-secondary p-0.5">
          <div className="h-full w-full origin-left animate-[window-open_0.9s_ease-out] bg-foreground" />
        </div>
      </div>
    </div>
  )
}

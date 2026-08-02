'use client'

import type { WindowApp, WindowId } from './apps'
import { cn } from '@/lib/utils'

export function MinimizedWindowStrip({
  windows,
  onRestore,
}: {
  windows: WindowApp[]
  onRestore: (id: WindowId) => void
}) {
  if (windows.length === 0) return null

  return (
    <div
      data-desktop-interactive="true"
      aria-label="Minimized windows"
      className="absolute bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-1 overflow-x-auto os-border bg-paper/95 p-1 os-shadow"
    >
      {windows.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => onRestore(app.id)}
          className="flex min-w-14 max-w-32 items-center gap-1.5 border-2 border-transparent px-2 py-1 text-left text-foreground transition-colors hover:border-border hover:bg-secondary focus-visible:border-border focus-visible:bg-secondary focus-visible:outline-none"
          aria-label={`Restore ${app.title}`}
          title={`Restore ${app.title}`}
        >
          <span
            aria-hidden
            className={cn(
              'grid size-4 shrink-0 place-items-center overflow-hidden',
              app.tone === 'recruiter' ? 'recruiter-inline-icon border' : null,
              app.tone === 'firewall' ? 'firewall-inline-icon border' : null,
            )}
          >
            <app.Icon className={app.tone ? 'size-3' : 'size-4'} />
          </span>
          <span className="truncate font-pixel text-[7px] leading-relaxed">
            {app.title}
          </span>
        </button>
      ))}
    </div>
  )
}

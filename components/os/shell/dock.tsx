'use client'

import {
  DOCK_PINNED_APP_IDS,
  WINDOW_APPS,
  getDesktopAppLabel,
  isDockPinnedAppId,
  type WindowId,
} from '../apps'
import { cn } from '@/lib/utils'
import type { OpenWindow } from '@/lib/os/window-geometry'

type DockAppState = 'closed' | 'running' | 'active' | 'minimized'

function getDockAppState(
  id: WindowId,
  windows: readonly OpenWindow[],
  activeWindowId: WindowId | undefined,
): DockAppState {
  const windowRecord = windows.find((entry) => entry.id === id && entry.status !== 'closing')
  if (!windowRecord) return 'closed'
  if (windowRecord.status === 'minimized') return 'minimized'
  if (activeWindowId === id) return 'active'
  return 'running'
}

function dockItemAriaLabel(id: WindowId, state: DockAppState) {
  const title = WINDOW_APPS[id].title
  if (state === 'active') return `${title}, open and focused`
  if (state === 'running') return `${title}, running`
  if (state === 'minimized') return `${title}, minimized. Restore`
  return `Open ${title}`
}

export function JackOsDock({
  windows,
  activeWindowId,
  onSelect,
}: {
  windows: readonly OpenWindow[]
  activeWindowId: WindowId | undefined
  onSelect: (id: WindowId) => void
}) {
  const runningIds = windows
    .filter((windowRecord) => windowRecord.status !== 'closing')
    .map((windowRecord) => windowRecord.id)
  const overflowIds = runningIds.filter((id) => !isDockPinnedAppId(id))
  const dockIds: WindowId[] = [...DOCK_PINNED_APP_IDS, ...overflowIds]

  return (
    <nav
      data-desktop-interactive="true"
      aria-label="JackOS dock"
      className="jackos-dock pointer-events-auto absolute bottom-3 left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-end gap-1 overflow-x-auto os-border bg-paper/95 p-1.5 os-shadow"
    >
      {DOCK_PINNED_APP_IDS.map((id) => (
        <DockItem
          key={id}
          id={id}
          state={getDockAppState(id, windows, activeWindowId)}
          onSelect={onSelect}
        />
      ))}
      {overflowIds.length > 0 ? (
        <>
          <span aria-hidden className="mx-0.5 h-10 w-0.5 shrink-0 bg-border" />
          {overflowIds.map((id) => (
            <DockItem
              key={id}
              id={id}
              state={getDockAppState(id, windows, activeWindowId)}
              onSelect={onSelect}
            />
          ))}
        </>
      ) : null}
      <span className="sr-only">
        {dockIds.filter((id) => getDockAppState(id, windows, activeWindowId) !== 'closed').length}{' '}
        applications running
      </span>
    </nav>
  )
}

function DockItem({
  id,
  state,
  onSelect,
}: {
  id: WindowId
  state: DockAppState
  onSelect: (id: WindowId) => void
}) {
  const app = WINDOW_APPS[id]
  const label = getDesktopAppLabel(id)
  const isImageIcon = app.iconVisual === 'image'

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-label={dockItemAriaLabel(id, state)}
      aria-current={state === 'active' ? 'true' : undefined}
      data-dock-state={state}
      className={cn(
        'jackos-dock-item relative flex min-w-14 max-w-[4.75rem] shrink-0 flex-col items-center gap-1 border-2 px-1.5 py-1 text-foreground',
        state === 'active'
          ? 'border-border bg-foreground text-primary-foreground'
          : 'border-transparent hover:border-border hover:bg-secondary focus-visible:border-border focus-visible:bg-secondary',
        state === 'minimized' ? 'opacity-70' : null,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-8 place-items-center overflow-hidden',
          app.tone === 'recruiter' ? 'recruiter-inline-icon border' : null,
          app.tone === 'firewall' ? 'firewall-inline-icon border' : null,
          app.tone === 'blue-ocean' ? 'blue-ocean-inline-icon border' : null,
          app.tone === 'kickoff' ? 'kickoff-inline-icon border' : null,
        )}
      >
        <app.Icon className={isImageIcon || app.tone ? 'size-7' : 'size-6'} />
      </span>
      <span className="max-w-full truncate font-pixel text-[7px] leading-none">{label}</span>
      {state !== 'closed' ? (
        <span
          aria-hidden
          className={cn(
            'jackos-dock-running-mark absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2',
            state === 'active' ? 'bg-primary-foreground' : 'bg-foreground',
            state === 'minimized' ? 'opacity-50' : null,
          )}
        />
      ) : null}
    </button>
  )
}

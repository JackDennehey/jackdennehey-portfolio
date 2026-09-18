'use client'

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { type WindowApp } from './apps'
import {
  isWindowResizable,
  type ResizeHandle,
  type WindowGeometry,
} from '@/lib/os/window-geometry'

type Props = {
  app: WindowApp
  children: ReactNode
  x: number
  y: number
  width: number
  height: number
  z: number
  status: 'opening' | 'open' | 'minimized' | 'maximized' | 'closing'
  focused: boolean
  isMobile: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onMove: (x: number, y: number) => void
  onResize: (handle: ResizeHandle, start: WindowGeometry, dx: number, dy: number) => void
  onGeometryCommit: () => void
}

const RESIZE_HANDLES: readonly {
  handle: ResizeHandle
  className: string
  cursor: CSSProperties['cursor']
}[] = [
  { handle: 'n', className: 'left-10 right-16 top-0 h-1.5', cursor: 'ns-resize' },
  { handle: 's', className: 'left-3 right-3 bottom-0 h-1.5', cursor: 'ns-resize' },
  { handle: 'e', className: 'top-8 bottom-3 right-0 w-1.5', cursor: 'ew-resize' },
  { handle: 'w', className: 'top-8 bottom-3 left-0 w-1.5', cursor: 'ew-resize' },
  { handle: 'ne', className: 'top-0 right-0 size-3', cursor: 'nesw-resize' },
  { handle: 'nw', className: 'top-0 left-0 size-3', cursor: 'nwse-resize' },
  { handle: 'se', className: 'bottom-0 right-0 size-3', cursor: 'nwse-resize' },
  { handle: 'sw', className: 'bottom-0 left-0 size-3', cursor: 'nesw-resize' },
]

export function OsWindow({
  app,
  children,
  x,
  y,
  width,
  height,
  z,
  status,
  focused,
  isMobile,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  onGeometryCommit,
}: Props) {
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const resizeRef = useRef<{
    handle: ResizeHandle
    start: WindowGeometry
    pointerX: number
    pointerY: number
  } | null>(null)
  const frame = useRef<number | null>(null)
  const onMoveRef = useRef(onMove)
  const onResizeRef = useRef(onResize)
  const onGeometryCommitRef = useRef(onGeometryCommit)
  const tracking = useRef(false)
  const listenersRef = useRef<{
    onPointerMove: (e: PointerEvent) => void
    finish: () => void
  }>({
    onPointerMove: () => {},
    finish: () => {},
  })
  const [interacting, setInteracting] = useState(false)

  useEffect(() => {
    onMoveRef.current = onMove
  }, [onMove])

  useEffect(() => {
    onResizeRef.current = onResize
  }, [onResize])

  useEffect(() => {
    onGeometryCommitRef.current = onGeometryCommit
  }, [onGeometryCommit])

  useEffect(() => {
    const finish = () => {
      if (!tracking.current) return
      tracking.current = false
      dragRef.current = null
      resizeRef.current = null
      if (frame.current) {
        cancelAnimationFrame(frame.current)
        frame.current = null
      }
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      window.removeEventListener('blur', finish)
      setInteracting(false)
      onGeometryCommitRef.current()
    }

    function onPointerMove(e: PointerEvent) {
      if (dragRef.current) {
        const nextX = e.clientX - dragRef.current.dx
        const nextY = e.clientY - dragRef.current.dy
        if (frame.current) cancelAnimationFrame(frame.current)
        frame.current = requestAnimationFrame(() => {
          onMoveRef.current(nextX, nextY)
          frame.current = null
        })
        return
      }

      if (!resizeRef.current) return
      const { handle, start, pointerX, pointerY } = resizeRef.current
      const dx = e.clientX - pointerX
      const dy = e.clientY - pointerY
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        onResizeRef.current(handle, start, dx, dy)
        frame.current = null
      })
    }

    listenersRef.current = { onPointerMove, finish }

    return () => {
      if (tracking.current) {
        finish()
      } else {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', finish)
        window.removeEventListener('pointercancel', finish)
        window.removeEventListener('blur', finish)
      }
      if (frame.current) {
        cancelAnimationFrame(frame.current)
        frame.current = null
      }
    }
  }, [])

  const startTracking = () => {
    if (tracking.current) return
    tracking.current = true
    window.addEventListener('pointermove', listenersRef.current.onPointerMove)
    window.addEventListener('pointerup', listenersRef.current.finish)
    window.addEventListener('pointercancel', listenersRef.current.finish)
    window.addEventListener('blur', listenersRef.current.finish)
    setInteracting(true)
  }

  const canMove =
    !isMobile && status !== 'closing' && status !== 'minimized' && status !== 'maximized'
  const canResize =
    canMove && isWindowResizable(app.id, isMobile) && status !== 'opening'

  const startDrag = (e: ReactPointerEvent) => {
    if (!canMove || e.button !== 0) return
    e.preventDefault()
    onFocus()
    dragRef.current = { dx: e.clientX - x, dy: e.clientY - y }
    startTracking()
  }

  const startResize = (handle: ResizeHandle) => (e: ReactPointerEvent) => {
    if (!canResize || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    onFocus()
    resizeRef.current = {
      handle,
      start: { x, y, width, height },
      pointerX: e.clientX,
      pointerY: e.clientY,
    }
    startTracking()
  }

  const mobileStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    top: 32,
    zIndex: z,
  }
  const desktopStyle: CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width,
    maxWidth: 'calc(100vw - 24px)',
    height,
    maxHeight: 'calc(100vh - 120px)',
    zIndex: Math.max(0, z),
    display: status === 'minimized' ? 'none' : undefined,
  }
  const titlebarControlClass =
    'grid size-4 place-items-center border-2 border-current bg-transparent font-pixel text-[8px] leading-none transition-colors hover:border-border hover:bg-transparent focus-visible:border-border focus-visible:outline-none disabled:cursor-default disabled:opacity-60'

  return (
    <section
      role="dialog"
      aria-label={app.title}
      aria-modal={isMobile}
      aria-hidden={!isMobile && status === 'minimized'}
      data-window-id={app.id}
      data-window-status={status}
      data-window-focused={focused ? 'true' : 'false'}
      data-window-interacting={interacting ? 'true' : 'false'}
      style={isMobile ? mobileStyle : desktopStyle}
      onPointerDown={status === 'closing' || status === 'minimized' ? undefined : onFocus}
      className={`os-window-frame flex flex-col overflow-hidden bg-paper os-border ${
        status === 'closing'
          ? 'animate-window-close'
          : status === 'minimized'
            ? 'animate-window-minimize'
            : 'animate-window-open'
      } ${
        isMobile
          ? ''
          : focused
            ? 'os-window-active os-shadow-lg'
            : 'os-window-inactive os-shadow'
      }`}
    >
      <header
        onPointerDown={startDrag}
        onDoubleClick={isMobile || status === 'closing' ? undefined : onMaximize}
        className={`flex h-8 shrink-0 select-none items-center gap-2 border-b-2 border-border px-2 ${
          canMove ? 'cursor-grab active:cursor-grabbing' : ''
        } ${focused ? 'bg-titlebar text-titlebar-foreground' : 'bg-secondary text-muted-foreground'}`}
      >
        <button
          type="button"
          disabled={status === 'closing'}
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Close ${app.title}`}
          className={titlebarControlClass}
        >
          <span
            aria-hidden
            className="opacity-80"
          >
            x
          </span>
        </button>

        <div className="flex flex-1 items-center justify-center gap-2 overflow-hidden">
          {focused ? (
            <span
              aria-hidden
              className="titlebar-lines hidden h-3 flex-1 opacity-60 sm:block"
            />
          ) : null}
          <div className="flex min-w-0 max-w-full items-center gap-1.5 px-2">
            {app.tone === 'recruiter' ? (
              <span
                aria-hidden
                className="recruiter-inline-icon grid size-4 shrink-0 place-items-center border"
              >
                <app.Icon className="size-3" />
              </span>
            ) : app.tone === 'firewall' ? (
              <span
                aria-hidden
                className="firewall-inline-icon grid size-4 shrink-0 place-items-center border"
              >
                <app.Icon className="size-3" />
              </span>
            ) : app.tone === 'blue-ocean' ? (
              <span
                aria-hidden
                className="blue-ocean-inline-icon grid size-4 shrink-0 place-items-center border"
              >
                <app.Icon className="size-3" />
              </span>
            ) : app.tone === 'kickoff' ? (
              <span
                aria-hidden
                className="kickoff-inline-icon grid size-4 shrink-0 place-items-center border"
              >
                <app.Icon className="size-3" />
              </span>
            ) : (
              <app.Icon aria-hidden className="size-3.5 shrink-0" />
            )}
            <h2 className="truncate font-pixel text-[9px] leading-none sm:text-[10px]">
              {app.title}
            </h2>
          </div>
          {focused ? (
            <span
              aria-hidden
              className="titlebar-lines hidden h-3 flex-1 opacity-60 sm:block"
            />
          ) : null}
        </div>

        {!isMobile ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={status === 'closing'}
              onClick={onMinimize}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`Minimize ${app.title}`}
              className={titlebarControlClass}
            >
              <span
                aria-hidden
                className="opacity-80"
              >
                -
              </span>
            </button>
            <button
              type="button"
              disabled={status === 'closing'}
              onClick={onMaximize}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={
                status === 'maximized' ? `Restore ${app.title}` : `Maximize ${app.title}`
              }
              className={titlebarControlClass}
            >
              <span
                aria-hidden
                className="opacity-80"
              >
                {status === 'maximized' ? '=' : '+'}
              </span>
            </button>
          </div>
        ) : null}
      </header>

      <div
        data-window-body-id={app.id}
        className={
          app.flushContent
            ? 'window-body min-h-0 flex flex-1 flex-col overflow-hidden p-0'
            : 'window-body min-h-0 flex-1 overflow-y-auto bg-paper p-4 text-card-foreground sm:p-5'
        }
      >
        {children}
      </div>

      {canResize
        ? RESIZE_HANDLES.map((item) => (
            <div
              key={item.handle}
              aria-hidden
              onPointerDown={startResize(item.handle)}
              className={`absolute z-10 touch-none select-none ${item.className}`}
              style={{ cursor: item.cursor }}
            />
          ))
        : null}
    </section>
  )
}

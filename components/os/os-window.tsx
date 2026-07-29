'use client'

import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import type { WindowApp } from './apps'

type Props = {
  app: WindowApp
  children: ReactNode
  x: number
  y: number
  z: number
  status: 'open' | 'closing'
  focused: boolean
  isMobile: boolean
  onFocus: () => void
  onClose: () => void
  onMove: (x: number, y: number) => void
}

const MENU_BAR_HEIGHT = 32
const DESKTOP_EDGE_PADDING = 8
const MIN_VISIBLE_TITLEBAR_WIDTH = 128
const DESKTOP_BOTTOM_TITLEBAR_MARGIN = 48

export function OsWindow({
  app,
  children,
  x,
  y,
  z,
  status,
  focused,
  isMobile,
  onFocus,
  onClose,
  onMove,
}: Props) {
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const frame = useRef<number | null>(null)
  const onMoveRef = useRef(onMove)

  useEffect(() => {
    onMoveRef.current = onMove
  }, [onMove])

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return
      const nextX = e.clientX - dragRef.current.dx
      const nextY = e.clientY - dragRef.current.dy
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const minX = DESKTOP_EDGE_PADDING
        const minY = MENU_BAR_HEIGHT + DESKTOP_EDGE_PADDING
        const maxX = Math.max(
          minX,
          window.innerWidth - Math.min(MIN_VISIBLE_TITLEBAR_WIDTH, app.width),
        )
        const maxY = Math.max(minY, window.innerHeight - DESKTOP_BOTTOM_TITLEBAR_MARGIN)
        onMoveRef.current(
          Math.min(Math.max(nextX, minX), maxX),
          Math.min(Math.max(nextY, minY), maxY),
        )
        frame.current = null
      })
    },
    [app.width],
  )

  const stopDrag = useCallback(() => {
    dragRef.current = null
    if (frame.current) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopDrag)
    window.removeEventListener('pointercancel', stopDrag)
    window.removeEventListener('blur', stopDrag)
  }, [onPointerMove])

  useEffect(() => stopDrag, [stopDrag])

  const startDrag = (e: React.PointerEvent) => {
    if (isMobile || status === 'closing' || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    onFocus()
    dragRef.current = { dx: e.clientX - x, dy: e.clientY - y }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)
    window.addEventListener('blur', stopDrag)
  }

  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    top: MENU_BAR_HEIGHT,
    zIndex: z,
  }
  const desktopStyle: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: app.width,
    maxWidth: 'calc(100vw - 24px)',
    height: app.height,
    maxHeight: `calc(100vh - ${MENU_BAR_HEIGHT + 24}px)`,
    zIndex: z,
  }

  return (
    <section
      role="dialog"
      aria-label={app.title}
      aria-modal={isMobile}
      data-window-status={status}
      data-window-focused={focused ? 'true' : 'false'}
      style={isMobile ? mobileStyle : desktopStyle}
      onPointerDown={status === 'closing' ? undefined : onFocus}
      className={`flex flex-col overflow-hidden bg-paper os-border ${
        status === 'closing' ? 'animate-window-close' : 'animate-window-open'
      } ${
        isMobile
          ? ''
          : focused
            ? 'os-window-active os-shadow-lg'
            : 'os-window-inactive os-shadow'
      }`}
    >
      {/* Title bar */}
      <header
        onPointerDown={startDrag}
        onDoubleClick={isMobile || status === 'closing' ? undefined : onClose}
        className={`flex h-8 shrink-0 select-none items-center gap-2 border-b-2 border-border px-2 ${
          isMobile ? '' : 'cursor-grab active:cursor-grabbing'
        } ${focused ? 'bg-titlebar text-titlebar-foreground' : 'bg-secondary text-muted-foreground'}`}
      >
        <button
          type="button"
          disabled={status === 'closing'}
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Close ${app.title}`}
          className="group/close grid size-4 place-items-center border-2 border-current bg-transparent transition-colors hover:bg-current focus-visible:bg-current focus-visible:outline-none disabled:cursor-default disabled:opacity-60"
        >
          <span
            aria-hidden
            className="font-pixel text-[7px] leading-none opacity-0 group-hover/close:opacity-100 group-focus-visible/close:opacity-100"
            style={{ color: 'var(--paper)' }}
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
            <app.Icon aria-hidden className="size-3.5 shrink-0" />
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

        <span aria-hidden className="size-4 shrink-0" />
      </header>

      {/* Body */}
      <div className="window-body min-h-0 flex-1 overflow-y-auto bg-paper p-4 text-card-foreground sm:p-5">
        {children}
      </div>
    </section>
  )
}

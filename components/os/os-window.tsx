'use client'

import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import type { WindowApp } from './apps'

type Props = {
  app: WindowApp
  children: ReactNode
  x: number
  y: number
  z: number
  focused: boolean
  isMobile: boolean
  onFocus: () => void
  onClose: () => void
  onMove: (x: number, y: number) => void
}

const MENU_BAR_HEIGHT = 32

export function OsWindow({
  app,
  children,
  x,
  y,
  z,
  focused,
  isMobile,
  onFocus,
  onClose,
  onMove,
}: Props) {
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const frame = useRef<number | null>(null)

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return
      const nextX = e.clientX - dragRef.current.dx
      const nextY = e.clientY - dragRef.current.dy
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const maxX = window.innerWidth - 80
        const maxY = window.innerHeight - 60
        onMove(
          Math.min(Math.max(nextX, -app.width + 120), maxX),
          Math.min(Math.max(nextY, MENU_BAR_HEIGHT), maxY),
        )
      })
    },
    [app.width, onMove],
  )

  const stopDrag = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopDrag)
  }, [onPointerMove])

  useEffect(() => stopDrag, [stopDrag])

  const startDrag = (e: React.PointerEvent) => {
    if (isMobile) return
    onFocus()
    dragRef.current = { dx: e.clientX - x, dy: e.clientY - y }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopDrag)
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
      style={isMobile ? mobileStyle : desktopStyle}
      onPointerDown={onFocus}
      className={`animate-window-open flex flex-col overflow-hidden bg-paper os-border ${
        isMobile ? '' : focused ? 'os-shadow-lg' : 'os-shadow'
      }`}
    >
      {/* Title bar */}
      <header
        onPointerDown={startDrag}
        onDoubleClick={isMobile ? undefined : onClose}
        className={`flex h-8 shrink-0 select-none items-center gap-2 border-b-2 border-border px-2 ${
          isMobile ? '' : 'cursor-grab active:cursor-grabbing'
        } ${focused ? 'bg-titlebar text-titlebar-foreground' : 'bg-secondary text-muted-foreground'}`}
      >
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Close ${app.title}`}
          className="group/close grid size-4 place-items-center border-2 border-current bg-transparent transition-colors hover:bg-current focus-visible:bg-current focus-visible:outline-none"
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
      <div className="min-h-0 flex-1 overflow-y-auto bg-paper p-4 text-card-foreground sm:p-5">
        {children}
      </div>
    </section>
  )
}

'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { DesktopItem } from './apps'

type DesktopIconPosition = {
  x: number
  y: number
}

export function DesktopIcon({
  item,
  variant,
  onOpenWindow,
  position,
  draggable = false,
  onClampDragPosition,
  onCommitDragPosition,
}: {
  item: DesktopItem
  variant: 'desktop' | 'mobile'
  onOpenWindow: (id: string) => void
  position?: DesktopIconPosition
  draggable?: boolean
  onClampDragPosition?: (x: number, y: number) => DesktopIconPosition
  onCommitDragPosition?: (id: string, x: number, y: number) => void
}) {
  const { Icon, label } = item
  const [dragPosition, setDragPosition] = useState<DesktopIconPosition | null>(null)
  const dragPositionRef = useRef<DesktopIconPosition | null>(null)
  const dragRef = useRef<{
    pointerId: number
    dx: number
    dy: number
    startClientX: number
    startClientY: number
    moved: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)

  const currentPosition = dragPosition ?? position
  const style: CSSProperties | undefined = currentPosition
    ? {
        position: 'absolute',
        left: currentPosition.x,
        top: currentPosition.y,
        touchAction: draggable ? 'none' : undefined,
      }
    : undefined

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const moved =
        Math.abs(event.clientX - drag.startClientX) > 4 ||
        Math.abs(event.clientY - drag.startClientY) > 4
      drag.moved = drag.moved || moved

      const nextX = event.clientX - drag.dx
      const nextY = event.clientY - drag.dy
      const clamped = onClampDragPosition
        ? onClampDragPosition(nextX, nextY)
        : { x: nextX, y: nextY }
      dragPositionRef.current = clamped
      setDragPosition(clamped)
    },
    [onClampDragPosition],
  )

  const stopDrag = useCallback(() => {
    const drag = dragRef.current
    if (!drag) return

    dragRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopDrag)
    window.removeEventListener('pointercancel', stopDrag)
    window.removeEventListener('blur', stopDrag)

    if (drag.moved && dragPositionRef.current) {
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
      onCommitDragPosition?.(item.id, dragPositionRef.current.x, dragPositionRef.current.y)
    }
    dragPositionRef.current = null
    setDragPosition(null)
  }, [item.id, onCommitDragPosition, onPointerMove])

  useEffect(() => stopDrag, [stopDrag])

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggable || !position || variant !== 'desktop' || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      dx: event.clientX - position.x,
      dy: event.clientY - position.y,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    }
    setDragPosition(position)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)
    window.addEventListener('blur', stopDrag)
  }

  const preventSuppressedClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  const inner = (
    <>
      <span
        aria-hidden
        className="os-border grid size-12 place-items-center bg-paper text-foreground transition-colors group-hover:bg-foreground group-hover:text-primary-foreground group-focus-visible:bg-foreground group-focus-visible:text-primary-foreground sm:size-14"
      >
        <Icon className="size-6 sm:size-7" />
      </span>
      <span className="w-full text-center font-pixel text-[8px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
        {label}
      </span>
    </>
  )

  const className =
    'group pointer-events-auto flex w-20 flex-col items-center gap-1.5 rounded-sm p-1 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring sm:w-24'

  if (item.kind === 'link') {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        data-desktop-icon="true"
        data-desktop-interactive="true"
        data-icon-dragging={dragPosition ? 'true' : 'false'}
        onPointerDown={startDrag}
        onClickCapture={preventSuppressedClick}
        style={style}
        className={className}
        aria-label={`${label} (opens in a new tab)`}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type="button"
      data-desktop-icon="true"
      data-desktop-interactive="true"
      data-icon-dragging={dragPosition ? 'true' : 'false'}
      onPointerDown={startDrag}
      onClickCapture={preventSuppressedClick}
      style={style}
      className={className}
      onClick={variant === 'mobile' ? () => onOpenWindow(item.id) : undefined}
      onDoubleClick={
        variant === 'desktop'
          ? () => {
              if (!suppressClickRef.current) {
                onOpenWindow(item.id)
              }
            }
          : undefined
      }
    >
      {inner}
    </button>
  )
}

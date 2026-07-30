'use client'

import { useEffect } from 'react'

type DesktopContextMenuProps = {
  x: number
  y: number
  onClose: () => void
  onPersonalize: () => void
  onResetWallpaper: () => void
  onResetDesktopLayout: () => void
}

export function DesktopContextMenu({
  x,
  y,
  onClose,
  onPersonalize,
  onResetWallpaper,
  onResetDesktopLayout,
}: DesktopContextMenuProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      role="menu"
      aria-label="Desktop"
      data-desktop-interactive="true"
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => event.stopPropagation()}
      className="fixed z-[80] w-44 os-border bg-paper py-1 font-pixel text-[9px] leading-none text-foreground os-shadow"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onPersonalize()
          onClose()
        }}
        className="block w-full px-3 py-2 text-left transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        Personalize...
      </button>
      <span aria-hidden className="my-1 block border-t-2 border-border" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onResetWallpaper()
          onClose()
        }}
        className="block w-full px-3 py-2 text-left transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        Reset Wallpaper
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onResetDesktopLayout()
          onClose()
        }}
        className="block w-full px-3 py-2 text-left transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        Reset Desktop Layout
      </button>
    </div>
  )
}

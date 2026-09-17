'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'

type SystemMenuProps = {
  onPersonalize: () => void
  onOpenWelcome: () => void
  onOpenRecruiter: () => void
  onOpenSimpleMode: () => void
  onResetWindowLayout: () => void
  onRestartSession: () => void
  onClose: () => void
}

export function SystemMenu({
  onPersonalize,
  onOpenWelcome,
  onOpenRecruiter,
  onOpenSimpleMode,
  onResetWindowLayout,
  onRestartSession,
  onClose,
}: SystemMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = getMenuItems(menuRef.current)
    items[0]?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return
    }

    const items = getMenuItems(menuRef.current)
    if (items.length === 0) return

    event.preventDefault()
    const currentIndex = items.findIndex((item) => item === document.activeElement)
    let nextIndex = currentIndex
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
    } else if (event.key === 'ArrowUp') {
      nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else {
      nextIndex = items.length - 1
    }
    items[nextIndex]?.focus()
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="System"
      data-desktop-interactive="true"
      onKeyDown={onKeyDown}
      className="jackos-system-menu absolute left-0 top-full z-[90] mt-1 w-52 os-border bg-paper py-1 font-pixel text-[9px] leading-none text-foreground os-shadow"
    >
      <MenuItem
        label="Personalize..."
        onSelect={() => {
          onPersonalize()
          onClose()
        }}
      />
      <MenuItem
        label="Welcome"
        onSelect={() => {
          onOpenWelcome()
          onClose()
        }}
      />
      <MenuItem
        label="Recruiter Mode"
        onSelect={() => {
          onOpenRecruiter()
          onClose()
        }}
      />
      <MenuItem
        label="Simple Mode"
        onSelect={() => {
          onOpenSimpleMode()
          onClose()
        }}
      />
      <span aria-hidden className="my-1 block border-t-2 border-border" />
      <MenuItem
        label="Reset Window Layout"
        onSelect={() => {
          onResetWindowLayout()
          onClose()
        }}
      />
      <MenuItem
        label="Restart JackOS"
        onSelect={() => {
          onClose()
          onRestartSession()
        }}
      />
    </div>
  )
}

function MenuItem({
  label,
  onSelect,
}: {
  label: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="block w-full px-3 py-2 text-left transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
    >
      {label}
    </button>
  )
}

function getMenuItems(menu: HTMLDivElement | null) {
  if (!menu) return []
  return Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
}

'use client'

import type { KeyboardEvent } from 'react'
import type { DesktopItem } from './apps'

export function DesktopIcon({
  item,
  variant,
  onOpenWindow,
}: {
  item: DesktopItem
  variant: 'desktop' | 'mobile'
  onOpenWindow: (id: string) => void
}) {
  const { Icon, label } = item
  const iconClass =
    variant === 'desktop'
      ? 'os-border grid size-14 place-items-center bg-paper text-foreground transition-colors group-hover:bg-foreground group-hover:text-primary-foreground group-focus-visible:bg-foreground group-focus-visible:text-primary-foreground sm:size-16 2xl:size-[4.5rem]'
      : 'os-border grid size-12 place-items-center bg-paper text-foreground transition-colors group-hover:bg-foreground group-hover:text-primary-foreground group-focus-visible:bg-foreground group-focus-visible:text-primary-foreground sm:size-14'
  const glyphClass =
    variant === 'desktop'
      ? 'size-7 sm:size-8 2xl:size-9'
      : 'size-6 sm:size-7'
  const labelClass =
    variant === 'desktop'
      ? 'desktop-icon-label w-full text-center font-pixel text-[9px] font-semibold leading-relaxed text-foreground [overflow-wrap:anywhere] sm:text-[10px]'
      : 'desktop-icon-label w-full text-center font-pixel text-[8px] leading-relaxed text-foreground [overflow-wrap:anywhere]'

  const inner = (
    <>
      <span
        aria-hidden
        className={iconClass}
      >
        <Icon className={glyphClass} />
      </span>
      <span className={labelClass}>
        {label}
      </span>
    </>
  )

  const className =
    variant === 'desktop'
      ? 'group pointer-events-auto flex w-24 flex-col items-center gap-2 rounded-sm p-1.5 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring sm:w-28'
      : 'group pointer-events-auto flex w-20 flex-col items-center gap-1.5 rounded-sm p-1 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring sm:w-24'

  if (item.kind === 'link') {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        data-desktop-icon="true"
        data-desktop-interactive="true"
        className={className}
        aria-label={`${label} (opens in a new tab)`}
      >
        {inner}
      </a>
    )
  }

  const open = () => onOpenWindow(item.id)
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (variant !== 'desktop') return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open()
    }
  }

  return (
    <button
      type="button"
      data-desktop-icon="true"
      data-desktop-interactive="true"
      className={className}
      onClick={variant === 'mobile' ? open : undefined}
      onDoubleClick={variant === 'desktop' ? open : undefined}
      onKeyDown={onKeyDown}
    >
      {inner}
    </button>
  )
}

'use client'

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
    'group flex w-20 flex-col items-center gap-1.5 rounded-sm p-1 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring sm:w-24'

  if (item.kind === 'link') {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        data-desktop-icon="true"
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
      className={className}
      onClick={variant === 'mobile' ? () => onOpenWindow(item.id) : undefined}
      onDoubleClick={variant === 'desktop' ? () => onOpenWindow(item.id) : undefined}
    >
      {inner}
    </button>
  )
}

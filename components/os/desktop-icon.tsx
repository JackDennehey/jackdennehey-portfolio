'use client'

import type { KeyboardEvent } from 'react'
import type { DesktopItem } from './apps'
import { cn } from '@/lib/utils'

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
  const tone = item.kind === 'window' ? item.tone : undefined
  const isRecruiter = item.kind === 'window' && item.id === 'recruiter'
  const isFirewall = item.kind === 'window' && item.id === 'firewall'
  const accessibleLabel = isRecruiter
    ? 'Recruiter Mode — guided professional overview'
    : isFirewall
      ? 'Network Firewall — flagship simulated packet firewall demonstration'
      : label
  const openItem = () => {
    if (item.kind === 'window') {
      onOpenWindow(item.id)
    }
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    openItem()
  }

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          'os-border grid size-12 place-items-center transition-colors sm:size-14',
          tone === 'recruiter'
            ? 'recruiter-icon-frame'
            : tone === 'firewall'
              ? 'firewall-icon-frame'
              : 'bg-paper text-foreground group-hover:bg-foreground group-hover:text-primary-foreground group-focus-visible:bg-foreground group-focus-visible:text-primary-foreground',
        )}
      >
        <Icon className="size-6 sm:size-7" />
      </span>
      <span
        className={cn(
          'w-full text-center font-pixel text-[8px] leading-relaxed text-foreground [overflow-wrap:anywhere]',
          tone === 'recruiter' ? 'recruiter-icon-label' : null,
          tone === 'firewall' ? 'firewall-icon-label' : null,
        )}
      >
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
        rel="noopener noreferrer"
        data-desktop-icon="true"
        className={className}
        aria-label={`${accessibleLabel} (opens in a new tab)`}
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
      onClick={variant === 'mobile' || isRecruiter ? openItem : undefined}
      onDoubleClick={variant === 'desktop' && !isRecruiter ? openItem : undefined}
      onKeyDown={variant === 'desktop' ? onKeyDown : undefined}
      aria-label={accessibleLabel}
    >
      {inner}
    </button>
  )
}

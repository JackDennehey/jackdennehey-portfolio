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
  const isBlueOcean = item.kind === 'window' && item.id === 'blue-ocean'
  const isRecruiter = item.kind === 'window' && item.id === 'recruiter'
  const isFirewall = item.kind === 'window' && item.id === 'firewall'
  const isFlagship = isBlueOcean || isRecruiter || isFirewall
  const isImageIcon = item.kind === 'window' && item.iconVisual === 'image'
  const externalTone = item.kind === 'link' ? item.id : null
  const accessibleLabel = isRecruiter
    ? 'Recruiter Mode — guided professional overview'
    : isFirewall
      ? 'Network Firewall — flagship simulated packet firewall demonstration'
      : isBlueOcean
        ? '1984 Blue Ocean — flagship guided interactive keynote'
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
  const iconFrameClassName =
    tone === 'recruiter'
      ? 'recruiter-icon-frame'
      : tone === 'firewall'
        ? 'firewall-icon-frame'
        : tone === 'blue-ocean'
          ? 'blue-ocean-icon-frame'
          : externalTone === 'github'
            ? 'github-icon-frame'
            : externalTone === 'linkedin'
              ? 'linkedin-icon-frame'
              : 'bg-paper text-foreground group-hover:bg-foreground group-hover:text-primary-foreground group-focus-visible:bg-foreground group-focus-visible:text-primary-foreground'

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          'os-border grid size-12 place-items-center transition-colors',
          iconFrameClassName,
        )}
      >
        <Icon className={isImageIcon ? 'size-[42px]' : 'size-6'} />
      </span>
      <span
        className={cn(
          'desktop-icon-label w-full text-center font-pixel text-[8px] leading-relaxed text-foreground',
          tone === 'recruiter' ? 'recruiter-icon-label' : null,
          tone === 'firewall' ? 'firewall-icon-label' : null,
          tone === 'blue-ocean' ? 'blue-ocean-icon-label' : null,
          externalTone === 'github' ? 'github-icon-label' : null,
          externalTone === 'linkedin' ? 'linkedin-icon-label' : null,
        )}
      >
        {label}
      </span>
    </>
  )

  const className =
    'group flex w-20 flex-col items-center gap-1 rounded-sm p-0.5 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring sm:w-24'

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
      onClick={variant === 'mobile' || isFlagship ? openItem : undefined}
      onDoubleClick={variant === 'desktop' && !isFlagship ? openItem : undefined}
      onKeyDown={variant === 'desktop' ? onKeyDown : undefined}
      aria-label={accessibleLabel}
    >
      {inner}
    </button>
  )
}

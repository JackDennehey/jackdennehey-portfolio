'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Clock } from './clock'
import type { WindowId } from './apps'
import type { InterfaceTheme } from '@/lib/interface-theme'
import { CONTACT } from '@/lib/portfolio-data'

type MenuName = 'jack' | 'system' | 'about'

type MenuEntry =
  | {
      type: 'item'
      label: string
      onSelect: () => void
      detail?: string
      disabled?: boolean
    }
  | {
      type: 'link'
      label: string
      href: string
      detail?: string
    }
  | { type: 'separator' }

type MenuDefinition = {
  id: MenuName
  label: string
  entries: MenuEntry[]
}

const MENU_ORDER: MenuName[] = ['jack', 'system', 'about']
const menuButtonClass =
  'flex h-full items-center px-2 font-pixel text-[10px] leading-none text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none'
const menuItemClass =
  'flex w-full min-w-44 items-center justify-between gap-4 px-3 py-2 text-left font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground'

export function MenuBar({
  onOpen,
  onOpenProjectCaseStudy,
  onRestart,
  onRestoreDefaultDesktop,
  onShowWelcomeTour,
  onCopyPortfolioLink,
  onCopyEmail,
  scanlines,
  onToggleScanlines,
  theme,
  onToggleTheme,
  soundEffectsEnabled,
  onToggleSoundEffects,
  onOpenCommandPalette,
}: {
  onOpen: (id: WindowId) => void
  onOpenProjectCaseStudy: (slug: string) => void
  onRestart: () => void
  onRestoreDefaultDesktop: () => void
  onShowWelcomeTour: () => void
  onCopyPortfolioLink: () => void
  onCopyEmail: () => void
  scanlines: boolean
  onToggleScanlines: () => void
  theme: InterfaceTheme
  onToggleTheme: () => void
  soundEffectsEnabled: boolean
  onToggleSoundEffects: () => void
  onOpenCommandPalette: () => void
}) {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const triggerRefs = useRef<Record<MenuName, HTMLButtonElement | null>>({
    jack: null,
    system: null,
    about: null,
  })

  const menus = useMemo<MenuDefinition[]>(
    () => [
      {
        id: 'jack',
        label: 'Jack',
        entries: [
          { type: 'item', label: 'Welcome', onSelect: () => onOpen('home') },
          { type: 'item', label: 'Enter Recruiter View', onSelect: () => onOpen('recruiter') },
          { type: 'item', label: 'About Jack', onSelect: () => onOpen('about') },
          { type: 'item', label: 'Projects', onSelect: () => onOpen('projects') },
          { type: 'item', label: 'Jack OS Case Study', onSelect: () => onOpenProjectCaseStudy('jack-os') },
          { type: 'item', label: 'Credentials', onSelect: () => onOpen('certifications') },
          { type: 'item', label: 'Contact Jack', onSelect: () => onOpen('contact') },
          { type: 'separator' },
          { type: 'item', label: 'Copy Portfolio Link', onSelect: onCopyPortfolioLink },
          { type: 'item', label: 'Copy Email', onSelect: onCopyEmail },
          { type: 'separator' },
          { type: 'link', label: 'LinkedIn', href: CONTACT.linkedin },
          { type: 'link', label: 'GitHub', href: CONTACT.github },
          { type: 'separator' },
          { type: 'item', label: 'Restart Jack OS', onSelect: onRestart },
        ],
      },
      {
        id: 'system',
        label: 'System',
        entries: [
          { type: 'item', label: 'About This Jack OS', onSelect: () => onOpen('system-info') },
          { type: 'item', label: 'Personalize...', onSelect: () => onOpen('wallpapers') },
          { type: 'item', label: 'Wallpapers', onSelect: () => onOpen('wallpapers') },
          { type: 'separator' },
          {
            type: 'item',
            label: `Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`,
            detail: 'Toggle',
            onSelect: onToggleTheme,
          },
          {
            type: 'item',
            label: `CRT Effect: ${scanlines ? 'On' : 'Off'}`,
            detail: 'Toggle',
            onSelect: onToggleScanlines,
          },
          {
            type: 'item',
            label: `Sound: ${soundEffectsEnabled ? 'On' : 'Off'}`,
            detail: 'Toggle',
            onSelect: onToggleSoundEffects,
          },
          { type: 'separator' },
          { type: 'item', label: 'Keyboard Shortcuts', onSelect: () => onOpen('shortcuts') },
          { type: 'item', label: 'Welcome Tour', onSelect: onShowWelcomeTour },
          { type: 'item', label: 'Restore Default Desktop', onSelect: onRestoreDefaultDesktop },
          { type: 'separator' },
          { type: 'item', label: 'Secrets', onSelect: () => onOpen('secrets') },
        ],
      },
      {
        id: 'about',
        label: 'About',
        entries: [
          { type: 'item', label: 'About Jack', onSelect: () => onOpen('about') },
          { type: 'item', label: 'Education', onSelect: () => onOpen('about') },
          { type: 'item', label: 'Skills', onSelect: () => onOpen('about') },
          { type: 'item', label: 'Credentials', onSelect: () => onOpen('certifications') },
          { type: 'item', label: 'Current Focus', onSelect: () => onOpen('about') },
          { type: 'item', label: 'Contact', onSelect: () => onOpen('contact') },
        ],
      },
    ],
    [
      onCopyEmail,
      onCopyPortfolioLink,
      onOpen,
      onOpenProjectCaseStudy,
      onRestart,
      onRestoreDefaultDesktop,
      onShowWelcomeTour,
      onToggleScanlines,
      onToggleSoundEffects,
      onToggleTheme,
      scanlines,
      soundEffectsEnabled,
      theme,
    ],
  )

  useEffect(() => {
    if (!openMenu) return

    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        headerRef.current?.contains(event.target)
      ) {
        return
      }
      setOpenMenu(null)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [openMenu])

  useEffect(() => {
    if (!openMenu) return

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      const closingMenu = openMenu
      setOpenMenu(null)
      window.setTimeout(() => triggerRefs.current[closingMenu]?.focus(), 0)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openMenu])

  const focusFirstMenuItem = (menuId: MenuName) => {
    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(`#jack-os-menu-${menuId} [role^="menuitem"]`)
        ?.focus()
    }, 0)
  }

  const focusSiblingMenu = (current: MenuName, direction: 1 | -1) => {
    const currentIndex = MENU_ORDER.indexOf(current)
    const nextMenu = MENU_ORDER[(currentIndex + direction + MENU_ORDER.length) % MENU_ORDER.length]
    setOpenMenu(nextMenu)
    triggerRefs.current[nextMenu]?.focus()
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, menuId: MenuName) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpenMenu(menuId)
      focusFirstMenuItem(menuId)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusSiblingMenu(menuId, 1)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusSiblingMenu(menuId, -1)
    }
  }

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>, menuId: MenuName) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled)'),
    )
    const currentIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex =
        currentIndex === -1
          ? 0
          : (currentIndex + direction + items.length) % items.length
      items[nextIndex]?.focus()
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusSiblingMenu(menuId, 1)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusSiblingMenu(menuId, -1)
    }
  }

  const activateItem = (entry: Extract<MenuEntry, { type: 'item' }>) => {
    if (entry.disabled) return
    setOpenMenu(null)
    entry.onSelect()
  }

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between border-b-2 border-border bg-paper px-2 sm:px-3"
    >
      <nav aria-label="Main" className="flex h-full min-w-0 items-center">
        {menus.map((menu) => (
          <div key={menu.id} className="relative flex h-full items-center">
            <button
              ref={(node) => {
                triggerRefs.current[menu.id] = node
              }}
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === menu.id}
              aria-controls={`jack-os-menu-${menu.id}`}
              onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              onKeyDown={(event) => onTriggerKeyDown(event, menu.id)}
              className={menuButtonClass}
            >
              {menu.id === 'jack' ? (
                <span
                  aria-hidden
                  className="mr-1.5 grid size-4 place-items-center bg-foreground text-[8px] text-primary-foreground"
                >
                  J
                </span>
              ) : null}
              {menu.label}
            </button>

            {openMenu === menu.id ? (
              <div
                id={`jack-os-menu-${menu.id}`}
                role="menu"
                aria-label={`${menu.label} menu`}
                data-desktop-interactive="true"
                data-jack-os-menu-open="true"
                onKeyDown={(event) => onMenuKeyDown(event, menu.id)}
                className="absolute left-0 top-full z-[75] mt-0 w-max os-border bg-paper py-1 text-foreground os-shadow"
              >
                {menu.entries.map((entry, index) => {
                  if (entry.type === 'separator') {
                    return (
                      <span
                        key={`${menu.id}-separator-${index}`}
                        aria-hidden
                        className="my-1 block border-t-2 border-border"
                      />
                    )
                  }

                  if (entry.type === 'link') {
                    return (
                      <a
                        key={entry.label}
                        role="menuitem"
                        href={entry.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpenMenu(null)}
                        className={menuItemClass}
                      >
                        <span>{entry.label}</span>
                        {entry.detail ? <span className="text-[7px] opacity-70">{entry.detail}</span> : null}
                      </a>
                    )
                  }

                  return (
                    <button
                      key={entry.label}
                      type="button"
                      role="menuitem"
                      disabled={entry.disabled}
                      onClick={() => activateItem(entry)}
                      className={menuItemClass}
                    >
                      <span>{entry.label}</span>
                      {entry.detail ? <span className="text-[7px] opacity-70">{entry.detail}</span> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setOpenMenu(null)
            onOpenCommandPalette()
          }}
          className={menuButtonClass}
        >
          Search Jack OS
        </button>
      </nav>

      <div className="hidden shrink-0 sm:block">
        <Clock />
      </div>
    </header>
  )
}

'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type SVGProps,
} from 'react'
import { cn } from '@/lib/utils'
import type { AppTone } from './apps'

export type JackOsCommand = {
  id: string
  title: string
  subtitle?: string
  keywords?: readonly string[]
  shortcut?: string
  disabled?: boolean
  tone?: AppTone
  ariaLabel?: string
  Icon?: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
  action: () => void
}

type CommandPaletteProps = {
  open: boolean
  commands: readonly JackOsCommand[]
  onClose: () => void
}

function commandMatches(command: JackOsCommand, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const searchable = [
    command.title,
    command.subtitle ?? '',
    ...(command.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return searchable.includes(normalizedQuery)
}

export function CommandPalette({ open, commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const visibleCommands = useMemo(
    () => commands.filter((command) => commandMatches(command, query)),
    [commands, query],
  )

  useEffect(() => {
    if (!open) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setQuery('')
    setSelectedIndex(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)

    return () => {
      window.setTimeout(() => {
        if (previousFocusRef.current?.isConnected) {
          previousFocusRef.current.focus()
        }
      }, 0)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex((current) =>
      visibleCommands.length === 0 ? 0 : Math.min(current, visibleCommands.length - 1),
    )
  }, [visibleCommands.length])

  if (!open) return null

  const activateCommand = (command: JackOsCommand | undefined) => {
    if (!command || command.disabled) return
    onClose()
    command.action()
  }

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      setSelectedIndex((current) =>
        visibleCommands.length === 0 ? 0 : (current + 1) % visibleCommands.length,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      setSelectedIndex((current) =>
        visibleCommands.length === 0
          ? 0
          : (current - 1 + visibleCommands.length) % visibleCommands.length,
      )
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      activateCommand(visibleCommands[selectedIndex])
    }
  }

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
      return
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-background/20 px-3 pt-14 sm:pt-20"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Jack OS"
        onKeyDown={onDialogKeyDown}
        className="w-full max-w-xl overflow-hidden os-border bg-paper text-foreground os-shadow-lg"
      >
        <header className="flex h-8 items-center gap-2 border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
          <span className="font-pixel text-[10px] leading-none">Search Jack OS</span>
          <span aria-hidden className="titlebar-lines h-3 flex-1 opacity-60" />
          <span className="hidden font-pixel text-[7px] leading-none sm:block">Esc</span>
        </header>

        <div className="p-3">
          <label htmlFor="jack-os-command-palette-search" className="sr-only">
            Type an app or command
          </label>
          <input
            ref={inputRef}
            id="jack-os-command-palette-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={onInputKeyDown}
            autoComplete="off"
            spellCheck={false}
            placeholder="Type an app or command..."
            className="w-full os-border bg-card px-3 py-2 font-pixel text-[9px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div
            role="listbox"
            aria-label="Command results"
            className="mt-3 max-h-[min(58dvh,360px)] overflow-y-auto os-border bg-secondary p-1"
          >
            {visibleCommands.length > 0 ? (
              visibleCommands.map((command, index) => {
                const Icon = command.Icon
                const selected = index === selectedIndex
                return (
                  <button
                    key={command.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={command.disabled}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => activateCommand(command)}
                    aria-label={command.ariaLabel ?? command.title}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 px-2 py-2 text-left transition-colors focus-visible:outline-none',
                      selected
                        ? 'bg-foreground text-primary-foreground'
                        : 'text-foreground hover:bg-card focus-visible:bg-card',
                      command.disabled ? 'cursor-default opacity-50' : null,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-7 shrink-0 place-items-center border-2',
                        command.tone === 'recruiter'
                          ? 'recruiter-inline-icon'
                          : command.tone === 'firewall'
                            ? 'firewall-inline-icon'
                            : 'border-current bg-paper text-foreground',
                      )}
                    >
                      {Icon ? <Icon className="size-4" /> : <span className="font-pixel text-[8px]">J</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-pixel text-[8px] leading-relaxed">
                        {command.title}
                      </span>
                      {command.subtitle ? (
                        <span className="block truncate text-xs leading-relaxed opacity-75">
                          {command.subtitle}
                        </span>
                      ) : null}
                    </span>
                    {command.shortcut ? (
                      <span className="hidden shrink-0 font-pixel text-[7px] leading-none opacity-70 sm:block">
                        {command.shortcut}
                      </span>
                    ) : null}
                  </button>
                )
              })
            ) : (
              <p className="px-2 py-3 font-pixel text-[8px] leading-relaxed text-muted-foreground">
                No matching command.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

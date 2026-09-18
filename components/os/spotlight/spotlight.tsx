'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { WINDOW_APPS, isWindowId } from '@/components/os/apps'
import { JackSearchIcon } from '@/components/os/jack-icons'
import {
  describeSpotlightAction,
  groupSpotlightResults,
  limitGroupedResults,
  querySpotlight,
  type SpotlightAction,
  type SpotlightEntry,
  type SpotlightKind,
  type SpotlightResult,
} from '@/lib/search'
import { cn } from '@/lib/utils'
import { HighlightedText, KindLabel } from './highlight'

const KIND_LABEL: Record<SpotlightKind, string> = {
  app: 'App',
  project: 'Project',
  'case-study': 'Case study',
  'case-study-section': 'Section',
  skill: 'Skill',
  experience: 'Experience',
  education: 'Education',
  credential: 'Credential',
  timeline: 'Timeline',
  'recruiter-section': 'Recruiter',
  link: 'Link',
  system: 'Action',
}

type SpotlightProps = {
  open: boolean
  compact?: boolean
  extraEntries?: readonly SpotlightEntry[]
  disabledIds?: readonly string[]
  onClose: () => void
  onAction: (action: SpotlightAction) => void
}

export function Spotlight({
  open,
  compact = false,
  extraEntries = [],
  disabledIds = [],
  onClose,
  onAction,
}: SpotlightProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const activatedRef = useRef(false)
  const listId = useId()
  const inputId = useId()

  const disabled = useMemo(() => new Set(disabledIds), [disabledIds])
  const search = useMemo(() => querySpotlight(query, extraEntries), [extraEntries, query])
  const visibleResults = useMemo(
    () => (search.grouped ? limitGroupedResults(search.results) : search.results),
    [search],
  )
  const groups = useMemo(
    () => (search.grouped ? groupSpotlightResults(visibleResults) : []),
    [search.grouped, visibleResults],
  )

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIndex(0)
      return
    }

    activatedRef.current = false
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.setTimeout(() => inputRef.current?.focus(), 0)

    return () => {
      window.setTimeout(() => {
        if (activatedRef.current) return
        if (previousFocusRef.current?.isConnected) {
          previousFocusRef.current.focus()
        }
      }, 0)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex((current) =>
      visibleResults.length === 0 ? 0 : Math.min(current, visibleResults.length - 1),
    )
  }, [visibleResults.length])

  if (!open) return null

  const selected = visibleResults[selectedIndex]
  const selectedOptionId = selected ? `${listId}-${selected.id}` : undefined

  const activate = (result: SpotlightResult | undefined) => {
    if (!result || disabled.has(result.id)) return
    activatedRef.current = true
    onClose()
    onAction(result.action)
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
        visibleResults.length === 0 ? 0 : (current + 1) % visibleResults.length,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      setSelectedIndex((current) =>
        visibleResults.length === 0
          ? 0
          : (current - 1 + visibleResults.length) % visibleResults.length,
      )
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      activate(selected)
    }
  }

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  let optionIndex = -1

  return (
    <div
      className={cn(
        'spotlight-overlay fixed inset-0 z-[90] flex justify-center bg-background/20 px-3',
        compact
          ? 'items-stretch pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]'
          : 'items-start pt-14 sm:pt-20',
      )}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight"
        onKeyDown={onDialogKeyDown}
        className={cn(
          'spotlight-window flex min-h-0 w-full max-w-xl flex-col overflow-hidden os-border bg-paper text-foreground os-shadow-lg',
          compact && 'h-full max-h-[min(92dvh,44rem)]',
        )}
      >
        <header className="flex h-8 shrink-0 items-center gap-2 border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
          <JackSearchIcon className="size-3.5 shrink-0" />
          <span className="font-pixel text-[10px] leading-none">Spotlight</span>
          <span aria-hidden className="titlebar-lines h-3 flex-1 opacity-60" />
          <span className="hidden font-pixel text-[7px] leading-none sm:block">⌘K</span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <label htmlFor={inputId} className="sr-only">
            Search JackOS
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={onInputKeyDown}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            inputMode="search"
            placeholder="Find apps, projects, case studies, skills..."
            role="combobox"
            aria-autocomplete="list"
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={selectedOptionId}
            className="min-h-11 w-full shrink-0 os-border bg-card px-3 py-2 font-pixel text-[9px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div
            className="sr-only"
            aria-live="polite"
          >
            {search.query
              ? `${visibleResults.length} JackOS ${visibleResults.length === 1 ? 'result' : 'results'}`
              : `${visibleResults.length} suggested actions`}
          </div>

          <div
            id={listId}
            role="listbox"
            aria-label={search.query ? 'Spotlight results' : 'Suggested JackOS actions'}
            className={cn(
              'mt-3 min-h-0 flex-1 overflow-y-auto os-border bg-secondary p-1',
              compact ? 'max-h-none' : 'max-h-[min(58dvh,22rem)]',
            )}
          >
            {visibleResults.length === 0 ? (
              <div className="px-2 py-3">
                <p className="font-pixel text-[8px] leading-relaxed text-foreground">
                  No JackOS result for “{search.query}”.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Try a project name, skill, app, or a shorter query. Spotlight only searches this system.
                </p>
              </div>
            ) : search.grouped ? (
              groups.map((group) => (
                <section key={group.id} className="mb-1 last:mb-0">
                  <h3 className="px-2 py-1 font-pixel text-[7px] leading-none text-muted-foreground">
                    {group.label}
                  </h3>
                  {group.results.map((result) => {
                    optionIndex += 1
                    const index = optionIndex
                    return (
                      <SpotlightResultRow
                        key={result.id}
                        result={result}
                        query={search.query}
                        selected={index === selectedIndex}
                        disabled={disabled.has(result.id)}
                        optionId={`${listId}-${result.id}`}
                        onHover={() => setSelectedIndex(index)}
                        onActivate={() => activate(result)}
                      />
                    )
                  })}
                </section>
              ))
            ) : (
              <>
                {search.query ? null : (
                  <h3 className="px-2 py-1 font-pixel text-[7px] leading-none text-muted-foreground">
                    Suggested
                  </h3>
                )}
                {visibleResults.map((result, index) => (
                  <SpotlightResultRow
                    key={result.id}
                    result={result}
                    query={search.query}
                    selected={index === selectedIndex}
                    disabled={disabled.has(result.id)}
                    optionId={`${listId}-${result.id}`}
                    onHover={() => setSelectedIndex(index)}
                    onActivate={() => activate(result)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpotlightResultRow({
  result,
  query,
  selected,
  disabled,
  optionId,
  onHover,
  onActivate,
}: {
  result: SpotlightResult
  query: string
  selected: boolean
  disabled: boolean
  optionId: string
  onHover: () => void
  onActivate: () => void
}) {
  const Icon =
    result.iconAppId && isWindowId(result.iconAppId) ? WINDOW_APPS[result.iconAppId].Icon : JackSearchIcon
  const iconVisual =
    result.iconAppId && isWindowId(result.iconAppId)
      ? WINDOW_APPS[result.iconAppId].iconVisual
      : undefined
  const tone =
    result.iconAppId && isWindowId(result.iconAppId) ? WINDOW_APPS[result.iconAppId].tone : undefined

  return (
    <button
      id={optionId}
      type="button"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onMouseEnter={onHover}
      onClick={onActivate}
      aria-label={`${result.title}. ${KIND_LABEL[result.kind]}. ${describeSpotlightAction(result.action)}`}
      className={cn(
        'flex w-full min-h-11 min-w-0 items-center gap-2 px-2 py-2 text-left transition-colors focus-visible:outline-none',
        selected
          ? 'bg-foreground text-primary-foreground'
          : 'text-foreground hover:bg-card focus-visible:bg-card',
        disabled ? 'cursor-default opacity-50' : null,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-7 shrink-0 place-items-center border-2',
          tone === 'recruiter'
            ? 'recruiter-inline-icon'
            : tone === 'firewall'
              ? 'firewall-inline-icon'
              : tone === 'blue-ocean'
                ? 'blue-ocean-inline-icon'
                : tone === 'kickoff'
                  ? 'kickoff-inline-icon'
                  : 'border-current bg-paper text-foreground',
        )}
      >
        <Icon className={iconVisual === 'image' ? 'size-[22px]' : 'size-4'} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-pixel text-[8px] leading-relaxed">
          <HighlightedText text={result.title} query={query} />
        </span>
        <span className="block truncate text-xs leading-relaxed opacity-75">
          <HighlightedText text={result.subtitle} query={query} />
        </span>
      </span>
      <KindLabel>{KIND_LABEL[result.kind]}</KindLabel>
    </button>
  )
}

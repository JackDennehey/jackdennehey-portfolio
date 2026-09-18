'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import {
  JACK_OS_STORAGE_KEYS,
  readLocalStorageItem,
  writeLocalStorageItem,
} from '@/lib/os/storage'
import {
  FILES_ROOT_PATH,
  getFilesCrumbs,
  getFilesInspector,
  getFilesLocationTitle,
  getPrimaryOpenTarget,
  listFilesItems,
  pathsEqual,
  type FilesItem,
  type FilesOpenTarget,
  type FilesPath,
} from '@/lib/os/files'
import {
  JackBadgeIcon,
  JackBlueOceanIcon,
  JackDocumentIcon,
  JackFilesIcon,
  JackFolderIcon,
  JackIdIcon,
  JackKickoffIcon,
  JackProjectsIcon,
  JackSystemIcon,
} from '../jack-icons'

export type FilesViewMode = 'grid' | 'list'

type FilesContentProps = {
  path: FilesPath
  isMobile: boolean
  onNavigate: (path: FilesPath) => void
  onOpenTarget: (target: Exclude<FilesOpenTarget, { type: 'navigate' }>) => void
}

function readStoredView(): FilesViewMode {
  return readLocalStorageItem(JACK_OS_STORAGE_KEYS.filesView) === 'list' ? 'list' : 'grid'
}

function itemIcon(item: FilesItem) {
  if (item.kind === 'directory') return JackFolderIcon
  if (item.kind === 'resume') return JackDocumentIcon
  if (item.kind === 'experience') return JackIdIcon
  if (item.kind === 'education') return JackDocumentIcon
  if (item.kind === 'skill') return JackSystemIcon
  if (item.kind === 'credential') return JackBadgeIcon
  if (item.id === 'kickoff') return JackKickoffIcon
  if (item.id === 'blue-ocean') return JackBlueOceanIcon
  if (item.id === 'jackos') return JackFilesIcon
  return JackProjectsIcon
}

function openLabel(item: FilesItem) {
  if (item.kind === 'directory') return `Open ${item.title} folder`
  if (item.kind === 'resume') return 'Open Resume'
  if (item.kind === 'project') return `Open ${item.title}`
  if (item.kind === 'credential') return `Open ${item.title} in Credentials`
  return `Select ${item.title}`
}

export function FilesContent({ path, isMobile, onNavigate, onOpenTarget }: FilesContentProps) {
  const listId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<FilesViewMode>('grid')
  const [past, setPast] = useState<FilesPath[]>([])
  const [future, setFuture] = useState<FilesPath[]>([])

  const items = useMemo(() => listFilesItems(path), [path])
  const inspector = useMemo(() => getFilesInspector(path), [path])
  const crumbs = useMemo(() => getFilesCrumbs(path), [path])
  const selectedIndex = items.findIndex((item) => item.id === path.selectedId)
  const effectiveView = isMobile ? 'list' : view
  const locationTitle = getFilesLocationTitle(path)

  useEffect(() => {
    setView(readStoredView())
  }, [])

  const persistView = useCallback((next: FilesViewMode) => {
    setView(next)
    writeLocalStorageItem(JACK_OS_STORAGE_KEYS.filesView, next)
  }, [])

  const goTo = useCallback(
    (next: FilesPath) => {
      if (pathsEqual(next, path)) return
      setPast((current) => [...current, path])
      setFuture([])
      onNavigate(next)
    },
    [onNavigate, path],
  )

  const goBack = useCallback(() => {
    const previous = past[past.length - 1]
    if (!previous) return
    setPast((current) => current.slice(0, -1))
    setFuture((current) => [path, ...current])
    onNavigate(previous)
  }, [onNavigate, past, path])

  const goForward = useCallback(() => {
    const next = future[0]
    if (!next) return
    setFuture((current) => current.slice(1))
    setPast((current) => [...current, path])
    onNavigate(next)
  }, [future, onNavigate, path])

  const selectItem = useCallback(
    (id: string | null) => {
      onNavigate({ folder: path.folder, selectedId: id })
    },
    [onNavigate, path.folder],
  )

  const openItem = useCallback(
    (item: FilesItem) => {
      const target = getPrimaryOpenTarget({ folder: path.folder, selectedId: item.id })
      if (target?.type === 'navigate') {
        goTo(target.path)
        return
      }
      if (target) {
        selectItem(item.id)
        onOpenTarget(target)
        return
      }
      selectItem(item.id)
    },
    [goTo, onOpenTarget, path.folder, selectItem],
  )

  const moveSelection = useCallback(
    (delta: number) => {
      if (items.length === 0) return
      const current = selectedIndex < 0 ? (delta > 0 ? -1 : items.length) : selectedIndex
      const nextIndex = Math.min(items.length - 1, Math.max(0, current + delta))
      const next = items[nextIndex]
      if (next) selectItem(next.id)
    },
    [items, selectItem, selectedIndex],
  )

  const onListKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const columns = effectiveView === 'grid' ? (isMobile ? 1 : 3) : 1
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveSelection(columns)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveSelection(-columns)
      } else if (event.key === 'ArrowRight' && effectiveView === 'grid') {
        event.preventDefault()
        moveSelection(1)
      } else if (event.key === 'ArrowLeft' && effectiveView === 'grid') {
        event.preventDefault()
        moveSelection(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        if (items[0]) selectItem(items[0].id)
      } else if (event.key === 'End') {
        event.preventDefault()
        const last = items[items.length - 1]
        if (last) selectItem(last.id)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const selected = items[selectedIndex]
        if (selected) openItem(selected)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        selectItem(null)
      } else if (event.key === 'Backspace' && !path.selectedId && path.folder !== 'root') {
        event.preventDefault()
        goTo(FILES_ROOT_PATH)
      }
    },
    [effectiveView, goTo, isMobile, items, moveSelection, openItem, path.folder, path.selectedId, selectItem, selectedIndex],
  )

  return (
    <div className="jackos-files" data-layout={isMobile ? 'mobile' : 'desktop'}>
      <div className="jackos-files-toolbar">
        <div className="jackos-files-history">
          <button type="button" className="jackos-files-tool" onClick={goBack} disabled={past.length === 0}>
            Back
          </button>
          {!isMobile ? (
            <button
              type="button"
              className="jackos-files-tool"
              onClick={goForward}
              disabled={future.length === 0}
            >
              Forward
            </button>
          ) : null}
        </div>
        <nav aria-label="Files location" className="jackos-files-crumbs">
          <ol>
            {crumbs.map((crumb, index) => {
              const current = index === crumbs.length - 1
              return (
                <li key={`${crumb.path.folder}-${crumb.path.selectedId ?? 'folder'}-${crumb.label}`}>
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {current ? (
                    <span aria-current="location">{crumb.label}</span>
                  ) : (
                    <button type="button" onClick={() => goTo(crumb.path)}>
                      {crumb.label}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        {!isMobile ? (
          <div className="jackos-files-views" role="group" aria-label="Files view">
            <button
              type="button"
              className="jackos-files-tool"
              aria-pressed={view === 'grid'}
              onClick={() => persistView('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className="jackos-files-tool"
              aria-pressed={view === 'list'}
              onClick={() => persistView('list')}
            >
              List
            </button>
          </div>
        ) : null}
      </div>

      <div className="jackos-files-body">
        <div
          ref={listRef}
          id={listId}
          className={cn('jackos-files-listing', effectiveView === 'grid' ? 'is-grid' : 'is-list')}
          role="listbox"
          tabIndex={0}
          aria-label={locationTitle}
          aria-activedescendant={path.selectedId ? `${listId}-${path.selectedId}` : undefined}
          onKeyDown={onListKeyDown}
        >
          {items.map((item) => {
            const Icon = itemIcon(item)
            const selected = item.id === path.selectedId
            return (
              <div
                key={item.id}
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={selected}
                aria-label={openLabel(item)}
                className={cn('jackos-files-item', selected && 'is-selected')}
                onClick={() => {
                  if (isMobile) {
                    openItem(item)
                    return
                  }
                  selectItem(item.id)
                }}
                onDoubleClick={() => {
                  if (!isMobile) openItem(item)
                }}
              >
                <span className="jackos-files-item-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="jackos-files-item-copy">
                  <span className="jackos-files-item-title">
                    {item.title}
                    {item.featured ? <span className="jackos-files-flag">Featured</span> : null}
                  </span>
                  <span className="jackos-files-item-meta">{isMobile || effectiveView === 'list' ? `${item.subtitle} · ${item.meta}` : item.meta}</span>
                </span>
              </div>
            )
          })}
        </div>

        {inspector ? (
          <aside className="jackos-files-inspector" aria-label="Selection details">
            <p className="jackos-files-kicker">{inspector.kindLabel}</p>
            <h2>{inspector.title}</h2>
            {inspector.subtitle ? <p className="jackos-files-subtitle">{inspector.subtitle}</p> : null}
            <dl>
              {inspector.meta.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
            {inspector.summary ? <p className="jackos-files-summary">{inspector.summary}</p> : null}
            {inspector.tags && inspector.tags.length > 0 ? (
              <ul className="jackos-files-tags" aria-label="Related details">
                {inspector.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            {inspector.actions.length > 0 ? (
              <div className="jackos-files-inspector-actions">
                {inspector.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="jackos-files-tool is-primary"
                    onClick={() => {
                      if (action.target.type === 'navigate') {
                        goTo(action.target.path)
                        return
                      }
                      onOpenTarget(action.target)
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {path.selectedId ? `${items[selectedIndex]?.title ?? 'Item'} selected in ${locationTitle}.` : `${locationTitle}.`}
      </p>
    </div>
  )
}

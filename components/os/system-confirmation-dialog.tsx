'use client'

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'

type SystemConfirmationDialogProps = {
  title: string
  message: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function SystemConfirmationDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: SystemConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    window.setTimeout(() => firstButtonRef.current?.focus(), 0)

    return () => {
      window.setTimeout(() => {
        if (previousFocusRef.current?.isConnected) {
          previousFocusRef.current.focus()
        }
      }, 0)
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
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
      className="fixed inset-0 z-[96] flex items-center justify-center bg-background/35 px-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={onKeyDown}
        className="w-full max-w-lg overflow-hidden os-border bg-paper text-foreground os-shadow-lg"
      >
        <header className="flex h-9 items-center gap-2 border-b-2 border-border bg-titlebar px-2.5 text-titlebar-foreground">
          <span className="font-pixel text-[11px] leading-none">{title}</span>
          <span aria-hidden className="titlebar-lines h-3 flex-1 opacity-60" />
        </header>
        <div className="space-y-5 p-5">
          <div className="text-base leading-7 text-muted-foreground text-pretty">
            {message}
          </div>
          <div className="flex flex-wrap justify-end gap-2.5">
            <button
              ref={firstButtonRef}
              type="button"
              onClick={onCancel}
              className="os-border bg-card px-4 py-2.5 font-pixel text-[9px] font-semibold leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="os-border bg-foreground px-4 py-2.5 font-pixel text-[9px] font-semibold leading-relaxed text-primary-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:outline-none"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

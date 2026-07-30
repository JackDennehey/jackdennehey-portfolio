'use client'

import { useId, useMemo, useState, type FormEvent } from 'react'
import {
  SECRET_DEFINITIONS,
  findSecretByCode,
  type SecretDefinition,
  type SecretId,
} from '@/lib/secrets'
import { cn } from '@/lib/utils'
import { JackSecretsIcon } from '../jack-icons'
import type { SecretUnlockResult } from '../use-secret-unlocks'

type SecretResult =
  | { kind: 'idle' }
  | { kind: 'success'; secret: SecretDefinition }
  | { kind: 'already'; secret: SecretDefinition }
  | { kind: 'invalid' }

type SecretsContentProps = {
  unlockedIds: readonly SecretId[]
  onUnlockSecret: (id: SecretId) => SecretUnlockResult
  onOpenWallpapers: () => void
  onResetUnlocks: () => void
}

export function SecretsContent({
  unlockedIds,
  onUnlockSecret,
  onOpenWallpapers,
  onResetUnlocks,
}: SecretsContentProps) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<SecretResult>({ kind: 'idle' })
  const [confirmReset, setConfirmReset] = useState(false)
  const inputId = useId()
  const resultId = useId()
  const recoveredCount = unlockedIds.length

  const statusText = useMemo(() => {
    if (result.kind === 'success') {
      return `Secret Unlocked. ${result.secret.wallpaperTitle}. ${result.secret.successMessage}`
    }
    if (result.kind === 'already') {
      return `Already Unlocked. ${result.secret.wallpaperTitle} is already available in Wallpapers.`
    }
    if (result.kind === 'invalid') {
      return 'No matching file found. Check the code and try again.'
    }
    return `${recoveredCount} of ${SECRET_DEFINITIONS.length} files recovered.`
  }, [recoveredCount, result])

  const submitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setConfirmReset(false)

    const secret = findSecretByCode(code)
    if (!secret) {
      setResult({ kind: 'invalid' })
      return
    }

    const unlockResult = onUnlockSecret(secret.id)
    if (unlockResult === 'already') {
      setResult({ kind: 'already', secret })
      return
    }

    setCode('')
    setResult({ kind: 'success', secret })
  }

  const resetUnlocks = () => {
    onResetUnlocks()
    setConfirmReset(false)
    setResult({ kind: 'idle' })
    setCode('')
  }

  return (
    <div className="space-y-5">
      <section className="os-border bg-secondary p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="os-border grid size-10 shrink-0 place-items-center bg-paper text-foreground"
          >
            <JackSecretsIcon className="size-6" />
          </span>
          <div className="min-w-0 space-y-2">
            <h2 className="font-pixel text-base leading-relaxed text-foreground">
              Secrets
            </h2>
            <p className="text-sm leading-relaxed text-foreground text-pretty">
              Some parts of Jack OS are not listed in the manual.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Enter a code to search the system for hidden files.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
            {'// local file search'}
          </h3>
          <p
            className="font-pixel text-[8px] leading-relaxed text-muted-foreground"
            aria-live="polite"
          >
            {recoveredCount} of {SECRET_DEFINITIONS.length} files recovered
          </p>
        </div>

        <form onSubmit={submitCode} className="os-border bg-card p-3">
          <label
            htmlFor={inputId}
            className="block font-pixel text-[9px] leading-relaxed text-foreground"
          >
            Search Code
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={inputId}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-describedby={resultId}
              autoComplete="off"
              spellCheck={false}
              inputMode="text"
              className="min-w-0 flex-1 os-border bg-paper px-3 py-2 font-pixel text-[9px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="os-border bg-card px-4 py-2 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
            >
              Search
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Codes are not case-sensitive. Spaces matter less than you think.
          </p>
        </form>

        <div
          id={resultId}
          aria-live="polite"
          aria-atomic="true"
          className="min-h-0"
        >
          <p className="sr-only">{statusText}</p>
          <SecretResultPanel result={result} onOpenWallpapers={onOpenWallpapers} />
        </div>
      </section>

      <section className="os-border space-y-3 bg-secondary p-3">
        <h3 className="font-pixel text-[10px] leading-relaxed text-foreground">
          Advanced
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Hidden wallpapers are presented as non-downloadable Jack OS exclusives.
        </p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Reset Secret Unlocks
          </button>
        ) : (
          <div className="os-border space-y-3 bg-paper p-3">
            <p className="text-sm leading-relaxed text-foreground">
              Remove the four local unlock records? Theme, sound, CRT, and normal wallpaper
              preferences will stay as they are.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetUnlocks}
                className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function SecretResultPanel({
  result,
  onOpenWallpapers,
}: {
  result: SecretResult
  onOpenWallpapers: () => void
}) {
  if (result.kind === 'idle') return null

  if (result.kind === 'invalid') {
    return (
      <div className="animate-credential-reveal os-border bg-secondary p-3">
        <p className="font-pixel text-[10px] leading-relaxed text-foreground">
          No matching file found.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Check the code and try again.
        </p>
      </div>
    )
  }

  const isSuccess = result.kind === 'success'

  return (
    <div
      className={cn(
        'animate-credential-reveal os-border bg-secondary p-3',
        isSuccess ? 'outline outline-2 outline-offset-[-6px] outline-current' : null,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="os-border grid size-9 shrink-0 place-items-center bg-paper text-foreground"
        >
          <JackSecretsIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-pixel text-[10px] leading-relaxed text-foreground">
            {isSuccess ? 'Secret Unlocked' : 'Already Unlocked'}
          </p>
          <p className="font-pixel text-[9px] leading-relaxed text-foreground">
            {result.secret.wallpaperTitle}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isSuccess
              ? result.secret.successMessage
              : 'This file is already available in Wallpapers.'}
          </p>
          <button
            type="button"
            onClick={onOpenWallpapers}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Open Wallpapers
          </button>
        </div>
      </div>
    </div>
  )
}

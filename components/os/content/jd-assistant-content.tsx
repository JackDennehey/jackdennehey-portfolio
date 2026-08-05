'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ExternalLink } from 'lucide-react'
import type { WindowId } from '../apps'
import {
  answerPortfolioQuestion,
  JD_ASSISTANT_INTRO,
  JD_SUGGESTED_PROMPTS,
  type AssistantAction,
  type AssistantIntent,
} from '@/lib/jd-assistant'
import { cn } from '@/lib/utils'

type Message = {
  id: number
  role: 'assistant' | 'visitor'
  content: string
  actions?: AssistantAction[]
}

type SeedPrompt = {
  question: string
  nonce: number
} | null

type Props = {
  seedPrompt: SeedPrompt
  onOpen: (id: WindowId) => void
  onCopyEmail: () => void
  onQuestionAnswered: () => void
}

export function JdAssistantContent({
  seedPrompt,
  onOpen,
  onCopyEmail,
  onQuestionAnswered,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      role: 'assistant',
      content: JD_ASSISTANT_INTRO,
      actions: [{ type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' }],
    },
  ])
  const [input, setInput] = useState('')
  const [inputNotice, setInputNotice] = useState('')
  const [lastIntent, setLastIntent] = useState<AssistantIntent | null>(null)
  const nextId = useRef(2)
  const submittingRef = useRef(false)
  const lastSeedNonce = useRef<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const logRef = useRef<HTMLDivElement | null>(null)

  const addExchange = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) {
      setInputNotice('Type a question for J.D. first.')
      window.setTimeout(() => inputRef.current?.focus(), 0)
      return
    }
    if (submittingRef.current) return

    submittingRef.current = true
    const response = answerPortfolioQuestion(trimmed, { lastIntent })
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: 'visitor', content: trimmed },
      {
        id: nextId.current++,
        role: 'assistant',
        content: response.content,
        actions: response.actions,
      },
    ])
    setLastIntent(response.intent)
    setInput('')
    setInputNotice('')
    onQuestionAnswered()
    window.setTimeout(() => {
      submittingRef.current = false
    }, 0)
  }

  useEffect(() => {
    if (!seedPrompt || seedPrompt.nonce === lastSeedNonce.current) return
    lastSeedNonce.current = seedPrompt.nonce
    addExchange(seedPrompt.question)
  }, [seedPrompt])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [messages])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    addExchange(input)
  }

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    addExchange(input)
  }

  const clearMessages = () => {
    nextId.current = 2
    setLastIntent(null)
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: JD_ASSISTANT_INTRO,
        actions: [{ type: 'open', label: 'Open Recruiter Mode', target: 'recruiter' }],
      },
    ])
    setInput('')
    setInputNotice('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[900px] flex-col gap-3">
      <section className="os-border bg-secondary p-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="os-border grid size-12 shrink-0 place-items-center overflow-hidden bg-card"
          >
            <img
              src="/images/jd/jd-bot.png"
              alt=""
              loading="eager"
              decoding="async"
              className="h-full w-full object-contain pixelated"
            />
          </span>
          <div className="min-w-0">
            <h3 className="font-pixel text-[11px] leading-relaxed text-foreground">
              Local Portfolio Assistant
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              Ask about Jack&apos;s education, credentials, projects, 1984 Blue Ocean, skills,
              or professional direction.
            </p>
          </div>
        </div>
      </section>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="J.D. conversation"
        className="os-border min-h-[230px] flex-1 space-y-4 overflow-y-auto bg-card p-3"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={cn(
              'max-w-[92%] space-y-2',
              message.role === 'visitor' ? 'ml-auto text-right' : 'mr-auto text-left',
            )}
          >
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {message.role === 'visitor' ? 'You' : 'J.D.'}
            </p>
            <div
              className={cn(
                'os-border p-3 text-sm leading-6 text-pretty',
                message.role === 'visitor'
                  ? 'bg-foreground text-primary-foreground'
                  : 'bg-paper text-foreground',
              )}
            >
              {message.content}
            </div>
            {message.actions ? (
              <div className="flex flex-wrap gap-2">
                {message.actions.map((action) => (
                  <AssistantActionButton
                    key={`${message.id}-${action.label}`}
                    action={action}
                    onOpen={onOpen}
                    onCopyEmail={onCopyEmail}
                  />
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <section aria-label="Suggested questions" className="flex flex-wrap gap-2">
        {JD_SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => addExchange(prompt)}
            className="os-border bg-card px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            {prompt}
          </button>
        ))}
      </section>

      <form onSubmit={submit} className="space-y-2">
        <label
          htmlFor="jd-assistant-input"
          className="block font-pixel text-[8px] leading-relaxed text-muted-foreground"
        >
          Ask J.D. about Jack&apos;s portfolio
        </label>
        <textarea
          ref={inputRef}
          id="jd-assistant-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onInputKeyDown}
          rows={3}
          spellCheck={false}
          placeholder="Ask about projects, Blue Ocean, credentials, or contact..."
          className="w-full resize-none os-border bg-card px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {inputNotice ? (
          <p role="status" className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
            {inputNotice}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={clearMessages}
            className="os-border bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Clear Conversation
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="os-border bg-foreground px-3 py-2 font-pixel text-[8px] leading-relaxed text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
          >
            Ask J.D.
          </button>
        </div>
      </form>
    </div>
  )
}

function AssistantActionButton({
  action,
  onOpen,
  onCopyEmail,
}: {
  action: AssistantAction
  onOpen: (id: WindowId) => void
  onCopyEmail: () => void
}) {
  if (action.type === 'external') {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="os-border inline-flex items-center gap-1.5 bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        <span>{action.label}</span>
        <ExternalLink aria-hidden className="size-3" />
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (action.type === 'copy-email') {
          onCopyEmail()
          return
        }
        onOpen(action.target)
      }}
      className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
    >
      {action.label}
    </button>
  )
}

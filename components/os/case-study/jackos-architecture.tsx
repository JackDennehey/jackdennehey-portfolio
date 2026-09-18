import { JACKOS_ARCHITECTURE } from '@/lib/portfolio/case-studies/architecture'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function JackOsArchitectureMap() {
  const [activeId, setActiveId] = useState('registry')
  const active =
    JACKOS_ARCHITECTURE.nodes.find((node) => node.id === activeId) ??
    JACKOS_ARCHITECTURE.nodes[0] ?? {
      id: 'registry',
      label: 'App registry',
      detail: JACKOS_ARCHITECTURE.textEquivalent,
    }

  return (
    <div className="jackos-architecture">
      <p className="sr-only">{JACKOS_ARCHITECTURE.textEquivalent}</p>
      <div className="grid gap-3 @min-[640px]:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <ol className="grid gap-1.5" aria-label={JACKOS_ARCHITECTURE.caption}>
          {JACKOS_ARCHITECTURE.nodes.map((node, index) => {
            const selected = node.id === active?.id
            return (
              <li key={node.id} className="min-w-0">
                {index > 0 ? (
                  <p className="px-1 py-0.5 font-pixel text-[8px] text-muted-foreground" aria-hidden>
                    ↓
                  </p>
                ) : null}
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveId(node.id)}
                  className={cn(
                    'os-border w-full min-h-11 px-3 py-2 text-left font-pixel text-[8px] leading-relaxed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'bg-foreground text-primary-foreground'
                      : 'bg-card text-foreground hover:bg-secondary',
                  )}
                >
                  {node.label}
                </button>
              </li>
            )
          })}
        </ol>
        {active ? (
          <div className="os-border bg-card p-4" aria-live="polite">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">Selected layer</p>
            <h4 className="mt-2 text-sm font-semibold text-foreground">{active.label}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {active.detail}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

import { POCKET_PIER_COPY } from '@/lib/pocket-pier'

export function PocketPierLoop() {
  return (
    <ol className="pocket-pier-loop grid gap-2 @min-[520px]:grid-cols-2" aria-label="Pocket Pier gameplay loop">
      {POCKET_PIER_COPY.gameplayLoop.map((step, index) => (
        <li key={step} className="os-border min-w-0 bg-card p-3">
          <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground text-pretty">{step}</p>
        </li>
      ))}
    </ol>
  )
}

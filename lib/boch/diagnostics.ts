/** Privacy-conscious PUBLIC diagnostics. No visitor text. No private memory. */

export type BochDiagnosticEvent = {
  at: number
  provider: string
  backend: string
  category: string
  latencyMs: number
  recordIds: string[]
  sourceKind: string
  currentUsed: boolean
  actionsProposed: number
  actionsValidated: number
  error: string | null
}

const MAX = 24
const events: BochDiagnosticEvent[] = []

export function recordBochDiagnostic(event: BochDiagnosticEvent) {
  events.push(event)
  while (events.length > MAX) events.shift()
  console.info(
    JSON.stringify({
      boch: true,
      provider: event.provider,
      backend: event.backend,
      category: event.category,
      latencyMs: event.latencyMs,
      recordIds: event.recordIds,
      sourceKind: event.sourceKind,
      currentUsed: event.currentUsed,
      actionsValidated: event.actionsValidated,
      error: event.error,
    }),
  )
}

export function listBochDiagnostics() {
  return events.slice(-MAX)
}

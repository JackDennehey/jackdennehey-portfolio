'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type FirewallPresetId =
  | 'normal'
  | 'port-scan'
  | 'brute-force'
  | 'suspicious-dns'
  | 'web-burst'

type FirewallAction = 'Allowed' | 'Blocked' | 'Inspected'

type FirewallEvent = {
  id: number
  protocol: string
  source: string
  destination: string
  port: number
  action: FirewallAction
  rule: string
  latency: number
  timestamp: string
}

type PacketVisual = FirewallEvent & {
  lane: number
}

type FirewallRuleId = 'blockAdminPorts' | 'inspectDns'

type FirewallRules = Record<FirewallRuleId, boolean>

type FirewallPreset = {
  id: FirewallPresetId
  label: string
  description: string
  completionEvents: number
  protocols: string[]
  ports: number[]
}

const FIREWALL_PRESETS: readonly FirewallPreset[] = [
  {
    id: 'normal',
    label: 'Normal Traffic',
    description: 'Balanced web and DNS requests moving through ordinary rules.',
    completionEvents: 28,
    protocols: ['HTTPS', 'DNS', 'NTP', 'SSH'],
    ports: [443, 53, 123, 22],
  },
  {
    id: 'port-scan',
    label: 'Port Scan',
    description: 'A burst of probes checks several services and trips defensive rules.',
    completionEvents: 34,
    protocols: ['TCP', 'TCP', 'TCP', 'UDP'],
    ports: [22, 23, 3389, 445, 8080, 8443],
  },
  {
    id: 'brute-force',
    label: 'Brute Force Attempt',
    description: 'Repeated sign-in attempts target administrative services.',
    completionEvents: 32,
    protocols: ['SSH', 'RDP', 'HTTPS'],
    ports: [22, 3389, 443],
  },
  {
    id: 'suspicious-dns',
    label: 'Suspicious DNS Activity',
    description: 'DNS requests are inspected when they arrive in unusual bursts.',
    completionEvents: 30,
    protocols: ['DNS', 'DNS', 'HTTPS'],
    ports: [53, 853, 443],
  },
  {
    id: 'web-burst',
    label: 'Web Request Burst',
    description: 'Many web requests arrive quickly but most remain legitimate.',
    completionEvents: 36,
    protocols: ['HTTPS', 'HTTP', 'DNS'],
    ports: [443, 80, 53],
  },
] as const

const INITIAL_RULES: FirewallRules = {
  blockAdminPorts: true,
  inspectDns: true,
}
const MAX_EVENTS = 120
const MAX_PACKETS = 24

export function NetworkFirewallContent({
  active,
  onAchievement,
}: {
  active: boolean
  onAchievement: (id: 'firewall-first-run') => void
}) {
  const [presetId, setPresetId] = useState<FirewallPresetId>('normal')
  const [rules, setRules] = useState<FirewallRules>(INITIAL_RULES)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [events, setEvents] = useState<FirewallEvent[]>([])
  const [packets, setPackets] = useState<PacketVisual[]>([])
  const [selectedPacketId, setSelectedPacketId] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const nextPacketId = useRef(1)
  const startedFromBeginning = useRef(false)
  const completionSent = useRef(false)
  const preset = FIREWALL_PRESETS.find((item) => item.id === presetId) ?? FIREWALL_PRESETS[0]

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setRunning(false)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const selectedPacket = useMemo(
    () => events.find((event) => event.id === selectedPacketId) ?? events[0] ?? null,
    [events, selectedPacketId],
  )

  const counters = useMemo(
    () => ({
      allowed: events.filter((event) => event.action === 'Allowed').length,
      blocked: events.filter((event) => event.action === 'Blocked').length,
      inspected: events.filter((event) => event.action === 'Inspected').length,
    }),
    [events],
  )

  const generatePacket = useCallback(() => {
    const id = nextPacketId.current++
    const protocol = preset.protocols[id % preset.protocols.length]
    const port = preset.ports[(id + preset.ports.length) % preset.ports.length]
    const source = id % 5 === 0 ? 'DMZ' : id % 2 === 0 ? 'EXTERNAL' : 'INTERNAL'
    const destination =
      port === 53 || port === 853
        ? 'DNS SERVICE'
        : port === 443 || port === 80
          ? 'WEB SERVICE'
          : 'ADMIN SERVICE'

    let action: FirewallAction = 'Allowed'
    let rule = 'default allow'
    if (rules.blockAdminPorts && [22, 23, 3389, 445].includes(port)) {
      action = 'Blocked'
      rule = 'block admin ports'
    } else if (rules.inspectDns && (protocol === 'DNS' || port === 53 || port === 853)) {
      action = preset.id === 'suspicious-dns' && id % 3 === 0 ? 'Blocked' : 'Inspected'
      rule = action === 'Blocked' ? 'dns burst guard' : 'inspect dns'
    } else if (preset.id === 'web-burst' && id % 8 === 0) {
      action = 'Inspected'
      rule = 'web burst review'
    }

    const event: FirewallEvent = {
      id,
      protocol,
      source,
      destination,
      port,
      action,
      rule,
      latency: 8 + ((id * 7) % 42),
      timestamp: `+${Math.max(1, events.length + 1)}s`,
    }
    setEvents((current) => [event, ...current].slice(0, MAX_EVENTS))
    setPackets((current) => [{ ...event, lane: id % 4 }, ...current].slice(0, MAX_PACKETS))
    setSelectedPacketId(event.id)
  }, [events.length, preset, rules])

  useEffect(() => {
    if (!active || !running || reducedMotion || document.hidden) return

    const interval = window.setInterval(() => {
      generatePacket()
    }, Math.max(220, 900 / speed))

    return () => window.clearInterval(interval)
  }, [active, generatePacket, reducedMotion, running, speed])

  useEffect(() => {
    if (!running || !startedFromBeginning.current || completionSent.current) return
    if (events.length < preset.completionEvents) return

    completionSent.current = true
    setRunning(false)
    onAchievement('firewall-first-run')
  }, [events.length, onAchievement, preset.completionEvents, running])

  useEffect(() => {
    if (!active) {
      setRunning(false)
    }
  }, [active])

  const start = () => {
    if (events.length === 0) {
      startedFromBeginning.current = true
      completionSent.current = false
    }
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setEvents([])
    setPackets([])
    setSelectedPacketId(null)
    nextPacketId.current = 1
    startedFromBeginning.current = false
    completionSent.current = false
  }

  const changePreset = (value: FirewallPresetId) => {
    setPresetId(value)
    reset()
  }

  const toggleRule = (rule: FirewallRuleId) => {
    setRules((current) => ({ ...current, [rule]: !current[rule] }))
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1280px] flex-col gap-4">
      <header className="os-border bg-secondary p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              Jack OS Network Firewall
            </p>
            <h3 className="mt-1 font-pixel text-[13px] leading-relaxed text-foreground">
              Packet Visualizer
            </h3>
          </div>
          <span className="os-border bg-foreground px-2 py-1 font-pixel text-[8px] leading-none text-primary-foreground">
            SIMULATION
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          This visualization uses locally generated sample traffic. It does not inspect visitor
          devices or display real IP addresses.
        </p>
      </header>

      <section className="grid gap-3 lg:grid-cols-[230px_minmax(0,1fr)_260px]">
        <aside className="space-y-3">
          <div className="os-border bg-card p-3">
            <label
              htmlFor="firewall-preset"
              className="block font-pixel text-[8px] leading-relaxed text-foreground"
            >
              Traffic Preset
            </label>
            <select
              id="firewall-preset"
              value={presetId}
              onChange={(event) => changePreset(event.target.value as FirewallPresetId)}
              className="mt-2 w-full os-border bg-paper px-2 py-2 font-pixel text-[8px] leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {FIREWALL_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {preset.description}
            </p>
          </div>

          <div className="os-border space-y-2 bg-card p-3">
            <p className="font-pixel text-[8px] leading-relaxed text-foreground">
              Sample Rules
            </p>
            <RuleToggle
              checked={rules.blockAdminPorts}
              label="Block admin ports"
              onChange={() => toggleRule('blockAdminPorts')}
            />
            <RuleToggle
              checked={rules.inspectDns}
              label="Inspect DNS bursts"
              onChange={() => toggleRule('inspectDns')}
            />
          </div>

          <div className="os-border space-y-2 bg-card p-3">
            <p className="font-pixel text-[8px] leading-relaxed text-foreground">
              Controls
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={start}
                disabled={running || reducedMotion}
                className="os-border bg-card px-2 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
              >
                Start
              </button>
              <button
                type="button"
                onClick={pause}
                disabled={!running}
                className="os-border bg-card px-2 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={reset}
                className="os-border bg-card px-2 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={generatePacket}
                className="os-border bg-card px-2 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              >
                Sample
              </button>
            </div>
            {reducedMotion ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Reduced motion is on. Use Sample to step through traffic.
              </p>
            ) : null}
            <label className="block text-xs leading-relaxed text-muted-foreground">
              Speed {speed.toFixed(1)}x
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.5"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
                className="mt-2 w-full accent-foreground"
              />
            </label>
          </div>
        </aside>

        <section className="os-border min-h-[330px] overflow-hidden bg-secondary p-3">
          <div className="grid grid-cols-3 gap-3 text-center font-pixel text-[8px] leading-relaxed text-foreground">
            <span className="os-border bg-card p-2">SOURCE</span>
            <span className="os-border bg-card p-2">FIREWALL</span>
            <span className="os-border bg-card p-2">DESTINATION</span>
          </div>
          <div className="firewall-stage relative mt-3 h-52 overflow-hidden border-2 border-border bg-paper">
            <div className="absolute left-[18%] top-4 h-[calc(100%-2rem)] border-l-2 border-dashed border-border" />
            <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] border-l-2 border-border" />
            <div className="absolute right-[18%] top-4 h-[calc(100%-2rem)] border-l-2 border-dashed border-border" />
            {packets.map((packet) => (
              <button
                key={packet.id}
                type="button"
                onClick={() => setSelectedPacketId(packet.id)}
                className={cn(
                  'firewall-packet os-border absolute size-8 bg-card font-pixel text-[6px] leading-none text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  packet.action === 'Blocked' ? 'firewall-packet-blocked' : null,
                  packet.action === 'Inspected' ? 'firewall-packet-inspected' : null,
                )}
                style={{ top: `${22 + packet.lane * 36}px` }}
                aria-label={`Inspect packet ${packet.id}, ${packet.action}`}
              >
                {packet.protocol.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Counter label="Allowed" value={counters.allowed} />
            <Counter label="Inspected" value={counters.inspected} />
            <Counter label="Blocked" value={counters.blocked} />
          </div>
        </section>

        <aside className="space-y-3">
          <section className="os-border bg-card p-3">
            <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
              Packet Inspector
            </h4>
            {selectedPacket ? (
              <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs leading-relaxed text-muted-foreground">
                <dt>ID</dt>
                <dd className="text-foreground">#{selectedPacket.id}</dd>
                <dt>Protocol</dt>
                <dd className="text-foreground">{selectedPacket.protocol}</dd>
                <dt>Path</dt>
                <dd className="text-foreground">
                  {selectedPacket.source} to {selectedPacket.destination}
                </dd>
                <dt>Port</dt>
                <dd className="text-foreground">{selectedPacket.port}</dd>
                <dt>Action</dt>
                <dd className="text-foreground">{selectedPacket.action}</dd>
                <dt>Rule</dt>
                <dd className="text-foreground">{selectedPacket.rule}</dd>
                <dt>Latency</dt>
                <dd className="text-foreground">{selectedPacket.latency}ms</dd>
              </dl>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Start the simulation or process a sample packet.
              </p>
            )}
          </section>

          <section className="os-border bg-card p-3">
            <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
              Help
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
              A firewall evaluates sample traffic against ordered rules. Allowed packets continue,
              blocked packets stop, and inspected packets receive extra review. Ports identify
              services, protocols describe how data travels, and rule priority decides which action
              wins first.
            </p>
          </section>
        </aside>
      </section>

      <section className="os-border bg-card p-3" aria-labelledby="firewall-log-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 id="firewall-log-heading" className="font-pixel text-[9px] leading-relaxed">
            Event Log
          </h4>
          <button
            type="button"
            onClick={() => setEvents([])}
            className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Clear Log
          </button>
        </div>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full min-w-[620px] text-left text-xs leading-relaxed">
            <thead className="font-pixel text-[7px] text-muted-foreground">
              <tr>
                <th className="border-b-2 border-border py-1 pr-2">Time</th>
                <th className="border-b-2 border-border py-1 pr-2">Protocol</th>
                <th className="border-b-2 border-border py-1 pr-2">Service</th>
                <th className="border-b-2 border-border py-1 pr-2">Port</th>
                <th className="border-b-2 border-border py-1 pr-2">Action</th>
                <th className="border-b-2 border-border py-1 pr-2">Rule</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td className="border-b border-border/40 py-1 pr-2">{event.timestamp}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.protocol}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.destination}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.port}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.action}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.rule}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-3 text-muted-foreground">
                    No sample traffic processed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function RuleToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs leading-relaxed text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-foreground"
      />
      <span>{label}</span>
    </label>
  )
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="os-border bg-card p-2 text-center">
      <p className="font-pixel text-[7px] leading-relaxed text-muted-foreground">{label}</p>
      <p className="font-pixel text-[14px] leading-relaxed text-foreground">{value}</p>
    </div>
  )
}

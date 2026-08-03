'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  FIREWALL_PRESET_COMPLETIONS_STORAGE_KEY,
  parseStoredIds,
  type JackOsAchievementId,
} from '@/lib/achievements'
import { cn } from '@/lib/utils'

type FirewallPresetId =
  | 'normal'
  | 'port-scan'
  | 'brute-force'
  | 'suspicious-dns'
  | 'web-burst'
  | 'remote-access'
  | 'data-sync'

type FirewallAction = 'Allowed' | 'Blocked' | 'Inspected'
type FirewallRisk = 'low' | 'medium' | 'high'

type FirewallEvent = {
  id: number
  presetId: FirewallPresetId
  protocol: string
  source: string
  destination: string
  service: string
  port: number
  action: FirewallAction
  rule: string
  latency: number
  timestamp: string
  explanation: string
  risk: FirewallRisk
}

type PacketVisual = FirewallEvent & {
  lane: number
  duration: number
}

type FirewallRuleId = 'blockAdminPorts' | 'inspectDns' | 'reviewBursts'

type FirewallRules = Record<FirewallRuleId, boolean>

type FirewallPreset = {
  id: FirewallPresetId
  label: string
  description: string
  completionEvents: number
  protocols: string[]
  ports: number[]
}

type PacketStyle = CSSProperties & {
  '--packet-duration': string
}

const FIREWALL_PRESETS: readonly FirewallPreset[] = [
  {
    id: 'normal',
    label: 'Normal Traffic',
    description: 'Balanced web, DNS, and time-sync requests moving through ordinary rules.',
    completionEvents: 28,
    protocols: ['HTTPS', 'DNS', 'NTP', 'HTTPS'],
    ports: [443, 53, 123, 443],
  },
  {
    id: 'port-scan',
    label: 'Port Scan',
    description: 'A burst of probes checks several services and trips defensive rules.',
    completionEvents: 34,
    protocols: ['TCP', 'TCP', 'UDP', 'TCP'],
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
    description: 'DNS requests receive extra review when they arrive in unusual bursts.',
    completionEvents: 30,
    protocols: ['DNS', 'DNS', 'DoT', 'HTTPS'],
    ports: [53, 53, 853, 443],
  },
  {
    id: 'web-burst',
    label: 'Web Request Burst',
    description: 'Many web requests arrive quickly but most remain legitimate.',
    completionEvents: 36,
    protocols: ['HTTPS', 'HTTP', 'DNS'],
    ports: [443, 80, 53],
  },
  {
    id: 'remote-access',
    label: 'Remote Access Review',
    description: 'Remote management attempts are checked before they reach internal services.',
    completionEvents: 32,
    protocols: ['SSH', 'RDP', 'TCP', 'HTTPS'],
    ports: [22, 3389, 5900, 443],
  },
  {
    id: 'data-sync',
    label: 'Data Sync Window',
    description: 'Scheduled cloud sync traffic mixes trusted requests with reviewable bursts.',
    completionEvents: 30,
    protocols: ['TLS', 'HTTPS', 'NTP', 'DNS'],
    ports: [443, 8443, 123, 53],
  },
] as const

const FIREWALL_PRESET_IDS = FIREWALL_PRESETS.map((preset) => preset.id)
const INITIAL_RULES: FirewallRules = {
  blockAdminPorts: true,
  inspectDns: true,
  reviewBursts: true,
}
const MAX_EVENTS = 120
const MAX_PACKETS = 28
const ADMIN_PORTS = [22, 23, 3389, 445, 5900]

const RULE_DETAILS: Record<FirewallRuleId, { label: string; description: string }> = {
  blockAdminPorts: {
    label: 'Block admin ports',
    description: 'Stops traffic aimed at remote login and management services.',
  },
  inspectDns: {
    label: 'Inspect DNS bursts',
    description: 'Reviews name-lookup traffic and blocks suspicious repeated bursts.',
  },
  reviewBursts: {
    label: 'Review traffic bursts',
    description: 'Adds extra review when many similar requests arrive at once.',
  },
}

const BEGINNER_GUIDE_TOPICS: readonly { title: string; body: string }[] = [
  {
    title: 'What is a packet?',
    body: 'A packet is a small piece of network data. Bigger messages are split into packets, sent across a network, then reassembled by the receiving system.',
  },
  {
    title: 'What is a firewall?',
    body: 'A firewall is a checkpoint. It compares traffic against rules and decides whether each packet should continue, stop, or receive extra review.',
  },
  {
    title: 'Stateful vs stateless firewalls',
    body: 'A stateless firewall checks each packet by itself. A stateful firewall also remembers recent connections, which helps it understand whether traffic belongs to an expected conversation.',
  },
  {
    title: 'Ports',
    body: 'Ports identify the kind of service traffic is trying to reach. For example, web traffic often uses port 443, while remote administration commonly uses ports such as 22 or 3389.',
  },
  {
    title: 'Protocols',
    body: 'Protocols are communication rules. TCP, UDP, DNS, HTTP, and HTTPS all describe different ways systems exchange information.',
  },
  {
    title: 'TCP vs UDP',
    body: 'TCP checks that data arrives in order and can retry missing pieces. UDP is faster and simpler, but it does not provide the same delivery guarantees.',
  },
  {
    title: 'DNS',
    body: 'DNS turns names into addresses. Because nearly every web visit uses DNS, unusual DNS patterns can be useful signals for firewall review.',
  },
  {
    title: 'HTTP and HTTPS',
    body: 'HTTP and HTTPS are web protocols. HTTPS adds encryption, which protects the contents of the connection while still allowing a firewall to reason about ports and patterns.',
  },
  {
    title: 'Why packets get blocked',
    body: 'Packets are blocked when they match a deny rule, target a risky service, arrive in suspicious patterns, or violate the policy the firewall is enforcing.',
  },
  {
    title: 'Firewall rules',
    body: 'Rules are ordered checks. A rule might block an admin port, inspect DNS bursts, or allow ordinary web traffic through.',
  },
  {
    title: 'Allow lists and deny lists',
    body: 'An allow list names what is trusted. A deny list names what should be stopped. Real systems often use both, depending on the risk and environment.',
  },
  {
    title: 'Why logging matters',
    body: 'Logs explain what happened. They help people spot patterns, investigate blocked traffic, and tune rules without guessing.',
  },
  {
    title: 'Home router vs enterprise firewall',
    body: 'A home router usually offers basic filtering. Enterprise firewalls can include deeper rules, logging, segmentation, identity controls, and stronger monitoring.',
  },
  {
    title: 'Common misconception',
    body: 'A firewall is not magic protection by itself. It is one security layer, and it works best alongside updates, good authentication, monitoring, and safe configuration.',
  },
]

function readCompletedPresets() {
  if (typeof window === 'undefined') return []

  try {
    return parseStoredIds(
      window.localStorage.getItem(FIREWALL_PRESET_COMPLETIONS_STORAGE_KEY),
      FIREWALL_PRESET_IDS,
    )
  } catch {
    return []
  }
}

function writeCompletedPresets(ids: readonly FirewallPresetId[]) {
  try {
    window.localStorage.setItem(FIREWALL_PRESET_COMPLETIONS_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Completion progress is local polish; simulation controls should never depend on storage.
  }
}

function getService(port: number) {
  const services: Record<number, { service: string; destination: string }> = {
    22: { service: 'SSH', destination: 'ADMIN SERVICE' },
    23: { service: 'Telnet', destination: 'LEGACY ADMIN' },
    53: { service: 'DNS', destination: 'DNS SERVICE' },
    80: { service: 'HTTP', destination: 'WEB SERVICE' },
    123: { service: 'NTP', destination: 'TIME SERVICE' },
    443: { service: 'HTTPS', destination: 'WEB SERVICE' },
    445: { service: 'SMB', destination: 'FILE SERVICE' },
    853: { service: 'DNS over TLS', destination: 'DNS SERVICE' },
    3389: { service: 'RDP', destination: 'ADMIN SERVICE' },
    5900: { service: 'VNC', destination: 'ADMIN SERVICE' },
    8080: { service: 'Proxy', destination: 'WEB SERVICE' },
    8443: { service: 'Cloud Sync', destination: 'CLOUD SERVICE' },
  }

  return services[port] ?? { service: `Port ${port}`, destination: 'APP SERVICE' }
}

function getPacketSource(id: number, presetId: FirewallPresetId) {
  const sources =
    presetId === 'normal' || presetId === 'data-sync'
      ? ['INTERNAL', 'EXTERNAL', 'DMZ', 'INTERNAL']
      : ['EXTERNAL', 'EXTERNAL', 'DMZ', 'EXTERNAL', 'INTERNAL']

  return sources[id % sources.length]
}

function getPacketExplanation({
  action,
  rule,
  service,
  presetId,
}: {
  action: FirewallAction
  rule: string
  service: string
  presetId: FirewallPresetId
}) {
  if (rule === RULE_DETAILS.blockAdminPorts.label) {
    return 'Blocked because the firewall rule blocks administrative ports.'
  }

  if (rule === RULE_DETAILS.inspectDns.label && action === 'Blocked') {
    return 'Blocked because repeated DNS activity matched the suspicious burst rule.'
  }

  if (rule === RULE_DETAILS.inspectDns.label) {
    return 'Inspected because DNS traffic can reveal where a device is trying to connect.'
  }

  if (rule === RULE_DETAILS.reviewBursts.label) {
    return 'Inspected because the preset is generating a burst of similar requests.'
  }

  if (presetId === 'port-scan' && action === 'Inspected') {
    return 'Inspected because repeated probes can indicate service discovery.'
  }

  return `Allowed because ${service} traffic did not match a blocking rule.`
}

function getPacketRisk(action: FirewallAction, rule: string): FirewallRisk {
  if (action === 'Blocked') return 'high'
  if (action === 'Inspected' || rule === RULE_DETAILS.reviewBursts.label) return 'medium'
  return 'low'
}

function formatEventTime() {
  return new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function NetworkFirewallContent({
  active,
  onAchievement,
}: {
  active: boolean
  onAchievement: (id: JackOsAchievementId) => void
}) {
  const [presetId, setPresetId] = useState<FirewallPresetId>('normal')
  const [rules, setRules] = useState<FirewallRules>(INITIAL_RULES)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [events, setEvents] = useState<FirewallEvent[]>([])
  const [packets, setPackets] = useState<PacketVisual[]>([])
  const [selectedPacketId, setSelectedPacketId] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [completedPresetIds, setCompletedPresetIds] = useState<FirewallPresetId[]>([])
  const nextPacketId = useRef(1)
  const startedFromBeginning = useRef(false)
  const completionSent = useRef(false)
  const preset = useMemo(
    () => FIREWALL_PRESETS.find((item) => item.id === presetId) ?? FIREWALL_PRESETS[0],
    [presetId],
  )

  useEffect(() => {
    setCompletedPresetIds(readCompletedPresets())
  }, [])

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
      processed: events.length,
      allowed: events.filter((event) => event.action === 'Allowed').length,
      blocked: events.filter((event) => event.action === 'Blocked').length,
      inspected: events.filter((event) => event.action === 'Inspected').length,
    }),
    [events],
  )

  const completionProgress = Math.min(100, Math.round((events.length / preset.completionEvents) * 100))
  const certified = FIREWALL_PRESET_IDS.every((id) => completedPresetIds.includes(id))
  const simulationStatus = running
    ? 'Simulation Active'
    : events.length >= preset.completionEvents
      ? 'Preset Complete'
      : 'Simulation Paused'

  const recordPresetCompletion = useCallback(
    (completedPresetId: FirewallPresetId) => {
      setCompletedPresetIds((current) => {
        if (current.includes(completedPresetId)) {
          return current
        }

        const next = [...current, completedPresetId]
        writeCompletedPresets(next)

        if (FIREWALL_PRESET_IDS.every((id) => next.includes(id))) {
          onAchievement('firewall-certified')
        }

        return next
      })
    },
    [onAchievement],
  )

  const generatePacket = useCallback(() => {
    const id = nextPacketId.current
    nextPacketId.current += 1

    const protocol = preset.protocols[id % preset.protocols.length]
    const port = preset.ports[(id * 3 + preset.ports.length) % preset.ports.length]
    const source = getPacketSource(id, preset.id)
    const { service, destination } = getService(port)

    let action: FirewallAction = 'Allowed'
    let rule = 'Default allow'

    if (rules.blockAdminPorts && ADMIN_PORTS.includes(port)) {
      action = 'Blocked'
      rule = RULE_DETAILS.blockAdminPorts.label
    } else if (rules.inspectDns && (protocol === 'DNS' || protocol === 'DoT' || port === 53 || port === 853)) {
      action = preset.id === 'suspicious-dns' && id % 3 === 0 ? 'Blocked' : 'Inspected'
      rule = RULE_DETAILS.inspectDns.label
    } else if (
      rules.reviewBursts &&
      (preset.id === 'web-burst' || preset.id === 'data-sync') &&
      id % 5 === 0
    ) {
      action = 'Inspected'
      rule = RULE_DETAILS.reviewBursts.label
    } else if (preset.id === 'port-scan' && id % 4 === 0) {
      action = 'Inspected'
      rule = 'Scan pattern review'
    }

    const latencyBase = action === 'Blocked' ? 6 : action === 'Inspected' ? 18 : 9
    const explanation = getPacketExplanation({ action, rule, service, presetId: preset.id })
    const event: FirewallEvent = {
      id,
      presetId: preset.id,
      protocol,
      source,
      destination,
      service,
      port,
      action,
      rule,
      latency: latencyBase + ((id * 7) % 38),
      timestamp: formatEventTime(),
      explanation,
      risk: getPacketRisk(action, rule),
    }

    setEvents((current) => [event, ...current].slice(0, MAX_EVENTS))
    setPackets((current) =>
      [
        {
          ...event,
          lane: id % 5,
          duration: action === 'Blocked' ? 1350 : action === 'Inspected' ? 1850 : 2150,
        },
        ...current,
      ].slice(0, MAX_PACKETS),
    )
    setSelectedPacketId(event.id)
  }, [preset, rules])

  useEffect(() => {
    if (!active || !running || reducedMotion || document.hidden) return

    const interval = window.setInterval(() => {
      generatePacket()
    }, Math.max(180, 780 / speed))

    return () => window.clearInterval(interval)
  }, [active, generatePacket, reducedMotion, running, speed])

  useEffect(() => {
    if (!running || !startedFromBeginning.current || completionSent.current) return
    if (events.length < preset.completionEvents) return

    completionSent.current = true
    setRunning(false)
    onAchievement('firewall-first-run')
    recordPresetCompletion(preset.id)
  }, [
    events.length,
    onAchievement,
    preset.completionEvents,
    preset.id,
    recordPresetCompletion,
    running,
  ])

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
          <div className="flex flex-wrap gap-2">
            {certified ? (
              <span className="firewall-certified-badge os-border bg-card px-2 py-1 font-pixel text-[8px] leading-none">
                Firewall Certified
              </span>
            ) : null}
            <span className="os-border bg-foreground px-2 py-1 font-pixel text-[8px] leading-none text-primary-foreground">
              SIMULATION
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          This visualization uses locally generated sample traffic. It does not inspect visitor
          devices, read real network activity, or display real IP addresses.
        </p>
      </header>

      <details className="os-border bg-card p-3">
        <summary className="cursor-pointer font-pixel text-[9px] leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Beginner Guide
        </summary>
        <div className="mt-3 grid gap-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
          {BEGINNER_GUIDE_TOPICS.map((topic) => (
            <GuideNote key={topic.title} title={topic.title}>
              {topic.body}
            </GuideNote>
          ))}
        </div>
      </details>

      <section className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
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
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2 font-pixel text-[7px] leading-relaxed text-muted-foreground">
                <span>Preset Run</span>
                <span>{completionProgress}%</span>
              </div>
              <div className="mt-1 h-3 os-border bg-secondary p-0.5">
                <div
                  className="h-full bg-foreground transition-[width] duration-150"
                  style={{ width: `${completionProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Completed presets: {completedPresetIds.length}/{FIREWALL_PRESETS.length}
              </p>
            </div>
          </div>

          <div className="os-border space-y-3 bg-card p-3">
            <p className="font-pixel text-[8px] leading-relaxed text-foreground">
              Sample Rules
            </p>
            {(Object.keys(RULE_DETAILS) as FirewallRuleId[]).map((ruleId) => (
              <RuleToggle
                key={ruleId}
                checked={rules[ruleId]}
                label={RULE_DETAILS[ruleId].label}
                description={RULE_DETAILS[ruleId].description}
                onChange={() => toggleRule(ruleId)}
              />
            ))}
          </div>

          <div className="os-border space-y-2 bg-card p-3">
            <p className="font-pixel text-[8px] leading-relaxed text-foreground">
              Controls
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ControlButton onClick={start} disabled={running || reducedMotion}>
                Start
              </ControlButton>
              <ControlButton onClick={pause} disabled={!running}>
                Pause
              </ControlButton>
              <ControlButton onClick={reset}>Reset</ControlButton>
              <ControlButton onClick={generatePacket}>Sample</ControlButton>
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

        <section className="os-border min-h-[360px] overflow-hidden bg-secondary p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-pixel text-[8px] leading-relaxed text-muted-foreground">
              {simulationStatus}
            </p>
            <span
              className={cn(
                'os-border px-2 py-1 font-pixel text-[7px] leading-none',
                running ? 'bg-foreground text-primary-foreground' : 'bg-card text-foreground',
              )}
            >
              {preset.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center font-pixel text-[8px] leading-relaxed text-foreground">
            <span className="os-border bg-card p-2">SOURCE</span>
            <span className="firewall-zone-center os-border bg-card p-2">FIREWALL</span>
            <span className="os-border bg-card p-2">DESTINATION</span>
          </div>
          <div className="firewall-stage relative mt-3 h-56 overflow-hidden border-2 border-border bg-paper">
            <div className="absolute left-[18%] top-4 h-[calc(100%-2rem)] border-l-2 border-dashed border-border" />
            <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] border-l-2 border-border" />
            <div className="absolute right-[18%] top-4 h-[calc(100%-2rem)] border-l-2 border-dashed border-border" />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[74%] w-10 -translate-x-1/2 -translate-y-1/2 border-2 border-border bg-card/60"
            />
            {packets.map((packet) => {
              const packetStyle: PacketStyle = {
                top: `${18 + packet.lane * 38}px`,
                '--packet-duration': `${packet.duration}ms`,
              }

              return (
                <button
                  key={packet.id}
                  type="button"
                  onClick={() => setSelectedPacketId(packet.id)}
                  data-protocol={packet.protocol.toLowerCase()}
                  data-action={packet.action.toLowerCase()}
                  className={cn(
                    'firewall-packet os-border absolute size-8 bg-card font-pixel text-[6px] leading-none text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selectedPacketId === packet.id ? 'firewall-packet-selected' : null,
                    packet.action === 'Blocked' ? 'firewall-packet-blocked' : null,
                    packet.action === 'Inspected' ? 'firewall-packet-inspected' : null,
                  )}
                  style={packetStyle}
                  aria-label={`Inspect packet ${packet.id}, ${packet.protocol}, ${packet.action}`}
                >
                  {packet.protocol.slice(0, 3).toUpperCase()}
                </button>
              )
            })}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <Counter label="Processed" value={counters.processed} />
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
              <div className="mt-2 space-y-3">
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs leading-relaxed text-muted-foreground">
                  <dt>Protocol</dt>
                  <dd className="text-foreground">{selectedPacket.protocol}</dd>
                  <dt>Service</dt>
                  <dd className="text-foreground">
                    {selectedPacket.service} / port {selectedPacket.port}
                  </dd>
                  <dt>Destination</dt>
                  <dd className="text-foreground">{selectedPacket.destination}</dd>
                  <dt>Rule</dt>
                  <dd className="text-foreground">{selectedPacket.rule}</dd>
                  <dt>Action</dt>
                  <dd className="text-foreground">{selectedPacket.action}</dd>
                  <dt>Latency</dt>
                  <dd className="text-foreground">{selectedPacket.latency}ms</dd>
                </dl>
                <p className="os-border bg-secondary p-2 text-xs leading-relaxed text-foreground text-pretty">
                  {selectedPacket.explanation}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Start the simulation or process a sample packet.
              </p>
            )}
          </section>

          <section className="os-border bg-card p-3">
            <h4 className="font-pixel text-[9px] leading-relaxed text-foreground">
              Preset Status
            </h4>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {FIREWALL_PRESETS.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      'mt-1.5 size-2 shrink-0 border border-current',
                      completedPresetIds.includes(item.id) ? 'bg-foreground' : 'bg-transparent',
                    )}
                  />
                  <span className={item.id === preset.id ? 'text-foreground' : undefined}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
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
            onClick={() => {
              setEvents([])
              setSelectedPacketId(null)
            }}
            className="os-border bg-card px-2 py-1 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Clear Log
          </button>
        </div>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full min-w-[720px] text-left text-xs leading-relaxed">
            <thead className="font-pixel text-[7px] text-muted-foreground">
              <tr>
                <th className="border-b-2 border-border py-1 pr-2">Time</th>
                <th className="border-b-2 border-border py-1 pr-2">Protocol</th>
                <th className="border-b-2 border-border py-1 pr-2">Service</th>
                <th className="border-b-2 border-border py-1 pr-2">Destination</th>
                <th className="border-b-2 border-border py-1 pr-2">Action</th>
                <th className="border-b-2 border-border py-1 pr-2">Rule</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr
                    key={event.id}
                    data-risk={event.risk}
                    className={cn(
                      'transition-colors hover:bg-secondary',
                      selectedPacketId === event.id ? 'bg-secondary' : null,
                    )}
                  >
                    <td className="border-b border-border/40 py-1 pr-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPacketId(event.id)}
                        className="text-left underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {event.timestamp}
                      </button>
                    </td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.protocol}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.service}</td>
                    <td className="border-b border-border/40 py-1 pr-2">{event.destination}</td>
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

function GuideNote({ title, children }: { title: string; children: string }) {
  return (
    <details className="min-w-0 os-border bg-secondary p-2">
      <summary className="cursor-pointer break-words font-pixel text-[8px] leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {title}
      </summary>
      <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground text-pretty">
        {children}
      </p>
    </details>
  )
}

function RuleToggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean
  label: string
  description: string
  onChange: () => void
}) {
  return (
    <label
      className={cn(
        'block min-w-0 os-border p-2 text-xs leading-relaxed text-muted-foreground transition-colors',
        checked ? 'bg-secondary text-foreground' : 'bg-card',
      )}
    >
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-4 accent-foreground"
        />
        <span className="font-medium text-foreground">{label}</span>
      </span>
      <span className="mt-1 block break-words pl-6">{description}</span>
    </label>
  )
}

function ControlButton({
  children,
  onClick,
  disabled = false,
}: {
  children: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="os-border bg-card px-2 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none disabled:cursor-default disabled:bg-secondary disabled:text-muted-foreground"
    >
      {children}
    </button>
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

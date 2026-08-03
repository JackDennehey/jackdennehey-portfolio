'use client'

import { useState } from 'react'
import type { WindowId } from '../apps'
import { cn } from '@/lib/utils'

type AboutArea = {
  id: string
  title: string
  lead: string
  listHeading: string
  items: string[]
  context: string
  action?: {
    label: string
    target: WindowId
  }
}

const ABOUT_AREAS: AboutArea[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    lead:
      'Cybersecurity is where my formal technology education began. It taught me to think about systems not only in terms of what they can do, but how they can fail, how they can be protected, and how people interact with risk.',
    listHeading: 'Areas of Foundation',
    items: [
      'Security principles and risk awareness',
      'Network and system security concepts',
      'Threat-focused problem solving',
      'Responsible technology use',
      'Connecting technical weaknesses to organizational impact',
    ],
    context:
      "I earned a Cyber Security Certificate of Competency with Honors from Delaware County Community College in May 2026. I'm continuing to build on that foundation through networking, cloud, and practical project work.",
    action: {
      label: 'View Credentials',
      target: 'certifications',
    },
  },
  {
    id: 'networking',
    title: 'Networking',
    lead:
      'Networking gives me a clearer picture of how devices, services, and users actually connect. Understanding that movement of data makes cybersecurity and cloud concepts feel concrete rather than isolated.',
    listHeading: 'Areas of Interest',
    items: [
      'IP addressing and subnet foundations',
      'Network devices and endpoints',
      'Common protocols',
      'Data flow and connectivity',
      'Introductory troubleshooting',
      'The relationship between networking and security',
    ],
    context:
      "Cisco Networking Basics provided my initial structured networking foundation. I'm continuing to strengthen it because networking supports nearly every technical direction I'm interested in.",
    action: {
      label: 'View Cisco Credential',
      target: 'certifications',
    },
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing',
    lead:
      "Cloud computing connects technical infrastructure with the way modern organizations operate. I'm interested in both sides: how cloud services are structured and how businesses decide when and why to use them.",
    listHeading: 'Areas Being Developed',
    items: [
      'Cloud-service models',
      'Shared responsibility',
      'Identity, access, and security concepts',
      'Core platform services',
      'Cost and operational considerations',
      'The role of cloud infrastructure in business systems',
    ],
    context:
      'My cloud path currently includes Azure AI study, with AWS Cloud Practitioner planned as a later milestone. The goal is not to collect platform names; it is to understand the concepts that transfer between them.',
    action: {
      label: 'View Credentials',
      target: 'certifications',
    },
  },
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    lead:
      "I'm interested in artificial intelligence as both a technical capability and a business tool. The important question is not only what a model can generate, but whether the result is accurate, responsible, and useful.",
    listHeading: 'Current Areas of Study',
    items: [
      'Generative AI',
      'Machine-learning concepts',
      'Computer vision',
      'Natural-language processing',
      'Speech and content understanding',
      'AI agents and tools',
      'Responsible AI',
      'Azure-based AI services',
    ],
    context:
      "I'm currently preparing for Microsoft Azure AI Fundamentals. Studying AI has helped me understand the systems behind tools I already use and think more critically about where they fit into real workflows.",
    action: {
      label: 'View Credentials',
      target: 'certifications',
    },
  },
  {
    id: 'business',
    title: 'Business',
    lead:
      'Business is the framework that helps me connect technology to people, decisions, and outcomes. A technically impressive solution still has to address a real need, fit its organization, and communicate its value clearly.',
    listHeading: 'Areas of Interest',
    items: [
      'Technology strategy',
      'Project planning',
      'Operations',
      'Decision-making',
      'Communication',
      'Leadership and teamwork',
      'Connecting technical capabilities to business needs',
    ],
    context:
      "At Penn State Brandywine, I'm building a broader business foundation while continuing to develop my technical interests. That combination reflects the direction I want my career to take: understanding both how technology works and why an organization should use it.",
    action: {
      label: 'View Projects',
      target: 'projects',
    },
  },
  {
    id: 'continuous-learning',
    title: 'Continuous Learning',
    lead:
      'Technology changes too quickly for learning to stop at a certificate or course. I treat each credential and project as a checkpoint rather than a finish line.',
    listHeading: 'How I Learn',
    items: [
      'Structured coursework',
      'Certification study',
      'Building projects',
      'Testing and revising ideas',
      'Documenting progress',
      'Learning from mistakes',
      'Connecting new concepts to existing knowledge',
    ],
    context:
      'Jack OS is an example of that process. It began as a portfolio concept and has grown through repeated design, accessibility, audio, state-management, and content improvements. Each phase gives me a more complete understanding of how a real project evolves.',
    action: {
      label: 'View Projects',
      target: 'projects',
    },
  },
]

export function AboutContent({ onOpen }: { onOpen: (id: WindowId) => void }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const toggleArea = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-5">
      <section>
        <h3 className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'// currently'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">
          I&apos;m currently studying{' '}
          <strong className="font-semibold">Business at Penn State Brandywine</strong>, building on
          a cybersecurity education and a growing foundation in networking, cloud computing, and
          artificial intelligence. I&apos;m most interested in the point where technology stops being
          theoretical and starts solving real problems.
        </p>
        <button
          type="button"
          onClick={() => onOpen('recruiter')}
          className="os-border mt-3 bg-card px-3 py-2 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          Open Recruiter Mode
        </button>
      </section>

      <section>
        <h3 className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
          {'// areas'}
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ABOUT_AREAS.map((area) => (
            <AboutAreaCard
              key={area.id}
              area={area}
              expanded={expandedIds.has(area.id)}
              onToggle={() => toggleArea(area.id)}
              onOpen={onOpen}
            />
          ))}
        </div>
      </section>

      <section className="os-border bg-card p-4">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          I&apos;m building a path that connects business judgment with technical understanding.
          Whether I&apos;m studying network behavior, exploring cloud and AI platforms, or developing
          a project like Jack OS, I learn best by turning ideas into something functional,
          testable, and useful.
        </p>
      </section>
    </div>
  )
}

function AboutAreaCard({
  area,
  expanded,
  onToggle,
  onOpen,
}: {
  area: AboutArea
  expanded: boolean
  onToggle: () => void
  onOpen: (id: WindowId) => void
}) {
  const panelId = `about-area-${area.id}`
  const action = area.action

  return (
    <article className="os-border min-w-0 bg-card p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="group flex w-full min-w-0 items-center justify-between gap-3 text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="font-pixel text-[9px] text-muted-foreground">
            {'>'}
          </span>
          <span className="min-w-0 font-pixel text-[9px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
            {area.title}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            'os-border grid size-6 shrink-0 place-items-center bg-secondary font-pixel text-[11px] leading-none transition-transform group-hover:bg-foreground group-hover:text-primary-foreground',
            expanded ? 'rotate-45' : null,
          )}
        >
          +
        </span>
      </button>

      {expanded ? (
        <div
          id={panelId}
          className="animate-credential-reveal mt-3 space-y-3 border-t-2 border-border pt-3"
        >
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            {area.lead}
          </p>

          <section className="space-y-1.5">
            <h4 className="font-pixel text-[8px] leading-relaxed text-foreground">
              {area.listHeading}
            </h4>
            <ul className="space-y-1 text-sm leading-relaxed text-muted-foreground">
              {area.items.map((item) => (
                <li key={item} className="flex min-w-0 gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-current" />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-pixel text-[8px] leading-relaxed text-foreground">
              Personal Context
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {area.context}
            </p>
          </section>

          {action ? (
            <button
              type="button"
              onClick={() => onOpen(action.target)}
              className="os-border bg-background px-2.5 py-1.5 font-pixel text-[8px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
              aria-label={`${action.label} from ${area.title}`}
            >
              {action.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

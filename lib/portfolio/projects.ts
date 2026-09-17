import { BLUE_OCEAN_COPY } from '../blue-ocean'
import { KICKOFF_COPY, KICKOFF_URL } from '../kickoff'
import { POCKET_PIER_APP_STORE_URL, POCKET_PIER_COPY } from '../pocket-pier'
import { PROFILE } from './profile'
import type { Project } from './types'

const SITE_URL = `https://${PROFILE.contact.domain}`

export const PROJECTS: readonly Project[] = [
  {
    id: 'kickoff',
    name: KICKOFF_COPY.title,
    shortDescription: KICKOFF_COPY.shortDescription,
    longDescription: `${KICKOFF_COPY.intro} ${KICKOFF_COPY.overview}`,
    status: 'live',
    statusLabel: KICKOFF_COPY.status,
    category: 'product',
    technologies: KICKOFF_COPY.technologies,
    platform: 'Web',
    role: KICKOFF_COPY.role,
    dates: {
      label: 'August 2026',
      start: '2026-08',
    },
    links: [
      {
        label: 'Launch Kickoff',
        href: KICKOFF_URL,
        kind: 'website',
      },
    ],
    media: {
      thumbnail: {
        src: KICKOFF_COPY.screenshots[0].src,
        alt: KICKOFF_COPY.screenshots[0].alt,
      },
      gallery: KICKOFF_COPY.screenshots.map((screenshot) => ({
        src: screenshot.src,
        alt: screenshot.alt,
      })),
    },
    highlights: [
      KICKOFF_COPY.liveProduct,
      KICKOFF_COPY.model,
      KICKOFF_COPY.ask,
    ],
    challenges: [...KICKOFF_COPY.limitations],
    outcomes: [
      `Evaluated on ${KICKOFF_COPY.evaluation.sample} at ${KICKOFF_COPY.evaluation.accuracy} straight-up accuracy.`,
      `Entering-record baseline reached ${KICKOFF_COPY.evaluation.baseline} on the same sample.`,
      KICKOFF_COPY.modelHonesty,
    ],
    metrics: KICKOFF_COPY.metrics,
    featured: true,
    featuredOrder: 1,
    featuredLabel: 'Flagship Project',
    spotlight: true,
    whyExists:
      'Kickoff explores the intersection of predictive modeling, historical sports data, and AI-powered research as a public product rather than a notebook.',
    result: `${KICKOFF_COPY.modelVersion} was evaluated on ${KICKOFF_COPY.evaluation.sample} at ${KICKOFF_COPY.evaluation.accuracy} straight-up accuracy.`,
    caseStudyAvailable: true,
    internalApp: 'kickoff',
    internalActionLabel: 'Open Kickoff',
    keySystems: [
      'walk-forward prediction model',
      'historical NFL research data',
      'Ask Kickoff structured research',
      'model evaluation dashboard',
      'production deployment controls',
    ],
  },
  {
    id: 'pocket-pier',
    name: POCKET_PIER_COPY.title,
    shortDescription: POCKET_PIER_COPY.shortDescription,
    longDescription: `${POCKET_PIER_COPY.whatItIs} ${POCKET_PIER_COPY.whatWasBuilt}`,
    status: 'live',
    statusLabel: POCKET_PIER_COPY.status,
    category: 'game',
    technologies: [
      'Godot',
      'GDScript',
      'iOS',
      'Game Development',
      'Product Development',
      'Pixel Art',
    ],
    platform: POCKET_PIER_COPY.platform,
    role: POCKET_PIER_COPY.role,
    dates: {
      label: 'Current',
    },
    links: [
      {
        label: 'View on App Store',
        href: POCKET_PIER_APP_STORE_URL,
        kind: 'app-store',
      },
    ],
    media: {
      thumbnail: {
        src: POCKET_PIER_COPY.assets.icon.src,
        alt: POCKET_PIER_COPY.assets.icon.alt,
      },
      gallery: POCKET_PIER_COPY.assets.screenshots.map((screenshot) => ({
        src: screenshot.src,
        alt: screenshot.alt,
      })),
    },
    highlights: [...POCKET_PIER_COPY.developmentHighlights],
    outcomes: [POCKET_PIER_COPY.whyItMatters],
    featured: true,
    featuredOrder: 2,
    featuredLabel: 'App Store',
    whyExists: POCKET_PIER_COPY.whyItMatters,
    result: POCKET_PIER_COPY.status,
    caseStudyAvailable: true,
    implementation:
      'Designed and built as a mobile-first Godot project with GDScript gameplay systems, pixel-art asset integration, iOS packaging, and a public App Store release.',
    keySystems: [
      'fishing and selling loop',
      'progression and economy systems',
      'worker automation',
      'boats and harbor expansion',
      'mobile UI and touch-first flow',
      'iOS build and distribution workflow',
    ],
    internalApp: 'pocket-pier',
    internalActionLabel: 'Open Pocket Pier',
  },
  {
    id: 'jackos',
    name: 'JackOS',
    alsoKnownAs: ['Jack OS', 'Portfolio Website'],
    shortDescription:
      'This operating-system-inspired portfolio, designed and built from scratch as a modern interpretation of classic monochrome computing.',
    longDescription:
      'JackOS is an interactive desktop portfolio that presents professional work through windows, a dock, a mobile shell, Recruiter Mode, and first-class project apps rather than a static landing page.',
    status: 'live',
    statusLabel: 'Live',
    category: 'platform',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    platform: 'Web',
    role: 'Designer and developer',
    dates: {
      label: 'July 2026',
      start: '2026-07',
    },
    links: [
      {
        label: 'Visit JackOS',
        href: SITE_URL,
        kind: 'website',
      },
      {
        label: 'GitHub',
        href: PROFILE.contact.github,
        kind: 'github',
      },
    ],
    highlights: [
      'window management',
      'desktop and mobile shells',
      'Recruiter Mode',
      'Network Firewall simulation',
      '1984 Blue Ocean keynote',
      'Kickoff and Pocket Pier product apps',
    ],
    featured: true,
    featuredOrder: 3,
    featuredLabel: 'This Platform',
    whyExists:
      'JackOS exists so visitors can understand the work through a usable system instead of a conventional brochure site.',
    result:
      'A public interactive portfolio with desktop windows, a purpose-built mobile shell, and first-class project applications.',
    caseStudyAvailable: true,
    keySystems: [
      'window management',
      'personalization',
      'wallpapers',
      'themes',
      'sound management',
      'Secrets',
      'Spotlight',
      'Timeline',
      'Road Map',
      'Achievements',
      'Simple Mode',
      'moderated Guestbook',
      'Network Firewall simulation',
      '1984 Blue Ocean keynote',
      'responsive behavior',
      'accessibility',
      'persistence',
    ],
    internalApp: 'portfolio',
    internalActionLabel: 'Open Portfolio',
  },
  {
    id: 'blue-ocean',
    name: BLUE_OCEAN_COPY.title,
    shortDescription: BLUE_OCEAN_COPY.shortDescription,
    longDescription: BLUE_OCEAN_COPY.longDescription,
    status: 'live',
    statusLabel: 'Interactive Keynote',
    category: 'keynote',
    technologies: [
      'JackOS',
      'React',
      'TypeScript',
      'Presentation Engine',
      'AI-assisted workflow',
    ],
    platform: 'JackOS',
    role:
      'Jack directed the product vision, narrative, visual identity, requirements, priorities, testing, critique, and iteration.',
    links: [
      {
        label: 'Open 1984 Blue Ocean',
        href: `${SITE_URL}/#1984-blue-ocean`,
        kind: 'demo',
      },
    ],
    highlights: [...BLUE_OCEAN_COPY.themes],
    featured: true,
    featuredOrder: 4,
    featuredLabel: 'Featured Experience',
    whyExists: BLUE_OCEAN_COPY.recruiterSummary,
    result: 'A 31-stage interactive keynote inside JackOS.',
    caseStudyAvailable: true,
    implementation:
      "Built as a 31-stage interactive keynote inside Jack OS, with Codex and AI-assisted development tools handling much of the direct implementation code under Jack's direction.",
    keySystems: [
      'centralized ordered step registry',
      'keyboard-driven presentation controller',
      'full-screen presentation mode',
      'chapter divider pacing',
      'session resume',
      'reduced-motion support',
    ],
    internalApp: 'blue-ocean',
    internalActionLabel: 'Launch Keynote',
  },
  {
    id: 'azure-ai-projects',
    name: 'Azure AI Projects',
    shortDescription:
      'A collection of experiments using Microsoft Azure AI services — exploring document intelligence, language understanding, and applied machine learning.',
    status: 'in-progress',
    statusLabel: 'In progress',
    category: 'study',
    technologies: ['Azure', 'Python', 'Cognitive Services'],
    links: [
      {
        label: 'GitHub',
        href: PROFILE.contact.github,
        kind: 'github',
      },
    ],
    caseStudyAvailable: false,
  },
  {
    id: 'networking-labs',
    name: 'Networking Labs',
    shortDescription:
      'Hands-on labs configuring routers, switches, subnets, and secure topologies while studying for Cisco networking fundamentals.',
    status: 'ongoing',
    statusLabel: 'Ongoing',
    category: 'lab',
    technologies: ['Cisco', 'Packet Tracer', 'TCP/IP', 'Subnetting'],
    caseStudyAvailable: false,
  },
]

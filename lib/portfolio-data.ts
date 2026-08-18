import { BLUE_OCEAN_COPY } from './blue-ocean'
import { KICKOFF_COPY } from './kickoff'
import { POCKET_PIER_COPY } from './pocket-pier'

export const CONTACT = {
  email: 'jackdennehey@gmail.com',
  github: 'https://github.com/JackDennehey',
  linkedin: 'https://www.linkedin.com/in/jackdennehey',
  domain: 'jackdennehey.com',
}

export type Project = {
  title: string
  status?: string
  description: string
  technologies: string[]
  github?: string
  demo?: string
  featured?: boolean
  featuredLabel?: string
  internalApp?: 'blue-ocean' | 'pocket-pier' | 'kickoff'
  internalActionLabel?: string
  thumbnail?: {
    src: string
    alt: string
  }
  role?: string
  implementation?: string
  keySystems?: string[]
}

export const PROJECTS: Project[] = [
  {
    title: KICKOFF_COPY.title,
    status: KICKOFF_COPY.subtitle,
    featured: true,
    featuredLabel: 'Flagship Project',
    description: KICKOFF_COPY.shortDescription,
    technologies: [...KICKOFF_COPY.technologies],
    internalApp: 'kickoff',
    internalActionLabel: 'Open Kickoff',
  },
  {
    title: 'Portfolio Website',
    status: 'Live',
    description:
      'This operating-system-inspired portfolio, designed and built from scratch as a modern interpretation of classic monochrome computing.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    github: CONTACT.github,
    demo: `https://${CONTACT.domain}`,
  },
  {
    title: BLUE_OCEAN_COPY.title,
    status: 'Interactive Keynote - Jack OS V3B',
    description: BLUE_OCEAN_COPY.longDescription,
    technologies: [
      'Jack OS',
      'React',
      'TypeScript',
      'Presentation Engine',
      'AI-assisted workflow',
    ],
    demo: `https://${CONTACT.domain}/#1984-blue-ocean`,
    internalApp: 'blue-ocean',
    role:
      'Jack directed the product vision, narrative, visual identity, requirements, priorities, testing, critique, and iteration.',
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
  },
  {
    title: POCKET_PIER_COPY.title,
    status: POCKET_PIER_COPY.subtitle,
    description: POCKET_PIER_COPY.shortDescription,
    technologies: [
      'Godot',
      'GDScript',
      'iOS',
      'Game Development',
      'Product Development',
      'Pixel Art',
    ],
    internalApp: 'pocket-pier',
    internalActionLabel: 'Open Pocket Pier',
    thumbnail: POCKET_PIER_COPY.assets.icon,
    role: POCKET_PIER_COPY.role,
    implementation:
      'Designed and built as a mobile-first Godot project with GDScript gameplay systems, pixel-art asset integration, iOS packaging, and App Store Connect preparation.',
    keySystems: [
      'fishing and selling loop',
      'progression and economy systems',
      'worker automation',
      'boats and harbor expansion',
      'mobile UI and touch-first flow',
      'iOS build and distribution workflow',
    ],
  },
  {
    title: 'Azure AI Projects',
    status: 'In progress',
    description:
      'A collection of experiments using Microsoft Azure AI services — exploring document intelligence, language understanding, and applied machine learning.',
    technologies: ['Azure', 'Python', 'Cognitive Services'],
    github: CONTACT.github,
  },
  {
    title: 'Networking Labs',
    status: 'Ongoing',
    description:
      'Hands-on labs configuring routers, switches, subnets, and secure topologies while studying for Cisco networking fundamentals.',
    technologies: ['Cisco', 'Packet Tracer', 'TCP/IP', 'Subnetting'],
  },
]

export type CredentialStatus = 'Earned' | 'Earned with Honors' | 'In Progress' | 'Planned'

export type CredentialSection = {
  heading: string
  body?: string
  items?: string[]
}

export type Credential = {
  id: string
  title: string
  issuer: string
  status: CredentialStatus
  marker: string
  summary: string
  date?: string
  honor?: string
  context?: string
  featured?: boolean
  verification?: {
    label: string
    url: string
  }
  sections: CredentialSection[]
}

export const CREDENTIALS: Credential[] = [
  {
    id: 'dccc-cyber-security-certificate',
    title: 'Cyber Security Certificate of Competency',
    issuer: 'Delaware County Community College',
    status: 'Earned with Honors',
    marker: 'HON',
    summary:
      'Formal college-level cybersecurity foundation earned with honors in Pennsylvania.',
    date: 'May 14, 2026',
    honor: 'Honors',
    context: 'Pennsylvania',
    featured: true,
    verification: {
      label: 'View Verified Credential',
      url: 'https://www.parchment.com/lp/award/13db1f82-5a09-4e2a-9974-dd696f6ea8f4',
    },
    sections: [
      {
        heading: 'Overview',
        body:
          'Jack earned a Certificate of Competency in Cyber Security with Honors from Delaware County Community College on May 14, 2026. The credential represents the formal completion of his initial college-level cybersecurity program and serves as the foundation for his continuing studies in business, networking, cloud computing, and technology.',
      },
      {
        heading: 'Areas Represented',
        items: [
          'Cybersecurity foundations',
          'Network and system security concepts',
          'Risk awareness',
          'Technical problem solving',
          'Security-focused coursework',
          'Continued professional development',
        ],
      },
      {
        heading: 'Personal Context',
        body:
          'This credential marks the transition from an early interest in technology into a structured academic and professional path. Jack is now continuing his education at Penn State Brandywine while building broader knowledge across business and emerging technology.',
      },
    ],
  },
  {
    id: 'cisco-networking-basics',
    title: 'Cisco Networking Basics',
    issuer: 'Cisco Networking Academy',
    status: 'Earned',
    marker: 'NET',
    summary:
      'Introductory networking credential supporting cybersecurity, cloud, and IT fundamentals.',
    verification: {
      label: 'View on Credly',
      url: 'https://www.credly.com/badges/cf51b887-6d85-45b0-9291-6593a2286cc4',
    },
    sections: [
      {
        heading: 'Overview',
        body:
          "Cisco Networking Basics introduced the core ideas behind how modern networks communicate and how connected devices exchange data. It strengthened Jack's understanding of the technical foundation that supports cybersecurity, cloud platforms, and IT operations.",
      },
      {
        heading: 'Topics Represented',
        items: [
          'Network devices and endpoints',
          'Data movement across networks',
          'IP addressing',
          'Common network protocols',
          'Basic connectivity concepts',
          'Introductory troubleshooting',
          'The relationship between networking and cybersecurity',
        ],
      },
      {
        heading: 'Personal Context',
        body:
          'Networking is one of the central technical areas Jack continues to develop. This credential supports his interest in cybersecurity while also giving him a stronger base for cloud and infrastructure-focused work.',
      },
    ],
  },
  {
    id: 'microsoft-azure-ai-fundamentals',
    title: 'Microsoft Azure AI Fundamentals',
    issuer: 'Microsoft',
    status: 'In Progress',
    marker: 'AI',
    summary:
      'Current study path focused on AI workloads, responsible AI, and Azure AI services.',
    sections: [
      {
        heading: 'Overview',
        body:
          'Jack is currently preparing for Microsoft Azure AI Fundamentals, which covers the concepts behind artificial intelligence workloads and the Azure services used to support them.',
      },
      {
        heading: 'Current Areas of Study',
        items: [
          'Machine-learning concepts',
          'Generative AI',
          'Computer vision',
          'Natural-language processing',
          'Speech and content-understanding services',
          'Responsible AI principles',
          'Azure AI tools and cloud-based AI solutions',
        ],
      },
      {
        heading: 'Personal Context',
        body:
          "This work expands Jack's technology background beyond networking and cybersecurity. The goal is to understand how AI capabilities can be evaluated and used within practical business and cloud environments.",
      },
    ],
  },
  {
    id: 'aws-cloud-practitioner',
    title: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    status: 'Planned',
    marker: 'AWS',
    summary:
      'Planned cloud milestone for broader exposure to AWS infrastructure and service models.',
    sections: [
      {
        heading: 'Overview',
        body:
          "AWS Certified Cloud Practitioner is planned as a future milestone in Jack's cloud-learning path. It is intended to build broad familiarity with the AWS platform and the role cloud services play in modern organizations.",
      },
      {
        heading: 'Planned Areas',
        items: [
          'Cloud concepts',
          'Core AWS services',
          'Shared responsibility and cloud security',
          'Basic architecture principles',
          'Pricing, billing, and support',
          'Business use cases for cloud technology',
        ],
      },
      {
        heading: 'Personal Context',
        body:
          "This planned credential complements Jack's cybersecurity, networking, business, and Azure AI interests by adding broader exposure to cloud infrastructure and service models.",
      },
    ],
  },
]

export const CERTIFICATIONS = CREDENTIALS

export const SKILLS: { group: string; items: string[] }[] = [
  { group: 'Cloud', items: ['Microsoft Azure', 'AWS (learning)', 'Cloud Fundamentals'] },
  { group: 'Networking', items: ['TCP/IP', 'Subnetting', 'Cisco Packet Tracer'] },
  { group: 'Security', items: ['Cybersecurity Fundamentals', 'Network Security'] },
  { group: 'Technical', items: ['Python', 'TypeScript', 'Git', 'AI / ML Concepts'] },
  { group: 'Interface', items: ['React', 'Front-end Development', 'Product Thinking'] },
  { group: 'Business', items: ['Analysis', 'Communication', 'Project Management'] },
]

export const EDUCATION = [
  {
    school: 'Penn State Brandywine',
    degree: 'Business studies',
    period: 'Current',
    detail:
      'Studying business with a strong focus on technology, cloud computing, and cybersecurity.',
  },
  {
    school: 'Delaware County Community College',
    degree: 'Cyber Security Certificate of Competency',
    period: 'Completed with Honors',
    detail:
      'Completed prior cybersecurity education that became the foundation for continued work in networking, cloud, and business technology.',
  },
]

export const EXPERIENCE = [
  {
    role: 'Independent Technology Projects',
    org: 'Self-directed',
    period: 'Ongoing',
    detail:
      'Building hands-on projects across cloud, networking, and AI while pursuing industry certifications.',
  },
]

export const INTERESTS = [
  'Cybersecurity',
  'Networking',
  'Cloud Computing',
  'Artificial Intelligence',
  'Front-end Development',
  'Product and Interface Thinking',
  'Business',
  'Continuous Learning',
]

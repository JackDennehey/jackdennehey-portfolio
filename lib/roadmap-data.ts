export type RoadmapStatus =
  | 'Current'
  | 'In Progress'
  | 'Active Study'
  | 'Planned'
  | 'Long-Term Direction'

export type RoadmapItem = {
  id: string
  title: string
  status: RoadmapStatus
  description: string
  tags?: readonly string[]
}

export type RoadmapSection = {
  id: 'current-pipeline' | 'upcoming-deployments' | 'long-term-direction'
  label: string
  summary: string
  items: readonly RoadmapItem[]
}

export const ROADMAP_TRACK = {
  label: 'Business & Technology Development',
  status: 'Current objectives in progress',
} as const

export const ROADMAP_SECTIONS: readonly RoadmapSection[] = [
  {
    id: 'current-pipeline',
    label: 'Current Pipeline',
    summary: 'Active education and study paths currently shaping Jack’s direction.',
    items: [
      {
        id: 'azure-ai-fundamentals',
        title: 'Microsoft Azure AI Fundamentals',
        status: 'In Progress',
        description:
          'Building foundational knowledge of AI concepts and Azure AI services.',
        tags: ['AI', 'Cloud', 'Microsoft Azure'],
      },
      {
        id: 'penn-state-business-studies',
        title: 'Penn State Brandywine Business Studies',
        status: 'Current',
        description:
          'Developing a business foundation while connecting technology, operations, and decision-making.',
        tags: ['Business', 'Education'],
      },
    ],
  },
  {
    id: 'upcoming-deployments',
    label: 'Upcoming Deployments',
    summary: 'Planned learning and portfolio work without unsupported dates or percentages.',
    items: [
      {
        id: 'aws-cloud-practitioner',
        title: 'AWS Cloud Practitioner',
        status: 'Planned',
        description:
          'Planned foundational study of AWS cloud concepts and services.',
        tags: ['AWS', 'Cloud'],
      },
      {
        id: 'additional-portfolio-projects',
        title: 'Additional Portfolio Projects',
        status: 'Planned',
        description:
          'Continued development of projects connecting business, cybersecurity, networking, cloud, and interface design.',
        tags: ['Projects', 'Portfolio'],
      },
    ],
  },
  {
    id: 'long-term-direction',
    label: 'Long-Term Direction',
    summary: 'Professional areas Jack is continuing to build toward.',
    items: [
      {
        id: 'business-technology-analysis',
        title: 'Technology and Business Analysis',
        status: 'Long-Term Direction',
        description:
          'Connecting technical decisions with business value, operations, and clear communication.',
      },
      {
        id: 'cloud-cybersecurity-networking',
        title: 'Cloud, Cybersecurity, and Networking',
        status: 'Long-Term Direction',
        description:
          'Building practical knowledge across secure systems, infrastructure, cloud platforms, and network fundamentals.',
      },
      {
        id: 'secure-product-thinking',
        title: 'Secure Systems and Product Thinking',
        status: 'Long-Term Direction',
        description:
          'Developing projects that combine security awareness, usable interfaces, and practical technology outcomes.',
      },
    ],
  },
] as const

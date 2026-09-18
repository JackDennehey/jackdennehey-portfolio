import type { SkillGroup } from './types'

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: 'cloud',
    group: 'Cloud',
    items: ['Microsoft Azure', 'AWS (learning)', 'Cloud Fundamentals'],
    relatedProjectIds: ['azure-ai-projects', 'jackos'],
  },
  {
    id: 'networking',
    group: 'Networking',
    items: ['TCP/IP', 'Subnetting', 'Cisco Packet Tracer'],
    relatedProjectIds: ['networking-labs'],
  },
  {
    id: 'security',
    group: 'Security',
    items: ['Cybersecurity Fundamentals', 'Network Security'],
    relatedProjectIds: ['networking-labs', 'jackos'],
  },
  {
    id: 'technical',
    group: 'Technical',
    items: ['Python', 'TypeScript', 'Git', 'AI / ML Concepts'],
    relatedProjectIds: ['kickoff', 'azure-ai-projects', 'jackos'],
  },
  {
    id: 'interface',
    group: 'Interface',
    items: ['React', 'Front-end Development', 'Product Thinking'],
    relatedProjectIds: ['jackos', 'kickoff', 'pocket-pier', 'blue-ocean'],
  },
  {
    id: 'business',
    group: 'Business',
    items: ['Analysis', 'Communication', 'Project Management'],
    relatedProjectIds: ['blue-ocean', 'kickoff'],
  },
]

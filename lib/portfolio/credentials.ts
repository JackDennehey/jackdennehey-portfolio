import type { Credential } from './types'

export const CREDENTIALS: readonly Credential[] = [
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

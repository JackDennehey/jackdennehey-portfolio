import { PORTFOLIO_KNOWLEDGE } from './portfolio-knowledge'
import { JACK_OS_ACHIEVEMENT_REGISTRY } from './achievements'
import { ROADMAP_SECTIONS } from './roadmap-data'
import { BLUE_OCEAN_COPY } from './blue-ocean'
import { POCKET_PIER_COPY } from './pocket-pier'

export type AssistantWindowTarget =
  | 'blue-ocean'
  | 'pocket-pier'
  | 'about'
  | 'projects'
  | 'certifications'
  | 'contact'
  | 'recruiter'
  | 'timeline'
  | 'guestbook'
  | 'firewall'
  | 'roadmap'

export type AssistantAction =
  | { type: 'open'; label: string; target: AssistantWindowTarget }
  | { type: 'copy-email'; label: string }
  | { type: 'external'; label: string; href: string }

export type AssistantIntent =
  | 'introduction'
  | 'education'
  | 'penn-state'
  | 'dccc'
  | 'credentials'
  | 'completed-credentials'
  | 'azure-status'
  | 'aws-status'
  | 'cisco'
  | 'cybersecurity'
  | 'networking'
  | 'business'
  | 'cloud'
  | 'ai'
  | 'frontend'
  | 'project-list'
  | 'pocket-pier'
  | 'pocket-pier-launch'
  | 'pocket-pier-technology'
  | 'jden-studios'
  | 'blue-ocean'
  | 'blue-ocean-authorship'
  | 'blue-ocean-recommendation'
  | 'blue-ocean-launch'
  | 'jack-os'
  | 'jack-os-technologies'
  | 'jack-os-features'
  | 'timeline'
  | 'guestbook'
  | 'firewall'
  | 'roadmap'
  | 'achievements'
  | 'simple-mode'
  | 'v3a'
  | 'return-to-jack-os'
  | 'github'
  | 'linkedin'
  | 'contact'
  | 'email'
  | 'resume'
  | 'professional-goals'
  | 'internships'
  | 'management-leadership'
  | 'business-technology'
  | 'navigation'
  | 'next-steps'
  | 'private-phone'
  | 'private-age'
  | 'private-address'
  | 'secret-codes'
  | 'unsupported'

export type AssistantContext = {
  lastIntent?: AssistantIntent | null
}

export type AssistantResponse = {
  content: string
  actions?: AssistantAction[]
  intent: AssistantIntent
}

type IntentDefinition = {
  intent: AssistantIntent
  phrases?: readonly string[]
  keywords?: Readonly<Record<string, number>>
  priority?: number
}

export const JD_ASSISTANT_INTRO =
  "Hello, I'm J.D., Jack OS's Local Portfolio Assistant. Ask me about Jack's education, credentials, projects, 1984 Blue Ocean, Pocket Pier, skills, or professional direction."

export const JD_SUGGESTED_PROMPTS = [
  'What is 1984 Blue Ocean?',
  'What is Pocket Pier?',
  'What has Jack built?',
  'What is JDen Studios?',
  'What credentials has Jack earned?',
  'What is Jack studying?',
  'What is on the Road Map?',
  'How can I contact Jack?',
] as const

export const JD_SUPPORTED_CATEGORIES: readonly AssistantIntent[] = [
  'introduction',
  'education',
  'penn-state',
  'dccc',
  'credentials',
  'completed-credentials',
  'azure-status',
  'aws-status',
  'cisco',
  'cybersecurity',
  'networking',
  'business',
  'cloud',
  'ai',
  'frontend',
  'project-list',
  'pocket-pier',
  'pocket-pier-launch',
  'pocket-pier-technology',
  'jden-studios',
  'blue-ocean',
  'blue-ocean-authorship',
  'blue-ocean-recommendation',
  'blue-ocean-launch',
  'jack-os',
  'jack-os-technologies',
  'jack-os-features',
  'timeline',
  'guestbook',
  'firewall',
  'roadmap',
  'achievements',
  'simple-mode',
  'v3a',
  'return-to-jack-os',
  'github',
  'linkedin',
  'contact',
  'email',
  'resume',
  'professional-goals',
  'internships',
  'management-leadership',
  'business-technology',
  'navigation',
]

const OPEN_RECRUITER: AssistantAction = {
  type: 'open',
  label: 'Open Recruiter Mode',
  target: 'recruiter',
}
const OPEN_BLUE_OCEAN: AssistantAction = {
  type: 'open',
  label: 'Launch 1984 Blue Ocean',
  target: 'blue-ocean',
}
const OPEN_POCKET_PIER: AssistantAction = {
  type: 'open',
  label: 'Open Pocket Pier',
  target: 'pocket-pier',
}
const OPEN_ABOUT: AssistantAction = { type: 'open', label: 'Open About', target: 'about' }
const OPEN_PROJECTS: AssistantAction = {
  type: 'open',
  label: 'Open Projects',
  target: 'projects',
}
const OPEN_CREDENTIALS: AssistantAction = {
  type: 'open',
  label: 'Open Credentials',
  target: 'certifications',
}
const OPEN_CONTACT: AssistantAction = { type: 'open', label: 'Open Contact', target: 'contact' }
const OPEN_TIMELINE: AssistantAction = { type: 'open', label: 'Open Timeline', target: 'timeline' }
const OPEN_GUESTBOOK: AssistantAction = {
  type: 'open',
  label: 'Open Guestbook',
  target: 'guestbook',
}
const OPEN_FIREWALL: AssistantAction = {
  type: 'open',
  label: 'Open Network Firewall',
  target: 'firewall',
}
const OPEN_ROADMAP: AssistantAction = {
  type: 'open',
  label: 'Open Road Map',
  target: 'roadmap',
}
const COPY_EMAIL: AssistantAction = { type: 'copy-email', label: 'Copy Email' }
const OPEN_GITHUB: AssistantAction = {
  type: 'external',
  label: 'Open GitHub',
  href: PORTFOLIO_KNOWLEDGE.contact.github,
}
const OPEN_LINKEDIN: AssistantAction = {
  type: 'external',
  label: 'Open LinkedIn',
  href: PORTFOLIO_KNOWLEDGE.contact.linkedin,
}

const INTENTS: readonly IntentDefinition[] = [
  {
    intent: 'private-phone',
    phrases: ['phone number', 'mobile number', 'cell number', 'call jack'],
    keywords: { phone: 6, number: 2, call: 3, mobile: 4, cell: 4 },
    priority: 100,
  },
  {
    intent: 'private-age',
    phrases: ['how old', 'what age', 'birthday', 'birth date', 'date of birth'],
    keywords: { age: 6, old: 3, birthday: 6, birthdate: 6, born: 4 },
    priority: 100,
  },
  {
    intent: 'private-address',
    phrases: ['home address', 'street address', 'where does jack live', 'where he lives'],
    keywords: { address: 6, street: 5, home: 3, live: 3, lives: 3 },
    priority: 100,
  },
  {
    intent: 'secret-codes',
    phrases: ['secret code', 'hidden code', 'wallpaper code', 'unlock code'],
    keywords: { secret: 5, secrets: 5, code: 5, codes: 5, hidden: 3, unlock: 3 },
    priority: 100,
  },
  {
    intent: 'azure-status',
    phrases: ['azure ai', 'did he finish azure', 'is azure completed', 'azure certification'],
    keywords: { azure: 8, microsoft: 3, ai: 2, completed: 2, finished: 2, progress: 2 },
    priority: 12,
  },
  {
    intent: 'aws-status',
    phrases: ['aws cloud practitioner', 'is aws completed', 'did he finish aws'],
    keywords: { aws: 8, amazon: 4, practitioner: 5, completed: 2, planned: 2, finished: 2 },
    priority: 12,
  },
  {
    intent: 'cisco',
    phrases: ['cisco networking basics', 'cisco credential', 'networking academy'],
    keywords: { cisco: 8, networking: 3, academy: 3, credential: 2 },
    priority: 11,
  },
  {
    intent: 'blue-ocean-authorship',
    phrases: [
      'did jack code 1984 blue ocean',
      'did jack code it',
      'did jack build the keynote',
      'who coded 1984 blue ocean',
      'was 1984 blue ocean ai assisted',
    ],
    keywords: {
      code: 5,
      coded: 6,
      build: 3,
      built: 3,
      authored: 4,
      ai: 3,
      assistant: 2,
      codex: 5,
      keynote: 3,
      ocean: 3,
    },
    priority: 18,
  },
  {
    intent: 'blue-ocean-recommendation',
    phrases: [
      'why should i watch 1984 blue ocean',
      'why should i watch the keynote',
      'why watch 1984 blue ocean',
      'strongest project',
      'best demonstration',
    ],
    keywords: {
      why: 2,
      watch: 6,
      strongest: 6,
      best: 4,
      demonstration: 5,
      recruiter: 3,
      keynote: 4,
      ocean: 3,
    },
    priority: 17,
  },
  {
    intent: 'blue-ocean-launch',
    phrases: [
      'open 1984 blue ocean',
      'launch 1984 blue ocean',
      'start 1984 blue ocean',
      'show me 1984 blue ocean',
      'resume 1984 blue ocean',
      'open the keynote',
      'launch the keynote',
      'start the keynote',
      'resume the keynote',
    ],
    keywords: {
      '1984': 8,
      blue: 5,
      open: 5,
      launch: 6,
      start: 5,
      show: 4,
      resume: 5,
      keynote: 5,
      ocean: 4,
      presentation: 3,
    },
    priority: 18,
  },
  {
    intent: 'blue-ocean',
    phrases: [
      'what is 1984 blue ocean',
      'tell me about 1984 blue ocean',
      'what is the keynote',
      '1984 blue ocean',
      'blue ocean keynote',
    ],
    keywords: {
      '1984': 8,
      blue: 5,
      ocean: 7,
      keynote: 6,
      presentation: 4,
      strategy: 3,
      execution: 3,
      product: 3,
    },
    priority: 16,
  },
  {
    intent: 'pocket-pier-launch',
    phrases: [
      'open pocket pier',
      'launch pocket pier',
      'show me pocket pier',
      'open the game',
      'launch the game',
      'show me the game',
    ],
    keywords: {
      pocket: 7,
      pier: 7,
      open: 5,
      launch: 6,
      show: 4,
      game: 3,
      mobile: 2,
    },
    priority: 18,
  },
  {
    intent: 'jden-studios',
    phrases: ['what is jden studios', 'tell me about jden studios', 'jden studios'],
    keywords: { jden: 9, studios: 8, studio: 6, game: 2, pocket: 2, pier: 2 },
    priority: 17,
  },
  {
    intent: 'pocket-pier-technology',
    phrases: [
      'what engine did you use',
      'what engine did jack use',
      'what was pocket pier built with',
      'pocket pier tech stack',
      'godot pocket pier',
      'gdscript pocket pier',
      'xcode app store connect',
    ],
    keywords: {
      pocket: 5,
      pier: 5,
      engine: 6,
      godot: 8,
      gdscript: 8,
      xcode: 6,
      ios: 5,
      app: 2,
      store: 2,
      connect: 2,
    },
    priority: 17,
  },
  {
    intent: 'pocket-pier',
    phrases: [
      'what is pocket pier',
      'tell me about pocket pier',
      'tell me about your game',
      'what is your game',
      'why did you build pocket pier',
      'how is pocket pier different from jack os',
      'how does pocket pier differ from jack os',
      'harbor game',
      'mobile game',
    ],
    keywords: {
      pocket: 7,
      pier: 7,
      game: 5,
      mobile: 4,
      harbor: 6,
      fishing: 5,
      ios: 3,
      godot: 3,
      jden: 3,
      different: 3,
      differs: 3,
    },
    priority: 16,
  },
  {
    intent: 'completed-credentials',
    phrases: ['completed credentials', 'earned credentials', 'certifications earned'],
    keywords: { completed: 5, earned: 5, finished: 3, credentials: 3, certifications: 3 },
    priority: 10,
  },
  {
    intent: 'credentials',
    phrases: ['what credentials', 'what certifications', 'does he have certifications'],
    keywords: {
      credential: 5,
      credentials: 5,
      certification: 5,
      certifications: 5,
      certificate: 4,
      certified: 4,
    },
    priority: 8,
  },
  {
    intent: 'penn-state',
    phrases: ['penn state', 'penn state brandywine'],
    keywords: { penn: 5, state: 4, brandywine: 6, school: 2, studying: 2 },
    priority: 9,
  },
  {
    intent: 'dccc',
    phrases: ['delaware county community college', 'dccc', 'cybersecurity education'],
    keywords: { dccc: 8, delaware: 4, county: 3, community: 3, college: 3 },
    priority: 9,
  },
  {
    intent: 'education',
    phrases: ['what is jack studying', 'currently studying', 'education background'],
    keywords: { studying: 5, study: 4, education: 5, school: 3, college: 3, student: 3 },
    priority: 7,
  },
  {
    intent: 'jack-os-technologies',
    phrases: ['built with', 'tech stack', 'technologies used', 'what was jack os built with'],
    keywords: { stack: 6, technologies: 5, technology: 4, react: 6, next: 5, typescript: 5 },
    priority: 10,
  },
  {
    intent: 'timeline',
    phrases: ['what is the timeline', 'system history', 'milestones has jack reached'],
    keywords: { timeline: 8, history: 4, journey: 4, milestones: 6, reached: 3 },
    priority: 10,
  },
  {
    intent: 'roadmap',
    phrases: [
      'what is on the road map',
      'what is jack working toward',
      'current goals',
      'future direction',
      'next steps',
    ],
    keywords: { roadmap: 8, road: 4, map: 4, goals: 5, plans: 5, direction: 4, working: 3 },
    priority: 11,
  },
  {
    intent: 'achievements',
    phrases: ['what achievements can i earn', 'achievement list', 'progress milestones'],
    keywords: { achievements: 8, achievement: 8, progress: 4, trophies: 5, unlocked: 4 },
    priority: 10,
  },
  {
    intent: 'simple-mode',
    phrases: ['what is simple mode', 'simple portfolio', 'plain portfolio', 'professional view'],
    keywords: { simple: 8, mode: 4, plain: 5, professional: 4, recruiter: 2 },
    priority: 10,
  },
  {
    intent: 'v3a',
    phrases: ['what changed in jack os v3a', 'identity update', 'v3a update'],
    keywords: { v3a: 9, identity: 6, update: 4, changed: 4, release: 4 },
    priority: 12,
  },
  {
    intent: 'return-to-jack-os',
    phrases: ['return to jack os', 'go back to jack os', 'leave simple mode'],
    keywords: { return: 7, back: 5, leave: 4, simple: 3, desktop: 3 },
    priority: 11,
  },
  {
    intent: 'guestbook',
    phrases: ['what is the guestbook', 'sign the guestbook', 'visitor log'],
    keywords: { guestbook: 8, sign: 4, visitor: 4, log: 3, message: 3, comments: 3 },
    priority: 10,
  },
  {
    intent: 'firewall',
    phrases: ['is the firewall real', 'what does the firewall demonstrate', 'network firewall'],
    keywords: { firewall: 8, simulation: 5, simulated: 5, packets: 4, traffic: 4, ports: 3 },
    priority: 10,
  },
  {
    intent: 'jack-os-features',
    phrases: ['technically interesting', 'jack os features', 'what makes jack os'],
    keywords: { feature: 4, features: 4, interesting: 4, windows: 3, wallpaper: 3, command: 3 },
    priority: 9,
  },
  {
    intent: 'jack-os',
    phrases: ['jack os', 'this website', 'portfolio website', 'what is this website'],
    keywords: { jack: 2, os: 5, website: 4, portfolio: 4, desktop: 3 },
    priority: 8,
  },
  {
    intent: 'project-list',
    phrases: ['what has jack made', 'what did he build', 'what has jack built', 'projects'],
    keywords: { projects: 5, project: 5, built: 4, build: 4, made: 4, work: 2 },
    priority: 7,
  },
  {
    intent: 'cybersecurity',
    phrases: ['cybersecurity background', 'security background', 'cyber security'],
    keywords: { cybersecurity: 7, cyber: 5, security: 4, risk: 2 },
    priority: 7,
  },
  {
    intent: 'networking',
    phrases: ['understand networking', 'networking background', 'networking experience'],
    keywords: { networking: 7, network: 5, networks: 5, subnetting: 5, tcp: 4, ip: 3 },
    priority: 7,
  },
  {
    intent: 'business-technology',
    phrases: ['business background connect to technology', 'business and technology connect'],
    keywords: { business: 5, technology: 5, connect: 4, connects: 4, bridge: 3 },
    priority: 9,
  },
  {
    intent: 'business',
    phrases: ['business studies', 'why business', 'move into business'],
    keywords: { business: 7, operations: 3, strategy: 3, studying: 2 },
    priority: 6,
  },
  {
    intent: 'cloud',
    phrases: ['cloud computing', 'cloud interests'],
    keywords: { cloud: 7, infrastructure: 3, azure: 2, aws: 2 },
    priority: 6,
  },
  {
    intent: 'ai',
    phrases: ['artificial intelligence', 'ai interests'],
    keywords: { ai: 7, artificial: 5, intelligence: 5, machine: 3, learning: 3 },
    priority: 6,
  },
  {
    intent: 'frontend',
    phrases: ['front end', 'front-end', 'frontend', 'interface thinking'],
    keywords: { frontend: 7, 'front-end': 7, interface: 5, react: 3, product: 3 },
    priority: 6,
  },
  {
    intent: 'professional-goals',
    phrases: ['professional goals', 'career direction', 'what kind of work'],
    keywords: { goals: 5, direction: 5, career: 4, work: 3, looking: 3, opportunities: 3 },
    priority: 7,
  },
  {
    intent: 'internships',
    phrases: ['internship', 'internships', 'entry-level', 'entry level'],
    keywords: { internship: 6, internships: 6, entry: 4, level: 3, opportunities: 4 },
    priority: 8,
  },
  {
    intent: 'management-leadership',
    phrases: ['management background', 'leadership background', 'project management'],
    keywords: { management: 6, leadership: 6, leader: 4, project: 2 },
    priority: 7,
  },
  {
    intent: 'github',
    phrases: ['where is github', 'github profile'],
    keywords: { github: 8, code: 3, source: 3, repository: 3 },
    priority: 8,
  },
  {
    intent: 'linkedin',
    phrases: ['where is linkedin', 'linkedin profile'],
    keywords: { linkedin: 8, connect: 3, professional: 2 },
    priority: 8,
  },
  {
    intent: 'email',
    phrases: ['email address', 'copy email'],
    keywords: { email: 8, gmail: 6, mail: 4 },
    priority: 8,
  },
  {
    intent: 'contact',
    phrases: ['contact jack', 'reach jack', 'get in touch'],
    keywords: { contact: 6, reach: 5, connect: 4, hire: 3 },
    priority: 7,
  },
  {
    intent: 'resume',
    phrases: ['public resume', 'resume', 'cv'],
    keywords: { resume: 8, cv: 8 },
    priority: 9,
  },
  {
    intent: 'navigation',
    phrases: ['where should i go', 'help me find', 'navigate', 'open app'],
    keywords: { navigate: 6, navigation: 6, open: 3, find: 3, where: 2, app: 2 },
    priority: 5,
  },
  {
    intent: 'introduction',
    phrases: ['who is jack', 'about jack', 'overview', 'summary'],
    keywords: { who: 2, overview: 6, summary: 5, intro: 4, introduction: 4 },
    priority: 4,
  },
]

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2019']/g, '')
    .replace(/[^a-z0-9+\-.#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string) {
  return normalizeText(value).split(' ').filter(Boolean)
}

function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const nextDiagonal = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diagonal = nextDiagonal
    }
  }

  return previous[b.length]
}

function tokenMatches(tokens: readonly string[], keyword: string) {
  const normalizedKeyword = normalizeText(keyword)
  if (normalizedKeyword.includes(' ')) return false

  return tokens.some((token) => {
    if (token === normalizedKeyword) return true
    if (token.length < 5 || normalizedKeyword.length < 5) return false
    return editDistance(token, normalizedKeyword) <= 1
  })
}

function scoreIntent(input: string, tokens: readonly string[], definition: IntentDefinition) {
  let score = 0

  for (const phrase of definition.phrases ?? []) {
    if (input.includes(normalizeText(phrase))) {
      score += Math.max(5, phrase.split(/\s+/).length * 3)
    }
  }

  for (const [keyword, weight] of Object.entries(definition.keywords ?? {})) {
    if (tokenMatches(tokens, keyword)) {
      score += weight
    }
  }

  return score > 0 ? score + (definition.priority ?? 0) / 100 : 0
}

function findBestIntent(rawQuestion: string): AssistantIntent {
  const input = normalizeText(rawQuestion)
  const tokens = tokenize(input)
  if (!input) return 'introduction'

  const ranked = INTENTS.map((definition) => ({
    intent: definition.intent,
    score: scoreIntent(input, tokens, definition),
  })).sort((a, b) => b.score - a.score)

  const best = ranked[0]
  return best && best.score >= 6 ? best.intent : 'unsupported'
}

function isFollowUpQuestion(input: string) {
  return /\b(it|that|those|them|next|after|also|what about|working on)\b/.test(input)
}

function resolveFollowUpIntent(intent: AssistantIntent, rawQuestion: string, context?: AssistantContext) {
  const input = normalizeText(rawQuestion)
  if (!context?.lastIntent || !isFollowUpQuestion(input)) return intent

  if (
    /\b(next|working on|after|planned|progress)\b/.test(input) &&
    ['credentials', 'completed-credentials', 'azure-status', 'aws-status', 'cisco'].includes(
      context.lastIntent,
    )
  ) {
    return 'next-steps'
  }

  if (
    /\b(technologies|built with|stack|used)\b/.test(input) &&
    ['project-list', 'jack-os', 'jack-os-features'].includes(context.lastIntent)
  ) {
    return 'jack-os-technologies'
  }

  if (
    /\b(technologies|built with|stack|used|engine|platform)\b/.test(input) &&
    ['pocket-pier', 'pocket-pier-launch', 'jden-studios'].includes(context.lastIntent)
  ) {
    return 'pocket-pier-technology'
  }

  if (
    /\b(features|interesting|technical|systems)\b/.test(input) &&
    ['project-list', 'jack-os', 'jack-os-technologies'].includes(context.lastIntent)
  ) {
    return 'jack-os-features'
  }

  return intent
}

function listNames(items: readonly { title: string }[]) {
  return items.map((item) => item.title).join(', ')
}

function uniqueTechnologies() {
  return Array.from(
    new Set(PORTFOLIO_KNOWLEDGE.projects.all.flatMap((project) => project.technologies)),
  )
}

function roadmapSummary() {
  return ROADMAP_SECTIONS.flatMap((section) =>
    section.items.map((item) => `${item.title} (${item.status})`),
  ).join('; ')
}

function publicAchievementTitles() {
  return JACK_OS_ACHIEVEMENT_REGISTRY
    .filter((achievement) => !achievement.secret)
    .map((achievement) => achievement.title)
    .join(', ')
}

function getResponse(intent: AssistantIntent): AssistantResponse {
  switch (intent) {
    case 'private-phone':
      return {
        intent,
        content:
          `Jack's phone number is not published on this portfolio. You can reach him at ${PORTFOLIO_KNOWLEDGE.contact.email} or through LinkedIn.`,
        actions: [COPY_EMAIL, OPEN_LINKEDIN, OPEN_CONTACT],
      }
    case 'private-age':
      return {
        intent,
        content:
          "Jack's age is not part of the public professional information available through this portfolio. I can help with his education, credentials, projects, or career direction.",
        actions: [OPEN_RECRUITER],
      }
    case 'private-address':
      return {
        intent,
        content:
          "Jack's home address is not published. Use the public email or LinkedIn links in the Contact app.",
        actions: [OPEN_CONTACT, COPY_EMAIL, OPEN_LINKEDIN],
      }
    case 'secret-codes':
      return {
        intent,
        content:
          "I can help with Jack's public professional information, but I don't reveal hidden Jack OS codes or private implementation details.",
        actions: [OPEN_RECRUITER],
      }
    case 'resume':
      return {
        intent,
        content:
          `${PORTFOLIO_KNOWLEDGE.resume.message} The best next steps are Projects, Credentials, Contact, or the guided Recruiter Mode overview.`,
        actions: [OPEN_RECRUITER, OPEN_PROJECTS, OPEN_CREDENTIALS, OPEN_CONTACT],
      }
    case 'introduction':
      return {
        intent,
        content:
          `${PORTFOLIO_KNOWLEDGE.person.overview} Jack OS presents that information as a retro desktop instead of a static portfolio page.`,
        actions: [OPEN_RECRUITER, OPEN_ABOUT],
      }
    case 'education':
    case 'penn-state':
      return {
        intent,
        content:
          'Jack is currently studying Business at Penn State Brandywine. He has not completed a Penn State degree; the public portfolio presents his current studies and the technical background he is building around them.',
        actions: [OPEN_RECRUITER, OPEN_ABOUT],
      }
    case 'dccc':
      return {
        intent,
        content:
          'Jack began his formal technology path through cybersecurity education at Delaware County Community College. He earned the Cyber Security Certificate of Competency with Honors, which now supports his networking, cloud, and business-technology direction.',
        actions: [OPEN_CREDENTIALS, OPEN_RECRUITER],
      }
    case 'credentials':
      return {
        intent,
        content:
          `Jack's credential path includes completed, in-progress, and planned milestones. Completed: ${listNames(PORTFOLIO_KNOWLEDGE.credentials.completed)}. Microsoft Azure AI Fundamentals is in progress, and AWS Cloud Practitioner is planned.`,
        actions: [OPEN_CREDENTIALS],
      }
    case 'completed-credentials':
      return {
        intent,
        content:
          `Jack has completed ${listNames(PORTFOLIO_KNOWLEDGE.credentials.completed)}. The DCCC cybersecurity certificate was earned with Honors, and Cisco Networking Basics supports his networking foundation.`,
        actions: [OPEN_CREDENTIALS],
      }
    case 'azure-status':
      return {
        intent,
        content:
          'Microsoft Azure AI Fundamentals is in progress. The portfolio does not claim Azure certification completion; it presents Azure AI as a current study path around AI workloads, responsible AI, and Azure services.',
        actions: [OPEN_CREDENTIALS],
      }
    case 'aws-status':
      return {
        intent,
        content:
          "AWS Cloud Practitioner is planned, not completed. It is listed as a future cloud milestone to broaden Jack's exposure to AWS infrastructure, cloud concepts, and service models.",
        actions: [OPEN_CREDENTIALS],
      }
    case 'cisco':
      return {
        intent,
        content:
          "Cisco Networking Basics is earned through Cisco Networking Academy. It supports Jack's understanding of devices, endpoints, IP addressing, protocols, connectivity, and the link between networking and cybersecurity.",
        actions: [OPEN_CREDENTIALS],
      }
    case 'next-steps':
      return {
        intent,
        content:
          'Next in the credential path, Azure AI Fundamentals is the active in-progress item and AWS Cloud Practitioner is planned. That sequence keeps Jack moving from cybersecurity and networking foundations toward cloud and AI literacy.',
        actions: [OPEN_ROADMAP, OPEN_CREDENTIALS, OPEN_RECRUITER],
      }
    case 'roadmap':
      return {
        intent,
        content:
          `The Road Map is Jack OS's central source for confirmed professional direction. It lists status labels rather than fabricated dates or percentages: ${roadmapSummary()}.`,
        actions: [OPEN_ROADMAP, OPEN_CREDENTIALS, OPEN_PROJECTS, OPEN_TIMELINE],
      }
    case 'cybersecurity':
      return {
        intent,
        content:
          "Jack's cybersecurity background comes from his DCCC Cyber Security Certificate of Competency with Honors. The portfolio frames cybersecurity as a foundation for understanding risk, systems, networks, and practical technology decisions.",
        actions: [OPEN_ABOUT, OPEN_CREDENTIALS],
      }
    case 'networking':
      return {
        intent,
        content:
          'Jack has a growing networking foundation through Cisco Networking Basics and ongoing lab-oriented study. His public portfolio connects networking to cybersecurity, cloud infrastructure, troubleshooting, and how data actually moves between systems. The Network Firewall app demonstrates those ideas with generated sample traffic only.',
        actions: [OPEN_ABOUT, OPEN_CREDENTIALS, OPEN_FIREWALL],
      }
    case 'business':
      return {
        intent,
        content:
          'Jack is studying Business at Penn State Brandywine because he wants to connect technical work to decisions, people, and outcomes. The portfolio positions business as the frame that helps technology become useful rather than merely impressive.',
        actions: [OPEN_ABOUT, OPEN_RECRUITER],
      }
    case 'business-technology':
      return {
        intent,
        content: PORTFOLIO_KNOWLEDGE.career.businessTechnology,
        actions: [OPEN_BLUE_OCEAN, OPEN_RECRUITER, OPEN_ABOUT],
      }
    case 'cloud':
      return {
        intent,
        content:
          "Jack's cloud-computing interests are developing through Azure AI study and a planned AWS Cloud Practitioner milestone. The portfolio emphasizes transferable cloud concepts such as service models, shared responsibility, identity, security, and business use cases.",
        actions: [OPEN_ABOUT, OPEN_CREDENTIALS],
      }
    case 'ai':
      return {
        intent,
        content:
          'Jack is studying artificial intelligence through Microsoft Azure AI Fundamentals topics such as machine-learning concepts, generative AI, computer vision, language, speech, and responsible AI. His angle is practical: how AI can be evaluated and used in real workflows.',
        actions: [OPEN_BLUE_OCEAN, OPEN_ABOUT, OPEN_CREDENTIALS],
      }
    case 'frontend':
      return {
        intent,
        content:
          'Front-end development shows up most clearly in Jack OS itself. The project uses React, Next.js, TypeScript, and Tailwind CSS to turn professional portfolio content into an interactive desktop-style interface.',
        actions: [OPEN_BLUE_OCEAN, OPEN_PROJECTS, OPEN_RECRUITER],
      }
    case 'project-list':
      return {
        intent,
        content:
          'The two major flagship projects are Jack OS and Pocket Pier. Jack OS is the operating-system-inspired portfolio and includes 1984 Blue Ocean, a 31-stage interactive keynote. Pocket Pier is an independent mobile game under JDen Studios that demonstrates gameplay systems, product iteration, and iOS deployment preparation. Other listed work includes Azure AI Projects and Networking Labs.',
        actions: [OPEN_BLUE_OCEAN, OPEN_POCKET_PIER, OPEN_PROJECTS, OPEN_GITHUB],
      }
    case 'pocket-pier':
      return {
        intent,
        content:
          `${POCKET_PIER_COPY.title} is ${POCKET_PIER_COPY.subtitle}: ${POCKET_PIER_COPY.shortDescription} It starts with a single wooden pier and grows through fishing, selling catches, upgrades, worker automation, boats, harbor expansion, markets, exploration, and economy management. It differs from Jack OS because Jack OS is the web/software platform, while Pocket Pier is an independent mobile product.`,
        actions: [OPEN_POCKET_PIER, OPEN_PROJECTS],
      }
    case 'pocket-pier-launch':
      return {
        intent,
        content:
          'I can open the Pocket Pier project window from here. It shows the gameplay concept, development path, screenshots, current status, and the move from idea to iOS distribution workflow.',
        actions: [OPEN_POCKET_PIER],
      }
    case 'pocket-pier-technology':
      return {
        intent,
        content:
          `Pocket Pier is built with ${POCKET_PIER_COPY.engine} and ${POCKET_PIER_COPY.language} for ${POCKET_PIER_COPY.platform}. The workflow includes gameplay systems, progression and economy design, mobile-first UI, asset integration, Xcode packaging, and App Store Connect preparation. The public portfolio does not claim the game is already available on the App Store.`,
        actions: [OPEN_POCKET_PIER, OPEN_PROJECTS],
      }
    case 'jden-studios':
      return {
        intent,
        content:
          `${POCKET_PIER_COPY.studio} is the independent project label behind Pocket Pier. In the current portfolio, it represents Jack's mobile product-development work rather than a claim of a large company or public game studio release.`,
        actions: [OPEN_POCKET_PIER, OPEN_PROJECTS],
      }
    case 'blue-ocean':
      return {
        intent,
        content:
          `${BLUE_OCEAN_COPY.title} is the flagship Jack OS V3B interactive keynote. ${BLUE_OCEAN_COPY.shortDescription} It lives inside Jack OS as a normal window or in Presentation Mode, and supports keyboard navigation, reduced motion, and session resume. It has 31 stages across five chapters rather than a traditional static slide deck.`,
        actions: [OPEN_BLUE_OCEAN, OPEN_PROJECTS, OPEN_RECRUITER],
      }
    case 'blue-ocean-authorship':
      return {
        intent,
        content:
          `Jack did not manually code every line of 1984 Blue Ocean. ${BLUE_OCEAN_COPY.authorship} The project is strongest when understood as product direction, narrative design, critique, testing, and iterative AI-assisted execution, not as a claim that Jack hand-wrote the entire implementation alone.`,
        actions: [OPEN_BLUE_OCEAN, OPEN_PROJECTS],
      }
    case 'blue-ocean-recommendation':
      return {
        intent,
        content:
          'You should watch 1984 Blue Ocean if you want the clearest proof of how Jack thinks. It connects business strategy, technical communication, AI-assisted product development, and Jack OS itself into one guided case study. For recruiters, it is one of the fastest ways to see his product judgment and ability to bridge business and technical work.',
        actions: [OPEN_BLUE_OCEAN, OPEN_RECRUITER, OPEN_PROJECTS],
      }
    case 'blue-ocean-launch':
      return {
        intent,
        content:
          'I can open 1984 Blue Ocean from here. It will start at the cover, and if this browser has a valid keynote session, the keynote window will offer Resume Presentation. Presentation Mode is the best viewing experience, but the normal Jack OS window works for previewing it.',
        actions: [OPEN_BLUE_OCEAN],
      }
    case 'jack-os':
      return {
        intent,
        content:
          "Jack OS is Jack's interactive portfolio, built as an original retro desktop experience rather than a conventional resume page. It organizes About, Projects, Credentials, Contact, Wallpapers, Secrets, Recruiter Mode, J.D., and the 1984 Blue Ocean keynote as apps inside one interface.",
        actions: [OPEN_BLUE_OCEAN, OPEN_PROJECTS, OPEN_RECRUITER],
      }
    case 'jack-os-technologies':
      return {
        intent,
        content:
          `Jack OS is built with ${PORTFOLIO_KNOWLEDGE.projects.featured.technologies.join(', ')}. Across the project list, public technologies include ${uniqueTechnologies().join(', ')}.`,
        actions: [OPEN_PROJECTS, OPEN_GITHUB],
      }
    case 'jack-os-features':
      return {
        intent,
        content:
          `Technically, Jack OS is interesting because it includes ${PORTFOLIO_KNOWLEDGE.projects.jackOsSystems.join(', ')}, Timeline, Guestbook, and a simulated Network Firewall. The work is also iterative: each phase adds polish while preserving the retro desktop identity.`,
        actions: [OPEN_BLUE_OCEAN, OPEN_PROJECTS, OPEN_TIMELINE, OPEN_FIREWALL, OPEN_RECRUITER],
      }
    case 'timeline':
      return {
        intent,
        content:
          "Timeline is the Jack OS system-history app. It presents Jack's public education, credentials, projects, and portfolio milestones as expandable entries rather than a conventional resume timeline.",
        actions: [OPEN_TIMELINE, OPEN_RECRUITER],
      }
    case 'guestbook':
      return {
        intent,
        content:
          'Guestbook lets visitors leave a short public-facing message without creating an account. Entries are reviewed before they appear, and visitors should not include private contact information, links, ads, or spam.',
        actions: [OPEN_GUESTBOOK],
      }
    case 'firewall':
      return {
        intent,
        content:
          "The Network Firewall is a local simulation. It uses generated sample traffic to demonstrate packets, services, ports, allow/block/inspect decisions, rule priority, and plain-English packet explanations; it does not inspect visitor devices or show real IP addresses.",
        actions: [OPEN_FIREWALL],
      }
    case 'achievements':
      return {
        intent,
        content:
          `Achievements are local Jack OS milestones saved in this browser. Public milestones include ${publicAchievementTitles()}. Secret-related requirements stay hidden, and achievements do not affect app access or portfolio content.`,
        actions: [OPEN_RECRUITER, OPEN_FIREWALL, OPEN_TIMELINE, OPEN_ROADMAP],
      }
    case 'simple-mode':
      return {
        intent,
        content:
          'Simple Mode is a conventional professional portfolio view for visitors who want a fast, readable overview without the retro desktop. It uses the same verified Jack OS portfolio data and is not a separate website.',
        actions: [OPEN_RECRUITER, OPEN_PROJECTS, OPEN_CREDENTIALS, OPEN_CONTACT],
      }
    case 'v3a':
      return {
        intent,
        content:
          'Jack OS V3A is The Identity Update. It strengthens the product identity with custom application icons, Icons/Rain Forest/Coral Reef wallpapers, the Road Map app, visible Achievements, live Jack OS status details, updated browser branding, and Simple Mode.',
        actions: [OPEN_ROADMAP, OPEN_TIMELINE, OPEN_RECRUITER],
      }
    case 'return-to-jack-os':
      return {
        intent,
        content:
          'From Simple Mode, use the persistent Return to Jack OS V3B control at the top right. Returning preserves local Jack OS preferences such as wallpaper, theme, achievements, and sound settings.',
        actions: [OPEN_RECRUITER],
      }
    case 'github':
      return {
        intent,
        content:
          `Jack's GitHub is ${PORTFOLIO_KNOWLEDGE.contact.github}. It is linked from the desktop, Contact app, Projects app, and relevant J.D. responses.`,
        actions: [OPEN_GITHUB],
      }
    case 'linkedin':
      return {
        intent,
        content:
          `Jack's LinkedIn is ${PORTFOLIO_KNOWLEDGE.contact.linkedin}. That is the best public professional network link in the portfolio.`,
        actions: [OPEN_LINKEDIN, OPEN_CONTACT],
      }
    case 'email':
    case 'contact':
      return {
        intent,
        content: `You can contact Jack at ${PORTFOLIO_KNOWLEDGE.contact.email}. ${PORTFOLIO_KNOWLEDGE.career.opportunityStatement}`,
        actions: [COPY_EMAIL, OPEN_CONTACT, OPEN_LINKEDIN, OPEN_GITHUB],
      }
    case 'professional-goals':
    case 'internships':
      return {
        intent,
        content: `${PORTFOLIO_KNOWLEDGE.career.opportunityStatement} His current direction connects cybersecurity, networking, business, cloud computing, AI, front-end development, and product/interface thinking.`,
        actions: [OPEN_RECRUITER, OPEN_BLUE_OCEAN, OPEN_CONTACT, COPY_EMAIL],
      }
    case 'management-leadership':
      return {
        intent,
        content: PORTFOLIO_KNOWLEDGE.career.managementLeadership,
        actions: [OPEN_RECRUITER, OPEN_ABOUT],
      }
    case 'navigation':
      return {
        intent,
        content: `${PORTFOLIO_KNOWLEDGE.career.navigationSummary} Timeline shows milestones, Guestbook accepts reviewed visitor messages, and Network Firewall demonstrates sample traffic rules with a stronger packet inspector.`,
        actions: [
          OPEN_RECRUITER,
          OPEN_BLUE_OCEAN,
          OPEN_TIMELINE,
          OPEN_PROJECTS,
          OPEN_CREDENTIALS,
          OPEN_GUESTBOOK,
          OPEN_FIREWALL,
          OPEN_CONTACT,
          COPY_EMAIL,
        ],
      }
    case 'unsupported':
      return {
        intent,
        content:
          "I'm designed to answer questions about Jack's professional portfolio. Try asking about his projects, credentials, education, technical background, or current goals.",
        actions: [OPEN_RECRUITER],
      }
  }
}

export function answerPortfolioQuestion(
  rawQuestion: string,
  context?: AssistantContext,
): AssistantResponse {
  const trimmed = rawQuestion.trim()
  const initialIntent = findBestIntent(trimmed)
  const intent = resolveFollowUpIntent(initialIntent, trimmed, context)
  return getResponse(intent)
}

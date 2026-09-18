import { isWindowId, type WindowId } from '@/components/os/apps'
import { getProjectById } from '@/lib/portfolio'
import { JackOSActionValidator } from './vendor/action-validator'
import type { BochAction } from './vendor/contracts'

export type JackOSBochDestination =
  | { kind: 'window'; id: WindowId }
  | { kind: 'case-study'; projectId: string }
  | { kind: 'url'; href: string }
  | { kind: 'notification'; title: string; body: string }
  | { kind: 'ignored'; reason: string }

const APP_TO_WINDOW: Record<string, WindowId> = {
  home: 'home',
  projects: 'projects',
  resume: 'resume',
  contact: 'contact',
  about: 'about',
  skills: 'portfolio',
  boch: 'boch',
  portfolio: 'portfolio',
  recruiter: 'recruiter',
  kickoff: 'kickoff',
  'pocket-pier': 'pocket-pier',
  'blue-ocean': 'blue-ocean',
  'case-study': 'case-study',
  certifications: 'certifications',
  timeline: 'timeline',
  roadmap: 'roadmap',
  'jden-studios': 'jden-studios',
  files: 'files',
}

export function createJackOSActionValidator(urlAllowlist: string[]) {
  return new JackOSActionValidator({ urlAllowlist })
}

export function mapBochActions(
  actions: BochAction[],
  {
    userText,
    validator,
  }: {
    userText: string
    validator?: JackOSActionValidator
  },
): JackOSBochDestination[] {
  const wantsCaseStudy = /case study/i.test(userText)
  const destinations: JackOSBochDestination[] = []
  const validated = validator
    ? validator.validateMany(actions, { max: 3 }).actions
    : actions.slice(0, 3)

  for (const action of validated) {
    switch (action.type) {
      case 'OPEN_RESUME':
        destinations.push({ kind: 'window', id: 'resume' })
        break
      case 'OPEN_CONTACT':
        destinations.push({ kind: 'window', id: 'contact' })
        break
      case 'OPEN_ABOUT':
        destinations.push({ kind: 'window', id: 'about' })
        break
      case 'OPEN_APP': {
        const mapped = APP_TO_WINDOW[action.payload.appId]
        if (mapped && isWindowId(mapped)) destinations.push({ kind: 'window', id: mapped })
        else destinations.push({ kind: 'ignored', reason: 'unknown-app' })
        break
      }
      case 'OPEN_PROJECT': {
        const project = getProjectById(action.payload.projectId)
        if (!project) {
          destinations.push({ kind: 'ignored', reason: 'unknown-project' })
          break
        }
        if (wantsCaseStudy && project.caseStudyAvailable) {
          destinations.push({ kind: 'case-study', projectId: project.id })
          break
        }
        if (project.internalApp && project.internalApp !== 'portfolio') {
          destinations.push({ kind: 'window', id: project.internalApp })
          break
        }
        if (project.internalApp === 'portfolio') {
          destinations.push({ kind: 'window', id: 'portfolio' })
          break
        }
        if (project.caseStudyAvailable) {
          destinations.push({ kind: 'case-study', projectId: project.id })
          break
        }
        destinations.push({ kind: 'window', id: 'projects' })
        break
      }
      case 'FOCUS_WINDOW': {
        const id = action.payload.windowId
        if (id && isWindowId(id)) destinations.push({ kind: 'window', id })
        else destinations.push({ kind: 'ignored', reason: 'unknown-window' })
        break
      }
      case 'OPEN_URL': {
        const href = action.payload.url
        if (!href || !/^https:\/\//i.test(href)) {
          destinations.push({ kind: 'ignored', reason: 'unsafe-url' })
          break
        }
        destinations.push({ kind: 'url', href })
        break
      }
      case 'SHOW_NOTIFICATION':
        destinations.push({
          kind: 'notification',
          title: action.payload.title || 'BOCH',
          body: action.payload.body || '',
        })
        break
      default:
        destinations.push({ kind: 'ignored', reason: 'unsupported' })
    }
  }

  return destinations
}

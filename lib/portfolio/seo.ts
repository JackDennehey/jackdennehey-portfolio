import { PROFILE } from './profile'
import type { SeoCopy } from './types'

export const SEO_COPY: SeoCopy = {
  siteName: PROFILE.productName,
  title: `${PROFILE.name} | ${PROFILE.productName}`,
  ogTitle: `${PROFILE.name} — ${PROFILE.productName}`,
  description: `${PROFILE.name} is a Penn State Brandywine business student. ${PROFILE.productName} is his interactive portfolio: Kickoff, Pocket Pier, 1984 Blue Ocean, Recruiter Mode, and Simple Mode.`,
  ogAlt: `${PROFILE.productName} — ${PROFILE.name}'s interactive portfolio`,
  ogSubtitle: 'Kickoff · Pocket Pier · JackOS',
  keywords: [
    PROFILE.name,
    PROFILE.productName,
    'Jack OS',
    `${PROFILE.name} portfolio`,
    'Penn State Brandywine',
    'Kickoff',
    'Pocket Pier',
    '1984 Blue Ocean',
    'Recruiter Mode',
    'Simple Mode',
    'JDen Studios',
  ],
}

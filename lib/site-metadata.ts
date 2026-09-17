import { PROFILE, SEO_COPY } from './portfolio'

export const SITE_URL = `https://${PROFILE.contact.domain}`
export const SITE_DOMAIN = PROFILE.contact.domain
export const SITE_NAME = SEO_COPY.siteName
export const SITE_AUTHOR = PROFILE.name
export const SITE_TITLE = SEO_COPY.title
export const SITE_OG_TITLE = SEO_COPY.ogTitle
export const SITE_DESCRIPTION = SEO_COPY.description
export const SITE_OG_ALT = SEO_COPY.ogAlt
export const SITE_OG_SUBTITLE = SEO_COPY.ogSubtitle
export const SITE_KEYWORDS = [...SEO_COPY.keywords]

export function getSiteLastModified(): Date | undefined {
  const raw = process.env.VERCEL_GIT_COMMIT_DATE
  if (!raw) return undefined
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

import type { MetadataRoute } from 'next'

const SITE_URL = 'https://jackdennehey.com'
const LAST_UPDATED = new Date('2026-08-02T00:00:00-04:00')

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}

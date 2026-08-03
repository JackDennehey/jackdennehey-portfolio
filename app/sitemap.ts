import type { MetadataRoute } from 'next'
import { SITE_LAST_UPDATED, SITE_URL } from '@/lib/site-metadata'

const LAST_UPDATED = new Date(SITE_LAST_UPDATED)

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_UPDATED,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/simple`,
      lastModified: LAST_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}

import type { MetadataRoute } from 'next'
import { getSiteLastModified, SITE_URL } from '@/lib/site-metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = getSiteLastModified()

  return [
    {
      url: `${SITE_URL}/`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/simple`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}

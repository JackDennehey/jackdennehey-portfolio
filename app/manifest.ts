import type { MetadataRoute } from 'next'
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site-metadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${SITE_AUTHOR} - ${SITE_NAME} Portfolio`,
    short_name: SITE_AUTHOR,
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#eae7df',
    theme_color: '#eae7df',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['portfolio', 'education', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}

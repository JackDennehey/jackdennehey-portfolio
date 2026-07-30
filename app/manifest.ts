import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jack OS',
    short_name: 'Jack OS',
    description:
      'Jack Dennehey’s interactive portfolio for projects, credentials, technical background, and professional direction.',
    start_url: '/',
    display: 'browser',
    background_color: '#eae7df',
    theme_color: '#eae7df',
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
    ],
  }
}

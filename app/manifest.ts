import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jack OS',
    short_name: 'Jack OS',
    description:
      'An interactive retro operating-system portfolio for Jack Dennehey, featuring a network firewall simulation, Timeline, Guestbook, Recruiter Mode, and technical projects.',
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

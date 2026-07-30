import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Press_Start_2P } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
  display: 'swap',
})

const siteUrl = 'https://jackdennehey.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Jack Dennehey — Jack OS',
    template: '%s · Jack OS',
  },
  description:
    'The personal computer of Jack Dennehey — a business student at Penn State exploring technology, cybersecurity, networking, cloud computing, and artificial intelligence. Browse his projects, certifications, and resume.',
  keywords: [
    'Jack Dennehey',
    'Penn State',
    'business student',
    'cybersecurity',
    'networking',
    'cloud computing',
    'artificial intelligence',
    'portfolio',
  ],
  authors: [{ name: 'Jack Dennehey' }],
  creator: 'Jack Dennehey',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Jack Dennehey — Jack OS',
    description:
      'Explore the professional work of Jack Dennehey through an operating-system-inspired portfolio.',
    siteName: 'Jack OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jack Dennehey — Jack OS',
    description:
      'Explore the professional work of Jack Dennehey through an operating-system-inspired portfolio.',
  },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#eae7df',
  width: 'device-width',
  initialScale: 1,
}

const themeInitScript = `
(() => {
  try {
    const key = 'jack-os:interface-theme';
    const stored = window.localStorage.getItem(key);
    const valid = stored === 'light' || stored === 'dark';
    const theme = valid
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  } catch {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.classList.add('light');
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`light ${geistSans.variable} ${pressStart.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

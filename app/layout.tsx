import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import {
  SITE_DESCRIPTION,
  SITE_OG_ALT,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site-metadata'
import './globals.css'

const socialImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: SITE_OG_ALT,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Jack Dennehey',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Jack Dennehey',
    'cybersecurity portfolio',
    'Penn State business student',
    'networking',
    'Cisco Networking Academy',
    'cloud computing',
    'Microsoft Azure AI',
    'artificial intelligence',
    'technology portfolio',
    'Jack OS',
    'Delaware County Community College',
    'cybersecurity certificate',
  ],
  authors: [{ name: 'Jack Dennehey' }],
  creator: 'Jack Dennehey',
  publisher: 'Jack Dennehey',
  alternates: {
    canonical: 'https://jackdennehey.com/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://jackdennehey.com/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'Jack OS',
    locale: 'en_US',
    images: [socialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [socialImage],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: [{ url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
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
    const theme = valid ? stored : 'light';
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
      className="light"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background antialiased">
        <a href="#jack-os-desktop" className="skip-link">
          Skip to Jack OS desktop
        </a>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

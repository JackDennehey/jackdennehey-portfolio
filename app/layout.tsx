import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Press_Start_2P } from 'next/font/google'
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OG_ALT,
  SITE_OG_TITLE,
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Jack Dennehey',
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: `${SITE_AUTHOR} - ${SITE_NAME}`,
  authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  category: 'technology',
  classification: 'Portfolio',
  alternates: {
    canonical: `${SITE_URL}/`,
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
    url: `${SITE_URL}/`,
    title: SITE_OG_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [socialImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_OG_TITLE,
    description: SITE_DESCRIPTION,
    images: [socialImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: SITE_AUTHOR,
    statusBarStyle: 'default',
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  referrer: 'strict-origin-when-cross-origin',
  generator: 'Next.js',
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
      className={`light ${geistSans.variable} ${pressStart.variable}`}
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

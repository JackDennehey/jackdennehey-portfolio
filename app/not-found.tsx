import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'File Not Found',
  description: 'The requested Jack OS item could not be located.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-desktop p-6 text-foreground paper-texture">
      <section className="mx-auto mt-16 max-w-xl overflow-hidden bg-paper os-border os-shadow-lg">
        <header className="flex h-8 items-center border-b-2 border-border bg-titlebar px-2 text-titlebar-foreground">
          <span className="font-pixel text-[10px] leading-none">Jack OS</span>
          <span aria-hidden className="titlebar-lines ml-3 h-3 flex-1 opacity-60" />
        </header>
        <div className="space-y-4 p-6">
          <p className="font-pixel text-[10px] leading-relaxed text-muted-foreground">
            {'> file lookup failed'}
          </p>
          <h1 className="font-pixel text-base leading-relaxed text-foreground">
            File Not Found
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The item you requested could not be located.
          </p>
          <Link
            href="/"
            className="os-border inline-flex bg-card px-3 py-2 font-pixel text-[9px] leading-relaxed text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground focus-visible:bg-foreground focus-visible:text-primary-foreground focus-visible:outline-none"
          >
            Return to Jack OS
          </Link>
        </div>
      </section>
    </main>
  )
}

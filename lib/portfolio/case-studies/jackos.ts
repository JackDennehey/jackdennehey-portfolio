import type { CaseStudy } from './types'

export const JACKOS_CASE_STUDY: CaseStudy = {
  projectId: 'jackos',
  tone: 'system',
  kicker: 'This system',
  summary:
    'JackOS is the operating-system-inspired portfolio you are using now. It presents professional work through windows, a dock, a purpose-built mobile shell, Recruiter Mode, and first-class project apps rather than a static landing page.',
  sections: [
    {
      id: 'what',
      kind: 'prose',
      title: 'What it is',
      body: 'JackOS is an interactive desktop portfolio designed as a modern interpretation of classic monochrome computing. Visitors open applications, move windows, and follow the same product through a navigational mobile shell. The work is the environment, not a brochure sitting in front of it.',
    },
    {
      id: 'why',
      kind: 'prose',
      title: 'Why it exists',
      body: 'JackOS exists so visitors can understand the work through a usable system instead of a conventional brochure site. The product name stays JackOS: an evolution of this repository, not a rewrite and not a numbered sequel.',
    },
    {
      id: 'role',
      kind: 'prose',
      title: 'What Jack did',
      body: 'Jack is the designer and developer of the platform: application registry, window management, desktop and mobile shells, Recruiter Mode, Network Firewall, first-class project apps, and the canonical portfolio content model that feeds Portfolio.app.',
    },
    {
      id: 'architecture',
      kind: 'module',
      title: 'How it works',
      body: 'Post-M5 JackOS separates system mechanics, shell presentation, applications, and canonical content. Select a layer to read what it actually owns.',
      module: 'jackos-architecture',
    },
    {
      id: 'evolution',
      kind: 'process',
      title: 'What changed',
      body: 'Public timeline entries and architecture notes document the product’s expansion. Milestone labels M1–M5 come from the architecture notes in this repository; they describe system work, not invented shipping dates.',
      steps: [
        'July 2026 — JackOS launched as a public operating-system-inspired portfolio.',
        'V2 (5A / 5B / 5C) — Recruiter Mode, J.D., Timeline, Guestbook, and Network Firewall, plus search, SEO, accessibility, and wallpaper work.',
        'V3A — Identity update: custom icons, Road Map, achievements, system status, Simple Mode, and branding.',
        'V3B — 1984 Blue Ocean, the flagship interactive keynote inside JackOS.',
        'M1 — System foundation: registry, persistence catalog, and durable OS conventions.',
        'M2 — Window Manager extracted from desktop.tsx into dedicated lifecycle and geometry modules.',
        'M3 — Desktop shell: dock, remembered geometry, system menu and status.',
        'M4 — Purpose-built mobile shell. Desktop stays spatial; mobile is Home → fullscreen app → Home.',
        'M5 — Canonical portfolio content in lib/portfolio and first-class Portfolio.app.',
      ],
    },
    {
      id: 'decisions',
      kind: 'decisions',
      title: 'Design and technical decisions',
      decisions: [
        {
          title: 'Two interaction models, one product',
          body: 'Architecture notes state the split directly: desktop JackOS is spatial (windows). Mobile JackOS is navigational (Home → fullscreen app → Home). The mobile breakpoint is owned in one query, and OsWindow chrome is not mounted on phones.',
        },
        {
          title: 'Window mechanics leave desktop.tsx',
          body: 'Authoritative window lifecycle lives in the Window Manager. desktop.tsx orchestrates boot, hash routing, Spotlight, sounds, and content switching. It does not own resize math, cascade, or remembered geometry.',
        },
        {
          title: 'Canonical content, product copy beside it',
          body: 'Profile, projects, experience, education, skills, and credentials live in lib/portfolio. Kickoff, Pocket Pier, and Blue Ocean keep product-specific presentation copy in their own modules and are referenced from the catalog. That split is documented as intentional, not accidental duplication.',
        },
        {
          title: 'Home does not destroy desktop state',
          body: 'On mobile, Home is a navigation flag. Returning Home does not close Window Manager windows, so desktop geometry survives a brief phone-sized viewport.',
        },
        {
          title: 'Single-instance windows and remembered normal geometry',
          body: 'Windows are single-instance per app id. Minimized and maximized status is session-only. Normal x/y/width/height may be remembered after a completed desktop move or resize, then clamped before reuse. Mobile open/home must not persist phone-sized geometry.',
        },
      ],
    },
    {
      id: 'stack',
      kind: 'list',
      title: 'Implementation',
      items: [
        'Next.js App Router with React and TypeScript',
        'Tailwind for JackOS-native chrome rather than a macOS or Windows clone',
        'WINDOW_APPS as the application registry for titles, icons, sizes, hashes, and Spotlight metadata',
        'Hash routing for deep links without breaking existing slugs',
        'Persistence catalog in lib/os/storage.ts so components do not invent localStorage keys',
      ],
    },
    {
      id: 'result',
      kind: 'prose',
      title: 'What exists today',
      body: 'A public interactive portfolio with desktop windows, a purpose-built mobile shell, Recruiter Mode, Network Firewall, 1984 Blue Ocean, Kickoff and Pocket Pier product apps, and Portfolio.app reading from canonical project records. Command palette, Timeline, Road Map, achievements, Simple Mode, and a moderated Guestbook remain first-class system surfaces.',
    },
  ],
}

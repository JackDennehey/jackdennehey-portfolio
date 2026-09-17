import type { CaseStudyDiagram } from './types'

export const JACKOS_ARCHITECTURE: CaseStudyDiagram = {
  caption: 'JackOS system map after Portfolio Core',
  textEquivalent:
    'JackOS is layered. The system layer holds the app registry, window manager, geometry, persistence catalog, and Spotlight commands. The shell layer chooses desktop or mobile presentation. Applications render window content. Canonical portfolio content in lib/portfolio feeds Portfolio.app and other professional surfaces. Hash routing and remembered window geometry sit with the system layer rather than inside individual apps.',
  nodes: [
    {
      id: 'registry',
      label: 'App registry',
      detail:
        'WINDOW_APPS owns ids, titles, icons, default sizes, hashes, dock pins, launcher order, and Spotlight app rows. Adding an app starts here.',
    },
    {
      id: 'shell',
      label: 'Desktop / mobile shell',
      detail:
        'desktop.tsx orchestrates the session. On desktop it mounts windows, dock, menu bar, and the icon rail. On mobile it mounts a Home screen and one fullscreen app. Same product, two interaction models.',
    },
    {
      id: 'wm',
      label: 'Window manager',
      detail:
        'use-window-manager.ts owns open, close, focus, minimize, maximize, move, and resize. Geometry helpers and remembered normal bounds live beside it. OsWindow is desktop chrome only.',
    },
    {
      id: 'apps',
      label: 'Applications',
      detail:
        'Window content lives in components/os/content. Recruiter Mode, Firewall, Kickoff, Pocket Pier, Blue Ocean, and Portfolio.app are applications, not extra shells.',
    },
    {
      id: 'content',
      label: 'Canonical portfolio content',
      detail:
        'lib/portfolio is the source of professional facts. Kickoff, Pocket Pier, and Blue Ocean keep product copy in their own modules and are referenced from the catalog.',
    },
  ],
}

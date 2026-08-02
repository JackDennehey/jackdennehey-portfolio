import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function JackIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function JackSystemIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="12" />
      <path d="M7 9h2M11 9h6M7 12h2M11 12h6" />
      <path d="M8 20h8M10 17v3M14 17v3" />
    </JackIcon>
  )
}

export function JackIdIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="5" y="4" width="14" height="16" />
      <path d="M8 8h8" />
      <rect x="9" y="10" width="6" height="4" />
      <path d="M8 17h8" />
    </JackIcon>
  )
}

export function JackProjectsIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="7" height="6" />
      <rect x="13" y="5" width="7" height="6" />
      <rect x="4" y="13" width="7" height="6" />
      <path d="M11 8h2M7 11v2M11 16h4M16 11v5" />
    </JackIcon>
  )
}

export function JackBadgeIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M8 4h8l2 3v6l-6 3-6-3V7z" />
      <path d="M10 8h4M9 11h6" />
      <path d="M10 16v5l2-2 2 2v-5" />
    </JackIcon>
  )
}

export function JackDocumentIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 10h6M9 14h6M9 18h4" />
    </JackIcon>
  )
}

export function JackMailIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="6" width="16" height="12" />
      <path d="M5 7l7 6 7-6" />
      <path d="M5 17l5-5M19 17l-5-5" />
    </JackIcon>
  )
}

export function JackScanlinesIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="12" />
      <path d="M7 9h10M7 12h10M7 15h10" />
      <path d="M9 20h6" />
    </JackIcon>
  )
}

export function JackScanlinesOffIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="12" />
      <path d="M8 10h8M8 14h8M9 20h6M5 20L19 4" />
    </JackIcon>
  )
}

export function JackThemeLightIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="5" y="5" width="14" height="14" />
      <path d="M12 8v8M8 12h8" />
      <path d="M4 12H2M22 12h-2M12 4V2M12 22v-2" />
    </JackIcon>
  )
}

export function JackThemeDarkIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="5" y="5" width="14" height="14" />
      <path d="M15 8a5 5 0 1 0 0 8" />
      <path d="M16 10h2M16 14h2" />
    </JackIcon>
  )
}

export function JackSoundOnIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M4 10h4l5-4v12l-5-4H4z" />
      <path d="M16 9l2 3-2 3" />
      <path d="M19 7l3 5-3 5" />
    </JackIcon>
  )
}

export function JackSoundOffIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M4 10h4l5-4v12l-5-4H4z" />
      <path d="M16 9l6 6M22 9l-6 6" />
    </JackIcon>
  )
}

export function JackPersonalizeIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="12" />
      <path d="M7 9h6M7 13h4M9 20h6" />
      <path d="M15 8v7M13 10h4M13 13h4" />
    </JackIcon>
  )
}

export function JackWallpapersIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="13" />
      <path d="M7 15l4-4 3 3 2-2 2 3" />
      <path d="M15 9h2M9 21h6M12 18v3" />
    </JackIcon>
  )
}

export function JackSecretsIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
      <rect x="5" y="10" width="14" height="10" />
      <path d="M12 14v3M10 14h4" />
      <path d="M8 4h1M15 4h1" />
    </JackIcon>
  )
}

export function JackRecruiterIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="8" width="16" height="11" />
      <path d="M9 8V6h6v2" />
      <path d="M4 12h16M11 12v2h2v-2" />
      <rect x="7" y="4" width="4" height="4" />
      <path d="M14 5h4M14 7h4" />
    </JackIcon>
  )
}

export function JackAssistantIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="12" />
      <path d="M7 9h3M12 9h5M7 12h5M14 12h3" />
      <path d="M8 21l3-4h5" />
      <path d="M7 15h1M10 15h1M13 15h1" />
    </JackIcon>
  )
}

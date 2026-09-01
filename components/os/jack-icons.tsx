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
      <image
        href="/images/jd/jd-icon.png"
        x="2"
        y="2"
        width="20"
        height="20"
        preserveAspectRatio="xMidYMid meet"
      />
    </JackIcon>
  )
}

export function JackTimelineIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M7 4v16" />
      <rect x="10" y="4" width="9" height="4" />
      <rect x="10" y="10" width="9" height="4" />
      <rect x="10" y="16" width="9" height="4" />
      <path d="M5 6h4M5 12h4M5 18h4" />
    </JackIcon>
  )
}

export function JackBlueOceanIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" fill="#07131f" stroke="#c1a36a" strokeWidth="2" />
      <rect x="6" y="6" width="12" height="12" fill="#12344d" />
      <path d="M6 13h12" stroke="#d8ccb0" strokeWidth="1.5" />
      <path d="M6 15c2-1 4-1 6 0s4 1 6 0" stroke="#7fb0c8" strokeWidth="1.5" />
      <path d="M6 17c2-1 4-1 6 0s4 1 6 0" stroke="#4d7d98" strokeWidth="1.5" />
      <path d="M12 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#d6b96f" />
      <path d="M4 4h4M16 4h4M4 20h4M16 20h4" stroke="#f2e4bc" strokeWidth="1" />
    </svg>
  )
}

export function JackGuestbookIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M5 5h7v15H5zM12 5h7v15h-7" />
      <path d="M8 9h2M8 13h2M14 9h3M14 13h3" />
      <path d="M14 17l3-2 1 1-3 2z" />
    </JackIcon>
  )
}

export function JackFirewallIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <path d="M12 3l8 3v6c0 4.5-3.2 7.2-8 9-4.8-1.8-8-4.5-8-9V6z" />
      <path d="M8 8h8M7 11h10M8 14h8" />
      <path d="M12 6v11" />
      <path d="M3 10h3M18 10h3M3 15h3M18 15h3" />
      <rect x="10" y="10" width="4" height="4" />
    </JackIcon>
  )
}

export function JackKickoffIcon(props: IconProps) {
  return (
    <JackIcon {...props}>
      <rect x="4" y="5" width="16" height="14" />
      <path d="M12 5v14" />
      <path d="M4 12h16" />
      <path d="M7 8h3M14 8h3M7 16h3M14 16h3" />
      <rect x="10" y="10" width="4" height="4" />
    </JackIcon>
  )
}

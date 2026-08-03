import type { SVGProps } from 'react'

export const APP_ICON_IMAGE_SOURCES = {
  about: '/photos/app-icons/north-star.png',
  guestbook: '/photos/app-icons/guestbook.png',
  resume: '/photos/app-icons/resume.png',
  roadmap: '/photos/app-icons/roadmap.png',
  secrets: '/photos/app-icons/secrets.png',
  certifications: '/photos/app-icons/credentials.png',
} as const

type AppIconImageId = keyof typeof APP_ICON_IMAGE_SOURCES

function createAppImageIcon(id: AppIconImageId, title: string) {
  const AppImageIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <image
        href={APP_ICON_IMAGE_SOURCES[id]}
        x="0"
        y="0"
        width="24"
        height="24"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  )

  AppImageIcon.displayName = `${id}AppImageIcon`
  return AppImageIcon
}

export const JackAboutImageIcon = createAppImageIcon('about', 'About Me')
export const JackGuestbookImageIcon = createAppImageIcon('guestbook', 'Guestbook')
export const JackResumeImageIcon = createAppImageIcon('resume', 'Resume')
export const JackRoadmapImageIcon = createAppImageIcon('roadmap', 'Road Map')
export const JackSecretsImageIcon = createAppImageIcon('secrets', 'Secrets')
export const JackCredentialsImageIcon = createAppImageIcon('certifications', 'Credentials')

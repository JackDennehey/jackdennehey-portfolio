export const GUESTBOOK_PAGE_SIZE = 10
export const GUESTBOOK_DISPLAY_NAME_LIMIT = 50
export const GUESTBOOK_ORGANIZATION_LIMIT = 80
export const GUESTBOOK_MESSAGE_LIMIT = 500

export type GuestbookPublicEntry = {
  id: string
  displayName: string
  organization: string | null
  message: string
  signedAt: string
}

export type GuestbookAdminEntry = {
  id: string
  displayName: string
  organization: string | null
  message: string
  originalText: string
  status: 'pending' | 'approved' | 'rejected' | 'blocked'
  createdAt: string
  approvedAt: string | null
  moderationReason: string | null
  userAgentCategory: string | null
}

export type GuestbookFieldErrors = Partial<
  Record<'displayName' | 'organization' | 'message' | 'consent', string>
>

export type GuestbookEntriesResponse =
  | {
      ok: true
      entries: GuestbookPublicEntry[]
      nextPage: number | null
    }
  | {
      ok: false
      message: string
    }

export type GuestbookSubmitResponse =
  | {
      ok: true
      status: 'pending'
      message: 'Message received.'
      detail: string
    }
  | {
      ok: false
      code:
        | 'configuration'
        | 'validation'
        | 'turnstile'
        | 'rate_limited'
        | 'moderation'
        | 'server'
      message: string
      fieldErrors?: GuestbookFieldErrors
    }

export type GuestbookSubmitPayload = {
  displayName: string
  organization?: string
  message: string
  consent: boolean
  turnstileToken: string
}

export const GUESTBOOK_PUBLIC_GUIDELINES = [
  'Be respectful.',
  'Do not include private contact information.',
  'No links, advertisements, or spam.',
  'Messages appear only after review.',
  "Keep entries related to Jack OS, Jack's work, or professional feedback.",
] as const

import { NextRequest, NextResponse } from 'next/server'
import { submitGuestbookEntry } from '@/lib/guestbook-server'
import type { GuestbookSubmitPayload } from '@/lib/guestbook'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16_000

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get('content-length') ?? '0')
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        code: 'validation',
        message: 'This message could not be submitted. Review the Guestbook guidelines and try again.',
      },
      { status: 400 },
    )
  }

  let payload: GuestbookSubmitPayload
  try {
    payload = (await request.json()) as GuestbookSubmitPayload
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: 'validation',
        message: 'Check the highlighted fields and try again.',
      },
      { status: 400 },
    )
  }

  const result = await submitGuestbookEntry(payload, request.headers)
  const status =
    result.ok ? 202 : result.code === 'configuration' ? 503 : result.code === 'rate_limited' ? 429 : 400

  return NextResponse.json(result, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

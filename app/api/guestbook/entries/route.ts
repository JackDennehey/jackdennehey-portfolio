import { NextRequest, NextResponse } from 'next/server'
import { listApprovedGuestbookEntries } from '@/lib/guestbook-server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? '0')
  const result = await listApprovedGuestbookEntries(Number.isFinite(page) ? page : 0)

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: {
      'Cache-Control': result.ok ? 'public, max-age=30, stale-while-revalidate=120' : 'no-store',
    },
  })
}

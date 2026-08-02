import { NextRequest, NextResponse } from 'next/server'
import {
  listAdminGuestbookEntries,
  moderateGuestbookEntry,
} from '@/lib/guestbook-server'

export const runtime = 'nodejs'

function getBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request)
  const status = request.nextUrl.searchParams.get('status') ?? 'pending'
  const page = Number(request.nextUrl.searchParams.get('page') ?? '0')
  const search = request.nextUrl.searchParams.get('search') ?? ''

  if (!['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
    return NextResponse.json({ ok: false, message: 'Invalid status' }, { status: 400 })
  }

  const result = await listAdminGuestbookEntries({
    token,
    status: status as 'pending' | 'approved' | 'rejected' | 'blocked',
    page: Number.isFinite(page) ? page : 0,
    search,
  })

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function PATCH(request: NextRequest) {
  const token = getBearerToken(request)
  let payload: { id?: unknown; action?: unknown }

  try {
    payload = (await request.json()) as { id?: unknown; action?: unknown }
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 })
  }

  if (
    typeof payload.id !== 'string' ||
    !['approve', 'reject', 'block'].includes(String(payload.action))
  ) {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 })
  }

  const result = await moderateGuestbookEntry({
    token,
    id: payload.id,
    action: payload.action as 'approve' | 'reject' | 'block',
  })

  return NextResponse.json(result, {
    status: result.ok ? 200 : result.status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

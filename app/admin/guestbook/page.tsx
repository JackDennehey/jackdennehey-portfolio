import type { Metadata } from 'next'
import { GuestbookAdmin } from '@/components/admin/guestbook-admin'

export const metadata: Metadata = {
  title: 'Guestbook Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default function GuestbookAdminPage() {
  return <GuestbookAdmin />
}

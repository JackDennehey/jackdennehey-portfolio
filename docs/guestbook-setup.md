# Jack OS Guestbook Setup

Jack OS 5B adds a moderated public Guestbook. Visitors do not create accounts, and
public entries appear only after review.

## Supabase

1. Create a Supabase project on the free plan.
2. Run `supabase/migrations/20260802000000_create_guestbook_entries.sql` in the SQL editor or through the Supabase CLI.
3. Confirm `guestbook_entries` exists and Row Level Security is enabled.
4. Confirm `guestbook_public_entries` returns only approved public fields.
5. Keep the service-role key server-only. Never expose it in browser code.

## Admin User

1. In Supabase Auth, create Jack's admin user.
2. Set `GUESTBOOK_ADMIN_EMAIL` to that exact email address.
3. The private dashboard is `/admin/guestbook`.
4. The dashboard uses Supabase Auth for sign-in, then server routes verify the token and email before moderation actions.

## Cloudflare Turnstile

1. Create a Turnstile widget for `jackdennehey.com`.
2. Add the public site key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. Add the secret key as `TURNSTILE_SECRET_KEY`.
4. Tokens are verified server-side before a message can enter the pending queue.

For local development only, you may set both Turnstile values to `dev-bypass`.
Do not use that bypass in production.

## Vercel Environment Variables

Public browser variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Server-only variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `GUESTBOOK_FINGERPRINT_SECRET`
- `GUESTBOOK_ADMIN_EMAIL`

`GUESTBOOK_FINGERPRINT_SECRET` should be a long random value. Jack OS uses it to
create a rotating one-way abuse-prevention fingerprint. Raw IP addresses are not
stored or displayed.

## Testing Flow

1. Open Jack OS and launch Guestbook.
2. Submit a normal message and confirm the visitor sees `Message received.`
3. Confirm the message is inserted as `pending`.
4. Confirm pending messages are not visible in the public Guestbook.
5. Open `/admin/guestbook`, sign in, and approve the entry.
6. Refresh Guestbook and confirm the approved entry appears.
7. Reject and block test entries from the admin dashboard.
8. Test missing Turnstile token, repeated submissions, duplicate messages, HTML tags, script-like input, URLs, oversized fields, and excessive repeated characters.

Keep prohibited moderation fixtures private and server-side.

## Free-Tier Notes

- Guestbook reads are paginated.
- Public reads happen only when the Guestbook app opens or Load More/Refresh is selected.
- There is no continuous polling.
- Firewall traffic is simulated locally and does not use the database.
- Back up approved entries periodically through Supabase exports.

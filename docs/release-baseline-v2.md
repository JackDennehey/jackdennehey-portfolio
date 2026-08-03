# Jack OS V2 Production Baseline

## Approved Baseline

- Commit: `a7cfd9456d65d69ec4f05092873edf7ea66728ab`
- Branch state at V3A start: `main` and `origin/main` both pointed to this commit after remote refresh.
- Merge label: `Merge pull request #16 from JackDennehey/jack-os-v5-phase-5c`
- V3A branch: `jack-os-v3-phase-3a`

## Included V2 Systems

- Recruiter Mode as a flagship professional overview.
- Network Firewall as the flagship educational simulation.
- Timeline application with oldest-first storytelling and optional newest-first sorting.
- Moderated Guestbook architecture with Turnstile-backed submission flow.
- J.D. local portfolio assistant and left-side desktop widget.
- Wallpapers app, concept art, hidden wallpapers, and Secrets unlocks.
- Corrected desktop layout: Clock, Calendar, and J.D. on the left; application icons on the right; open center workspace.
- Simplified top menu with Jack OS, System, About, Search, Help, theme, CRT, sound, and clock controls.
- Centralized sound effects, startup sound, desktop ambience, achievement sound, and optional hourly chime.
- Custom Jack Dennehey browser branding and metadata.
- Final V2 Timeline entries and V2.2 desktop watermark.
- Light and dark theme behavior.

## Constraints To Preserve

- Do not rebuild stable V2 systems when extending them.
- Do not invert the desktop layout or move apps back to the left.
- Preserve Recruiter Mode muted-gold treatment and Network Firewall blue flagship treatment.
- Preserve public wallpaper IDs and hidden wallpaper unlock persistence.
- Preserve first-visit Welcome behavior: one Welcome window appears only for first launch unless preferences are reset.
- Preserve mobile app launcher behavior and mobile fullscreen windows.
- Preserve local-only preference and achievement storage; do not add accounts, analytics, or external infrastructure.

## Baseline Validation

Before V3A edits:

- `pnpm exec tsc --noEmit` passed.
- `pnpm build` passed.
- `git diff --check` passed.
- Local dev server started on `127.0.0.1:3000`.
- `/` returned `200` and contained Jack OS content.

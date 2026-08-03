# Jack OS Architecture Notes

Stable implementation notes for future Jack OS update passes. Keep this document focused on entry points and durable conventions rather than transient UI details.

## Application Registry

- Window applications are registered in `components/os/apps.tsx` through `WINDOW_APPS`.
- Desktop and mobile launcher entries are registered in `DESKTOP_ITEMS` in the same file.
- Hash routing for window apps is centralized in `WINDOW_HASH_SLUGS`, `getWindowHash`, and `getWindowIdFromHash`.
- Application icon components use the shared `WindowApp.Icon` contract, so the same icon renders in desktop shortcuts, mobile launcher, command palette, title bars, and minimized-window strip.
- Custom raster app icons are centralized in `components/os/app-image-icons.tsx`.

## Window Manager

- `components/os/desktop.tsx` owns desktop boot state, open windows, window order, hash opening, first-visit welcome behavior, command registration, and application content routing.
- `components/os/os-window.tsx` owns window chrome, title-bar dragging, focus affordances, close/minimize/maximize controls, and mobile fullscreen presentation.
- Recruiter Mode and Network Firewall are auto-maximized on desktop through `AUTO_MAXIMIZED_WINDOW_IDS`.
- `components/os/minimized-window-strip.tsx` renders minimized windows from the central app registry.

## Desktop Layout

- Desktop widgets live on the left side in `components/os/desktop.tsx`: clock, calendar, and J.D.
- Application icons live in a right-side launcher rail and keep the center of the wallpaper open as the workspace.
- Mobile uses the OS-style app grid only when no app window is open.
- J.D. is available as a left widget and mobile launcher item; it is intentionally hidden from the desktop app rail.

## Icon Registry

- System-drawn SVG icons live in `components/os/jack-icons.tsx`.
- Branded external icons live in `components/os/brand-icons.tsx`.
- Custom PNG application icons live under `public/photos/app-icons/` and are exposed through `components/os/app-image-icons.tsx`.
- Recruiter Mode keeps the muted-gold flagship treatment and Network Firewall keeps the blue flagship treatment through shared tone styling.

## Wallpaper Registry

- Wallpaper metadata is centralized in `lib/wallpapers.ts`.
- `DEFAULT_WALLPAPER_ID` remains `jack-os-default`.
- Collections are `current`, `concept`, and `hidden`.
- Wallpaper display, selected-wallpaper preload, preview thumbnails, and fallback behavior are handled in `components/os/wallpaper-manager.tsx`.
- The Wallpapers app UI is in `components/os/content/wallpapers-content.tsx`.
- Secrets can unlock hidden wallpapers without changing public wallpaper IDs.

## Sound System

- Semantic sound sources and playback methods live in `components/os/use-sound-effects.ts`.
- Global sound preference parsing lives in `lib/sound-preferences.ts`.
- Startup audio, ambience, app open, close, first wallpaper, guestbook sign, achievement, hourly chime, and secret unlock sounds all route through the same hook.
- Hourly chime scheduling lives in `components/os/use-hourly-chime.ts`.

## Achievement Storage

- Achievement constants and storage keys live in `lib/achievements.ts`.
- `jack-os:achievements.v1` stores stable achievement IDs.
- Interactive 5B app exploration and firewall preset completion use separate local keys for prerequisite tracking.
- Achievement playback is routed through `useSoundEffects().achievementUnlocked(...)`.

## Shared Portfolio Data

- Portfolio facts live in `lib/portfolio-data.ts`.
- Recruiter-oriented sections and portfolio knowledge live in `lib/portfolio-knowledge.ts`.
- The local J.D. assistant response engine lives in `lib/jd-assistant.ts`.
- Timeline entries live in `lib/timeline-data.ts`.

## Timeline Data

- Timeline rendering is in `components/os/content/timeline-content.tsx`.
- The default sort order is oldest first.
- Stable explicit ordering is handled in the Timeline component; do not rely on ambiguous month strings alone for same-month releases.

## Theme And CRT Behavior

- Theme persistence uses `jack-os:interface-theme`.
- Theme parsing lives in `lib/interface-theme.ts`; the hook is `components/os/use-interface-theme.ts`.
- Initial theme hydration is handled by the inline script in `app/layout.tsx`.
- CRT scanlines are desktop state in `components/os/desktop.tsx`; Recruiter Mode disables the visible CRT effect while it is open.

## localStorage Naming Conventions

- Desktop preferences: `jack-os.desktop-preferences.v1`
- Sound Effects: `jack-os:sound-effects-enabled`
- First wallpaper sound completion: `jack-os:first-wallpaper-sound-played`
- Interface theme: `jack-os:interface-theme`
- Secrets: `jack-os:unlocked-secrets.v1`
- Achievements: `jack-os:achievements.v1`
- Interactive app tracking: `jack-os:interactive-apps-opened.v1`
- Firewall preset completions: `jack-os:firewall-presets-completed.v1`

## Release And Branch Conventions

- V3A work starts from the final approved V2 production-candidate merge on `main`.
- V3A implementation branch: `jack-os-v3-phase-3a`.
- Do not push, merge, deploy, or modify `main` during local implementation passes.
- Keep V3A as one public release made from focused internal commits.

# Jack OS Architecture Notes

Stable implementation notes after JackOS M2 (Window Manager). Keep this document focused on entry points and durable conventions rather than transient UI details.

JackOS is an evolution of this repository, not a rewrite. Product name remains **JackOS**.

## System Map

```
JackOS
|-- System
|   |-- Window geometry + chrome constants  lib/os/window-geometry.ts
|   |-- Window manager                      components/os/use-window-manager.ts
|   |-- Remembered window geometry          lib/os/window-memory.ts
|   |-- Window chrome                       components/os/os-window.tsx
|   |-- App registry                        components/os/apps.tsx
|   |-- Persistence catalog                 lib/os/storage.ts
|   |-- Command palette app commands        components/os/build-app-commands.ts
|
|-- Shell
|   |-- Desktop                             components/os/desktop.tsx
|   |-- Menu bar / widgets / minimized strip
|   |-- Context menu                        components/os/desktop-context-menu.tsx
|   |-- Command palette                     components/os/command-palette.tsx
|   |-- Boot                                components/os/boot-screen.tsx
|
|-- Apps
|   |-- Window content                      components/os/content/*
|   |-- JDEN STUDIOS (system entity)        components/os/jden-launch.tsx
|
|-- Content
    |-- Projects / about / credentials      lib/portfolio-data.ts
    |-- Recruiter knowledge                 lib/portfolio-knowledge.ts
    |-- Timeline                            lib/timeline-data.ts
    |-- J.D. assistant                      lib/jd-assistant.ts
```

## Application Registry

- Window applications are registered in `components/os/apps.tsx` through `WINDOW_APPS`.
- Adding an app should start in `WINDOW_APPS` with id, title, icon, default size, description, keywords, and optional `autoMaximize` / `minWidth` / `minHeight` / `resizable` / `desktopLabel` / command-palette fields.
- Desktop and mobile launcher order is `DESKTOP_LAUNCHER_APP_IDS`; `DESKTOP_ITEMS` is derived from that list plus GitHub/LinkedIn links.
- Command-palette app rows are derived from `COMMAND_PALETTE_APP_IDS` via `buildAppOpenCommands`.
- Hash routing is `WINDOW_HASH_SLUGS`, `getWindowHash`, and `getWindowIdFromHash`.
- Home is launched from Welcome / first visit, not the desktop icon rail.
- JDEN STUDIOS is a registered window plus a system-level desktop artifact; it is not a desktop launcher icon.

## Window Manager

- Authoritative window lifecycle lives in `components/os/use-window-manager.ts`.
- Geometry helpers, cascade, clamp, resize math, maximize bounds, stack z, and chrome metrics live in `lib/os/window-geometry.ts`.
- `components/os/desktop.tsx` orchestrates the shell: boot, hash routing, command palette, Blue Ocean launch context, sounds, achievements, overlays, and `renderContent`. It does not own window mechanics.
- `components/os/os-window.tsx` owns window chrome, title-bar dragging, desktop edge/corner resize hit targets, focus affordances, close/minimize/maximize controls, and mobile fullscreen presentation.
- Recruiter Mode and Network Firewall auto-maximize on desktop through `WindowApp.autoMaximize`.
- Windows are single-instance per `WindowId`. Minimized/maximized status is session-only.
- Normal geometry (`x`, `y`, `width`, `height`) may be remembered in `jack-os:window-geometry.v1` after a completed move or resize, then clamped before reuse.
- Desktop windows can be resized from edges and corners. Resize is disabled on the current `<=640px` fullscreen layout and while a window is maximized.
- `components/os/minimized-window-strip.tsx` renders minimized windows from the central app registry.

## Persistence

- Canonical keys and helpers live in `lib/os/storage.ts`.
- Domain modules re-export the same key strings so existing imports keep working.
- Do not invent new localStorage keys inside components. Add them to the catalog first.
- Intentionally **not** persisted: CRT scanlines, z-order, minimized/maximized status, boot state, launch context.
- Guestbook admin token and Blue Ocean in-progress session are sessionStorage only.

## Desktop Layout

- Desktop widgets live on the left side in `components/os/desktop.tsx`: clock, calendar, and J.D.
- Application icons live in a right-side launcher rail and keep the center of the wallpaper open as the workspace.
- Mobile (`max-width: 640px`) uses the OS-style app grid only when no app window is open, and windows go fullscreen.
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
- Writes go through `persistAchievementId` so Simple Mode and desktop sound playback share one writer.
- Interactive 5B app exploration uses `recordInteractiveAppOpened`.
- Achievement playback is routed through `useSoundEffects().achievementUnlocked(...)`.

## Shared Portfolio Data

- Portfolio facts live in `lib/portfolio-data.ts`.
- Recruiter-oriented sections and portfolio knowledge live in `lib/portfolio-knowledge.ts`.
- The local J.D. assistant response engine lives in `lib/jd-assistant.ts`.
- Timeline entries live in `lib/timeline-data.ts`.

## Theme And CRT Behavior

- Theme persistence uses `JACK_OS_STORAGE_KEYS.interfaceTheme`.
- Theme parsing lives in `lib/interface-theme.ts`; the hook is `components/os/use-interface-theme.ts`.
- Initial theme hydration is handled by the inline script in `app/layout.tsx`.
- CRT scanlines are desktop state in `components/os/desktop.tsx`; Recruiter Mode disables the visible CRT effect while it is open.

## localStorage Naming Conventions

See `JACK_OS_STORAGE_CATALOG` in `lib/os/storage.ts`. Existing key strings are stable and must not be renamed without a migration.

## Known Scaling Limits (intentionally deferred)

- `desktop.tsx` still coordinates shell concerns (boot, hash, command palette extras, content switch).
- Multi-instance application windows are not implemented.
- Mobile is a compressed desktop, not a purpose-built shell.
- Portfolio facts are duplicated across `portfolio-data`, `portfolio-knowledge`, `jd-assistant`, and SEO metadata.
- `app/globals.css` and keynote CSS are large; visual identity should stay JackOS-native rather than a macOS/Windows clone.

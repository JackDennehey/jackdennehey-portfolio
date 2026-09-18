# JackOS Architecture Notes

JackOS is an evolution of this repository, not a rewrite. The product name is **JackOS**. “Jack OS” remains a spoken/search alias and appears in historical material (V1–V3B). Do not treat V3B as the current product label.

Stable implementation notes after JackOS M10 (BOCH integration). Keep this document focused on entry points and durable conventions rather than transient UI details.

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
|   |-- Spotlight index                     lib/search/
|
|-- Shell
|   |-- Desktop                             components/os/desktop.tsx
|   |-- Mobile breakpoint                   components/os/use-mobile-breakpoint.ts
|   |-- Mobile shell                        components/os/mobile/mobile-shell.tsx
|   |-- Mobile home                         components/os/mobile/mobile-home.tsx
|   |-- Mobile app header                   components/os/mobile/mobile-app-header.tsx
|   |-- Mobile system panel                 components/os/mobile/mobile-system-panel.tsx
|   |-- Menu bar                            components/os/menu-bar.tsx
|   |-- Dock                                components/os/shell/dock.tsx
|   |-- System status                       components/os/shell/system-status.tsx
|   |-- System menu                         components/os/shell/system-menu.tsx
|   |-- Context menu                        components/os/desktop-context-menu.tsx
|   |-- Spotlight                           components/os/spotlight/spotlight.tsx
|   |-- Boot                                components/os/boot-screen.tsx
|
|-- Apps
|   |-- Window content                      components/os/content/*
|   |-- JDEN STUDIOS (system entity)        components/os/jden-launch.tsx
|
|-- Content
    |-- Canonical portfolio facts             lib/portfolio/
    |-- Project case studies                  lib/portfolio/case-studies/
    |-- Compatibility adapters                lib/portfolio-data.ts, lib/portfolio-knowledge.ts
    |-- Timeline                              lib/timeline-data.ts
    |-- J.D. assistant                        lib/jd-assistant.ts
    |-- BOCH public runtime                   lib/boch/
    |-- SEO copy                              lib/portfolio/seo.ts via lib/site-metadata.ts
```

## Application Registry

- Window applications are registered in `components/os/apps.tsx` through `WINDOW_APPS`.
- Adding an app should start in `WINDOW_APPS` with id, title, icon, default size, description, keywords, and optional `autoMaximize` / `minWidth` / `minHeight` / `resizable` / `desktopLabel` / Spotlight fields.
- Desktop dock pins are `DOCK_PINNED_APP_IDS`. Pin IDs resolve through `WINDOW_APPS`; do not duplicate names or icons.
- Desktop and mobile launcher order is `DESKTOP_LAUNCHER_APP_IDS`; `DESKTOP_ITEMS` is derived from that list plus GitHub/LinkedIn links. The desktop rail hides dock-pinned apps so the two launchers do not show the same list.
- Spotlight app rows are derived from `SPOTLIGHT_APP_IDS` via `lib/search/build-index.ts`. There is no parallel command palette.
- Hash routing is `WINDOW_HASH_SLUGS`, `getWindowHash`, and `getWindowIdFromHash`.
- Project case studies use a single `case-study` window. Deep links are `#case-study/{projectId}` with `#project/{projectId}` as an alias. Existing product hashes (`#kickoff`, `#pocket-pier`, `#1984-blue-ocean`, `#portfolio`) still open those apps.
- Home is launched from Welcome / first visit / system menu, not the desktop icon rail.
- JDEN STUDIOS is a registered window plus a system-level desktop artifact; it is not a desktop launcher icon.

## Window Manager

- Authoritative window lifecycle lives in `components/os/use-window-manager.ts`.
- Geometry helpers, cascade, clamp, resize math, maximize bounds, stack z, and chrome metrics live in `lib/os/window-geometry.ts`.
- `components/os/desktop.tsx` orchestrates the shell: boot, hash routing, Spotlight, Blue Ocean launch context, sounds, achievements, overlays, and `renderContent`. It does not own window mechanics.
- `components/os/os-window.tsx` owns desktop window chrome, title-bar dragging, edge/corner resize, focus affordances, and close/minimize/maximize. It is not mounted on mobile.
- Recruiter Mode and Network Firewall auto-maximize on desktop through `WindowApp.autoMaximize`.
- Windows are single-instance per `WindowId`. Minimized/maximized status is session-only.
- Normal geometry (`x`, `y`, `width`, `height`) may be remembered in `jack-os:window-geometry.v1` after a completed desktop move or resize, then clamped before reuse. Mobile open/home must not persist phone-sized geometry.
- `resetWindowLayout()` clears remembered geometry only and re-cascades currently open normal windows. Theme, wallpaper, achievements, and other preferences are left alone. It is desktop-only in the System menu.
- Desktop windows can be resized from edges and corners. Resize is disabled while a window is maximized. Mobile does not present window chrome.
- The desktop dock consumes Window Manager `windows` / `activeWindowId` rather than keeping a parallel running-app list.

## Persistence

- Canonical keys and helpers live in `lib/os/storage.ts`.
- Domain modules re-export the same key strings so existing imports keep working.
- Do not invent new localStorage keys inside components. Add them to the catalog first.
- Intentionally **not** persisted: CRT scanlines, z-order, minimized/maximized status, boot state, launch context.
- Guestbook admin token and Blue Ocean in-progress session are sessionStorage only.

## Desktop Layout

- Menu bar shows JackOS identity, the active application name (or Desktop), JDEN, System, About, Simple, Search (Spotlight), Help, achievements, and real system status.
- Desktop widgets live on the left side in `components/os/desktop.tsx`: clock, calendar, J.D., and the JDEN artifact.
- The dock is the primary desktop launcher for pinned apps and currently running overflow apps. It is desktop-only; it is not mounted on mobile.
- Remaining desktop icons live in a right-side rail (plus GitHub/LinkedIn) and keep the center of the wallpaper open as the workspace.
- J.D. is available as a left widget and mobile launcher item; it is intentionally hidden from the desktop app rail.

## Mobile Shell

- Desktop JackOS is spatial (windows). Mobile JackOS is navigational (Home → fullscreen app → Home). Same product, two interaction modes.
- Breakpoint: `JACK_OS_MOBILE_QUERY` in `components/os/use-mobile-breakpoint.ts` — `(max-width: 640px)` plus short landscape phone viewports `(max-height: 520px) and (max-width: 960px)`.
- `desktop.tsx` owns session/hash/Window Manager/content. It renders `MobileShell` or the desktop tree; it does not mount OsWindow, dock, menu bar, rail, or context menu on mobile.
- Home is a navigation flag. Returning Home does not close Window Manager windows, so desktop geometry survives a brief mobile viewport.
- Mobile app surface shows one fullscreen app with a Home control. No drag, resize, minimize, maximize, or Close-as-window-chrome.
- Mobile system panel reuses real M3 actions (Personalize, Theme, Sound, CRT, Welcome, Recruiter, Simple, Achievements, Restart) plus Spotlight. Reset Window Layout and window-count status are desktop-only.
- Spotlight is the universal local search. Desktop: menu Search or Cmd/Ctrl+K. Mobile: Home Search and System → Spotlight. There is no parallel command palette.
- Window Manager skips clamp/persist while mobile and does not restore minimized windows on mobile enter.
- Viewport uses `viewportFit: 'cover'` and mobile chrome uses `100dvh` / `100svh` plus `env(safe-area-inset-*)`.

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

- Canonical portfolio facts live in `lib/portfolio/`.
- `lib/portfolio/types.ts` defines profile, project, experience, education, skill, credential, and SEO types.
- `lib/portfolio/projects.ts` is the first-class project catalog. Kickoff, Pocket Pier, and Blue Ocean keep product-specific presentation copy in their own modules and are referenced from the catalog.
- Selectors and assistant/search formatters live in `lib/portfolio/selectors.ts` and `lib/portfolio/format.ts`. Integrity checks run when the catalog is imported.
- `lib/portfolio-data.ts` is a compatibility adapter for existing consumers that still expect `PROJECTS[].title`.
- Recruiter presentation plus derived knowledge live in `lib/portfolio-knowledge.ts`.
- The local J.D. assistant response engine lives in `lib/jd-assistant.ts` and reads derived knowledge. J.D. is a guided portfolio Q&A layer, not a second search system and not a BOCH prototype.
- Timeline entries live in `lib/timeline-data.ts` and resolve projects/credentials by canonical id.
- Portfolio.app is registered as `portfolio` in `WINDOW_APPS`, hash `#portfolio`.
- Project case studies live in `lib/portfolio/case-studies/` and render through `components/os/case-study/`. `caseStudyAvailable` is true only when a study record exists. Portfolio.app, Projects, Recruiter Mode, and Simple Mode open the same studies by canonical project id.

## Recruiter Surfaces

Two intentional paths share one content graph (`lib/portfolio`, case studies, Spotlight). Do not add `recruiter-data.ts`, `simple-mode-projects.ts`, or `jd-project-data.ts`.

| Surface | Job |
| --- | --- |
| Welcome (`#` / Home) | Orientation: what this is, who Jack is, where to go. |
| Portfolio.app (`#portfolio`) | Primary portfolio overview **inside** JackOS. |
| Recruiter Mode (`#recruiter`) | Fast evidence brief. Same hashes for sections (`#recruiter/projects`). |
| Simple Mode (`/simple`) | Conventional full-site experience without OS chrome. |
| Resume.app (`#resume`) | Readable resume plus `/jack-dennehey-resume.txt` download. |
| Contact (`#contact`) | Email, GitHub, LinkedIn, site identity. |
| J.D. (`#jd`) | Temporary guided Q&A. Kept during BOCH validation. |
| BOCH (`#boch`) | Public conversational guide. Deployment.PUBLIC. |

### Simple Mode lifecycle

- Simple Mode is a **route**, not in-app window state. Opening it is `window.location.assign('/simple')` (full navigation).
- Return to JackOS is `/`. Browser history is a normal page stack: `/` ↔ `/simple`.
- Direct hashes into JackOS still work from Simple Mode (`/#portfolio`, `/#resume`, `/#contact`, `/#recruiter`, `/#case-study/{id}`).
- `/simple` does not load the desktop shell. That is the performance boundary; do not rewrite architecture solely for theoretical bundle savings.

## Spotlight

- Local search only. No network, no query telemetry, no web search, no LLM.
- Index sources: `WINDOW_APPS` / `SPOTLIGHT_APP_IDS`, canonical `lib/portfolio` records, case studies and sections, timeline, recruiter sections, real system commands, and project links. Small aliases live in `lib/search/aliases.ts` and are not a second content source.
- Query and ranking live in `lib/search/query.ts` and `lib/search/score.ts`. The UI does not own matching.
- Actions are typed (`open-app`, `open-case-study`, `open-case-study-section`, `open-portfolio-section`, `open-recruiter-section`, `open-external`, `system`). `desktop.tsx` routes them through existing open/navigation helpers.
- Case-study section results open the study and scroll `getCaseStudySectionDomId(projectId, sectionId)` into view. They do not use JackOS hashes.
- Adding searchable content: put facts in the canonical source. Rebuild is automatic on import. Integrity checks run when `lib/search` is imported.
- BOCH does not replace Spotlight. Spotlight stays fast and deterministic. BOCH consumes canonical portfolio knowledge, not Spotlight UI scraping.

## System Actions

- Spotlight system commands: Personalize, Ask BOCH, Ask J.D., Copy Email, View Achievements, Reset Window Layout, Restart Session.
- Desktop System menu and mobile System panel expose the same real preferences (theme, sound, CRT, wallpaper/Personalize, Welcome, Recruiter, Simple, Achievements, Restart). Reset Window Layout is desktop-only.
- Context menu repeats desktop workspace actions; it does not invent a second command surface.
- Cmd/Ctrl+K and the menu Search control open Spotlight. There is no parallel command palette.

## Theme And CRT Behavior

- Theme persistence uses `JACK_OS_STORAGE_KEYS.interfaceTheme`.
- Theme parsing lives in `lib/interface-theme.ts`; the hook is `components/os/use-interface-theme.ts`.
- Initial theme hydration is handled by the inline script in `app/layout.tsx`.
- CRT scanlines are desktop state in `components/os/desktop.tsx`; Recruiter Mode disables the visible CRT effect while it is open.

## localStorage Naming Conventions

See `JACK_OS_STORAGE_CATALOG` in `lib/os/storage.ts`. Existing key strings are stable and must not be renamed without a migration.

## Known Scaling Limits (intentionally deferred)

- `desktop.tsx` still coordinates shell concerns (boot, hash, Spotlight extras, content switch).
- Multi-instance application windows are not implemented.
- Mobile has no running-app switcher; Home hides the current app without closing Window Manager state.
- Product-specific Kickoff, Pocket Pier, and Blue Ocean copy remains beside the canonical project catalog by design.
- About area essays and Recruiter/Simple Mode presentation copy remain app-specific.
- `app/globals.css` and keynote CSS are large; visual identity should stay JackOS-native rather than a macOS/Windows clone.
- Compatibility adapters `lib/portfolio-data.ts` and `lib/portfolio-knowledge.ts` remain until remaining consumers are migrated.
- Sitemap `lastModified` is set only when `VERCEL_GIT_COMMIT_DATE` is present. There is no invented “last updated” date.
- Files and Terminal remain future milestones.
- BOCH production intelligence is `GeminiPublicModelProvider` over Google Gemini API (`gemini-3.5-flash`, failover `gemini-3.5-flash-lite`) using server-only `GEMINI_API_KEY`. Development may use `BOCH_PROVIDER=local` (workstation Ollama). Production never uses localhost Ollama. Vercel AI Gateway is optional (`BOCH_PROVIDER=gateway`) and not required for production. Do not use `NEXT_PUBLIC_GEMINI_API_KEY`.
- PUBLIC BOCH sends only public conversation context to Gemini: personality/system prompt, authority block, canonical JACK/BOCH evidence for the current topic, CURRENT evidence when present, a referent-only session block, and the current visitor text. Conversation history is not a fact source. It does not send Personal BOCH memory, private notes, credentials, or the API key. Google's free-tier terms may use prompts to improve their products.
- BOCH visitor sessions: in-memory for local/tests; signed `jackos-boch-ctx` cookie when `BOCH_SESSION_SECRET` or `GUESTBOOK_FINGERPRINT_SECRET` is set; optional Upstash/Vercel KV (`KV_REST_API_URL` + `KV_REST_API_TOKEN`). Cookie-only is durable across serverless instances without pretending KV exists.
- PUBLIC voice: Fenrir (`am_fenrir`) via client-side Kokoro-82M in the visitor's browser. Text never leaves the tab for TTS. No TTS API key, no `/api/boch/speak` synthesis, no Jack Mac sidecar. PERSONAL/local `BOCH_TTS_URL` remains for standalone deployments only.

## BOCH (M10)

BOCH = Behavioral Operating & Cognitive Helper, pronounced BOCK.

```
JackOS BOCH UI
    ↓  BochRequest contractVersion 1
POST /api/boch  (httpOnly sess_* cookie)
    ↓
PublicBochRuntime  (Deployment.PUBLIC fixed)
    ↓
PublicKnowledgeStore ← lib/portfolio adapter
PublicSessionStore (ephemeral, visitor-isolated)
GeminiPublicModelProvider | HostedPublicModelProvider (Ollama/optional Gateway) | GroundedPublicModelProvider (fixture) | Mock | unavailable
JackOSActionValidator
    ↓
BochResponse
    ↓
JackOS maps validated actions → existing openWindow / openCaseStudy / https URLs
    ↓
visitor Speak (optional, explicit)
    ↓
client-side Kokoro-82M Fenrir (browser) → Web Audio
```

- Spotlight remains deterministic local search. BOCH is conversational. They share canonical `lib/portfolio` facts, not a second content graph.
- The JackOS window is only the container. BOCH's interior is the standalone companion: wordmark, dominant 400×400 face, expression renderer, mood/status, single reply, and Fenrir in the visitor's browser. It is not a JackOS-styled chatbot.
- CURRENT MOOD is local presence (NORMAL / CLEAN / WORK / SLEEP / MUTED). PUBLIC remains the trust boundary and cannot be switched from the UI.
- Voice: `BochResponse` text stays on-screen as written. Speech-only `spokenForm` maps BOCH→BOCK, then client-side Kokoro Fenrir plays via Web Audio. Speak is lazy: the model is not downloaded on JackOS load or merely opening BOCH. `POST /api/boch/speak` returns 410 and does not synthesize. Do not expose Ollama or a TTS host to visitors.
- Dock: BOCH is pinned first for discovery. Projects moved to the desktop rail so the dock stays at seven pins.
- Simple Mode and Recruiter Mode have optional Ask BOCH entries. Conventional surfaces remain usable without BOCH.
- J.D. stays available (`#jd`) during M10 validation. Help menu opens BOCH. Replacement decision: KEEP TEMPORARILY until the public-internet acceptance test succeeds with Jack's development machine unavailable.
- Session cookie `jackos-boch-sid` is httpOnly, SameSite=Lax, and `Secure` only on HTTPS. Optional signed `jackos-boch-ctx` carries bounded history across serverless instances. Visitor conversations are session-scoped and never Personal BOCH memory.
- Knowledge authority (M10.7): CASUAL / BOCH / JACK / CURRENT / GENERAL / PRIVATE. Retrieval chooses evidence; the model writes language; JackOS validates actions. Canonical JackOS records win for Jack-specific facts. Time-sensitive world facts use `PublicCurrentInformationProvider` (DuckDuckGo, optional Brave, Wikipedia fallback, runtime clock). If live retrieval is unavailable, BOCH refuses to guess.
- Abuse controls: 2,000-character input, 12-turn history, 400 max output tokens, 45s model timeout, 8s retrieval timeout, 20 requests/session/min plus 180 global/min (in-process; pair with Vercel Firewall in production). Server logs record provider, latency, category, record IDs, and validation — never visitor text. `GET /api/boch` is a PUBLIC health snapshot only (no diagnostic ring, model names, keys, or prompts).

## BOCH M10.7 production path

```
ANY VISITOR
    ↓
jackdennehey.com
    ↓
JackOS BOCH
    ↓
POST /api/boch
    ↓
Deployment.PUBLIC
    ↓
PUBLIC session (cookie and/or KV)
    ↓
classifyPublicQuery → knowledge / current retrieval
    ↓
hosted conversational model (Gemini API, server-only GEMINI_API_KEY)
    ↓
structured BochResponse
    ↓
JackOSActionValidator → JackOS
```

Jack's Mac is not in this chain. `BOCH_PROVIDER=local` is development-only.


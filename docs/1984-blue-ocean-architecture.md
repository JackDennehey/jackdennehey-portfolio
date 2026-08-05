# 1984 Blue Ocean Keynote Architecture

1984 Blue Ocean is a Jack OS desktop application built as a reusable keynote engine. V3B Phase 4 keeps the approved 31-step narrative intact while adding an immersive presentation runtime, fullscreen fallback, motion presets, cinematic chapter dividers, and a more complete Power Down lifecycle. V3B Phase 5 integrates the keynote as a flagship Jack OS experience across desktop, Welcome, Recruiter Mode, Simple Mode, Projects, Search, and J.D.

## State Model

Presentation state is owned by `usePresentationController`. The controller stores the current global step index, derives cover vs. stage state, exposes previous/next/home/end actions, tracks navigation direction, and handles keyboard navigation. Individual stage components never own global navigation.

Escape returns to the cover in windowed mode. In presentation mode, Escape exits presentation mode first. Repeated keydown events are ignored so holding a key does not skip through multiple stages. Overlay skip hooks allow the launch sequence and chapter dividers to be dismissed without accidentally advancing multiple narrative steps.

## Presentation Mode

The keynote has two operating states:

- Windowed Preview Mode keeps the Jack OS application shell, header, window controls, full progress copy, and standard Previous/Next controls.
- Presentation Mode removes the ordinary window frame from the canvas, fills the viewport with a dedicated presentation shell, shows discreet controls near the bottom edge, and preserves the active stage instead of resetting progress.

The Present action attempts the browser Fullscreen API from the user gesture. If fullscreen succeeds, the same shell runs inside the browser fullscreen element. If the API is unavailable, denied, or skipped on touch-first devices, the fixed viewport-filling overlay remains fully functional as the fallback. `fullscreenchange` synchronizes unexpected browser exits back to windowed preview mode.

The `keynote-presentation-active` document class prevents page-level scrolling while the overlay is active. All fullscreen calls are caught so a rejected promise cannot block navigation.

## Master Step Registry

`components/keynote/config/steps.ts` is the ordered source of truth. Each step contains:

- stable step id
- chapter id and chapter number
- stage number
- renderer key
- typography theme
- visual theme
- build or chapter transition metadata
- optional image asset id
- ARIA label
- optional presenter note
- chapter start/end flags
- optional completion action
- typed content payload

The cover screen is intentionally outside the step count. The in-deck sequence contains the working thesis, five numbered chapters, and the final Power Down Keynote step.

## Renderer Registry

`components/keynote/config/renderers.ts` maps typed renderer keys to React components. The app shell asks the registry for the current renderer, which keeps component lookup explicit and avoids unsafe dynamic component names.

Available renderers:

- `title`
- `split`
- `metric`
- `quote`
- `diagram`
- `timeline`
- `image-text`
- `terminal`

## Typography Registry

`components/keynote/config/typography.ts` centralizes chapter typography. Each theme defines frame, eyebrow, heading, subheading, body, accent, data, quote, and fallback font stack classes. Stage components consume these classes from configuration rather than hardcoding chapter styling.

## Visual Theme Registry

`components/keynote/config/visual-themes.ts` separates visual treatment from typography. Themes define background, foreground, muted text, accent, border, image overlay, diagram style, control contrast, optional texture, and image position. The shell applies these values through CSS custom properties.

## Asset Registry

`components/keynote/assets/keynote-assets.ts` contains the typed photography registry for `public/Keynote`. It supports PNG, JPG/JPEG, WebP, and AVIF assets and stores path, alt text, chapter association, focal position, overlay preference, preload priority, and caption.

The keynote preloads the cover and next likely image when needed, then lazy-loads later imagery through the stage components. Images use object-fit and focal positions to avoid stretching.

## Transition Model

`components/keynote/animations/transitions.ts` distinguishes build transitions from chapter transitions. Build transitions are short and subtle. Chapter transitions are slightly longer and provide a clearer visual reset. CSS reduced-motion rules disable nonessential motion while preserving immediate state changes.

`components/keynote/config/motion.ts` defines shared timing tokens, the concise preset library, Roman numeral formatting, and chapter-divider metadata. Future steps should prefer `motionPreset` metadata only when the inferred preset is not suitable. The available presets are:

- `fade-up`
- `fade-in`
- `crossfade`
- `split-reveal`
- `diagram-build`
- `layer-stack`
- `timeline-advance`
- `status-reveal`
- `chapter-reset`
- `power-down`

Stage renderers expose stable sequence markers such as headings, images, panels, nodes, labels, and terminal lines. CSS uses those markers plus `--keynote-build-index` to sequence entrances without moving animation state into chapter components.

## Chapter Dividers

Chapter dividers are transitional overlays triggered by `chapterStart` steps for Chapters I-V. They do not count as separate narrative steps. Each divider shares the same structure and uses a motif from the incoming chapter: split grid, ledger, ocean, version marker, or minimal field. Standard divider timing is intentionally slower than ordinary slide motion so chapter changes feel like meaningful resets. Pointer or keyboard navigation can skip a divider immediately, and reduced-motion mode shortens the divider to a near-immediate crossfade.

## Launch Sequence

The cover Begin action and presentation entry from the cover use a restrained launch overlay. The overlay briefly preserves the cover, shows a compact `1984 BLUE OCEAN` title card, displays a segmented progress treatment, then enters the Working Thesis. Space, ArrowRight, click, or tap can skip the sequence after it begins. Reduced-motion mode runs the pending begin/resume action promptly and removes artificial delay.

## Inactivity Controls

Presentation Mode starts with controls visible. Pointer movement, pointer down, focus movement, and keyboard navigation reveal them again. After roughly three seconds, controls reduce opacity but remain discoverable. Focused or hovered controls restore full opacity. Cursor auto-hide is disabled on touch-first devices and is also suppressed when a control is focused or hovered. Timers are cleaned up on exit and unmount.

## Session Resume

Progress is stored in `sessionStorage` under `jack-os:blue-ocean-session.v1`. The stored state contains only the current step id, whether the presentation has begun, and whether the visitor returned to the cover. The storage key and validation helpers live in `components/keynote/config/session.ts` so the keynote engine and Welcome app use the same resume rules.

Same-session reloads offer `Resume Presentation` on the cover. New browser sessions naturally begin at the cover because the state is not persisted in `localStorage`.

## Phase 5 Integration

Phase 5 keeps the 31 approved narrative steps unchanged and adds a launch layer around the existing engine.

Primary entry points:

- Desktop icon: `1984 Blue Ocean` opens the standard Jack OS window and uses the shared flagship icon treatment.
- Welcome: a `Featured Experience` card offers `Launch 1984 Blue Ocean` and conditionally shows `Resume Keynote` when a valid session exists.
- Recruiter Mode: the overview section includes a concise featured case-study card with `View the Keynote` and `Continue Recruiter Mode`.
- Simple Mode: a featured interactive case-study card links into Jack OS with the `#1984-blue-ocean` hash.
- Projects: the project metadata includes Blue Ocean as an internal Jack OS project with role, implementation, and key systems.
- Search: the command palette recognizes keynote, business strategy, product development, and AI-assisted workflow terms.
- J.D.: the local assistant can describe the keynote, explain AI-assisted authorship accurately, recommend it, and launch it.

The desktop tracks a lightweight launch context:

- `desktop`
- `welcome`
- `recruiter`
- `simple`
- `projects`
- `search`
- `ask-jd`

Power Down closes the keynote, then attempts to restore the originating window when it still exists. If the origin is unavailable, Jack OS falls back to the desktop. Simple Mode opens the keynote through a hash link and returns with client-side navigation after Power Down.

## Completion State

The final Power Down action writes completion to `localStorage` under `jack-os:1984-blue-ocean:v1:completed`. Completion is not written when the app opens, when a visitor previews the cover, or when they navigate partway through the keynote.

Completing the keynote unlocks the local `Blue Ocean Navigator` achievement through the existing Jack OS achievement system. The achievement is local to the visitor's browser and does not affect app access or portfolio content.

## Accessibility Strategy

The shell provides semantic headings, visible focus states, keyboard-complete controls, ARIA labels for stages, polite progress announcements, and no keyboard trap. Stage changes focus the active heading with `preventScroll` so keyboard users receive context without losing orientation.

Photography is decorative only where it functions as a background. Meaningful image frames use registry alt text and captions.

Presentation Mode announces entry and exit through a polite screen-reader message. The visible Exit Presentation control works independently of Escape. Chapter dividers and launch overlays use polite status regions and can be skipped without producing alert dialogs.

## Sound Hooks

Blue Ocean receives semantic sound callbacks from the centralized Jack OS sound system. Presentation entry uses the existing app-open cue, and Power Down uses the existing window-close cue. Standard slide builds and chapter dividers remain silent in Phase 4 because no dedicated restrained page-advance asset exists. All playback obeys the global Sound Effects preference and rejected playback promises are handled by the shared sound hook.

## Final Narrative Path

Future content revisions should edit the chapter metadata, step registry content payloads, presenter notes, and asset associations. They should not duplicate navigation, create per-chapter controller state, or bypass the renderer and theme registries.

## Power Down Ending

The final step uses `completionAction: 'power-down'`. The shell locks duplicate activation, fades ordinary navigation, displays the status sequence, advances a restrained progress indicator, exits browser fullscreen if active, removes the presentation overlay, and asks the Jack OS window manager to close the keynote window. Reduced-motion users receive the same lifecycle with a much shorter delay.

Cleanup responsibilities live in the shell: launch timers, divider timers, inactivity timers, power-down timers, fullscreen listeners, document classes, and pointer/focus listeners are cleared on exit or unmount.

# 1984 Blue Ocean Keynote Architecture

1984 Blue Ocean is a Jack OS desktop application built as a reusable keynote engine. Phase 2 establishes the presentation shell, visual system, and renderer contracts; it does not contain final keynote chapter copy.

## State Model

Presentation state is owned by `usePresentationController`. The controller stores the current global step index, derives cover vs. stage state, exposes previous/next/home/end actions, and handles keyboard navigation. Individual stage components never own global navigation.

Escape returns to the cover in windowed mode. In presentation mode, Escape exits presentation mode first. Repeated keydown events are ignored so holding a key does not skip through multiple stages.

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
- typed content payload

Future chapter work should replace the placeholder content objects in this file while preserving the shape of the registry.

## Renderer Registry

`components/keynote/config/renderers.ts` maps typed renderer keys to React components. The app shell asks the registry for the current renderer, which keeps component lookup explicit and avoids unsafe dynamic component names.

Available Phase 2 renderers:

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

## Session Resume

Progress is stored in `sessionStorage` under `jack-os:blue-ocean-session.v1`. The stored state contains only the current step id, whether the presentation has begun, and whether the visitor returned to the cover.

Same-session reloads offer `Resume Presentation` on the cover. New browser sessions naturally begin at the cover because the state is not persisted in `localStorage`.

## Accessibility Strategy

The shell provides semantic headings, visible focus states, keyboard-complete controls, ARIA labels for stages, polite progress announcements, and no keyboard trap. Stage changes focus the active heading with `preventScroll` so keyboard users receive context without losing orientation.

Photography is decorative only where it functions as a background. Meaningful image frames use registry alt text and captions.

## Phase 3 Content Path

Phase 3 should add final keynote content by editing the chapter metadata, step registry content payloads, presenter notes, and asset associations. It should not duplicate navigation, create per-chapter controller state, or bypass the renderer and theme registries.

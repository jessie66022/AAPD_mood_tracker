# Pace UI — Design System

Style guide for this codebase, reverse-engineered from the Figma file ("Pace UI HW 3") and the
screens built from it (Home, Mood Record, Tags, Review). Use this as the source of truth when
implementing new screens so they stay visually and structurally consistent with what already
exists — read it *before* pulling a new node from Figma.

Stack: React + Vite + Tailwind CSS v4 (CSS-first config, no `tailwind.config.js` — tokens live in
[`src/index.css`](src/index.css) as plain CSS custom properties and are consumed via Tailwind's
arbitrary-value syntax, e.g. `bg-[var(--color-primary)]`).

## 1. Color palette

All colors are defined once in [`src/index.css`](src/index.css) as CSS custom properties. Never
hardcode a hex value in a component — reference the variable (via inline `style` since these are
plain custom properties, not registered Tailwind theme colors).

### Core tokens

| Variable | Value | Usage |
|---|---|---|
| `--color-bg-base` | `#FAF7F2` | Screen/phone-frame background |
| `--color-bg-surface` | `#FFFFFF` | Cards, tab bar, calendar body |
| `--color-bg-alt-base` | `rgba(102,78,41,0.1)` | Muted note-card background (小熊筆記) |
| `--color-primary` | `#80604D` | Buttons, active tab label, FAB, brand accent |
| `--color-primary-muted` | `rgba(128,96,77,0.3)` | Progress track background, dashed borders |
| `--color-text-primary` | `#3D3A35` | Headings, primary body text |
| `--color-text-secondary` | `rgba(61,58,53,0.6)` | Dates, captions, subtext |
| `--color-text-muted` | `#BAB6AF` | Inactive tab labels, weekday headers |
| `--color-icon-primary` | `#0F172A` | Home-indicator bar (iOS chrome only) |

Two more colors are used but not yet tokenized in `index.css` — promote them if they recur again:

| Hex | Usage |
|---|---|
| `#D5CAC0` | `border/default` — outline on tag chips and the "past week" cards |
| `#60995C` | `semantic/success` — the filled/completed portion of step progress bars |

### Mood palette (the 6-color spectrum)

The single most important shared token set. Defined in [`src/data/moods.js`](src/data/moods.js),
**not** in CSS, because each mood pairs a `fill` with a computed `stroke` and a Chinese label.
This exact 6-stop sequence recurs everywhere a mood is visualized: the Home mood ring, the Mood
Record slider gradient, the recolorable bear illustrations, and the Review calendar day icons.

| # | fill | stroke (derived) | label |
|---|---|---|---|
| 0 | `#BAAFD6` (purple) | auto | 非常緊繃 |
| 1 | `#66CCED` (teal) | auto | 緊繃 |
| 2 | `#92D0A8` (green) | auto | 平靜 |
| 3 | `#FACA78` (yellow) | auto | 愉快 |
| 4 | `#F6B386` (orange) | auto | 開心 |
| 5 | `#F3A9B7` (pink) | auto | 非常愉快 |

- `stroke` is **not** hand-picked — [`src/lib/color.js`](src/lib/color.js)'s `deriveStroke()`
  darkens/saturates each `fill` in HSL space, calibrated against Figma's one known fill/stroke
  pair (`#F3A9B7` → `#F3617D`). Reuse `deriveStroke()` for any new mood-adjacent color; don't
  eyeball a new stroke value.
- Always go through `MOODS` (array, index-ordered 0–5 exactly as above) or `moodForValue(value)`
  (snaps a 0–100 slider value to the nearest stop) — never inline one of these hex codes directly.
- Bear/glow SVG assets in this palette are recolored live via CSS custom properties baked into the
  SVG source itself: `fill="var(--fill-0, #F3A9B7)"` / `fill="var(--stroke-0, #F3617D)"`. To
  recolor one, inline the SVG (Vite `?raw` import + `dangerouslySetInnerHTML`) inside a wrapper
  `div` whose inline `style` sets `"--fill-0"` / `"--stroke-0"` — see `MoodBear.jsx`. A plain
  `<img src="...svg">` cannot be recolored this way (external images don't inherit page CSS vars).

## 2. Typography

Font: **PingFang TC**, with fallback stack defined once as `--font-pingfang` in `index.css` and
applied globally on `body` — never set `font-family` per component.

```css
--font-pingfang: "PingFang TC", "PingFang SC", "Noto Sans TC", "Microsoft JhengHei", -apple-system, sans-serif;
```

Every text style seen in Figma maps directly onto a Tailwind default type-scale step. Use the
class, not an arbitrary `text-[Npx]` value:

| Figma style | Tailwind class | Size / weight / line-height | Used for |
|---|---|---|---|
| Caption | `text-xs` + `font-medium` | 12px / 500 / 1.5 | Weekday headers, "不一定要選" hint |
| Label | `text-sm` (+ `letterSpacing: "0.77px"`) | 14px / 400 / 1.5 | Dates ("7月4日 • 週六"), tag-pill text |
| Body | `text-base` | 16px / 400 / 1.5 | Card descriptions, list body text |
| Button | `text-base` + `font-semibold` | 16px / 600 / 1.5 | Button labels, tag chip labels |
| Title | `text-xl` + `font-semibold` | 20px / 600 / 1.5 | Section headers ("過去一週"), month label |
| Display | `text-2xl` + `font-semibold` | 24px / 600 / 1.5 | Screen titles, "嗨 Jessie", big questions |

Notes:
- `letterSpacing: "0.77px"` (inline `style`, not a Tailwind class — Tailwind has no built-in token
  for this exact value) is the signature of the **Label** style specifically. Apply it whenever you
  use `text-sm` for date/caption-style text; body/title/display text has no extra tracking.
- Text color always comes from `--color-text-primary` / `--color-text-secondary` /
  `--color-text-muted` (§1), never a bespoke gray.
- Status bar clock ("9:41") is the one exception: it's `text-[17px]` at `font-semibold`/590 weight
  in a fixed `#090909` — it's iOS chrome, not app content, so it doesn't follow the scale above.

## 3. Spacing & sizing

No custom spacing scale — this project uses **Tailwind's stock 4px-increment scale** as-is
(`gap-1`=4px, `gap-2`=8px, `gap-3`=12px, `gap-4`=16px, `gap-6`=24px, `gap-9`=36px, `gap-12`=48px).
Don't introduce arbitrary spacing values (`gap-[13px]`) unless Figma genuinely specifies an
off-scale number — check first, most "odd" Figma values still round to a 4px step.

Recurring layout constants worth knowing before you eyeball new screens:

| Value | Meaning |
|---|---|
| `402 × 874`, `aspectRatio: "402 / 874"` | The iPhone frame every screen is built inside (`PhoneFrame.jsx`) |
| `rounded-[32px]` | Outer phone-frame corner radius (only place this exact radius is used) |
| `left-6` / `px-6` (24px) | Standard screen-content side margin, giving a 354px-wide content column |
| `rounded-2xl` (16px) | Standard card corner radius (note card, calendar body, history cards) |
| `rounded-full` | Buttons, tab bar pill, tag chips, avatar, progress tracks — the dominant radius in this UI |
| `rounded-[9px]` | The one exception: calendar "add entry" dashed-border day cells |
| `size-6` (24px) | Standard icon size (tab icons, chevrons, nav icons) |
| `size-12` (48px) | Standard "medium" bear/avatar icon size (note cards, history list) |
| `34px` | Calendar day-cell footprint (bear icon itself renders at 32px inside it) |

### Shadows

Two drop-shadow treatments, both approximating Figma's `DROP_SHADOW #00000014 (0,2) blur 8`:

```js
style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" }}   // small: tab bar, note card, history cards
style={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}   // large: calendar body
```

Use inline `style` (not a Tailwind `shadow-*` utility) so the exact rgba stays copy-pasteable from
Figma's inspector. The one place a Tailwind utility is used instead is `shadow-2xl` on
`PhoneFrame` itself — that's presentational chrome for viewing the mock in a browser, not part of
the Figma design, so it's fine for it to diverge.

## 4. Reusable components

All shared components live in [`src/components/`](src/components). **Check this list before
writing new markup** — most new screens should compose these rather than re-implement status
bars, tab bars, or note cards inline (that duplication happened once already in this project and
was refactored out; don't reintroduce it).

| Component | Purpose | Notes |
|---|---|---|
| [`PhoneFrame.jsx`](src/components/PhoneFrame.jsx) | Outer rounded iPhone-shaped container every screen renders into | Wrap every new screen's root in this |
| [`StatusBar.jsx`](src/components/StatusBar.jsx) | iOS status bar (9:41 clock + signal/wifi/battery) | Render at the top of every screen — easy to forget since it has no visible interaction |
| [`TabBar.jsx`](src/components/TabBar.jsx) | Bottom pill nav (首頁 / 問熊熊 / FAB / 回顧 / 設定) | Takes an `active` prop (`"home" \| "ask-bear" \| "history" \| "settings"`); all four tabs route to real screens, and every `Link` sets `viewTransition` so all tab switches ease-fade (§5). Icons are inlined via `?raw` import (not `<img src>`) so their `--stroke-0` can be recolored per active state — see §1's SVG-recoloring note |
| [`Button.jsx`](src/components/Button.jsx) | Full-width primary pill button (brown fill, white text) | The only button variant that exists — there's no secondary/outline/ghost variant yet, add one deliberately (with a `variant` prop) rather than one-off styling a `<button>` |
| [`NoteCard.jsx`](src/components/NoteCard.jsx) | The "小熊筆記" note/tip card (bear icon + title + description + chevron) | Currently static copy; if it becomes dynamic, thread props rather than duplicating the component |
| [`MoodBear.jsx`](src/components/MoodBear.jsx) | Recolorable gummy-bear illustration, driven by `moodIndex` (0–5, indexes into `MOODS`) and `variant` (`"calendar"` 32px icon vs `"medium"` 48px icon) | The pattern to copy for any new recolorable illustration — see §1 |
| [`Toggle.jsx`](src/components/Toggle.jsx) | On/off switch (Settings screen) | `--color-primary` when on, `--color-primary-muted` when off; thumb uses the small shadow token (§3) |
| [`SettingsRow.jsx`](src/components/SettingsRow.jsx) | Card-style settings row, either a nav row (chevron, `onClick`) or holds an arbitrary `right` node (e.g. a `Toggle`) | Same card treatment as `NoteCard`/history cards (`rounded-2xl`, surface bg, small shadow) |
| [`RecordMoodSheet.jsx`](src/components/RecordMoodSheet.jsx) | The mood-record flow (slider step + tags step), presented as a full-screen bottom sheet, not a route | See "Sheets & overlays" in §5 — this is the reference implementation for any future sheet/modal |

### Data modules ([`src/data/`](src/data))

Not components, but equally part of "don't hand-roll this again":

- `moods.js` — the mood palette + `moodForValue()` (§1)
- `tags.js` — the flat list of "related to" tag strings (Tags screen)
- `calendar.js` / `history.js` — static mock content for the Review screen (month grid, past-week
  entries). This app has no backend — new screens needing sample data should follow this same
  "flat exported const" pattern rather than inventing a different data-loading approach.
- `askBear.js` — the 問熊熊 greeting copy and its starter-suggestion chips (label + a key that maps
  to one of the `lib/insights.js` functions below).

### Utility ([`src/lib/`](src/lib))

- `color.js`'s `deriveStroke(fillHex)` — HSL-based darken/saturate helper for generating a mood's
  stroke color from its fill. Reuse this any time a new color needs a matching "darker outline" tone.
- `insights.js` — reads `moods.js` / `calendar.js` / `history.js` and turns them into Chinese
  sentences (`weeklyMoodSummary()`, `monthlyMoodBreakdown()`, `topInfluenceTags()`,
  `monthlyRecordRate()`, plus `answerFreeText(text)` for simple keyword-matched free-text input).
  This is the pattern for any "AI insight" feature in this app: **compute the answer from the real
  data modules, don't hand-write canned copy** — even though there's no real LLM/backend yet, the
  numbers in the response should always be true. If 問熊熊 gains more question types, add a
  function here rather than inlining logic in `AskBearScreen.jsx`.

## 5. Conventions to keep following

- **Design tokens over inline hex.** If you write a raw hex or rgba more than once, it belongs in
  `index.css` as a `--color-*` variable (or in `moods.js` if it's part of the mood spectrum).
- **Inline `style` for CSS-variable references and exact shadow/gradient values**; Tailwind
  classes for everything else (layout, spacing, standard-scale typography). This project
  intentionally mixes both — arbitrary-value Tailwind classes (`bg-[...]`) only when the value is
  itself static and copy-pasted from Figma (e.g. gradient stops), inline `style` when the value is
  a CSS variable or computed at runtime (mood colors, conditional active-state colors).
- **One PhoneFrame + StatusBar per screen, always.** Every screen so far is a full-viewport mock
  of a single iPhone screen; there's no multi-pane or responsive layout to worry about.
- **Fixed-height content that fits fits; content that can grow (lists, calendars) scrolls.**
  `PhoneFrame` clips at a hard 874px — content positioned with `absolute top-[Npx] ...` and no
  scroll mechanism is silently cut off (and, worse, can end up hidden *underneath* the opaque
  floating `TabBar` rather than visibly clipped). Two established patterns, pick based on content:
  - **Short, known-length content** (Home, Settings): position with `top-[Npx] left-6 ... h-[Npx]`
    and just make sure the total height fits above the tab bar (~120px reserved at the bottom).
  - **Variable-length content** (Review's calendar + entry list): make the wrapper itself the
    scroll container — `absolute top-[Npx] right-0 bottom-0 left-0 overflow-y-auto` plus the
    `scroll-hidden` utility class (defined in `index.css`) to hide the scrollbar for a native-app
    feel, and end the scrollable content with `pb-[120px]` so the last item can scroll clear of
    the floating `TabBar` instead of stopping right at its edge. `TabBar` itself stays outside the
    scroll container (a sibling, still `absolute bottom-0`) so it stays pinned while content
    scrolls under it.
- **React Router (data router) for top-level screens; overlays are not routes.** Screens are
  routes (`/`, `/review`, `/settings`, `/ask-bear`), each rendered by `createBrowserRouter` (not
  `<BrowserRouter>`/`<Routes>` — that's required for `Link`'s `viewTransition` prop to work at
  all: it only wires up under the data-router APIs). Every `TabBar` link sets `viewTransition`, so
  switching between any two tabs cross-fades via the browser's native View Transitions API (tuned
  in `index.css`'s `::view-transition-old/new(root)` rule — currently a plain 0.22s ease-out
  fade). A screen that should visually *overlay* whatever's currently on screen — rather than
  replace it — is not a route; see "Sheets & overlays" below.
- **Sheets & overlays: shared context + state, not routes.** The mood-record flow
  (`RecordMoodSheet.jsx`) is triggered from two places (Home's mood ring, the tab bar's FAB) and
  needs to cover whatever screen was already showing underneath, so it can't be a route swap (that
  would replace, not overlay, the current screen). Instead:
  - `context/SheetContext.jsx` provides `{ isOpen, open, close }`, mounted once at the app root in
    `main.jsx` (**not** inside `PhoneFrame` — every screen renders its own `<PhoneFrame>`, and
    a screen needs to call `useRecordSheet()` to open it, so the provider must be an *ancestor* of
    every screen, not a descendant of the component that screen renders).
  - `PhoneFrame.jsx` reads that context and renders the sheet as a plain sibling of `children` —
    since it's `absolute inset-0` inside `PhoneFrame`'s `relative` box, it always overlays exactly
    the current screen, whichever one that is.
  - Internal flow steps (mood slider → tags) are local `useState` inside the sheet component, not
    nested routes — a sheet's steps are transient session state, not something that needs its own
    URL.
  - If a future feature needs the same "overlay whatever's underneath" behavior, reuse this
    context + `PhoneFrame`-mounts-the-overlay pattern rather than reaching for React Router's
    background-location/modal-route trick — it's unnecessary complexity for an app this size.
- **Gesture-driven motion uses `motion` (the `motion/react` package), not CSS transitions.**
  Installed specifically for `RecordMoodSheet`'s drag-to-dismiss. Per the `apple-design` skill:
  CSS `transition`/`@keyframes` can't be smoothly interrupted or reversed mid-gesture, so anything
  a user can grab and drag needs a real spring (`animate()` on a `useMotionValue`). CSS transitions
  are still correct and preferred for non-gesture micro-feedback (e.g. `active:scale-97` press
  states) — reach for `motion` only when a drag/spring is actually involved.
  - **Known gotcha, cost real debugging time:** if a component has `drag` enabled, do **not** also
    move that same axis with the declarative `animate` prop *or* an external `animate()` call —
    Framer Motion's own drag-constraint enforcement keeps fighting the outside animation every
    frame, and the two cancel out into a frozen mid-point (not an error, just visually stuck).
    Fix: drive `drag` and all programmatic animation through one shared `useMotionValue`, and only
    animate it externally while `drag` is temporarily set to `false` (see `isReady`/`isClosing` in
    `RecordMoodSheet.jsx`). When a drag *doesn't* pass the dismiss threshold, prefer letting
    Framer's own `dragConstraints`/`dragElastic` snap it back automatically over calling your own
    `animate()` — that avoids the same conflict entirely.
- **SVG assets are organized by scope**: `assets/shared/` for anything used on 2+ screens (status
  bar icons, tab icons, the note bear), `assets/<screen>/` for anything screen-specific. When an
  asset starts being reused, move it to `shared/` at the same time you wire up the second usage —
  don't let duplicate copies of the same icon accumulate.

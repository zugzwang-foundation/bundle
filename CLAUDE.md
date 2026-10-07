# CLAUDE.md: Bundle site (ZW-FS-001)

Companion site for **Bundle**, a feature proposal for Claude published by the Zugzwang Foundation. The specification at `public/Bundle_ZW-FS-001_v1_0.pdf` is the source of truth. This file maps that spec to this codebase so changes stay faithful to it.

The Foundation is **not affiliated with or endorsed by Anthropic**. Never remove the non-affiliation disclaimer in the page footer. The page must keep the string `zugzwangworld`.

## Commands

```
npm run dev        # Vite dev server, http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build
npm test           # state machine: journeys J-1..J-7 + acceptance criteria (scripts/statetest.js)
npm run test:unit  # Vitest, 286 tests: state, merge, safety, similarity, clustering, rules, engine
npm run smoke      # server-renders / and asserts key strings (list in scripts/smoke.jsx)
npm run lint       # oxlint
```

Run `npm test && npm run smoke && npm run test:unit && npm run build` before you call a change done, and run `npm run lint` on the files you touched. The site needs no API key and no `.env` file.

## Architecture

### One route

`src/App.jsx` serves one page at `/`. There is no `/prototype` route, no live chat and no Netlify function. The page is a scroll story on a macOS desktop that tells Meera's four months, March to June 2026, in twelve chapters, 00 to 11.

The v0.2 engine (`src/engine/`, `src/safety/`), the state machine (`src/state/store.jsx`) and the fixtures (`src/data/`) stay as tested code with no UI. `docs/` describes the v0.2 build, including the deleted prototype and stage view; read it as history.

### The desk engine

- `src/components/desk/Desktop.jsx` concatenates `CHAPTERS_A` (`chapters-a.jsx`, chapters 00 to 04) and `CHAPTERS_B` (`chapters-b.jsx`, chapters 05 to 11) in array order. To add or reorder a chapter, edit those arrays.
- Each chapter takes `length` viewport heights of scroll. The engine turns the page scroll into one local progress value per chapter, from 0 to 1.
- A sticky stage keeps the main window pinned in the centre for the whole story. The main window renders `ShowcaseApp` with the active chapter's scene.
- `FlyingWindow.jsx` renders one chapter window. It flies in from its `from` side when chapter progress reaches `at`, holds at its `slot`, and flies out at the chapter end.
- Chapter windows may overlap the main window's edges. They must never cover the part of the product the chapter demonstrates.
- Chapter 11 ends with Mission Control: every chapter window returns small and tiles around the main window. The last window holds the call to action to read the spec and the source.
- Every chapter's windows are in the DOM from the first render, hidden by opacity and transform. Never mount them conditionally, because `npm run smoke` reads their text from server-rendered HTML.
- Never read `window`, `document` or `localStorage` during render.
- At 375 px wide the main window sits at full width at the top of the stage. Chapter windows enter one at a time as bottom sheets, with 16 px gutters and no horizontal scroll.
- Styles: `src/styles/desk.css` (desktop, stage and window bodies), `desk-b.css` (window bodies for chapters 05 to 11), `showcase.css` (the main window), `product.css` (the `cl-` product rules the main window reuses).

### The chapter schema

```js
{
  id: 'invariants',        // anchor id
  num: '05',               // chapter number
  spec: '§5',              // spec reference, shown in the headline window's label
  title: 'What never changes',
  scene: 'ready',          // ShowcaseApp scene while this chapter is active
  length: 1,               // scroll length in viewport heights (1 = 100vh)
  windows: [
    {
      key: 'inv-1',
      title: 'INV-1',      // title bar text
      slot: 'tl',          // 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r' | 't' | 'b'
      from: 'left',        // fly-in direction: 'left' | 'right' | 'top' | 'bottom'
      w: 340,              // width in px on desktop
      at: 0.1,             // entry point in chapter progress, 0..1; the engine handles the exit
      tone: 'light',       // 'light' | 'dark' | 'terminal'
      Body: InvOne,        // a component; receives { progress }, the chapter-local MotionValue 0..1
    },
  ],
}
```

Every chapter opens with one headline window: a `.dk-label` (such as `05 · §5`), a `.dk-h` headline and one `.dk-p` lead sentence. Window bodies use the classes in `desk.css`: `.dk-label`, `.dk-h`, `.dk-p`, `.dk-small`, `.dk-list`, `.dk-stat` (with `.dk-unit` and `.dk-src`), `.dk-term` and `.dk-cta`.

| # | id | Scene, in order | Spec |
|---|---|---|---|
| 00 | `top` | `list` | |
| 01 | `problem` | `arrive` | §2 |
| 02 | `live` | `toggle` → `generating` → `ready` | §7 |
| 03 | `anatomy` | `anatomy` | §7.1, Fig. 4 |
| 04 | `verbs` | `rename` → `remove` → `hide` | G4 |
| 05 | `invariants` | `ready` | §5 |
| 06 | `states` | `generating` → `thin` → `failed` → `memory-off` | §9 |
| 07 | `sensitive` | `sensitive` | §10 |
| 08 | `stability` | `join` | §11 |
| 09 | `engine` | `ready` | v0.2 |
| 10 | `scope` | `off` | §13 |
| 11 | `journeys` | `ready` | §8 |

When a chapter lists several scenes, the main window steps through them as chapter progress rises.

### The scene contract

`ShowcaseApp({ scene, progress, compact = false })` in `src/components/desk/ShowcaseApp.jsx` draws Claude's dark chat index for Meera from `src/data/chats.js`. `scene` is one of the strings below. `progress` is the active chapter's local MotionValue, 0 to 1, for motion inside a scene. `compact` shrinks type and hides the sidebar on phones.

Rows carry ``layoutId={`sc-${chat.id}`}`` inside one `LayoutGroup id="showcase"`. That makes rows fly between the flat list and the bundle sections when the scene changes. A new surface with flying rows needs its own `layoutId` prefix.

| scene | The main window shows |
|---|---|
| `list` | Chats and tasks with the toggle off: Meera's chats in one list, newest first. The tooltip element is in the DOM, visually hidden until `toggle`. |
| `arrive` | The list fills month by month from March to June as progress rises. "Tax on pension withdrawals" (chat `r5`, 15 April) and "Pension withdrawal tax rules" (chat `r2`, 9 June) end outlined in coral. |
| `toggle` | The `Bundle chats` toggle pulses, its tooltip shows, and it flips on once progress passes 0.5. |
| `generating` | Skeleton bundle sections and `Finding related chats…` above the full list (INV-1). |
| `ready` | Retirement planning (expanded), Spanish practice, Apartment hunt and Health (collapsed) above `All chats`, with the first formation note. |
| `anatomy` | `ready` plus six numbered coral markers on the chevron, name, count, spark, menu and rows (Fig. 4). |
| `rename` | The Apartment hunt name becomes an inline field, and “Anaya’s flat” types in as progress rises (J-3). |
| `remove` | The row menu on "Monthly budget on a fixed income" picks `Remove from bundle`; the row flies back to All chats; toast `Removed from bundle.` with Undo (J-4). |
| `hide` | The hide confirmation with `Cancel` and `Hide bundle`; the bundle disappears; toast `Bundle hidden.` with Undo (J-5). |
| `failed` | The failure card with `Try again`; the list stays whole. |
| `memory-off` | A disabled toggle and the memory dependency sentence (J-7). |
| `thin` | A fresh account with a few chats and the thin-history sentence. |
| `sensitive` | `ready` with the Health bundle expanded and its name highlighted. The name is the neutral domain word, never a condition. |
| `join` | The new chat "How do I say ‘the landlord raised the rent’ in Spanish?" appears at the top of the list. It then flies into Spanish practice with a highlight, and no bundle reorders (J-2). |
| `off` | The toggle flips off and every row flies back into one flat list. Nothing is lost (J-6). |

User-facing strings in these scenes come from the copy register below, character for character.

### Two visual worlds (do not mix)

| World | Classes | Where | Tokens and type |
|---|---|---|---|
| Desktop (modern macOS) | `dk-` (desk engine and chapter windows), `sc-` (ShowcaseApp's own additions, `showcase.css`), `mw-` (`MacWindow`), `cc-` (primitives) | wallpaper, menu bar, every window frame, every chapter window | `--cc-*` in `src/styles/base.css` |
| Product (Claude habitat) | `cl-` | everything inside `.cl-app` in the main window | `--cl-*` in `src/styles/base.css`, unchanged: `#262624` background, `#1f1e1c` sidebar, coral `#d97757`, warm greys; Archivo (`--font-sans`) |

The desktop world has one light theme, with no theme toggle and no `prefers-color-scheme` branch for the `--cc-*` tokens. `--cc-wallpaper` is a layered radial gradient: coral and peach at the top left, lilac and sky blue at the bottom right, on `#F4E9E1`. Windows are white (`--cc-surface`) with a 14 px radius (`--cc-radius-window`) and large soft shadows (`--cc-shadow-window`). Title bars, toolbars and the 26 px menu bar (`--cc-topbar`) use `--cc-vibrancy` with `--cc-vibrancy-filter` as a backdrop filter. Text is `#1D1D1F` (`--cc-text`) and the accent is coral `#D97757` (`--cc-accent`).

Desktop type uses three tokens. `--cc-sans` is SF Pro Text, then Inter. `--cc-display` is SF Pro Display, then Inter, for headlines at weight 700 with letter-spacing -0.022em. `--cc-mono` is SF Mono, then JetBrains Mono. Old token names (`--cc-desk`, `--cc-platinum*`, `--cc-chrome`, `--cc-serif`) are aliases, so older rules still render.

The primitives live in `src/components/cc/` and are styled in `src/styles/cc.css`. They include `MacWindow` (rounded window with traffic lights), `MenuBar`, `PushButton` and the scroll helpers in `scroll.jsx` (`useStep`, `ScrollScene`).

Do not edit existing `cl-` rules or the `--cl-*` tokens. The `cl-` rules live in `src/styles/product.css`. New markup inside the main window may reuse `cl-` classes and adds `sc-` classes for anything new. Two zero-specificity `:where()` guards in `base.css` keep `cl-` elements on Archivo and `cl-` overlays (`.cl-overlay`, `.cl-menu`) on `--cl-text`. This keeps desktop type and colour out of the product.

The spark ✦ (`Icons.jsx → Spark`) is the only element that crosses worlds. It sits at the left of the menu bar, where the Apple logo would be. The site shows no Apple, Anthropic or Claude logo, and its identity is the Zugzwang Foundation.

### State (`src/state/store.jsx`)

One reducer plus context (`BundleProvider`, `useBundle`). The phases are `off | generating | ready | thin | failed | paused`. Corrections (`names`, `removed`, `hidden`, `collapsed`) persist across toggle off and on and across memory pauses (§11, Q2, J-6). They also persist across reloads through localStorage.

`selectIndex(state)` is the **only** derivation of bundles and the list. It enforces A13 ("the two surfaces always agree"). Never derive bundle membership anywhere else.

The reducer has two engine paths. `sim` resolves generation with `GENERATION_DONE` and groups chats by the fixtures' `concern`. `live` takes `BUNDLES_FORMED` or `GENERATION_FAILED` from the engine pipeline with the matching `runId`. `tests/state.test.js` covers both.

Timers (generation, toast auto-dismiss, join highlight) live in `BundleProvider` effects. Generation is `runId`-guarded, so a stale timer cannot resolve a newer run.

### Animation

- framer-motion. Scroll position travels as motion values: `useScroll` gives page progress, and each chapter gets a local progress from 0 to 1.
- React state changes only when a `useStep` index crosses a threshold, never on every scroll frame. Animate only `transform`, `opacity` and `filter`.
- Derive progress from `useScroll` with a function `useTransform`, such as `useTransform(scrollYProgress, (v) => v)`, to keep it on the main thread. Framer hands a range `useTransform` of a raw scroll value to a native scroll timeline. That timeline drops the keyframe at 1, so elements fade back out after their range.
- Never call a hook inside a render prop. Pass `progress` into a component and call `useTransform` or `useStep` inside that component.
- A sticky stage pins only while no ancestor between it and the page has `overflow: hidden` or `overflow: auto`. Either value makes that ancestor the sticky container. `overflow: clip` is safe because it creates no scroll container.
- Chapter windows fly in from off-screen, scaled down, tilted and blurred, and land in their slot on a spring. At the chapter end they fly out toward an edge. The newest window has the active title bar, and older ones dim.
- The main window stays in place. Its rows fly through `layoutId` when the scene changes.
- With reduced motion there is no flying and no pinning. The page renders as a static column: the main window in its `ready` scene, then every chapter's windows in order, all visible. Use framer `useReducedMotion` or the CSS media query in `base.css`.

## Spec ↔ code map

The page shows each behaviour as a `ShowcaseApp` scene. The behaviour itself is implemented in the `store.jsx` reducer and the engine, and checked by `npm test` and `npm run test:unit`.

| Spec | Scene on the page | State machine and engine |
|---|---|---|
| §7 toggle, one preference on two surfaces (A13) | `list`, `toggle` | `TOGGLE_BUNDLE`; every surface reads `selectIndex` |
| §7.1 anatomy: chevron, name, count, spark, menu, rows | `anatomy` | bundle objects from `selectIndex`; `TOGGLE_COLLAPSE` |
| §7.2 formation standard, no residue bucket | `ready` (ungrouped chats stay in All chats) | `isBundleCandidate`; ungrouped chats stay in `listChats`; `src/engine/rules.js` (min_size 4, min_days 2) |
| J-1 turn on → skeletons → formation | `toggle`, `generating`, `ready` | `TOGGLE_BUNDLE` → `generating` → `GENERATION_DONE` (2.2 s) or `BUNDLES_FORMED` |
| J-2 new chat joins | `join` | `NEW_CHAT`, `BUNDLE_ATTACHED`, highlight via `highlightId`; `src/engine/attach.js` (τ_attach 0.40) |
| J-3 rename inline, never overwritten | `rename` | `START_RENAME`, `COMMIT_RENAME`, `CANCEL_RENAME`; the `names` map wins in `selectIndex` |
| J-4 remove + undo, removal remembered | `remove` | `REMOVE_FROM_BUNDLE`, `UNDO_REMOVE`, `removed` map |
| J-5 hide: confirm → toast undo, stays hidden | `hide` | `HIDE_BUNDLE`, `UNDO_HIDE`, `hidden` map |
| J-6 off means off; on resumes | `off` | `TOGGLE_BUNDLE` branch (`everFormed` → straight to `ready`) |
| J-7 memory dependency | `memory-off` | `TOGGLE_MEMORY` (pause and resume via `pausedFrom`) |
| §9 six states | `list`, `generating`, `ready`, `thin`, `failed`, `memory-off` | phases `off`, `generating`, `ready`, `thin`, `failed`, `paused`; `RETRY` (A12) |
| §10 sensitive names | `sensitive` | `src/safety/gate.js` (layer 1 code, layer 2 Claude), `lexicon.js`; 95 tests in `tests/safety.test.js` |
| §11 stability | `join` | bundles sort by latest activity, rows newest first, corrections permanent (`selectIndex` and the reducer); `src/engine/merge.js` |
| §12 acceptance criteria | | `scripts/statetest.js` asserts A1, A3 in part, A7 to A10 and A12 to A14 against the reducer |
| §13 out of scope | `off` (chapter 10) | |
| Fig. 6 row menu grammar | `remove` | `REMOVE_FROM_BUNDLE`; `Remove from bundle` appears only while a chat is bundled |

## The copy register — IMMUTABLE strings (§9.1)

These strings are verbatim from the spec. Never rephrase, retitle, or "improve" them:

- Toggle: `Bundle chats`
- Tooltip: `Group related chats into bundles you can rename, edit, or hide.`
- Generating: `Finding related chats…`
- First formation note: `Bundled by Claude. Rename, remove chats, or hide any bundle.`
- Thin history: `Bundles will appear once you have a few chats about the same thing.`
- Memory dependency: `Bundle uses memory to understand your chats. Turn on memory to bundle them.`
- Bundle menu: `Rename bundle` · `Hide bundle` (two verbs, nothing else, ever)
- Row menu addition: `Remove from bundle` (shortcut B)
- Hide confirmation: `Hide this bundle? Your chats stay in your list. The bundle just stops appearing.` — buttons `Cancel` / `Hide bundle`
- Toasts: `Removed from bundle.` Undo · `Bundle hidden.` Undo
- Failure: `Claude couldn’t bundle your chats. Your list is unchanged.` — button `Try again`

## Invariants as engineering constraints

1. **INV-1**: bundles render *above* `listChats`, never instead of it. Every phase and every scene with bundles keeps the list.
2. **INV-2**: no reducer action on a bundle may mutate, remove or reorder chat data. Only `DELETE_CHAT` (today's product behaviour, A14) removes a chat. `selectIndex` is **total**: every chat appears exactly once across `bundles`, `listChats` and `projects`. Project sections are derived from the chats' own `project` values. A fixed list of project names would drop chats in any project it does not name.
3. **INV-3**: rename, remove and hide are each at most 2 clicks from the bundle name. `names[key]` always outranks the generated default.
4. **INV-4**: project chats and incognito chats never enter bundle membership, and memory off means nothing is bundled. Two places enforce it. `isBundleCandidate(chat)` is the single candidacy rule (§7.2), and bundles are built only from chats that pass it. `showBundles` tests `state.memoryOn` **directly** instead of inferring it from `phase`. `TOGGLE_BUNDLE`, `RETRY` and `GENERATION_DONE` each refuse to run or resolve with memory off, so no sequence reaches `ready` while it is off. Never rebuild membership from `nonProject`: that variable is computed for the list, where excluding project chats is a side effect.

## Resolved ambiguities (decisions already made; keep them)

- **"All chats" shows the remainder**, not a copy of the bundled chats, per Fig. 3 and Fig. 7. Removed chats and the chats of hidden bundles return to it. Expanding a bundle, hide, remove and toggle-off keep every chat reachable (A3).
- A bundle whose last chat is removed or deleted disappears; there is no empty section.
- On first formation Retirement planning is expanded and the other bundles start collapsed (Fig. 3). Collapse state then persists per bundle.
- Simulated generation takes 2.2 s, or 1.1 s on the fresh account, so `Finding related chats…` can be read.

## Known findings

**GHSA-qwww-vcr4-c8h2**: react-router RSC-mode CSRF bypass. `npm audit` reports it as **high** against the installed `react-router-dom` 7.18.2 (via `react-router`, flagged range `7.12.0 - 8.2.0`). Assessed and accepted; **do not run `npm audit fix --force`.**

- Upstream lists 7.18.2 as a patched release for the 7.x line. The GitHub Advisory Database range is coarser than the real fix boundary and flags it anyway.
- The advisory only affects apps using the unstable RSC APIs. This is a client-only SPA with no server, no actions and no RSC, so the vulnerable path is not reachable here.
- npm's proposed fix is a **downgrade** to `react-router-dom@7.11.0`, which reintroduces advisories fixed later in the 7.x line.
- The forward fix is the react-router v8 migration. Do it as planned work, not as an audit response.
- **An `npm audit` gate in CI will fail until that migration lands.** Waive or threshold that gate; do not let it drive the downgrade.

## Deployment

The live site is https://zugzwang-bundle.netlify.app, the Netlify site `zugzwang-bundle` in the "Zugzwang-world's team" account. Deploy by hand from a local build:

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

This checkout is linked to that site (`.netlify/state.json`, gitignored). In a fresh clone, run `npx netlify-cli login`, then `npx netlify-cli link --name zugzwang-bundle`. Production is public; deploy previews require a Netlify login to open.

The older domain zugzwang-claude-bundle.in still serves the previous build from a Netlify account the team no longer controls. Do not link to it.

The repository is https://github.com/Zugzwang-world/bundle, with history restarted on 2026-10-07. The build-day mirror https://github.com/Zugzwang-world/bundle-v0.2 keeps the earlier history.

The PDF ships at `/Bundle_ZW-FS-001_v1_0.pdf`. Keep that filename, because the page, the pitch deck and the README link to it.

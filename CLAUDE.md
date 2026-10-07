# CLAUDE.md — Bundle site (ZW-FS-001)

Explainer site + fully operable prototype for **Bundle**, a feature proposal for Claude
published by the Zugzwang Foundation. The source of truth is the specification at
`public/Bundle_ZW-FS-001_v1_0.pdf` (linked throughout the site). This file maps that
spec to this codebase so future work stays faithful to it.

Independent proposal — the Foundation is **not affiliated with or endorsed by Anthropic**.
The non-affiliation disclaimer in the landing footer must never be removed.

## Commands

```
npm run dev       # Vite dev server
npm run build     # production build → dist/
npm run preview   # serve the build
npm test          # state-machine tests: journeys J-1..J-7 + acceptance criteria
npm run smoke     # SSR-renders both routes, asserts key content
```

Run `npm test && npm run smoke && npm run build` before considering any change done.

## Architecture

Two routes (React Router, `BrowserRouter`):

- `/`: **Landing** (`src/pages/Landing.jsx`), the explainer, told as Meera's four months in twelve chapters (00 to 11) and a footer.
  - Each chapter is one file in `src/components/landing/chapters/`: `Hero`, `Problem`, `Live`, `Anatomy`, `Verbs`, `Invariants`, `States`, `Sensitive`, `Stability`, `Engine`, `Scope`, `Journeys` (which also exports `FinalCta`) and `Footer`.
  - `Landing.jsx` renders them in the order of `CHAPTERS` in `src/components/landing/story.js`, which holds each chapter's section id, number and short title. To add, remove or reorder a chapter, change both files.
  - Helpers shared by the chapters are in `src/components/landing/shared.jsx`. `HeroGather.jsx` and `MiniDemo.jsx` sit beside it.
  - The menu bar (`MenuBar`, `src/components/cc/MenuBar.jsx`) is fixed at the top and 28 px tall: ✦ at the left, then `Bundle`, `Chapters` (a drop-down of the chapters), `Spec` (the PDF) and `Prototype`. Its clock slot at the right shows the story date, Meera's dates from early March to 9 June 2026 as the reader scrolls, and `Today` at the prototype call to action.
  - The story rail, at 1200 px and wider, is a small fixed utility window titled `Chapters` that lists the chapters as classic checkboxes: passed chapters checked and struck through, the current one with the coral spinner glyph, later ones empty. Clicking an item scrolls to that chapter. Under 1200 px it is replaced by a 2 px coral progress line under the menu bar (`ScrollProgress`).
  - Chapter styles are in `src/styles/landing.css` (chapters 00 to 04) and `src/styles/chapters-2.css` (chapters 05 to 11, `c2-` prefix).
- `/prototype` — **Prototype** (`src/pages/Prototype.jsx`) — a full-screen, operable
  recreation of Claude's chat index with Bundle implemented. Components in
  `src/components/proto/`.

### Two visual worlds (do not mix)

| World | Prefix | Where | Palette |
|---|---|---|---|
| Document (classic Mac OS, System 7 to Mac OS 8) | `cc-` (primitives), `mw-` (`MacWindow`), `ch-` (`Chapter` header), `c2-` (chapters 05 to 11); the `zw-` and `dr-` classes still in `landing.css`, `stage.css` and `proto.css` belong here too | landing, menu bar, story rail, prototype top bar, demo rail, stage view, every window frame | `--cc-*` tokens, one light theme: beige desktop `#E9E3D3`, platinum chrome `#DDDDDD`, ink `#1A1A1A` 1 px outlines, hard offset shadows with no blur (`4px 4px 0` windows, `2px 2px 0` menus and buttons), square windows, coral `#D97757` highlight |
| Product (Claude habitat) | `cl-` | everything inside `.cl-app` | `--cl-*` tokens, unchanged: `#262624` bg, `#1f1e1c` sidebar, coral `#d97757`, warm greys |

Tokens for both worlds live in `src/styles/base.css`. The document world has one light theme: no theme toggle and no `prefers-color-scheme` branch for the `--cc-*` tokens. Use `--cc-*` tokens in every document-world rule, including the remaining `zw-` and `dr-` rules.

The primitives live in `src/components/cc/` and are styled in `src/styles/cc.css`: `MacWindow`, `MenuBar`, `PushButton`, `Checkbox`, `ProgressBar`, `Marquee`, `Transcript.jsx` (`ToolCall`, `TodoList`, `Diff`, `Keycap`), `Spinner` and `Shimmer`, `Token`, `Stat`, `Chapter`, `motion.jsx` (`Reveal`, `StreamText`, `Counter`, `useActiveSection`) and `scroll.jsx` (`ScrollScene`, `useStep`, `DrawPath`, `ScrollProgress`). `Gallery.jsx` is a usage sheet for the primitives and is not mounted on any route. Inside windows, content follows Claude Code's grammar: tool call rows, todo lists with classic checkboxes, diffs, the spinner and the composer.

The product world is not part of the redesign. The `--cl-*` tokens, `--font-sans` (Archivo) and every `cl-` rule keep their values, and `Sidebar.jsx`, `ChatsPage.jsx`, `Rows.jsx`, `Menus.jsx` and `Overlays.jsx` stay as they are. Windows wrap the product from outside: `MacWindow tone="dark"` keeps the platinum chrome and lets the dark `.cl-app` fill the body edge to edge. `MiniDemo.jsx` keeps its `cl-` markup inside such a window. Two zero-specificity `:where()` guards in `base.css` keep `cl-` elements on Archivo and `cl-` overlays (`.cl-overlay`, `.cl-menu`) on `--cl-text`, so document-world type and colour do not reach the product.

The spark ✦ (`Icons.jsx → Spark`) is the only element that crosses worlds. It is the leftmost item of the menu bar; the site shows no Apple, Anthropic or Claude logo. Document-world chrome must never leak inside the `.cl-app` frame, and vice versa.

Type in the document world is four families, set as tokens in `base.css`: `--cc-chrome` Pixelify Sans for the menu bar, window titles, buttons, tabs and small labels at 14 to 16 px, never for body text; `--cc-serif` EB Garamond for headlines and the story prose at 19 to 21 px; `--cc-mono` JetBrains Mono for transcripts, code, captions, figure labels and keycaps; `--cc-sans` Inter for dense UI text inside windows, such as tables and small controls. The product world uses Archivo (`--font-sans`) only.

### State (`src/state/store.jsx`)

Single reducer + context (`BundleProvider`, `useBundle`). Phases:
`off | generating | ready | thin | failed | paused`. Corrections — `names`, `removed`,
`hidden`, `collapsed` — persist across toggle-off/on and memory pauses (§11, Q2, J-6).

`selectIndex(state)` is the **only** derivation of bundles + list, consumed by both the
sidebar and the Chats and tasks page — that is how A13 ("the two surfaces always
agree") is enforced. Never derive bundle membership anywhere else.

Timers (generation, toast auto-dismiss, join highlight) live in `BundleProvider`
effects. Generation is `runId`-guarded so a stale timer can't resolve a newer run.

### Animation

framer-motion. Chat rows carry `layoutId` = `` `${surface}-${chat.id}` `` (`m-` main,
`s-` sidebar, `mini-` landing demo) inside one `LayoutGroup` per surface scope — this
is what makes rows *fly* from the flat list into bundle sections on formation, and
back on hide/remove. If you add a surface, add a new prefix.

- `MacWindow` opens with the System 7 zoom rects the first time it enters the viewport: five 1 px ink outline rects step from the window centre (or from an `origin` element) out to the window bounds over 280 ms, then the window appears whole.
- Key chapters are pinned `ScrollScene`s (`src/components/cc/scroll.jsx`): a tall section (`260vh` by default, `150vh` under 640 px) holding a sticky stage pinned under the 28 px menu bar. framer `useScroll({ target, offset: ['start start', 'end end'] })` gives a progress motion value from 0 at the section top to 1 at the section bottom. Scenes map it with `useTransform`, `useStep` (a step index that changes at given thresholds) and `DrawPath`, so scrolling back plays a scene backwards.
- Scroll position travels as framer motion values. React state changes only when a `useStep` index changes, never on every scroll frame. Animate only `transform`, `opacity`, `clip-path` and `filter`.
- `ScrollScene` takes a render function `(progress) => node`. Never call a hook inside that function: pass `progress` to a component and call `useTransform` or `useStep` inside that component.
- The sticky stage pins only while no ancestor between it and the page has `overflow: hidden` or `overflow: auto`, because either value makes that ancestor the sticky container. Keep wrappers of a `ScrollScene` free of both; `overflow: clip` is safe because it does not create a scroll container.
- The landing follows one chat as a coral `Token` (`src/components/cc/Token.jsx`, a pill with a 1 px ink border and a 2 px hard shadow): "Pension withdrawal tax rules" (chat `r2`, 2026-06-09 in `src/data/chats.js`), Meera's June re-ask of "Tax on pension withdrawals" (chat `r5`, 2026-04-15). It appears in the hero, lands in her March to June list in chapter 01, joins "Retirement planning" when the toggle flips in chapter 02, sits in the anatomy in chapter 03, keeps its place through a rename in chapter 04, and is renamed at each engine stage in chapter 09. Each rename cross-fades in place while the pill width eases. Coral marks the followed chat or the step happening now; a second coral element in a scene is the one number that matters there.
- The spinner (`· ✢ ✳ ✶ ✻ ✽` at about 120 ms a frame) and blinking status dots use `steps()` timing. Rows flying, the token routing and scene scrubbing stay smooth.
- Every animation has a reduced-motion path, through framer `useReducedMotion` or the CSS media query in `base.css`. With reduced motion, `ScrollScene` sets its section to auto height, unpins the stage and fixes progress at 1, so each scene shows its finished state in place; `MacWindow` skips the zoom rects; all content is visible and static.

## Spec ↔ code map

| Spec | Where implemented |
|---|---|
| §7 toggle, one preference two surfaces (A13) | `ChatsPage.jsx` controls + `Sidebar.jsx` Recents header (mini `Toggle`), both dispatch `TOGGLE_BUNDLE`, both read `selectIndex` |
| §7.1 anatomy (chevron/name/count/spark/menu/rows) | `Rows.jsx → BundleSection`, `Menus.jsx` |
| §7.2 formation standard, no residue bucket | `data/chats.js` concerns + `selectIndex` (ungrouped chats just stay in `listChats`); candidacy is `isBundleCandidate` in `store.jsx` |
| J-1 turn on → skeletons → formation | `TOGGLE_BUNDLE` → `generating` (2.2 s) → `GENERATION_DONE`; `ChatsPage.jsx → Skeletons` |
| J-2 new chat joins | `NEW_CHAT` (Demo rail), `INCOMING_CHATS`, highlight via `highlightId` |
| J-3 rename inline, never overwritten | `Rows.jsx → RenameField`, `COMMIT_RENAME`, `names` map wins in `selectIndex` |
| J-4 remove + undo, removal remembered | `REMOVE_FROM_BUNDLE` / `UNDO_REMOVE`, `removed` map |
| J-5 hide: confirm → toast undo, stays hidden | `Menus.jsx` → `Dialogs` (Overlays.jsx) → `HIDE_BUNDLE` / `UNDO_HIDE` |
| J-6 off means off; on resumes | `TOGGLE_BUNDLE` branch (`everFormed` → straight to `ready`) |
| J-7 memory dependency | `TOGGLE_MEMORY` (pause/resume via `pausedFrom`); disabled toggle + sentence in `ChatsPage.jsx`; door opens `SettingsPopover` |
| §9 six states | `ChatsPage.jsx` (`Skeletons`, `StateCard`s, note) — the chronological list renders in every one of them (INV-1) |
| §10 sensitive names | Landing chapter 07, `src/components/landing/chapters/Sensitive.jsx` (behavioural rules are about generation, which the demo fakes; the Health card depicts R1/R3) |
| §11 stability | bundle sort by latest activity, rows newest-first, corrections permanent — all in `selectIndex` + reducer |
| §12 acceptance criteria | `scripts/statetest.js` asserts A1, A3-ish, A7–A10, A12–A14 against the reducer |
| §13 out of scope | inert menu items / nav dispatch a toast; mobile notice on `/prototype` |
| Fig. 6 row menu grammar | `Menus.jsx` — Remove from bundle appears only while bundled, shortcut **B** works while the menu is open |

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

1. **INV-1** — bundles render *above* `listChats`, never instead of; every phase keeps
   the list mounted.
2. **INV-2** — no reducer action on a bundle may mutate, remove, or reorder chat data.
   Only `DELETE_CHAT` (the pre-existing product behaviour, A14) removes a chat. The
   derivation is held to the same standard: `selectIndex` is **total**, so every chat
   appears exactly once across `bundles` + `listChats` + `projects`. Project sections are
   derived from the chats' own `project` values for that reason — a fixed list of project
   names silently drops chats in any project it does not name.
3. **INV-3** — rename/remove/hide each ≤ 2 clicks from the bundle name; `names[key]`
   always outranks the generated default.
4. **INV-4** — project chats and incognito chats never enter bundle membership; memory
   off ⇒ never bundled. Enforced in two places on purpose: `isBundleCandidate(chat)` is
   the single stated candidacy rule (§7.2) and bundles are built only from chats that
   pass it, while `showBundles` tests `state.memoryOn` **directly** rather than inferring
   it from `phase` — and `TOGGLE_BUNDLE`, `RETRY`, and `GENERATION_DONE` each refuse to
   run or resolve with memory off, so no sequence reaches `ready` while it is off.
   Never rebuild membership from `nonProject`: that variable is computed for the list,
   where excluding project chats is a side effect rather than the rule.

## Resolved ambiguities (decisions already made — keep them)

- **"All chats" shows the remainder**, not a duplicate of bundled chats — per Fig. 3
  and Fig. 7 (removed chats and hidden bundles' chats return to it). A3's "still
  reachable" is satisfied by expansion, hide, remove, and toggle-off.
- A bundle whose last chat is removed/deleted simply disappears (no empty section).
- On first formation, Retirement planning is expanded; the others start collapsed
  (Fig. 3). Collapse state persists per bundle thereafter.
- Generation takes 2.2 s (1.1 s on the fresh account) — long enough to read
  "Finding related chats…", short enough to feel like a view.
- The delete-confirmation copy is prototype-scaffolding wording (delete is today's
  product behaviour, not Bundle's; the spec provides no string for it).
- Demo rail, top bar, and journeys checklist are **demo scaffolding**, visually part of
  the document world — they are not part of the proposal and must stay outside the
  `.cl-app` frame.

## Known findings

**GHSA-qwww-vcr4-c8h2** — react-router RSC-mode CSRF bypass. `npm audit` reports it as
**high** against the installed `react-router-dom` 7.18.2 (via `react-router`, flagged range
`7.12.0 - 8.2.0`). Assessed and accepted; **do not run `npm audit fix --force`.**

- Upstream lists 7.18.2 as a patched release for the 7.x line. The GitHub Advisory
  Database range is coarser than the real fix boundary and flags it anyway.
- The advisory only affects apps using the unstable RSC APIs. This is a client-only SPA:
  no server, no actions, no RSC. The vulnerable path is not reachable here.
- npm's proposed fix is a **downgrade** to `react-router-dom@7.11.0`, which reintroduces
  advisories fixed later in the 7.x line — strictly worse than staying put.
- The forward fix is the react-router v8 migration. Not urgent; do it as planned work,
  not as an audit response.
- Consequence: **an `npm audit` gate in CI will fail until that migration lands.** Expect
  it, and do not let a red gate drive the downgrade — waive or threshold it instead.

## Deployment

SPA on any static host. `public/_redirects` covers Netlify; Vercel/Cloudflare Pages
auto-detect Vite SPAs. For GitHub Pages either add the 404 redirect hack or switch
`BrowserRouter` → `HashRouter` in `src/main.jsx`. The PDF ships at
`/Bundle_ZW-FS-001_v1_0.pdf` — keep the filename; three places link to it.

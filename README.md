# Bundle: a toggle on Claude's chat index

Companion site for **ZW-FS-001 · Bundle**, a feature specification for Claude published by the Zugzwang Foundation. Bundle adds automatic, reversible grouping to Claude's chat index.

With the toggle off, the chat index stays as it is today. With it on, chats about the same ongoing concern gather into named, collapsible sections above the chronological list. A bundle is a view over the list and never moves a chat.

## Links

| What | Where |
|---|---|
| Live site | https://zugzwang-bundle.netlify.app |
| Specification ZW-FS-001 v1.0 (PDF) | https://zugzwang-bundle.netlify.app/Bundle_ZW-FS-001_v1_0.pdf · [in repo](public/Bundle_ZW-FS-001_v1_0.pdf) |
| Pitch deck (HTML, arrow keys to navigate) | https://zugzwang-bundle.netlify.app/pitch.html · [source](public/pitch.html) |
| Repository (history restarted on 2026-10-07) | https://github.com/Zugzwang-world/bundle |
| Build-day mirror (keeps the history before 2026-10-07) | https://github.com/Zugzwang-world/bundle-v0.2 |
| Working brief: architecture, spec↔code map, copy register | [CLAUDE.md](CLAUDE.md) |
| v0.2 handover, integration contract and tuning notes (history) | [docs/](docs/) |

The older domain zugzwang-claude-bundle.in still serves the previous build from a Netlify account the team no longer controls. Link to https://zugzwang-bundle.netlify.app instead.

## The site

The site is one page at `/`. It tells Meera's four months, March to June 2026, as a scroll story in twelve chapters, 00 to 11.

The page draws a modern macOS desktop: a gradient wallpaper, a translucent menu bar with ✦ at the left, and rounded windows with traffic lights. One main window stays pinned in the centre for the whole story. It shows Claude's dark chat index for Meera. Each chapter changes what it shows: chats arriving, the toggle flipping and rows flying into bundles. Later chapters show rename, remove, hide, the failure and memory states, and a new chat joining its bundle.

Smaller macOS windows fly in around the main window with each chapter's text, then fly out. Scroll drives every move, so scrolling back plays it in reverse. Chapter 11 tiles all the windows in a Mission Control view and ends with a call to action to read the spec and the source.

| # | Chapter | Spec |
|---|---|---|
| 00 | Title and the proposal label | |
| 01 | Meera's March to June: she asked the same tax question on 15 April and again on 9 June | §2 |
| 02 | One toggle: off changes nothing; on adds sections above a complete list | §7 |
| 03 | The six parts of a bundle | §7.1, Fig. 4 |
| 04 | Correction: rename, remove and hide, each within two clicks | G4 |
| 05 | The four invariants | §5 |
| 06 | The six states and their strings | §9 |
| 07 | Sensitive names: a health cluster renders as `Health` | §10 |
| 08 | Stability: new chats join, names freeze, corrections are permanent | §11 |
| 09 | The v0.2 engine pipeline, typed in a Terminal window | v0.2 |
| 10 | What v1 leaves out | §13 |
| 11 | The seven journeys J-1 to J-7, Mission Control, call to action | §8 |

With reduced motion the page renders as a static column: the main window, then every chapter's windows in order. On a phone the main window sits at full width and chapter windows enter one at a time as bottom sheets.

There is no prototype route and no live chat. The site makes no API calls and needs no API key to run or deploy.

## The four invariants

1. **INV-1** The list is never replaced. Bundles sit above it; the chronological list stays beneath.
2. **INV-2** A bundle never moves a chat. Every chat appears exactly once.
3. **INV-3** Every generated name is correctable and safety-filtered. A health scare renders as `Health`, never a condition.
4. **INV-4** Bundle sees only what memory already sees. Memory off, no bundles.

## The v0.2 engine and state machine (tested code, no UI)

The engine, the safety gate and the state machine from the v0.2 build day (2026-09-20) stay in the repo. They have no UI now. The engine and the gate run only in the unit tests, and the state machine also runs in `scripts/statetest.js`.

| Piece | Where | Tested by |
|---|---|---|
| State machine: the toggle, six states, rename, remove and hide with Undo, off→on resume, journeys J-1 to J-7 | `src/state/store.jsx` | `npm test` (`scripts/statetest.js`), `tests/state.test.js` |
| Bundle formation: sentence embeddings with transformers.js (`Xenova/all-MiniLM-L6-v2`, q8, 384 dimensions), cosine similarity, average-linkage agglomerative clustering, the spec's formation rules | `src/engine/embed.js`, `similarity.js`, `cluster.js`, `rules.js`, `form.js` | `tests/similarity.test.js`, `cluster.test.js`, `rules.test.js`, `engine.test.js` |
| Thresholds, tuned on Meera's chats (`docs/STATE.md`): τ_form 0.26, τ_attach 0.40, min_size 4, min_days 2 | `src/engine/config.js` | `tests/engine.test.js` |
| Attach: a new chat joins the nearest bundle centroid at similarity 0.40 or more; two candidates within 0.05 go to a tie-break | `src/engine/attach.js`, `tiebreak.js` | `tests/similarity.test.js` |
| Naming a concern, gating the name and breaking a tie: Claude is called only where judgement is needed | `src/engine/name.js`, `tiebreak.js`, `prompts.js`, `anthropic.js` | `tests/safety.test.js` |
| Safety gate: a lexicon and a person-name check in code, then Claude; a health cluster renders as `Health`; the gate fails closed | `src/safety/lexicon.js`, `gate.js` | 95 tests in `tests/safety.test.js` |
| Stability merge: corrections outrank the model, names freeze after first render, attach never renames | `src/engine/merge.js` | `tests/state.test.js` |

No test calls the Messages API. The safety tests stub `fetch`, and the engine test runs only the code stages. The engine test embeds Meera's chats with the real model from `public/models/`, or from the Hugging Face hub when that folder is missing. It is skipped when `src/data/meera.json` is missing.

## Quickstart

```bash
npm install
npm run dev             # http://localhost:5173
```

No `.env` file is needed. Node 22 or later is required (`package.json` → `engines`).

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | State-machine tests: journeys J-1 to J-7 and acceptance criteria against the reducer |
| `npm run test:unit` | Vitest, 286 tests in six files: state 159, safety 95, similarity 10, cluster 9, rules 7, engine 6 |
| `npm run smoke` | Server-renders `/` and asserts key strings in the HTML |
| `npm run lint` | oxlint |

Run `npm test && npm run smoke && npm run test:unit && npm run build` before you deploy.

## Deploying

The live site is the Netlify site `zugzwang-bundle` in the "Zugzwang-world's team" account. It is deployed by hand from a local build:

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

This checkout is linked to that site through `.netlify/state.json`, which is gitignored. In a fresh clone, run `npx netlify-cli login`, then `npx netlify-cli link --name zugzwang-bundle`.

Production is public. Deploy previews, made by a deploy without `--prod`, require a Netlify login to open.

## Structure

```
public/Bundle_ZW-FS-001_v1_0.pdf   the specification (keep this path; the page and the pitch deck link to it)
public/pitch.html                  the pitch deck
public/models/                     vendored embedding model and ONNX runtime, loaded by tests/engine.test.js
docs/                              v0.2 handover, integration contract, fixtures and tuning evidence (history)
src/
  App.jsx                one route: /
  components/desk/       Desktop.jsx (the scroll engine) · FlyingWindow.jsx (one chapter window)
                         ShowcaseApp.jsx (the main window: Claude's chat index for Meera, one scene per prop)
                         chapters-a.jsx (chapters 00 to 04) · chapters-b.jsx (chapters 05 to 11)
  components/cc/         macOS primitives (windows, menu bar, buttons, scroll helpers)
  components/Icons.jsx   icons, including the ✦ Spark
  engine/                the v0.2 pipeline (tests only)
  safety/                lexicon.js · gate.js (tests only)
  data/chats.js          Meera's four months, a fresh account, incoming chats; summaries in meera.json
  state/store.jsx        reducer, provider and selectIndex
  styles/                base.css (--cc-* and --cl-* tokens) · cc.css (primitives) · desk.css · desk-b.css
                         (chapter windows) · showcase.css (the main window) · product.css (cl- rules)
scripts/                 statetest.js (npm test) · smoke.jsx (npm run smoke) · gen-summaries.mjs (fixture summaries)
tests/                   Vitest suites (npm run test:unit)
CLAUDE.md                working brief: architecture, spec↔code map, immutable copy register
```

## Credits

Specification and site © 2026 The Zugzwang Foundation · zugzwangworld.com

An independent proposal. The Zugzwang Foundation is not affiliated with, commissioned by, or endorsed by Anthropic. "Claude" is used nominatively to name the product this proposal addresses; all interface depictions are illustrative reconstructions, not screenshots.

// This module exports chapter data whose windows hold their body components, so fast refresh reloads it in full when it changes.
/* oxlint-disable react/only-export-components */
import { useMemo } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { CONFIG } from '../../engine/config';
import { ChatGlyph, Spark } from '../Icons';
import { Checkbox } from '../cc/Checkbox';
import { PushButton } from '../cc/PushButton';
import { useStep } from '../cc/scroll';
import { Spinner } from '../cc/Spinner';
import Token from '../cc/Token';
import { Diff, TodoList, ToolCall } from '../cc/Transcript';

/* Chapters 05 to 11 of the landing as data: each chapter names its ShowcaseApp scene and the windows that fly in around the main window. */
/* Every Body receives { progress }, the chapter-local scroll progress (a framer MotionValue from 0 to 1); in-window motion uses useTransform or useStep on it. */

/**
 * The progress a body should animate from.
 * Input: progress (a MotionValue, or undefined when a body renders outside the engine).
 * Output: progress itself, or a MotionValue fixed at 1 under reduced motion or when progress is missing, so the body shows its finished state.
 */
function useLive(progress) {
  const reduced = useReducedMotion();
  const one = useMotionValue(1);
  return reduced || !progress ? one : progress;
}

/** Content that fades and rises into place while chapter progress moves from `at` to `at + span`. Input: progress, at, span (default 0.06), as ('div' or 'li'), className, children. */
function Late({ progress, at, span = 0.06, as = 'div', className, children }) {
  const p = useLive(progress);
  const opacity = useTransform(p, [at, at + span], [0, 1]);
  const y = useTransform(p, [at, at + span], [8, 0]);
  const Tag = as === 'li' ? motion.li : motion.div;
  return <Tag className={className} style={{ opacity, y }}>{children}</Tag>;
}

/** The headline window body every chapter starts with. Input: num, spec, title, lead (one sentence). */
function Head({ num, spec, title, lead }) {
  return (
    <>
      <p className="dk-label">{`${num} · ${spec}`}</p>
      <h2 className="dk-h">{title}</h2>
      <p className="dk-p">{lead}</p>
    </>
  );
}

/* ── 05 · §5 invariants ── */

const INVARIANTS = [
  {
    id: 'INV-1',
    tt: 'The chronological list is never replaced',
    td: 'Bundles render above the chronological list, never instead of it. Every chat remains reachable in time order at all times, bundled or not.',
    pv: 'The person turns Bundle on, can’t find yesterday’s chat where it always was, turns Bundle off, and never touches it again.',
  },
  {
    id: 'INV-2',
    tt: 'A bundle is a view, never a move',
    td: 'Forming, renaming, hiding, or dissolving a bundle changes nothing about any chat: not its place, not its project, not its content. No action on a bundle can lose a chat.',
    pv: 'The question “Where did my chat go?”',
  },
  {
    id: 'INV-3',
    tt: 'Every generated name is correctable',
    td: 'Rename, remove-a-chat, and hide are never more than two clicks from the bundle’s name. A name the person sets is theirs: Claude never overwrites it.',
    pv: 'A wrong, generic, or harmful label standing over a person’s history with no obvious way to answer back.',
  },
  {
    id: 'INV-4',
    tt: 'Bundle sees only what memory sees',
    td: 'Bundle requires memory to be on and reads nothing memory does not already read. Incognito chats never bundle. Project chats never bundle. Turning memory off pauses Bundle with it.',
    pv: 'A feature that quietly enlarges the data question instead of inheriting its answer.',
  },
];

// The four fixture bundles (CONCERNS in src/data/chats.js, sizes from docs/STATE.md) added above four unbundled chats that keep their place.
const DIFF = [
  { kind: 'add', text: 'Retirement planning ✦ 9' },
  { kind: 'add', text: 'Apartment hunt ✦ 5' },
  { kind: 'add', text: 'Spanish practice ✦ 11' },
  { kind: 'add', text: 'Health ✦ 4' },
  { kind: 'ctx', text: 'Draft a birthday message for Ravi · Jun 22' },
  { kind: 'ctx', text: 'Recipe for masala oats · Jun 2' },
  { kind: 'ctx', text: 'Reset a hearing aid that keeps beeping · May 30' },
  { kind: 'ctx', text: 'Word for the feeling of missing a place · May 15' },
];

function InvHead() {
  return (
    <Head
      num="05"
      spec="§5"
      title="Four invariants every bundle action keeps"
      lead="Turning Bundle on adds four sections above Meera’s list and removes no chat, and each invariant names the failure it prevents."
    />
  );
}

function InvDiff() {
  return <Diff header="+4 sections −0 chats" lines={DIFF} />;
}

/** Builds the body for one invariant window: the rule, its text, then the failure it prevents, which lands shortly after the window. Input: inv (one INVARIANTS entry), at (the window's entry point). */
function invBody(inv, at) {
  function InvBody({ progress }) {
    return (
      <>
        <h3 className="dkb-rule-h">{inv.tt}</h3>
        <p className="dk-p">{inv.td}</p>
        <Late progress={progress} at={at + 0.05} className="dkb-prevents">
          <span className="dkb-prevents-k">Prevents</span>
          <span className="dk-small">{inv.pv}</span>
        </Late>
      </>
    );
  }
  return InvBody;
}

const INV_PLACES = [
  { slot: 'tr', from: 'right', at: 0.2 },
  { slot: 'r', from: 'top', at: 0.32 },
  { slot: 'br', from: 'bottom', at: 0.44 },
  { slot: 'l', from: 'left', at: 0.56 },
];

const INVARIANTS_CHAPTER = {
  id: 'invariants',
  num: '05',
  spec: '§5',
  title: 'Four invariants every bundle action keeps',
  scene: 'ready',
  length: 1.6,
  windows: [
    { key: 'inv-head', title: 'Invariants', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: InvHead },
    { key: 'inv-diff', title: 'Meera’s list, Bundle on', slot: 'bl', from: 'bottom', w: 360, at: 0.08, tone: 'light', Body: InvDiff },
    ...INVARIANTS.map((inv, i) => ({
      key: inv.id.toLowerCase(),
      title: inv.id,
      w: 340,
      tone: 'light',
      ...INV_PLACES[i],
      Body: invBody(inv, INV_PLACES[i].at),
    })),
  ],
};

/* ── 06 · §9 states ── */

function StatesHead() {
  return (
    <Head
      num="06"
      spec="§9"
      title="Six states, with the list present in each"
      lead="Each window shows one state with its exact string from the spec, and the chronological list stays mounted in all six (INV-1)."
    />
  );
}

function StateOff() {
  return (
    <>
      <div className="dkb-row"><ChatGlyph size={12} /> <span className="dkb-row-t">Pension withdrawal tax rules</span> <span className="dkb-row-d">Jun 9</span></div>
      <div className="dkb-row"><ChatGlyph size={12} /> <span className="dkb-row-t">Recipe for masala oats</span> <span className="dkb-row-d">Jun 2</span></div>
      <p className="dk-small">Chats and tasks looks exactly as it does today, and off is the default state.</p>
    </>
  );
}

function StateGenerating() {
  return (
    <>
      <div className="dkb-quote"><Spinner verb="Finding related chats…" /></div>
      <p className="dk-small">Skeleton sections sit above the list while the list stays untouched below, and navigation never waits on generation.</p>
    </>
  );
}

function StateReady() {
  return (
    <>
      <div className="dkb-row dkb-row--strong"><span className="dkb-row-t">Retirement planning</span> <span className="dkb-row-n">9</span> <Spark size={10} /></div>
      <p className="dkb-quote">Bundled by Claude. Rename, remove chats, or hide any bundle.</p>
      <p className="dk-small">Bundles sit above All chats, and collapse state persists per bundle.</p>
    </>
  );
}

function StateThin() {
  return (
    <>
      <p className="dkb-quote">Bundles will appear once you have a few chats about the same thing.</p>
      <p className="dk-small">The toggle stays on, and bundles arrive once the history supports them.</p>
    </>
  );
}

function StateFailed() {
  return (
    <>
      <p className="dkb-quote">Claude couldn’t bundle your chats. Your list is unchanged.</p>
      <div className="dkb-btnrow"><PushButton tabIndex={-1}>Try again</PushButton></div>
      <p className="dk-small">A failure leaves the index exactly as it was, and retry is one tap.</p>
    </>
  );
}

function StateMemoryOff() {
  return (
    <>
      <Checkbox checked={false} label="Bundle chats" disabled />
      <p className="dkb-quote">Bundle uses memory to understand your chats. Turn on memory to bundle them.</p>
      <p className="dk-small">The toggle is disabled with a reason and a link to the memory setting.</p>
    </>
  );
}

// The engine splits this chapter's progress across its four scenes; each state window lands just after its scene starts.
const STATES_CHAPTER = {
  id: 'states',
  num: '06',
  spec: '§9',
  title: 'Six states, with the list present in each',
  scene: ['generating', 'thin', 'failed', 'memory-off'],
  length: 2.2,
  windows: [
    { key: 'states-head', title: 'States', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: StatesHead },
    { key: 'state-off', title: 'Off (default)', slot: 'l', from: 'left', w: 300, at: 0.05, tone: 'light', Body: StateOff },
    { key: 'state-generating', title: 'Generating', slot: 'bl', from: 'bottom', w: 300, at: 0.1, tone: 'light', Body: StateGenerating },
    { key: 'state-ready', title: 'Ready', slot: 'tr', from: 'right', w: 320, at: 0.16, tone: 'light', Body: StateReady },
    { key: 'state-thin', title: 'Too little history', slot: 'r', from: 'right', w: 300, at: 0.28, tone: 'light', Body: StateThin },
    { key: 'state-failed', title: 'Couldn’t bundle', slot: 'br', from: 'bottom', w: 300, at: 0.53, tone: 'light', Body: StateFailed },
    { key: 'state-memory-off', title: 'Memory off', slot: 'b', from: 'bottom', w: 320, at: 0.78, tone: 'light', Body: StateMemoryOff },
  ],
};

/* ── 07 · §10 sensitive names ── */

const RULES = [
  { n: 'R1', t: <><b>Name the domain, never the struggle.</b> A cluster about a health scare is, at most, <b>Health</b>: never a condition, a symptom, or a diagnosis. The neutral name is deliberately boring.</> },
  { n: 'R2', t: <><b>Every generated name passes a safety filter</b> before first render. A name that fails is replaced by its domain word; a cluster with no safe name does not form.</> },
  { n: 'R3', t: <><b>Hide is one menu away, and it is total.</b> A hidden bundle does not return, reform, or resurface under a new name.</> },
  { n: 'R4', t: <><b>What memory does not see, Bundle cannot say.</b> Incognito chats never bundle; nothing outside memory’s reach can appear in a name.</> },
  { n: 'R5', t: <><b>In doubt, don’t.</b> An unformed bundle costs a convenience. A wrong label on someone’s life costs trust that does not come back.</> },
];

const GATE = [
  { name: 'Name', args: 'cluster', result: 'Claude proposes a name for 4 chats about a health scare' },
  { name: 'Gate', args: 'layer 1: lexicon and person-name check, in code', result: 'a condition, a symptom or a diagnosis fails here (R1)' },
  { name: 'Gate', args: 'layer 2: Claude', result: 'checks the name before first render (R2)' },
  { name: 'Render', args: 'sidebar', result: <>the bundle shows as <b className="dkb-accent">Health</b>, with 4 chats inside</> },
];

// Step k (1 to 4) means row k is running and the rows before it are done; step 5 means all four are done.
const GATE_STOPS = [0.12, 0.2, 0.28, 0.36, 0.44];

function SensHead() {
  return (
    <Head
      num="07"
      spec="§10"
      title="A bundle name is printed on the navigation surface"
      lead="Anyone who can see the screen can read a bundle name, so automatic naming of a person’s history follows five safety rules."
    />
  );
}

function SensGate({ progress }) {
  const step = useStep(useLive(progress), GATE_STOPS);
  return (
    <>
      <div className="dkb-calls">
        {GATE.map((row, i) => {
          const n = i + 1;
          if (step < n) return <div key={n} className="dkb-pending" aria-hidden="true">{`⏺ ${row.name}`}</div>;
          const done = step > n;
          return <ToolCall key={n} name={row.name} args={row.args} status={done ? 'done' : 'running'} result={done ? row.result : undefined} />;
        })}
      </div>
      <p className="dk-small dkb-gap">The surface shows the domain word only, and the four chats keep their own titles inside. Hide bundle is one menu item away if the domain word is too much for the screen.</p>
    </>
  );
}

function SensRules({ progress }) {
  return (
    <ol className="dk-list dkb-rules">
      {RULES.map((r, i) => (
        <Late key={r.n} as="li" progress={progress} at={0.36 + i * 0.08} className="dkb-rule">
          <span className="dkb-rule-n">{r.n}</span>
          <span className="dkb-rule-t">{r.t}</span>
        </Late>
      ))}
    </ol>
  );
}

const SENSITIVE_CHAPTER = {
  id: 'sensitive',
  num: '07',
  spec: '§10',
  title: 'A bundle name is printed on the navigation surface',
  scene: 'sensitive',
  length: 1.6,
  windows: [
    { key: 'sens-head', title: 'Sensitive names', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: SensHead },
    { key: 'sens-gate', title: 'Safety gate: health cluster', slot: 'tr', from: 'right', w: 420, at: 0.08, tone: 'light', Body: SensGate },
    { key: 'sens-rules', title: 'Naming rules, §10', slot: 'bl', from: 'bottom', w: 400, at: 0.3, tone: 'light', Body: SensRules },
  ],
};

/* ── 08 · §11 stability ── */

const STABILITY = [
  { key: 'stab-names', title: 'Names are stable', slot: 'tr', from: 'right', at: 0.12, text: 'A name changes on exactly two events: you rename it, or you explicitly ask Claude to regenerate. Never silently, never on a schedule.' },
  { key: 'stab-members', title: 'Membership grows without churn', slot: 'r', from: 'top', at: 0.26, text: 'New chats join incrementally. Existing chats are never reshuffled between bundles in the background.', note: `A new chat joins its nearest bundle only at a similarity of ${CONFIG.tauAttach.toFixed(2)} or more (τ_attach), and joining never renames the bundle.` },
  { key: 'stab-corrections', title: 'Corrections are permanent', slot: 'bl', from: 'bottom', at: 0.4, text: 'A removed chat stays removed. A hidden bundle stays hidden. Your decisions outrank the model’s next opinion.' },
  { key: 'stab-order', title: 'Order is boring on purpose', slot: 'br', from: 'bottom', at: 0.54, text: 'Bundles sort by most recent activity; chats keep newest-first. There is no novelty resorting and no “smart” reordering.' },
];

function StabHead() {
  return (
    <Head
      num="08"
      spec="§11"
      title="Bundles stay where the person left them"
      lead="People find chats by where they last saw them, so a group that keeps changing is worse than no group."
    />
  );
}

/** Builds the body for one §11 rule window. Input: item (one STABILITY entry), n (its number, 1 to 4). */
function stabBody(item, n) {
  function StabBody() {
    return (
      <>
        <p className="dk-label">{`§11 · rule ${n} of 4`}</p>
        <p className="dk-p">{item.text}</p>
        {item.note && <p className="dk-small dkb-gap">{item.note}</p>}
      </>
    );
  }
  return StabBody;
}

const STABILITY_CHAPTER = {
  id: 'stability',
  num: '08',
  spec: '§11',
  title: 'Bundles stay where the person left them',
  scene: 'join',
  length: 1.4,
  windows: [
    { key: 'stab-head', title: 'Stability', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: StabHead },
    ...STABILITY.map((item, i) => ({ key: item.key, title: item.title, slot: item.slot, from: item.from, w: 320, at: item.at, tone: 'light', Body: stabBody(item, i + 1) })),
  ],
};

/* ── 09 · v0.2 engine ── */

// Facts from src/engine/config.js, README.md and docs/STATE.md (sweep at τ_form 0.26).
const STEPS = [
  { name: 'Embed', args: `${CONFIG.embedModel}, q8, 384-dim`, result: '384-dim vectors, one per chat card, computed in the browser' },
  { name: 'Similarity', args: 'cosine', result: 'a score for every pair of chats' },
  { name: 'Cluster', args: `agglomerative, τ_form ${CONFIG.tauForm}`, result: `merged while the best average similarity stayed ≥ ${CONFIG.tauForm}` },
  { name: 'Rules', args: `min_size ${CONFIG.minSize}, min_days ${CONFIG.minDays}`, result: '4 candidates: retirement 9/9, apartment 5/5, spanish 11/12, health 4/4' },
  { name: 'Name', args: 'Claude, 4 clusters', result: 'Claude names each cluster; this one is Retirement planning' },
  { name: 'Gate', args: 'lexicon and person-name check, then Claude', result: 'the name passed both layers' },
];

// Token label and caption for each step: step 0 is the chat as Meera wrote it, step k (1 to 6) means rows before k are done and row k is running, step 7 is all done.
const TOKEN = [
  ['Pension withdrawal tax rules', 'Chat r2, Meera’s re-ask on 9 June 2026.'],
  ['card', 'The title and the summary join into one card of text.'],
  ['384-dim vector', 'MiniLM turns the card into 384 numbers.'],
  ['384-dim vector', 'Cosine similarity scores the vector against every other chat.'],
  ['cluster 1 of 4', 'Merging puts it with the other 8 retirement chats.'],
  ['cluster 1 of 4', 'The cluster has 9 chats on more than 2 days, so it meets both rules.'],
  ['Retirement planning', 'Claude names the cluster.'],
  ['passed the gate', 'The name passed the code check and Claude’s check.'],
];

// Row k of the run starts at RUN_START + (k - 1) * RUN_STEP; its call line types first, then its result line.
const RUN_START = 0.1;
const RUN_STEP = 0.1;
const ENGINE_STOPS = STEPS.map((_, i) => RUN_START + i * RUN_STEP).concat(RUN_START + STEPS.length * RUN_STEP);

/** One terminal line that types in character by character as progress moves from `from` to `to`. The full text is also in the DOM for screen readers and server rendering. Input: progress, from, to, className, children (the line as a string). */
function TermLine({ progress, from, to, className = '', children: text }) {
  const p = useLive(progress);
  const chars = useMemo(() => Array.from(text), [text]);
  const typed = useTransform(p, (v) => Math.round(Math.min(1, Math.max(0, (v - from) / (to - from))) * chars.length));
  return (
    <motion.div className={`dkb-tl ${className}`.trim()} style={{ '--typed': typed }}>
      <span className="cc-sr">{text}</span>
      <span aria-hidden="true">
        {chars.map((ch, i) => <span key={i} className="dkb-ch" style={{ '--i': i }}>{ch}</span>)}
      </span>
    </motion.div>
  );
}

/** A line that appears whole once progress reaches `at`. Input: progress, at, className, children. */
function TermShow({ progress, at, className = '', children }) {
  const p = useLive(progress);
  const opacity = useTransform(p, [at - 0.001, at], [0, 1]);
  return <motion.div className={`dkb-tl ${className}`.trim()} style={{ opacity }}>{children}</motion.div>;
}

function EngineHead() {
  return (
    <Head
      num="09"
      spec="v0.2"
      title="How v0.2 forms a bundle in the browser"
      lead={`Version 0.2 embeds each chat in the browser with all-MiniLM-L6-v2 and merges clusters while their average similarity stays at or above τ_form ${CONFIG.tauForm}.`}
    />
  );
}

function EngineTerminal({ progress }) {
  const end = RUN_START + STEPS.length * RUN_STEP;
  return (
    <div className="dk-term dkb-term">
      <TermLine progress={progress} from={0.03} to={0.08} className="is-head">✻ Form run, v0.2, following chat r2</TermLine>
      {STEPS.map((s, i) => {
        const start = RUN_START + i * RUN_STEP;
        return (
          <div key={s.name} className="dkb-step">
            <TermLine progress={progress} from={start} to={start + 0.055} className="is-call">{`⏺ ${s.name}(${s.args})`}</TermLine>
            <TermLine progress={progress} from={start + 0.06} to={start + 0.095} className="is-result">{`  ⎿ ${s.result}`}</TermLine>
          </div>
        );
      })}
      <TermShow progress={progress} at={end + 0.01} className="is-prompt">
        <span className="dkb-prompt">$</span> <span className="dkb-caret" aria-hidden="true" />
      </TermShow>
    </div>
  );
}

function EngineToken({ progress }) {
  const step = useStep(useLive(progress), ENGINE_STOPS);
  const [label, caption] = TOKEN[step];
  return (
    <div className="dkb-follow">
      <p className="dk-label">The followed chat is now</p>
      <div className="dkb-token"><Token label={label} size="lg" done={step === TOKEN.length - 1} /></div>
      <p className="dk-p" aria-live="polite">{caption}</p>
      <p className="dk-small">{`step ${Math.min(step, STEPS.length)} of ${STEPS.length}`}</p>
    </div>
  );
}

function EngineStats() {
  return (
    <div className="dkb-stats">
      <div className="dkb-stat">
        <p className="dk-label">τ_form</p>
        <p className="dk-stat">{CONFIG.tauForm.toFixed(2)}</p>
        <p className="dk-unit">average similarity needed to merge</p>
        <p className="dk-src">source: src/engine/config.js</p>
      </div>
      <div className="dkb-stat">
        <p className="dk-label">τ_attach</p>
        <p className="dk-stat">{CONFIG.tauAttach.toFixed(2)}</p>
        <p className="dk-unit">similarity a new chat needs to join</p>
        <p className="dk-src">source: src/engine/config.js</p>
      </div>
      <div className="dkb-stat">
        <p className="dk-label">Embedding size</p>
        <p className="dk-stat">384</p>
        <p className="dk-unit">dims per chat</p>
        <p className="dk-src">source: docs/STATE.md (model in src/engine/config.js)</p>
      </div>
    </div>
  );
}

const ENGINE_CHAPTER = {
  id: 'engine',
  num: '09',
  spec: 'v0.2',
  title: 'How v0.2 forms a bundle in the browser',
  scene: 'ready',
  length: 2.2,
  windows: [
    { key: 'engine-head', title: 'Engine', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: EngineHead },
    { key: 'engine-term', title: 'Terminal · Form run', slot: 'tr', from: 'right', w: 480, at: 0.03, tone: 'terminal', Body: EngineTerminal },
    { key: 'engine-token', title: 'Chat r2', slot: 'bl', from: 'bottom', w: 340, at: 0.07, tone: 'light', Body: EngineToken },
    { key: 'engine-stats', title: 'Thresholds', slot: 'br', from: 'bottom', w: 380, at: 0.74, tone: 'light', Body: EngineStats },
  ],
};

/* ── 10 · §13 scope ── */

const NOT = [
  'Not a new place chats live',
  'No “Miscellaneous” bucket: the list holds the ungrouped chats',
  'Never touches Projects',
  'Not on mobile in v1',
  'No merge & split',
  'One chat, one bundle',
  'No knowledge base and no instructions: a bundle is a shelf, not a room',
];

function ScopeHead() {
  return (
    <Head
      num="10"
      spec="§13"
      title="What v1 leaves out"
      lead="The spec names seven things v1 does not do and defers one feature to v2."
    />
  );
}

function ScopeList({ progress }) {
  return (
    <ul className="dk-list dkb-xlist">
      {NOT.map((n, i) => (
        <Late key={n} as="li" progress={progress} at={0.14 + i * 0.05}>
          <span className="dkb-x" aria-hidden="true">×</span>
          {n}
        </Late>
      ))}
    </ul>
  );
}

function ScopeOff() {
  return (
    <>
      <p className="dk-label">J-6 · off means off</p>
      <p className="dk-p">Turning Bundle off puts every chat back in one flat list.</p>
      <p className="dk-small">Names, removals, hidden bundles and collapse state persist, so turning Bundle on again resumes them.</p>
    </>
  );
}

function ScopeV2() {
  return (
    <>
      <p className="dk-label">Deferred to v2</p>
      <p className="dk-p">Starting a new chat <b>from</b> a bundle that already knows the story is deferred, so v1 stays a pure view with zero write-behaviour.</p>
      <p className="dk-small">It is a v2 candidate, and it needs its own specification.</p>
    </>
  );
}

const SCOPE_CHAPTER = {
  id: 'scope',
  num: '10',
  spec: '§13',
  title: 'What v1 leaves out',
  scene: 'off',
  length: 1.4,
  windows: [
    { key: 'scope-head', title: 'Scope', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: ScopeHead },
    { key: 'scope-list', title: 'Out of scope for v1', slot: 'tr', from: 'right', w: 380, at: 0.08, tone: 'light', Body: ScopeList },
    { key: 'scope-off', title: 'Bundle off', slot: 'bl', from: 'bottom', w: 320, at: 0.3, tone: 'light', Body: ScopeOff },
    { key: 'scope-v2', title: 'Deferred to v2', slot: 'br', from: 'right', w: 340, at: 0.5, tone: 'light', Body: ScopeV2 },
  ],
};

/* ── 11 · §8 journeys, then the closing window ── */

// Journey names from §8; each fact is the behaviour the spec gives that journey (see the spec-to-code map in CLAUDE.md).
const JS = [
  ['J-1', 'Turning Bundle on', 'The toggle flips, skeleton sections show “Finding related chats…”, and the bundles form above the list.'],
  ['J-2', 'A new chat joins its bundle', 'A new chat joins the bundle it belongs to, is briefly highlighted, and no bundle reorders.'],
  ['J-3', 'Renaming a bundle', 'The name becomes an inline field, and a name the person sets is never overwritten.'],
  ['J-4', 'Removing a chat', 'Remove from bundle sends the chat back to All chats with Undo, and the removal is remembered.'],
  ['J-5', 'Hiding a bundle', 'Hide bundle asks for confirmation, the toast “Bundle hidden.” offers Undo, and the bundle stays hidden.'],
  ['J-6', 'Turning Bundle off', 'Off restores the flat list, and turning Bundle on again resumes every correction.'],
  ['J-7', 'The memory dependency', 'With memory off the toggle is disabled with its reason, and Bundle pauses until memory is back on.'],
];

const JOURNEY_STOPS = [0.1, 0.16, 0.22, 0.28, 0.34, 0.4, 0.46];

function JourneysHead() {
  return (
    <Head
      num="11"
      spec="§8"
      title="Seven journeys through Meera’s chats"
      lead="Each journey in §8 is a step-wise path through Meera’s chats, from turning Bundle on to the memory dependency."
    />
  );
}

function JourneysList({ progress }) {
  const step = useStep(useLive(progress), JOURNEY_STOPS);
  const items = JS.map(([id, t], i) => ({ id, label: `${id}  ${t}`, done: i < step }));
  const shown = JS[Math.min(step, JS.length - 1)];
  return (
    <>
      <TodoList items={items} current={step < JS.length ? JS[step][0] : undefined} className="dkb-todo" />
      <p className="dk-small dkb-gap" aria-live="polite">
        <span className="dkb-jid">{shown[0]}</span> {shown[2]}
      </p>
    </>
  );
}

function JourneysCta() {
  return (
    <>
      <p className="dk-label">ZW-FS-001 · v1.0</p>
      <p className="dk-h dkb-cta-h">The full proposal is specification ZW-FS-001 v1.0.</p>
      <div className="dk-cta">
        <PushButton as="a" href="/Bundle_ZW-FS-001_v1_0.pdf" target="_blank" rel="noreferrer" isDefault>Read the spec</PushButton>
        <PushButton as="a" href="https://github.com/Zugzwang-world/bundle" target="_blank" rel="noreferrer">Source on GitHub</PushButton>
      </div>
    </>
  );
}

// finale: the engine tiles every earlier chapter's windows small around the main window (Mission Control) before the closing window lands.
const JOURNEYS_CHAPTER = {
  id: 'journeys',
  num: '11',
  spec: '§8',
  title: 'Seven journeys through Meera’s chats',
  scene: 'ready',
  length: 2.4,
  finale: true,
  windows: [
    { key: 'journeys-head', title: 'Journeys', slot: 'tl', from: 'left', w: 400, at: 0, tone: 'light', Body: JourneysHead },
    { key: 'journeys-list', title: 'Meera’s seven journeys', slot: 'tr', from: 'right', w: 380, at: 0.05, tone: 'light', Body: JourneysList },
    { key: 'journeys-cta', title: 'Bundle · ZW-FS-001', slot: 'b', from: 'bottom', w: 460, at: 0.82, tone: 'light', Body: JourneysCta },
  ],
};

export const CHAPTERS_B = [
  INVARIANTS_CHAPTER,
  STATES_CHAPTER,
  SENSITIVE_CHAPTER,
  STABILITY_CHAPTER,
  ENGINE_CHAPTER,
  SCOPE_CHAPTER,
  JOURNEYS_CHAPTER,
];

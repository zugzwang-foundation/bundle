import { useRef, useState } from 'react';
import Chapter from './Chapter';
import { Checkbox } from './Checkbox';
import MacWindow from './MacWindow';
import { Marquee } from './Marquee';
import { MenuBar } from './MenuBar';
import { Counter, Reveal, StreamText } from './motion';
import { ProgressBar } from './ProgressBar';
import { PushButton } from './PushButton';
import { DrawPath, ScrollProgress, ScrollScene, useStep } from './scroll';
import { Shimmer, Spinner } from './Spinner';
import Stat from './Stat';
import Token from './Token';
import { Diff, Keycap, TodoList, ToolCall } from './Transcript';

/* A dev-only page that renders each cc primitive once. It is not routed; import it into a page temporarily to look at the primitives. */

const TODOS = [
  { id: 'a', label: 'Read the chats', done: true },
  { id: 'b', label: 'Embed 13 chats', done: false },
  { id: 'c', label: 'Cluster at τ_form 0.26', done: false },
  { id: 'd', label: 'Name each cluster', done: false },
];

const NAMES = ['Pension withdrawal tax rules', 'card', '384-dim vector', 'cluster 1 of 4', 'Retirement planning', 'passed the gate'];

const MENUS = [
  { label: 'Zugzwang Foundation', spark: true, items: [{ label: 'About this proposal', href: '#gallery' }] },
  {
    label: 'Bundle',
    items: [
      { label: 'Open the prototype', href: '#gallery', shortcut: 'O' },
      { divider: true },
      { label: 'Print', disabled: true },
    ],
  },
  { label: 'Chapters', items: [{ label: '01 Meera’s four months', href: '#gallery' }, { label: '02 One toggle', href: '#gallery-scene' }] },
  { label: 'Spec', href: '#gallery' },
];

function TodoDemo() {
  const [step, setStep] = useState(1);
  const items = TODOS.map((t, i) => ({ ...t, done: i < step }));
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <TodoList items={items} current={TODOS[step]?.id} />
      <PushButton onClick={() => setStep((s) => (s + 1) % (TODOS.length + 1))}>Next step</PushButton>
    </div>
  );
}

function TokenDemo() {
  const [i, setI] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Token label={NAMES[i]} done={i === NAMES.length - 1} />
      <Token label="sm" size="sm" active={false} />
      <Token label="lg token" size="lg" />
      <PushButton isDefault onClick={() => setI((n) => (n + 1) % NAMES.length)}>Rename</PushButton>
    </div>
  );
}

function ShadeDemo() {
  const [shaded, setShaded] = useState(false);
  const [checked, setChecked] = useState(true);
  return (
    <MacWindow title="Shaded" shaded={shaded} onMinimize={() => setShaded((s) => !s)} onClose={() => {}} toolbar={<Keycap>⌘W</Keycap>} leading="2 items">
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <Checkbox checked={checked} onChange={setChecked} label="Bundle chats" />
        <Checkbox checked label="Read-only checked" />
        <ProgressBar value={0.62} label="Formation" />
        <ProgressBar indeterminate label="Finding related chats…" />
      </div>
    </MacWindow>
  );
}

function SceneDemo({ progress }) {
  const step = useStep(progress, [0.2, 0.4, 0.6, 0.8, 0.95]);
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', gap: 24, alignContent: 'center' }}>
      <svg width="420" height="80" viewBox="0 0 420 80" style={{ color: 'var(--cc-text)', maxWidth: '100%' }}>
        <DrawPath d="M10 40 C 120 0, 300 80, 410 40" progress={progress} from={0.05} to={0.9} strokeWidth={1.5} />
      </svg>
      <Token label={NAMES[step]} done={step === NAMES.length - 1} size="lg" />
      <span className="cc-label">step {step}</span>
    </div>
  );
}

/** Renders every cc primitive once, for agents and QA to look at. */
export function CcGallery() {
  const iconRef = useRef(null);
  return (
    <div style={{ paddingTop: 'var(--cc-topbar)' }}>
      <MenuBar items={MENUS} clock="Tue 9 Jun 2026" />
      <ScrollProgress />
      <Chapter id="gallery" num="00" spec="§0" title="Every primitive on one page" lead="Each component in src/components/cc renders here once.">
        <div style={{ display: 'grid', gap: 40 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Spinner verb="Bundling…" />
            <Shimmer>Finding related chats…</Shimmer>
            <span>Press <Keycap>B</Keycap> or <Keycap>⌘K</Keycap></span>
            <PushButton>Cancel</PushButton>
            <PushButton isDefault>Hide bundle</PushButton>
            <span ref={iconRef} className="cc-label" style={{ border: '1px dashed var(--cc-line)', borderRadius: 4, padding: '2px 6px' }}>origin</span>
          </div>

          <MacWindow title="Claude Code" origin={iconRef}>
            <div style={{ padding: 20 }}>
              <ToolCall name="Embed" args="13 chats" status="done" result="13 vectors, 384 dimensions" />
              <ToolCall name="Cluster" args="τ_form 0.26" status="running" index={1} />
              <ToolCall name="Name" args="cluster 3" status="error" result="Gate refused the name" index={2}>
                The safety gate replaced the name with its domain word.
              </ToolCall>
            </div>
          </MacWindow>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'start' }}>
            <MacWindow title="Todos" inactive>
              <div style={{ padding: 16 }}><TodoDemo /></div>
            </MacWindow>
            <MacWindow title="Diff" enter={false}>
              <div style={{ padding: 16 }}>
                <Diff
                  header="+4 sections −0 chats"
                  lines={[
                    { kind: 'ctx', text: 'Recents' },
                    { kind: 'add', text: 'Retirement planning ✦ 9' },
                    { kind: 'add', text: 'Spanish practice ✦ 11' },
                    { kind: 'del', text: 'Pension withdrawal tax rules' },
                    { kind: 'ctx', text: 'All chats' },
                  ]}
                />
              </div>
            </MacWindow>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'start' }}>
            <ShadeDemo />
            <MacWindow title="Chapters" variant="utility" scroll style={{ height: 180 }}>
              <div style={{ padding: 12 }}>
                <TodoList items={TODOS.concat(TODOS.map((t) => ({ ...t, id: `${t.id}2` })))} current="b" />
              </div>
            </MacWindow>
            <MacWindow title="Product" tone="dark" style={{ height: 120 }}>
              <div style={{ padding: 16 }} className="cl-row">A dark app fills this body edge to edge.</div>
            </MacWindow>
          </div>

          <div style={{ position: 'relative', padding: 24, background: 'var(--cc-wallpaper)', borderRadius: 'var(--cc-radius-card)' }}>
            <TokenDemo />
            <Marquee x={12} y={12} w={260} h={44} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <Stat label="Embedding size" value={384} unit="dims" source="src/engine/config.js" />
            <Stat label="τ_form" value={0.26} source="src/engine/config.js" />
            <Stat label="Time saved" notStated source="docs/STATE.md" />
          </div>

          <Reveal>
            <p style={{ fontFamily: 'var(--cc-sans)', fontSize: 19 }}>
              <StreamText text="Streamed text lands word by word." /> Counter: <Counter to={1284} />
            </p>
          </Reveal>

          <svg width="300" height="40" viewBox="0 0 300 40" style={{ color: 'var(--cc-accent)' }}>
            <DrawPath d="M4 20 H 296" dashed strokeWidth={1.5} />
          </svg>
        </div>
      </Chapter>

      <ScrollScene id="gallery-scene" height="220vh">
        {(progress) => <SceneDemo progress={progress} />}
      </ScrollScene>
      <div style={{ height: '60vh' }} />
    </div>
  );
}

export default CcGallery;

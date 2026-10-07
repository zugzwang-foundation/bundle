import { ChatGlyph, Spark } from '../../Icons';
import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';
import { ToolCall } from '../../cc/Transcript';

/* ── 07 · §10 sensitive names: a health cluster's name goes through the gate and renders as Health ── */

const RULES = [
  { n: 'R1', t: <><b>Name the domain, never the struggle.</b> A cluster about a health scare is, at most, <b>Health</b>: never a condition, a symptom, or a diagnosis. The neutral name is deliberately boring.</> },
  { n: 'R2', t: <><b>Every generated name passes a safety filter</b> before first render. A name that fails is replaced by its domain word; a cluster with no safe name does not form.</> },
  { n: 'R3', t: <><b>Hide is one menu away, and it is total.</b> A hidden bundle does not return, reform, or resurface under a new name.</> },
  { n: 'R4', t: <><b>What memory does not see, Bundle cannot say.</b> Incognito chats never bundle; nothing outside memory’s reach can appear in a name.</> },
  { n: 'R5', t: <><b>In doubt, don’t.</b> An unformed bundle costs a convenience. A wrong label on someone’s life costs trust that does not come back.</> },
];

export default function Sensitive() {
  return (
    <Chapter
      id="sensitive"
      num="07"
      spec="§10"
      title="A bundle name is printed on the navigation surface"
      lead="Anyone glancing at a shared screen, a projector or a family laptop can read it. Automatic naming of a person’s own history is a safety surface with its own rules."
      className="c2"
    >
      <div className="c2-sens">
        <div className="c2-sens-run">
          <MacWindow title="Safety gate: health cluster">
            <div className="c2-pad">
              <ToolCall name="Name" args="4 chats about a health scare" status="done" result="Claude proposes a name for the cluster" index={0} />
              <ToolCall name="Gate" args="layer 1: lexicon and person-name check, in code" status="done" result="a condition, a symptom or a diagnosis fails here (R1)" index={1} />
              <ToolCall name="Gate" args="layer 2: Claude" status="done" result="checks the name before first render (R2)" index={2} />
              <ToolCall name="Render" args="sidebar" status="done" result={<>the bundle shows as <b className="c2-accent">Health</b>, with 4 chats inside</>} index={3} />
            </div>
          </MacWindow>
          <Reveal delay={0.2} y={12} duration={0.33}>
            <MacWindow title="Recents" tone="dark" className="c2-sens-win">
              <div className="zw-sens-card c2-sens-card">
                <div className="cl-bundle-head">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--cl-faint)' }}>
                    <path d="m9 5 8 7-8 7" />
                  </svg>
                  <span className="cl-bundle-name">Health</span>
                  <span className="cl-bundle-count">4</span>
                  <Spark size={11} />
                  <span style={{ flex: 1 }} />
                  <span style={{ color: 'var(--cl-faint)', letterSpacing: 2 }}>···</span>
                </div>
                <div style={{ margin: '8px 10px 6px', borderRadius: 10, border: '1px solid var(--cl-hair)', background: '#191816', padding: 5, width: 190, maxWidth: '100%' }}>
                  <div className="cl-menu-item"><ChatGlyph size={12} /><span className="grow">Rename bundle</span></div>
                  <div className="cl-menu-item" style={{ background: 'var(--cl-hover)' }}><ChatGlyph size={12} /><span className="grow">Hide bundle</span></div>
                </div>
                <p style={{ padding: '10px 10px 6px', fontSize: 12, color: 'var(--cl-faint)', lineHeight: 1.55 }}>
                  The surface shows the domain word only. The four chats keep their own titles inside. If the domain word is too much for this screen, Hide bundle is one item down.
                </p>
              </div>
            </MacWindow>
          </Reveal>
        </div>
        <ol className="c2-list c2-rules">
          {RULES.map((r, i) => (
            <Reveal as="li" key={r.n} delay={i * 0.1} y={12} duration={0.33} className="c2-rule">
              <span className="c2-mono c2-rule-n">{r.n}</span>
              <span>{r.t}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}

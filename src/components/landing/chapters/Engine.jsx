import { Link } from 'react-router-dom';
import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { ScrollScene, useStep } from '../../cc/scroll';
import Stat from '../../cc/Stat';
import Token from '../../cc/Token';
import { Keycap, ToolCall } from '../../cc/Transcript';

/* ── 09 · v0.2 engine: Meera's chat r2 routed through the six Form steps, driven by scroll ── */

// Facts from src/engine/config.js, README.md and docs/STATE.md (sweep at τ_form 0.26).
const STEPS = [
  { name: 'Embed', args: 'Xenova/all-MiniLM-L6-v2, q8, in the browser', result: '384-dim vectors, one per chat card' },
  { name: 'Similarity', args: 'cosine', result: 'a score for every pair of chats' },
  { name: 'Cluster', args: 'agglomerative, τ_form 0.26', result: 'merged while the best average similarity stayed ≥ 0.26' },
  { name: 'Rules', args: 'min_size 4, min_days 2', result: '4 candidates: retirement 9/9, apartment 5/5, spanish 11/12, health 4/4' },
  { name: 'Name', args: '4 clusters', result: 'Claude names each cluster; this one is Retirement planning' },
  { name: 'Gate', args: 'lexicon and person-name check, then Claude', result: 'the name passed both layers' },
];

// Token label and caption for each step: step 0 is the chat as Meera wrote it, step k means rows 1..k-1 are done and row k is running, step 7 is all done.
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

const STOPS = [0.06, 0.15, 0.24, 0.33, 0.42, 0.51, 0.6];

/** The pinned stage: the Form run window and the renamed token. Input: progress (motion value 0 to 1 from the ScrollScene). */
function EngineStage({ progress }) {
  const step = useStep(progress, STOPS);
  const [label, caption] = TOKEN[step];
  return (
    <div className="c2-engine-stage">
      <MacWindow title="Stage — Form run" className="c2-engine-win" bodyClassName="c2-engine-body">
        <div className="c2-engine-rows">
          {STEPS.map((s, i) => {
            const n = i + 1;
            if (step < n) return <div key={s.name} className="c2-engine-pending" aria-hidden="true">{`⏺ ${s.name}`}</div>;
            const done = step > n;
            return <ToolCall key={s.name} name={s.name} args={s.args} status={done ? 'done' : 'running'} result={done ? s.result : undefined} />;
          })}
        </div>
      </MacWindow>
      <div className="c2-engine-follow">
        <p className="c2-engine-kicker">The followed chat is now</p>
        <Token label={label} size="lg" done={step === TOKEN.length - 1} />
        <p className="c2-engine-caption" aria-live="polite">{caption}</p>
        <p className="c2-engine-count">{`step ${Math.min(step, STEPS.length)} of ${STEPS.length}`}</p>
      </div>
    </div>
  );
}

export default function Engine() {
  return (
    <Chapter
      id="engine"
      num="09"
      spec="v0.2"
      title="How v0.2 forms a bundle in the browser"
      lead="Version 0.2 embeds each chat in the browser with all-MiniLM-L6-v2 and merges clusters while their average similarity stays at or above τ_form 0.26."
      className="c2 c2-engine"
    >
      <p className="c2-note">Scroll to move chat r2 through the six steps of a Form run.</p>
      <ScrollScene height="300vh" mobileHeight="200vh" className="c2-engine-scene">
        {(progress) => <EngineStage progress={progress} />}
      </ScrollScene>
      <div className="c2-stats">
        <Stat label="Embedding size" value={384} unit="dims" source="docs/STATE.md (model in src/engine/config.js)" />
        <Stat label="τ_form" value={0.26} source="src/engine/config.js" />
        <Stat label="τ_attach" value="0.40" source="src/engine/config.js" />
      </div>
      <p className="c2-engine-cta">
        Open <Link to="/prototype">the prototype</Link> and press <Keycap>`</Keycap> for the stage view: seven cards for Form, five for Attach, and the raw requests and responses in inspect mode.
      </p>
    </Chapter>
  );
}

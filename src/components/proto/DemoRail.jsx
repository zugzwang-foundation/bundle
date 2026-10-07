import { INCOMING_CHATS } from '../../data/chats';
import { JOURNEYS, useBundle } from '../../state/store';
import { Spark } from '../Icons';
import { Checkbox } from '../cc/Checkbox';
import MacWindow from '../cc/MacWindow';
import { PushButton } from '../cc/PushButton';
import { TodoList } from '../cc/Transcript';
import LiveChat from './LiveChat';
import { runAttach } from '../../stage/runner';

const SLIDE = { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

/**
 * A row of classic radio buttons for one setting.
 * Input: label (aria-label of the group), options [{ value, label, title? }], value (the selected value), onSelect(value).
 */
function Radios({ label, options, value, onSelect }) {
  return (
    <div className="dr-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? 'is-on' : ''}
          aria-pressed={value === o.value}
          title={o.title}
          onClick={() => onSelect(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* Demo controls for the prototype, in a classic window beside the app window. Everything here is demo scaffolding, not the feature. */
export default function DemoRail() {
  const { state, dispatch } = useBundle();
  const done = JOURNEYS.filter((j) => state.journeys[j.id]).length;
  const current = JOURNEYS.find((j) => !state.journeys[j.id])?.id;
  const todos = JOURNEYS.map((j) => {
    const isDone = Boolean(state.journeys[j.id]);
    return {
      id: j.id,
      done: isDone,
      label: (
        <>
          <span className="dr-jid">{j.id} · </span>{j.label}
          {!isDone && <span className="dr-jh">{j.hint}</span>}
        </>
      ),
    };
  });

  return (
    <MacWindow
      as="aside"
      title="Demo controls"
      enter={false}
      scroll
      className="demo-rail"
      bodyClassName="dr-body"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={SLIDE}
      aria-label="Demo controls"
    >
      <div className="dr-head">§8 · Step-wise, in your hands</div>
      <div className="dr-title">Walk the seven journeys</div>

      <TodoList items={todos} current={current} className="dr-todos" />
      {done === JOURNEYS.length && (
        <div className="dr-done-line">
          <Spark size={12} />
          Seven for seven. Nothing moved, nothing lost.
        </div>
      )}

      <div className="dr-block">
        <div className="dr-head">Demo controls</div>
        <div className="dr-ctl">
          <Radios
            label="Account scenario"
            value={state.scenario}
            onSelect={(scenario) => dispatch({ type: 'SET_SCENARIO', scenario })}
            options={[
              { value: 'meera', label: 'Meera · 4 months' },
              { value: 'fresh', label: 'New account' },
            ]}
          />

          {/* v0.2: which engine resolves a run, the v0.1 timer or the pipeline plus stage view. */}
          <div className="dr-switchrow">
            <span className="lb">Engine</span>
            <span className="dr-tag">v0.2</span>
            <Radios
              label="Engine"
              value={state.engine === 'live' ? 'live' : 'sim'}
              onSelect={(mode) => dispatch({ type: 'SET_ENGINE', mode })}
              options={[
                { value: 'sim', label: 'sim', title: 'v0.1 path — 2.2 s timer, fixture groups' },
                { value: 'live', label: 'live', title: 'v0.2 path — the pipeline runs on the stage' },
              ]}
            />
          </div>

          <LiveChat />

          <PushButton
            className="dr-btn"
            disabled={state.scenario === 'fresh' || state.arrivals.length >= INCOMING_CHATS.length}
            onClick={() => {
              const chat = INCOMING_CHATS[state.arrivals.length];
              dispatch({ type: 'NEW_CHAT' });
              // Live engine: the arrival runs Attach on the stage, like a real new chat.
              if (chat && state.engine === 'live' && state.bundleOn && state.memoryOn && state.phase === 'ready') {
                runAttach(chat, { state, dispatch });
              }
            }}
          >
            A new chat arrives
            <span className="sub">J-2 · {state.arrivals.length}/{INCOMING_CHATS.length}</span>
          </PushButton>

          <div className="dr-switchrow">
            <Checkbox
              checked={state.failNext}
              onChange={(value) => dispatch({ type: 'SET_FAIL_NEXT', value })}
              label="Fail the next run"
              className="lb"
            />
            <span className="dr-tag">§9</span>
          </div>

          <div className="dr-switchrow">
            <Checkbox
              checked={state.memoryOn}
              onChange={() => dispatch({ type: 'TOGGLE_MEMORY' })}
              label="Memory"
              className="lb"
            />
            <span className="dr-tag">J-7</span>
          </div>

          <PushButton className="dr-btn" onClick={() => dispatch({ type: 'RESET' })}>
            Reset the prototype
            <span className="sub">Fresh start</span>
          </PushButton>
        </div>

        <p className="dr-fine">
          Everything above this line is demo scaffolding. Everything inside the app frame is the
          proposal: one toggle, four invariants, six states — <a href="/Bundle_ZW-FS-001_v1_0.pdf" target="_blank" rel="noreferrer">ZW-FS-001 (PDF)</a>.
        </p>
      </div>
    </MacWindow>
  );
}

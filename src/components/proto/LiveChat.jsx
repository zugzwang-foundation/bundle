import { useRef, useState } from 'react';
import { useBundle } from '../../state/store';
import { hasKey, config } from '../../engine/anthropic';
import { reply } from '../../engine/reply';
import { card } from '../../engine/card';
import { runAttach } from '../../stage/runner';
import { PushButton } from '../cc/PushButton';

const SUGGESTED =
  'My bank says the SCSS interest is credited quarterly — should I move part of it to a 5-year tax-saver FD instead?';

/* v0.2 beat 1 — a real chat. Claude answers, then writes the card (title + summary).
   The card is dispatched as a chat; the list beneath never moves. */
export default function LiveChat() {
  const { state, dispatch } = useBundle();
  const stateRef = useRef(state);
  stateRef.current = state;
  const [text, setText] = useState(SUGGESTED);
  const [stage, setStage] = useState('idle'); // idle | reply | card | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const busy = stage === 'reply' || stage === 'card';

  async function send() {
    const msg = text.trim();
    if (!msg || busy) return;
    setError(null);
    setResult(null);
    try {
      setStage('reply');
      const r = await reply(msg);
      setStage('card');
      const c = await card(msg, r.output);
      const chat = {
        id: `live-${Date.now()}`,
        title: c.output.title,
        summary: c.output.summary,
        date: 'today',
        concern: c.output.concern || null,
        project: null,
        source: 'new',
      };
      dispatch({ type: 'CHAT_CREATED', chat });
      // v0.2 beat 3 — with Bundle on and the live engine, the new chat runs Attach on the
      // stage (src/engine/pipeline.js if present, else the scripted mock). In the sim
      // engine the card's concern hint places it, as in v0.1.
      const now = stateRef.current;
      if (now.engine === 'live' && now.bundleOn && now.memoryOn && now.phase === 'ready') {
        runAttach(chat, { state: now, dispatch, card: c });
      }
      setResult({ reply: r.output, card: c.output, ms: { reply: r.ms, card: c.ms } });
      setStage('done');
      setText('');
    } catch (e) {
      setError(e.message);
      setStage('error');
    }
  }

  return (
    <div className="dr-live">
      <div className="lb">
        New chat · real reply <span className="dr-tag">{config.model} · {config.mode}</span>
      </div>
      <textarea
        className="dr-ta"
        rows={3}
        value={text}
        disabled={!hasKey() || busy || state.scenario === 'fresh'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
        placeholder="Ask Claude anything…"
      />
      <div className="dr-send-row">
        <span className="dr-tag">Reply → Card → list</span>
        <PushButton
          isDefault
          className="dr-send"
          disabled={!hasKey() || busy || !text.trim() || state.scenario === 'fresh'}
          onClick={send}
        >
          {stage === 'reply' ? 'Claude is replying…' : stage === 'card' ? 'Claude writes the card…' : 'Send'}
        </PushButton>
      </div>
      {error && <p className="dr-fine dr-error">Couldn't reach Claude: {error}</p>}
      {result && (
        <div className="dr-live-out">
          <div className="dr-tag">
            CARD · {result.ms.reply} ms reply · {result.ms.card} ms card
          </div>
          <div className="dr-live-title">{result.card.title}</div>
          <div className="dr-live-sum">{result.card.summary}</div>
          <div className="dr-tag">
            {state.engine === 'live'
              ? 'ATTACH → on the stage'
              : `PLACED → ${result.card.concern || 'none'}${result.card.runner_up ? ` · runner-up ${result.card.runner_up}` : ''}`}
          </div>
          <div className="dr-live-sum">{result.card.reason}</div>
          <details className="dr-live-reply">
            <summary className="dr-tag">REPLY</summary>
            <div className="dr-live-sum" style={{ whiteSpace: 'pre-wrap' }}>{result.reply}</div>
          </details>
        </div>
      )}
    </div>
  );
}

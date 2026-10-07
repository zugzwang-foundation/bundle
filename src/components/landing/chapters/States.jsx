import { useState } from 'react';
import { ChatGlyph, Spark } from '../../Icons';
import { Checkbox } from '../../cc/Checkbox';
import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { ProgressBar } from '../../cc/ProgressBar';
import { PushButton } from '../../cc/PushButton';
import { Spinner } from '../../cc/Spinner';

/* ── 06 · §9 states: six small windows, one per state, each with its copy-register string ── */

/** One state window: inactive until the pointer is over it or focus is inside it. Input: title, caption (the sentence under the window), children (the window body). */
function StateWindow({ title, caption, children }) {
  const [active, setActive] = useState(false);
  return (
    <div
      className="c2-state"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <MacWindow title={title} inactive={!active} className="c2-statewin">
        <div className="c2-state-body">{children}</div>
      </MacWindow>
      <p className="c2-state-caption">{caption}</p>
    </div>
  );
}

export default function States() {
  return (
    <Chapter
      id="states"
      num="06"
      spec="§9"
      title="Six states, with the list present in each"
      lead="Each window below shows one state with its exact string from the spec. The chronological list stays mounted in all six (INV-1)."
      className="c2"
      band
    >
      <div className="c2-states">
        <StateWindow title="Off (default)" caption="The product as it is today, byte for byte. Bundle off is a state, and it is the default one.">
          <div className="c2-row"><ChatGlyph size={12} /> Pension tax rules <span className="c2-dt">Jun 9</span></div>
          <div className="c2-row"><ChatGlyph size={12} /> Masala oats recipe <span className="c2-dt">Jun 2</span></div>
        </StateWindow>
        <StateWindow title="Generating" caption="Skeletons above, list untouched below. Navigation never waits on generation.">
          <Spinner verb="Finding related chats…" />
          <ProgressBar indeterminate label="Finding related chats…" />
        </StateWindow>
        <StateWindow title="Ready" caption="Bundles above, All chats beneath. Collapse state persists per bundle.">
          <div className="c2-row c2-row--strong">Retirement planning <span className="c2-count">9</span> <Spark size={9} /></div>
          <div className="c2-row c2-row--faint">All chats</div>
        </StateWindow>
        <StateWindow title="Too little history" caption="One sentence. The toggle stays on, and bundles arrive once the history supports them.">
          <p className="c2-quote">Bundles will appear once you have a few chats about the same thing.</p>
        </StateWindow>
        <StateWindow title="Memory off" caption="The toggle is disabled with a reason and a link to the memory setting.">
          <Checkbox checked={false} label="Bundle chats" disabled />
          <p className="c2-quote">Bundle uses memory to understand your chats. Turn on memory to bundle them.</p>
        </StateWindow>
        <StateWindow title="Couldn’t bundle" caption="A failure leaves the index exactly as it was, and retry is one tap.">
          <p className="c2-quote">Claude couldn’t bundle your chats. Your list is unchanged.</p>
          <PushButton tabIndex={-1}>Try again</PushButton>
        </StateWindow>
      </div>
    </Chapter>
  );
}

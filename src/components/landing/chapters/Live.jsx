import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';
import { Spark } from '../../Icons';
import MiniDemo from '../MiniDemo';

/* Chapter 02 (§7): the live mini demo of the toggle inside a classic window. */

export default function Live() {
  return (
    <Chapter
      id="live"
      num="02"
      spec="§7"
      title="One toggle. Off, nothing changes."
      lead={
        <>
          Turned on, bundles appear as sections <strong>above</strong> the chronological list. They use the same layout as project sections and carry the mark <Spark size={10} /> because Claude formed them. The full list continues below them under <strong>All chats</strong>.
        </>
      }
    >
      <Reveal y={12} duration={0.33} delay={0.5}>
        <div className="lp-live">
          <MacWindow title="Claude" tone="dark" leading={<span className="lp-live-tag"><span className="lp-live-dot" />Live: flip the toggle</span>}>
            <MiniDemo />
          </MacWindow>
          <p className="lp-figcap">
            <b>Figure 3</b> · The same nine chats with the toggle off and on. Two concerns get sections, and the other two chats stay in date order under All chats. This demo runs live, and the full prototype is one click away.
          </p>
        </div>
      </Reveal>
    </Chapter>
  );
}

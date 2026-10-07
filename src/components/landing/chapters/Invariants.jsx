import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';
import { Diff } from '../../cc/Transcript';

/* ── 05 · §5 invariants: the diff Bundle makes to Meera's list, then the four rules ── */

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

export default function Invariants() {
  return (
    <Chapter
      id="invariants"
      num="05"
      spec="§5"
      title="Four invariants every bundle action keeps"
      lead="Turning Bundle on adds four sections above Meera’s list and removes no chat. Each invariant below names the failure it prevents."
      className="c2 c2-inv-ch"
    >
      <MacWindow title="Meera’s list, Bundle on" className="c2-diffwin">
        <div className="c2-pad">
          <Diff header="+4 sections −0 chats" lines={DIFF} />
        </div>
      </MacWindow>
      <div className="c2-invgrid">
        {INVARIANTS.map((inv, i) => (
          <Reveal key={inv.id} delay={i * 0.12} y={12} duration={0.33} className="c2-card c2-inv">
            <span className="c2-mono">{inv.id}</span>
            <h3>{inv.tt}</h3>
            <p>{inv.td}</p>
            <p className="c2-prevents"><b>Prevents</b> {inv.pv}</p>
          </Reveal>
        ))}
      </div>
    </Chapter>
  );
}

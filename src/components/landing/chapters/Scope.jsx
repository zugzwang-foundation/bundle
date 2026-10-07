import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';

/* ── 10 · §13 scope: what v1 leaves out, and the deferred v2 ── */

const NOT = [
  'Not a new place chats live',
  'No “Miscellaneous” bucket: the list holds the ungrouped chats',
  'Never touches Projects',
  'Not on mobile in v1',
  'No merge & split',
  'One chat, one bundle',
  'No knowledge base and no instructions: a bundle is a shelf, not a room',
];

export default function Scope() {
  return (
    <Chapter
      id="scope"
      num="10"
      spec="§13"
      title="What v1 leaves out"
      lead="The spec names seven things v1 does not do, so each absence reads as a decision."
      className="c2"
    >
      <div className="c2-scope">
        <MacWindow title="Out of scope for v1">
          <ul className="c2-list c2-scope-list">
            {NOT.map((n, i) => (
              <Reveal as="li" key={n} delay={i * 0.08} y={12} duration={0.33}>
                <span className="c2-x" aria-hidden="true">×</span>
                {n}
              </Reveal>
            ))}
          </ul>
        </MacWindow>
        <Reveal delay={0.17} y={12} duration={0.33} className="c2-card c2-v2">
          <span className="c2-mono">Deferred to v2</span>
          <p>
            Starting a new chat <b>from</b> a bundle that already knows the story is deferred, so v1 stays a pure view with zero write-behaviour. It is the obvious v2, and it needs its own specification.
          </p>
        </Reveal>
      </div>
    </Chapter>
  );
}

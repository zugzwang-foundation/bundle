import Chapter from '../../cc/Chapter';
import { Reveal } from '../../cc/motion';

/* ── 08 · §11 stability: four rules that keep groups where the person left them ── */

const ITEMS = [
  ['Names are stable', 'A name changes on exactly two events: you rename it, or you explicitly ask Claude to regenerate. Never silently, never on a schedule.'],
  ['Membership grows without churn', 'New chats join incrementally. Existing chats are never reshuffled between bundles in the background.'],
  ['Corrections are permanent', 'A removed chat stays removed. A hidden bundle stays hidden. Your decisions outrank the model’s next opinion.'],
  ['Order is boring on purpose', 'Bundles sort by most recent activity; chats keep newest-first. There is no novelty resorting and no “smart” reordering.'],
];

export default function Stability() {
  return (
    <Chapter
      id="stability"
      num="08"
      spec="§11"
      title="Bundles stay where the person left them"
      lead="People find chats by where they last saw them, so a group that keeps changing is worse than no group. Bundle follows four conservative rules."
      className="c2"
      band
    >
      <div className="c2-stab">
        {ITEMS.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.12} y={12} duration={0.33} className="c2-card c2-stab-item">
            <span className="c2-mono">{`0${i + 1}`}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </Reveal>
        ))}
      </div>
    </Chapter>
  );
}

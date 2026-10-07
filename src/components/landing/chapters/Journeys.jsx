import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion, useScroll } from 'framer-motion';
import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';
import { PushButton } from '../../cc/PushButton';
import { useStep } from '../../cc/scroll';
import { TodoList } from '../../cc/Transcript';

/* ── 11 · §8 journeys: the seven journeys tick off as the list scrolls through the viewport ── */

const JS = [
  ['J-1', 'Turning Bundle on'],
  ['J-2', 'A new chat joins its bundle'],
  ['J-3', 'Renaming a bundle'],
  ['J-4', 'Removing a chat'],
  ['J-5', 'Hiding a bundle'],
  ['J-6', 'Turning Bundle off'],
  ['J-7', 'The memory dependency'],
];

const STOPS = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8];

export default function Journeys() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] });
  const scrolled = useStep(scrollYProgress, STOPS);
  const step = reduced ? JS.length : scrolled;
  const items = JS.map(([id, t], i) => ({ id, label: `${id}  ${t}`, done: i < step }));

  return (
    <Chapter
      id="journeys"
      num="11"
      spec="§8"
      title="Seven journeys, all operable in the prototype"
      lead="Each journey is a step-wise path through Meera’s chats, and the prototype runs all seven."
      className="c2"
      band
    >
      <div ref={ref} className="c2-journeys">
        <MacWindow title="Journeys" variant="utility" className="c2-jwin">
          <div className="c2-pad">
            <TodoList items={items} current={step < JS.length ? JS[step][0] : undefined} className="c2-jlist" />
          </div>
        </MacWindow>
      </div>
    </Chapter>
  );
}

/* ── final call to action: a composer that opens the prototype ── */

export function FinalCta() {
  return (
    <section className="c2-final" id="try">
      <div className="ch-wrap">
        <Reveal y={12} duration={0.33}>
          <p className="ch-label">Prototype</p>
          <div className="c2-composer">
            <h2 className="c2-composer-field">Walk Meera’s four months yourself.</h2>
            <div className="c2-composer-bar">
              <span className="c2-composer-hint">The prototype runs all seven journeys in your browser.</span>
              <PushButton as={Link} to="/prototype" isDefault>Open the prototype</PushButton>
            </div>
          </div>
          <p className="c2-final-links">
            <a href="/Bundle_ZW-FS-001_v1_0.pdf" target="_blank" rel="noreferrer">Read the full spec (PDF)</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

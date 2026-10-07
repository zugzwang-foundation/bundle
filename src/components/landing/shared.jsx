import { Reveal as CcReveal } from '../cc/motion';

/* Helpers shared by the landing chapters. */

/**
 * Fades its children in and lifts them 26 px the first time they scroll into view, as the landing did before the split.
 * Input: children, delay (s), className. With reduced motion it renders a plain element.
 */
export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <CcReveal delay={delay} y={26} className={`zw-reveal ${className}`}>
      {children}
    </CcReveal>
  );
}

/** The section head: a ghost numeral behind, then "num · tag" with a dotted leader and an optional right-hand note. */
export function SectionHead({ num, tag, right }) {
  return (
    <>
      <div className="zw-ghost" aria-hidden="true">{num}</div>
      <Reveal>
        <div className="zw-sechead">
          <span className="mono"><b>{num}</b> · {tag}</span>
          <span className="lead" />
          {right && <span className="mono">{right}</span>}
        </div>
      </Reveal>
    </>
  );
}

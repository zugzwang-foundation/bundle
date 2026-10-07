import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/* Scroll-driven primitives: pinned scenes, discrete steps from scroll progress, paths that draw on, and the narrow-screen scroll progress line. */
/* Scroll positions travel as framer motion values; React state changes only when a step index changes. */

const EASE = [0.16, 1, 0.3, 1];

/**
 * A tall section with a sticky stage that fills the viewport under the menu bar while the reader scrolls through it; the section shows the --cc-desk checker.
 * Input: id, height (scroll length, default '260vh'), mobileHeight (scroll length under 640 px, default '150vh'), className (section), stageClassName (stage), children.
 * children is a render function (progress) => node, where progress is a motion value from 0 (section top at the viewport top) to 1 (section bottom at the viewport bottom).
 * Pass progress to components that call useTransform or useStep; do not call hooks inside the render function itself.
 * With reduced motion the section has auto height, the stage is not sticky, and progress is fixed at 1 so the scene shows its finished state.
 */
export function ScrollScene({ id, height = '260vh', mobileHeight = '150vh', className = '', stageClassName = '', children }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // A function transform keeps progress on the main thread: framer hands range transforms of a raw scroll value to a native scroll timeline, which drops the keyframe at progress 1 and fades elements back out after their range.
  const plain = useTransform(scrollYProgress, (v) => v);
  const finished = useMotionValue(1);
  const progress = reduced ? finished : plain;
  const cls = ['cc-scene', reduced && 'is-static', className].filter(Boolean).join(' ');

  return (
    <section id={id} ref={ref} className={cls} style={{ '--cc-scene-h': height, '--cc-scene-h-sm': mobileHeight }}>
      <div className={`cc-scene-stage ${stageClassName}`.trim()}>
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </section>
  );
}

function stepFor(value, stops) {
  let step = 0;
  while (step < stops.length && value >= stops[step]) step += 1;
  return step;
}

/**
 * Turns a progress motion value into a discrete step for scenes that switch states.
 * Input: progress (motion value), stops (ascending thresholds, e.g. [0.15, 0.4, 0.7]).
 * Output: the step index as React state: 0 below the first stop, then one more for each stop reached (3 at 0.7 and above in the example).
 * The component re-renders only when the index changes.
 */
// The hook sits beside the scroll components it is used with; fast refresh reloads this file in full when it changes.
// oxlint-disable-next-line react/only-export-components
export function useStep(progress, stops) {
  const [step, setStep] = useState(() => stepFor(progress.get(), stops));
  const stepRef = useRef(step);
  const stopsKey = stops.join(',');

  const update = (value) => {
    const next = stepFor(value, stops);
    if (next !== stepRef.current) {
      stepRef.current = next;
      setStep(next);
    }
  };

  useMotionValueEvent(progress, 'change', update);

  // A new motion value or new stops: recompute from the current value.
  useEffect(() => {
    const list = stopsKey ? stopsKey.split(',').map(Number) : [];
    const next = stepFor(progress.get(), list);
    if (next !== stepRef.current) {
      stepRef.current = next;
      setStep(next);
    }
  }, [progress, stopsKey]);

  return step;
}

/**
 * An SVG path that draws on.
 * Input: d, progress (optional motion value), from and to (the progress range over which the path draws from 0 to full length), className, strokeWidth (user units, default 1.25), dashed (draws a 3-on 5-off dash pattern on).
 * Without progress it draws on over 800 ms the first time it scrolls into view. Stroke colour is currentColor. With reduced motion it is fully drawn.
 * Render it inside an <svg>.
 */
export function DrawPath({ d, progress, from = 0, to = 1, className = '', strokeWidth = 1.25, dashed = false }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const idle = useMotionValue(0);
  const scrubbed = useTransform(progress || idle, [from, to], [0, 1], { clamp: true });
  const maskId = `cc-draw-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  let draw = {};
  if (!reduced && progress) draw = { style: { pathLength: scrubbed } };
  else if (!reduced) draw = { initial: { pathLength: 0 }, animate: inView ? { pathLength: 1 } : undefined, transition: { duration: 0.8, ease: EASE } };

  if (!dashed) {
    return <motion.path ref={ref} d={d} className={`cc-draw ${className}`.trim()} {...stroke} {...draw} />;
  }
  if (reduced) {
    return <path d={d} className={`cc-draw is-dashed ${className}`.trim()} {...stroke} strokeDasharray="3 5" />;
  }
  // Dashes and pathLength both use stroke-dasharray, so a solid path drawing on inside a mask reveals the dashed one.
  // The mask path is white because white means fully visible in an SVG mask; the visible colour is currentColor.
  return (
    <g className={`cc-draw is-dashed ${className}`.trim()}>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
        <motion.path d={d} {...stroke} stroke="#fff" strokeWidth={strokeWidth + 2} {...draw} />
      </mask>
      <path ref={ref} d={d} {...stroke} strokeDasharray="3 5" mask={`url(#${maskId})`} />
    </g>
  );
}

/**
 * A fixed 2 px coral line under the menu bar that fills left to right with page scroll.
 * Hidden at 1200 px and wider, where the story rail shows progress. (The classic boxed progress bar is ProgressBar.jsx.)
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="cc-scrollprogress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

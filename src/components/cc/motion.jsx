import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

/* Motion helpers for the Claude Code look: reveal on scroll, text that streams in word by word, numbers that count up, and the section the reader is in. */
/* Every component renders its finished state under renderToString and with reduced motion. */

const EASE = [0.16, 1, 0.3, 1];
const WORD_DURATION = 0.34; // seconds each streamed word takes to land

const formatInteger = (n) => Math.round(n).toLocaleString('en');

/* Returns the framer motion component for a tag name such as 'div' or 'p', or wraps a component once. */
function useMotionTag(as) {
  return useMemo(() => (typeof as === 'string' ? motion[as] : motion.create(as)), [as]);
}

/**
 * Fades its children in and lifts them `y` px the first time they scroll into view (70 px inside the viewport).
 * Input: children, delay and duration in seconds, y in px, className, as (tag name or component).
 * With reduced motion it renders a plain element, fully visible.
 */
export function Reveal({ children, delay = 0, y = 22, className = '', as = 'div', duration = 0.7 }) {
  const reduced = useReducedMotion();
  const MotionTag = useMotionTag(as);
  const cls = className || undefined;
  if (reduced) {
    const Tag = as;
    return <Tag className={cls}>{children}</Tag>;
  }
  return (
    <MotionTag
      className={cls}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Streams a string in word by word the first time it scrolls into view: each word goes from transparent, 4 px low and blurred to sharp, `stagger` seconds after the previous one.
 * A coral block caret blinks after the last word while the words land and fades out 600 ms after the last one lands.
 * Input: text (a string; anything else renders as is), as, className, delay and stagger in seconds, caret (boolean).
 * Screen readers get the text once from aria-label on the wrapper; the word spans are aria-hidden.
 * With reduced motion it renders the plain text with no caret.
 */
export function StreamText({ text, as = 'span', className = '', delay = 0, stagger = 0.028, caret = true }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [caretDone, setCaretDone] = useState(false);
  const isText = typeof text === 'string';
  const tokens = useMemo(() => (isText ? text.split(/(\s+)/).filter(Boolean) : []), [isText, text]);
  const isSpace = (tok) => /^\s/.test(tok);
  const wordCount = tokens.filter((tok) => !isSpace(tok)).length;
  const lastWord = tokens.findLastIndex((tok) => !isSpace(tok));
  const landedAt = delay + Math.max(0, wordCount - 1) * stagger + WORD_DURATION;
  const withCaret = caret && !reduced && wordCount > 0;

  useEffect(() => {
    if (!inView || !withCaret) return undefined;
    const timer = setTimeout(() => setCaretDone(true), landedAt * 1000 + 600);
    return () => clearTimeout(timer);
  }, [inView, withCaret, landedAt]);

  const Tag = as;
  if (!isText || reduced) return <Tag className={className || undefined}>{text}</Tag>;

  let wordIndex = -1;
  return (
    <Tag ref={ref} className={`st ${className}`.trim()} aria-label={text}>
      {tokens.map((tok, i) => {
        if (isSpace(tok)) return tok;
        wordIndex += 1;
        const word = (
          <motion.span
            key={i}
            className="st-w"
            aria-hidden="true"
            initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
            transition={{ duration: WORD_DURATION, delay: delay + wordIndex * stagger, ease: EASE }}
          >
            {tok}
          </motion.span>
        );
        if (i !== lastWord || !withCaret) return word;
        return (
          <span key={i} className="st-end">
            {word}
            <span className={`st-caret${inView ? ' is-on' : ''}${caretDone ? ' is-done' : ''}`} aria-hidden="true" />
          </span>
        );
      })}
    </Tag>
  );
}

/**
 * Counts from `from` up to `to` over `duration` seconds the first time it scrolls into view.
 * Input: to, from, duration (s), format (number to string; default rounds and adds thousands separators), className.
 * Output: a span with tabular figures. Server rendering and reduced motion show format(to).
 */
export function Counter({ to, from = 0, duration = 1.1, format = formatInteger, className = '' }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const value = useMotionValue(typeof window === 'undefined' ? to : from);
  const text = useTransform(value, (v) => format(v));

  useEffect(() => {
    if (reduced || !inView) return undefined;
    const controls = animate(value, to, { duration, ease: EASE });
    return () => controls.stop();
  }, [reduced, inView, to, duration, value]);

  const cls = `cc-counter ${className}`.trim();
  if (reduced) return <span className={cls}>{format(to)}</span>;
  return <motion.span ref={ref} className={cls}>{text}</motion.span>;
}

/**
 * Tracks which section the reader is in.
 * Input: ids, the section element ids in page order.
 * Output: { active, passed } where active is the last id whose top is at or above 40% of the viewport height (the last id once the page is scrolled to the bottom), and passed is a Set of the ids before it.
 * Server rendering returns { active: ids[0], passed: an empty Set }.
 */
// The hook sits beside the motion components it is used with; fast refresh reloads this file in full when it changes.
// oxlint-disable-next-line react/only-export-components
export function useActiveSection(ids) {
  const key = ids.join('|');
  const [active, setActive] = useState(ids[0]);
  const activeRef = useRef(ids[0]);

  useEffect(() => {
    const list = key ? key.split('|') : [];
    if (!list.length || typeof IntersectionObserver === 'undefined') return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let next = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && (atEnd || el.getBoundingClientRect().top <= line)) next = id;
      }
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // The observed region is the top 40% of the viewport, so a callback fires whenever a section top crosses the 40% line.
    const observer = new IntersectionObserver(schedule, { rootMargin: '0px 0px -60% 0px' });
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    // Scrolling to the very bottom crosses no section top, so scroll also triggers a measure (reads only, at most once a frame).
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  const passed = useMemo(() => {
    const list = key ? key.split('|') : [];
    const at = list.indexOf(active);
    return new Set(at > 0 ? list.slice(0, at) : []);
  }, [key, active]);

  return { active, passed };
}

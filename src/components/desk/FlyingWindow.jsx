import { useEffect, useLayoutEffect } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import MacWindow from '../cc/MacWindow';
import { useStep } from '../cc/scroll';

/* One chapter window on the landing desktop: it flies in from off-screen as the reader scrolls, holds in its slot around the Claude window, and flies out at the chapter end. Positions are in src/styles/desk.css (.dk-slot--*). */

const SPRING = { stiffness: 170, damping: 22 };
const IN_VH = 0.22; // scroll distance of a fly-in, in viewport heights
const OUT_VH = 0.16; // scroll distance of a fly-out, in viewport heights
const NEVER = 2; // a progress value a chapter never reaches
const FINALE_FROM = 0.5; // Mission Control starts here in a chapter with finale: true
const FINALE_CLEAR = 0.47; // earlier windows of that chapter leave from here
const SIDE = { tl: 'L', l: 'L', bl: 'L', tr: 'R', r: 'R', br: 'R', t: 'C', b: 'C' };
const CENTRE_X = { L: 16, R: 84, C: 50 }; // rough window centre, in vw
const CENTRE_Y = { tl: 24, tr: 24, t: 16, l: 50, r: 50, bl: 76, br: 76, b: 84 }; // rough window centre, in vh
const TILT = { left: -8, right: 8, top: -5, bottom: 6 }; // degrees at the start of a fly-in
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Works out when each window of a chapter flies in, turns inactive and flies out, in chapter-local progress (0 to 1).
 * Input: chapter (the chapter object; with finale: true, windows that land before 0.5 and have no out leave at 0.47), first (the page's first chapter: windows with at 0 are on screen from the start), last (the page's last chapter: windows never fly out), phone (bottom sheets: only the first two windows show, one at a time).
 * Output: one plan per window, in the order of chapter.windows: { at, inEnd, outStart, outEnd, next, genie, intro, hidden, order }.
 * at to inEnd is the fly-in, outStart to outEnd the fly-out, next the point where a newer window has landed and this one dims, genie marks the chapter's last window (it leaves toward the bottom centre), intro marks a window that flies in on page load.
 */
// The planner sits beside the window it drives; fast refresh reloads this file in full when it changes.
// oxlint-disable-next-line react/only-export-components
export function planWindows(chapter, { first = false, last = false, phone = false } = {}) {
  const len = chapter.length || 1;
  const dIn = Math.min(0.3, IN_VH / len);
  const dOut = Math.min(0.25, OUT_VH / len);
  const list = chapter.windows || [];

  if (phone) {
    const shown = Math.min(2, list.length);
    return list.map((w, i) => {
      if (i >= shown) return { at: NEVER, inEnd: NEVER + 1, outStart: NEVER + 2, outEnd: NEVER + 3, next: null, genie: false, intro: false, hidden: true, order: i };
      const half = shown === 2 ? 0.5 : 1;
      const start = i * half;
      const intro = first && i === 0;
      const lastSheet = i === shown - 1;
      return {
        at: intro ? -1 : start + 0.02,
        inEnd: intro ? 0 : start + 0.02 + Math.min(0.12, half * 0.25),
        outStart: last && lastSheet ? NEVER : start + half - Math.min(0.1, half * 0.18),
        outEnd: last && lastSheet ? NEVER + 1 : start + half,
        next: null,
        genie: false,
        intro,
        hidden: false,
        order: i,
      };
    });
  }

  const order = list.map((_, i) => i).sort((a, b) => (list[a].at || 0) - (list[b].at || 0) || a - b);
  const lastIndex = order[order.length - 1];
  return list.map((w, i) => {
    const intro = first && (w.at || 0) <= 0;
    const at = intro ? -1 : w.at || 0;
    const inEnd = intro ? 0 : Math.min(at + dIn, 0.98);
    // In a finale chapter, windows that land before Mission Control leave at 0.47 to clear the stage for it.
    const out = w.out ?? (chapter.finale && (w.at || 0) < FINALE_FROM ? FINALE_CLEAR : null);
    const hasOut = out != null;
    const outStart = last && !hasOut ? NEVER : hasOut ? out : 1 - dOut;
    const outEnd = last && !hasOut ? NEVER + 1 : hasOut ? Math.min(1, out + dOut) : 1;
    const pos = order.indexOf(i);
    const nextIndex = order[pos + 1];
    const nextAt = nextIndex != null ? list[nextIndex].at || 0 : null;
    const next = nextAt != null && nextAt > (w.at || 0) ? Math.min(nextAt + dIn * 0.6, 0.99) : null;
    return { at, inEnd, outStart, outEnd, next, genie: i === lastIndex && !hasOut && !last, intro, hidden: false, order: pos };
  });
}

/** Maps a window tone to the MacWindow tone and the body class: 'light' is the white body, 'dark' the dark grey body, 'terminal' the #1E1E1E body. */
function toneProps(tone = 'light') {
  return { mw: tone === 'light' ? 'auto' : 'dark', cls: `dk-content dk-content--${tone}` };
}

/**
 * One window from a chapter's windows list, flying on scroll.
 * Input: spec (the window object from the chapter: key, title, slot, from, w, at, out?, tone, Body), plan (from planWindows), progress (the chapter-local MotionValue, 0 to 1), phone (bottom-sheet motion), z (stacking order).
 * The window is always in the DOM; off stage it has opacity 0, aria-hidden and inert.
 */
export default function FlyingWindow({ spec, plan, progress, phone = false, z = 2 }) {
  const reduced = useReducedMotion();
  const { at, inEnd, outStart, outEnd, next, genie, intro, hidden, order } = plan;
  const slot = spec.slot || 'l';
  const from = spec.from || 'left';
  const side = SIDE[slot] || 'L';
  const cx = CENTRE_X[side];
  const cy = CENTRE_Y[slot] ?? 50;

  // Fly-in start: off-screen toward `from`, tilted, small and blurred.
  const x0 = from === 'left' ? -(cx + 34) : from === 'right' ? 100 - cx + 34 : side === 'L' ? -6 : side === 'R' ? 6 : 0;
  const y0 = from === 'top' ? -(cy + 44) : from === 'bottom' ? 100 - cy + 44 : -4;
  const r0 = TILT[from] ?? 0;
  // Fly-out end: toward the nearest screen edge, or down to the bottom centre (genie) for the chapter's last window.
  const outDir = side === 'L' ? 'left' : side === 'R' ? 'right' : slot === 't' ? 'top' : 'bottom';
  const x1 = genie ? 50 - cx : outDir === 'left' ? -(cx + 34) : outDir === 'right' ? 100 - cx + 34 : 0;
  const y1 = genie ? 100 - cy : outDir === 'top' ? -(cy + 44) : outDir === 'bottom' ? 100 - cy + 44 : 6;
  const r1 = genie ? 0 : outDir === 'left' ? -6 : outDir === 'right' ? 6 : 0;

  const tRaw = useTransform(progress, (v) => (hidden ? 0 : intro ? 1 : clamp01((v - at) / (inEnd - at))));
  const oRaw = useTransform(progress, (v) => (hidden ? 0 : clamp01((v - outStart) / (outEnd - outStart))));
  const t = useSpring(tRaw, SPRING);
  const o = useSpring(oRaw, SPRING);

  const x = useTransform([t, o], ([a, b]) => (phone ? 0 : `${(1 - a) * x0 + b * x1}vw`));
  const y = useTransform([t, o], ([a, b]) => (phone ? `${(1 - a) * 115 + b * 115}%` : `${(1 - a) * y0 + b * y1}vh`));
  const rotate = useTransform([t, o], ([a, b]) => (phone ? 0 : (1 - a) * r0 + b * r1));
  const scaleX = useTransform([t, o], ([a, b]) => (phone ? 1 : (0.86 + 0.14 * a) * (1 - b * (genie ? 0.86 : 0.1))));
  const scaleY = useTransform([t, o], ([a, b]) => (phone ? 1 : (0.86 + 0.14 * a) * (1 - b * (genie ? 0.95 : 0.1))));
  const opacity = useTransform([t, o], ([a, b]) => clamp01(a * 2.5) * (1 - clamp01((b - 0.35) / 0.65)));
  const filter = useTransform([t, o], ([a, b]) => {
    const blur = phone ? 0 : Math.max(0, 1 - a) * 8 + clamp01(b) * 6;
    return blur < 0.3 ? 'none' : `blur(${blur.toFixed(1)}px)`;
  });

  // The first chapter's windows fly in once on page load, one after another.
  useIsoLayoutEffect(() => {
    if (!intro || reduced) return undefined;
    t.jump(0);
    const id = setTimeout(() => t.set(1), 180 + order * 160);
    return () => clearTimeout(id);
  }, [intro, reduced, t, order]);

  // Step 1: on stage and active; step 2 (when a newer window lands): on stage and dimmed; the last step: gone.
  // Local progress sits at 0 for every chapter the reader has not reached, so a window with at 0 counts as on stage only once its chapter has begun.
  const onAt = intro ? at : Math.max(at, 0.001);
  const stops = next != null && next < outEnd ? [onAt, next, outEnd] : [onAt, outEnd];
  const step = useStep(progress, stops);
  const on = !hidden && step >= 1 && step < stops.length;
  const dim = stops.length === 3 && step === 2;
  const tone = toneProps(spec.tone);
  const { Body } = spec;

  return (
    <div
      className={`dk-slot dk-slot--${slot}${on ? ' is-on' : ' is-off'}`}
      style={{ '--w': `${spec.w || 340}px`, zIndex: z }}
      aria-hidden={on ? undefined : true}
      inert={on ? undefined : true}
    >
      <motion.div className="dk-fly" style={{ x, y, rotate, scaleX, scaleY, opacity, filter, transformOrigin: genie ? '50% 100%' : '50% 50%' }}>
        <div className={`dk-focus${dim ? ' is-dim' : ''}`}>
          <MacWindow title={spec.title} tone={tone.mw} inactive={dim} enter={false} className={`dk-win dk-win--${spec.tone || 'light'}`}>
            <div className={tone.cls}>
              <Body progress={progress} />
            </div>
          </MacWindow>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * The same window without motion, for the reduced-motion page: it sits in the document flow at its spec width.
 * Input: spec (the window object), progress (a MotionValue fixed at 1, so bodies show their finished state).
 */
export function StaticWindow({ spec, progress }) {
  const tone = toneProps(spec.tone);
  const { Body } = spec;
  return (
    <div className="dk-static-win" style={{ '--w': `${spec.w || 340}px` }}>
      <MacWindow title={spec.title} tone={tone.mw} enter={false} className={`dk-win dk-win--${spec.tone || 'light'}`}>
        <div className={tone.cls}>
          <Body progress={progress} />
        </div>
      </MacWindow>
    </div>
  );
}

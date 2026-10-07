import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { MenuBar } from '../cc/MenuBar';
import MacWindow from '../cc/MacWindow';
import { useStep } from '../cc/scroll';
import { ZwMark } from '../Icons';
import ShowcaseApp from './ShowcaseApp';
import FlyingWindow, { StaticWindow, planWindows } from './FlyingWindow';
import { CHAPTERS_A } from './chapters-a';
import { CHAPTERS_B } from './chapters-b';

/* The landing page as a macOS desktop: a fixed wallpaper, the menu bar, one tall scroll section with a pinned stage that holds the Claude window in the centre and each chapter's windows flying around it, then the footer window. */

const SPEC = '/Bundle_ZW-FS-001_v1_0.pdf';
const GITHUB = 'https://github.com/Zugzwang-world/bundle';
const CHAPTERS = [...CHAPTERS_A, ...CHAPTERS_B];
const LAST = CHAPTERS.length - 1;
const TOTAL = CHAPTERS.reduce((sum, c) => sum + (c.length || 1), 0);
const PHONE = '(max-width: 759px)';
const BREATHE = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

// Each chapter's share of the scroll section, as global progress from 0 to 1.
const BOUNDS = (() => {
  let acc = 0;
  return CHAPTERS.map((c) => {
    const start = acc / TOTAL;
    acc += c.length || 1;
    return { start, end: acc / TOTAL };
  });
})();
const CHAPTER_STOPS = BOUNDS.slice(1).map((b) => b.start);

// Every scene of the Claude window in page order; a chapter with a list of scenes splits its share evenly between them.
const SCENES = CHAPTERS.flatMap((c, i) => {
  const list = Array.isArray(c.scene) ? c.scene : [c.scene];
  const { start, end } = BOUNDS[i];
  const span = (end - start) / list.length;
  return list.map((scene, k) => ({ chapter: i, scene, start: start + span * k, end: start + span * (k + 1) }));
});
const SCENE_STOPS = SCENES.slice(1).map((s) => s.start);

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Returns the index of the scene that global progress v falls in. */
function sceneAt(v) {
  let i = 0;
  while (i < SCENE_STOPS.length && v >= SCENE_STOPS[i]) i += 1;
  return i;
}

/** The menu bar clock for a chapter: Meera's first retirement chat for chapter 00, the June re-ask for 01 to 09, and Today for 10 and 11. */
function clockFor(id) {
  if (id === 'top') return 'Thu 12 Mar 2026';
  if (id === 'scope' || id === 'journeys') return 'Today';
  return 'Tue 9 Jun 2026';
}

const MENUS = [
  { label: 'Zugzwang Foundation', spark: true, href: '#top' },
  {
    label: 'Bundle',
    items: [
      { label: 'Read the spec (PDF)', href: SPEC, target: '_blank', rel: 'noreferrer' },
      { label: 'Source on GitHub', href: GITHUB, target: '_blank', rel: 'noreferrer' },
      { divider: true },
      { label: 'Back to the top', href: '#top' },
    ],
  },
  { label: 'Spec', href: SPEC, target: '_blank', rel: 'noreferrer' },
];

const subscribePhone = (cb) => {
  const query = window.matchMedia(PHONE);
  query.addEventListener('change', cb);
  return () => query.removeEventListener('change', cb);
};
const phoneSnapshot = () => window.matchMedia(PHONE).matches;
const phoneServerSnapshot = () => false;

/** True under 760 px wide; false on the server. */
function usePhone() {
  return useSyncExternalStore(subscribePhone, phoneSnapshot, phoneServerSnapshot);
}

function Wallpaper() {
  return <div className="dk-wallpaper" aria-hidden="true" />;
}

/** The footer: a small window on the wallpaper with the Foundation line, the non-affiliation disclaimer (word for word) and the copyright line. */
function Footer() {
  return (
    <footer className="dk-footer">
      <MacWindow title="About this proposal" enter={false} className="dk-win dk-footer-win">
        <div className="dk-content">
          <div className="dk-footer-top">
            <span className="dk-footer-org">
              <ZwMark size={20} />
              <span>The Zugzwang Foundation</span>
            </span>
            <span className="dk-footer-doc">ZW-FS-001 · v1.0 · Published</span>
          </div>
          <p className="dk-small">
            Bundle — a feature specification for Claude, published by the Zugzwang Foundation (zugzwangworld.com) · An independent proposal. The Zugzwang Foundation is not affiliated with, commissioned by, or endorsed by Anthropic. “Claude” is used nominatively to name the product this proposal addresses; all interface depictions are illustrative reconstructions, not screenshots. Product facts verified against the live product on 2026-08-06; Claude ships gradually, and individual accounts may differ. ·{' '}
            <a href={SPEC} target="_blank" rel="noreferrer">Specification (PDF)</a>
          </p>
          <p className="dk-small dk-footer-copy">© 2026 The Zugzwang Foundation · zugzwangworld.com</p>
        </div>
      </MacWindow>
    </footer>
  );
}

// Mission Control: in the chapter with finale: true, one miniature window per earlier chapter tiles around the Claude window between local progress 0.50 and 0.80.
const FINALE = CHAPTERS.findIndex((c) => c.finale);
const MC_IN = 0.5; // first tile starts flying in
const MC_STAGGER = 0.012; // delay between tiles, in chapter order
const MC_FLY = 0.08; // length of one tile's fly-in
const MC_OUT = [0.74, 0.8]; // every tile fades and shrinks toward the Claude window over this range
const MC_SPRING = { stiffness: 170, damping: 22 };
// Tile places clockwise from the top left: the side of the Claude window and the fraction along that side.
const RING = [
  ['top', 0.18], ['top', 0.5], ['top', 0.82],
  ['right', 0.22], ['right', 0.5], ['right', 0.78],
  ['bottom', 0.82], ['bottom', 0.5], ['bottom', 0.18],
  ['left', 0.7], ['left', 0.3],
];

/** CSS position of a tile's centre on the stage, from the stage's --dk-* measurements. */
function ringPlace(side, f) {
  if (side === 'top') return { left: `calc(var(--dk-ml) + var(--dk-mw) * ${f})`, top: 'max(52px, calc(var(--dk-mt) / 2))' };
  if (side === 'bottom') return { left: `calc(var(--dk-ml) + var(--dk-mw) * ${f})`, top: 'min(calc(100% - 52px), calc(var(--dk-mt) * 1.5 + var(--dk-mh)))' };
  if (side === 'right') return { left: 'min(calc(100% - 72px), calc(var(--dk-ml) * 1.5 + var(--dk-mw)))', top: `calc(var(--dk-mt) + var(--dk-mh) * ${f})` };
  return { left: 'max(72px, calc(var(--dk-ml) / 2))', top: `calc(var(--dk-mt) + var(--dk-mh) * ${f})` };
}

/**
 * One miniature chapter window: it flies in from the edge its chapter's first window came from, holds in its ring place, then shrinks toward the Claude window and fades.
 * Input: chapter, index (chapter order, sets the stagger and the ring place), progress (the finale chapter's local MotionValue).
 */
function MiniTile({ chapter, index, progress }) {
  const [side, f] = RING[index % RING.length];
  const first = chapter.windows?.[0];
  const from = first?.from || 'left';
  const start = MC_IN + index * MC_STAGGER;
  const x0 = from === 'left' ? -45 : from === 'right' ? 45 : 0;
  const y0 = from === 'top' ? -50 : from === 'bottom' ? 50 : 0;
  const r0 = from === 'left' ? -8 : from === 'right' ? 8 : from === 'top' ? -5 : 6;
  // Toward the Claude window's centre, in vw and vh.
  const xc = side === 'left' ? 6 : side === 'right' ? -6 : (0.5 - f) * 12;
  const yc = side === 'top' ? 6 : side === 'bottom' ? -6 : (0.5 - f) * 12;

  const tRaw = useTransform(progress, (v) => clamp01((v - start) / MC_FLY));
  const oRaw = useTransform(progress, (v) => clamp01((v - MC_OUT[0]) / (MC_OUT[1] - MC_OUT[0])));
  const t = useSpring(tRaw, MC_SPRING);
  const o = useSpring(oRaw, MC_SPRING);
  const x = useTransform([t, o], ([a, b]) => `${(1 - a) * x0 + b * xc}vw`);
  const y = useTransform([t, o], ([a, b]) => `${(1 - a) * y0 + b * yc}vh`);
  const rotate = useTransform(t, (a) => (1 - a) * r0);
  const scale = useTransform([t, o], ([a, b]) => (0.7 + 0.3 * a) * (1 - 0.45 * clamp01(b)));
  const opacity = useTransform([t, o], ([a, b]) => clamp01(a * 2.5) * (1 - clamp01(b)));

  return (
    <div className="dk-mc-tile" style={ringPlace(side, f)}>
      <motion.div className="dk-mc-fly" style={{ x, y, rotate, scale, opacity }}>
        <div className="dk-mc-thumb">
          <MacWindow title={`${chapter.num} · ${chapter.title}`} enter={false} className="dk-win dk-mc-win">
            <div className="dk-content">
              <p className="dk-label">{chapter.num} · {chapter.spec}</p>
              <p className="dk-mc-h">{first?.title || chapter.title}</p>
            </div>
          </MacWindow>
        </div>
        <p className="dk-mc-label">{chapter.num} {chapter.title}</p>
      </motion.div>
    </div>
  );
}

/** The Mission Control layer: a decorative copy of every chapter before the finale, tiled around the Claude window. Desktop only. */
function MissionControl({ progress }) {
  const { start, end } = BOUNDS[FINALE];
  const local = useTransform(progress, (v) => clamp01((v - start) / (end - start)));
  return (
    <div className="dk-mc" aria-hidden="true" inert>
      {CHAPTERS.slice(0, FINALE).map((c, i) => <MiniTile key={c.id} chapter={c} index={i} progress={local} />)}
    </div>
  );
}

/** One chapter's windows on the stage, driven by that chapter's local progress. */
function ChapterWindows({ chapter, index, progress, phone }) {
  const { start, end } = BOUNDS[index];
  const local = useTransform(progress, (v) => clamp01((v - start) / (end - start)));
  const plans = useMemo(() => planWindows(chapter, { first: index === 0, last: index === LAST, phone }), [chapter, index, phone]);
  return chapter.windows.map((w, k) => (
    <FlyingWindow key={w.key} spec={w} plan={plans[k]} progress={local} phone={phone} z={2 + index * 10 + k} />
  ));
}

/** The scrolling desktop: the pinned stage with the Claude window and every chapter's windows. */
function ScrollDesktop() {
  const ref = useRef(null);
  const phone = usePhone();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // A function transform keeps progress on the main thread (see ScrollScene in scroll.jsx).
  const progress = useTransform(scrollYProgress, (v) => v);
  const chapterIndex = useStep(progress, CHAPTER_STOPS);
  const sceneIndex = useStep(progress, SCENE_STOPS);
  const sceneProgress = useTransform(progress, (v) => {
    const s = SCENES[sceneAt(v)];
    return clamp01((v - s.start) / (s.end - s.start));
  });
  const scene = SCENES[sceneIndex]?.scene || 'list';

  // The Claude window breathes from 98% to full size each time its scene changes.
  const breathe = useMotionValue(1);
  const lastScene = useRef(scene);
  useEffect(() => {
    if (lastScene.current === scene) return undefined;
    lastScene.current = scene;
    const anim = animate(breathe, [0.98, 1], BREATHE);
    return () => anim.stop();
  }, [scene, breathe]);

  return (
    <div className="dk-page">
      <Wallpaper />
      <MenuBar className="dk-menubar" items={MENUS} clock={clockFor(CHAPTERS[chapterIndex]?.id)} />
      <main className="dk-area">
        <section ref={ref} className="dk-scroll" style={{ height: `${TOTAL * 100}vh` }} aria-label="Bundle, chapter by chapter">
          {CHAPTERS.map((c, i) => (
            <span key={c.id} id={c.id} className="dk-anchor" style={{ top: `calc(${BOUNDS[i].start} * (100% - 100vh))` }} />
          ))}
          <div className="dk-stage">
            <motion.div className="dk-main" style={{ scale: breathe }}>
              <MacWindow tone="dark" title="Claude" enter={false} className="dk-main-win" bodyClassName="dk-main-body">
                <ShowcaseApp scene={scene} progress={sceneProgress} compact={phone} />
              </MacWindow>
            </motion.div>
            {FINALE > 0 && !phone && <MissionControl progress={progress} />}
            {CHAPTERS.map((c, i) => (
              <ChapterWindows key={c.id} chapter={c} index={i} progress={progress} phone={phone} />
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}

/** The reduced-motion page: the Claude window once in its ready scene, then every chapter's windows stacked in order. */
function StaticDesktop() {
  const phone = usePhone();
  const done = useMotionValue(1);
  return (
    <div className="dk-page is-static">
      <Wallpaper />
      <MenuBar className="dk-menubar" items={MENUS} clock="Today" />
      <main className="dk-area dk-static">
        <div className="dk-main dk-main--static">
          <MacWindow tone="dark" title="Claude" enter={false} className="dk-main-win" bodyClassName="dk-main-body">
            <ShowcaseApp scene="ready" progress={done} compact={phone} />
          </MacWindow>
        </div>
        {CHAPTERS.map((c) => (
          <section key={c.id} id={c.id} className="dk-static-chapter" aria-label={`${c.num} ${c.title}`}>
            {c.windows.map((w) => <StaticWindow key={w.key} spec={w} progress={done} />)}
          </section>
        ))}
        <Footer />
      </main>
    </div>
  );
}

/** The landing page. With reduced motion nothing flies or pins. */
export default function Desktop() {
  const reduced = useReducedMotion();
  return reduced ? <StaticDesktop /> : <ScrollDesktop />;
}

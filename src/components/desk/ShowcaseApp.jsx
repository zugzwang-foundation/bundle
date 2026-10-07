import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { CONCERNS, FRESH_CHATS, MEERA_CHATS, byNewest, dateLabel } from '../../data/chats';
import { ChatGlyph, Chevron, Dots, Spark } from '../Icons';
import { useStep } from '../cc/scroll';

/*
  The Claude window on the landing: Meera's Chats and tasks page in the dark claude.ai look, drawn for one scene at a time.
  Every scene is a pure derivation from src/data/chats.js. No store, no storage, no timers.
  React state changes only when the chapter's progress crosses a step threshold, never per scroll frame.
*/

const EASE = [0.16, 1, 0.3, 1];
const rowSpring = { type: 'spring', stiffness: 380, damping: 38 };

const NON_PROJECT = MEERA_CHATS.filter((ch) => !ch.project).sort(byNewest);
const PROJECT_CHATS = MEERA_CHATS.filter((ch) => ch.project).sort(byNewest);
const PROJECT_NAME = PROJECT_CHATS[0]?.project || '';
const FRESH = [...FRESH_CHATS].sort(byNewest);
const JOIN_CHAT = { id: 'j1', title: 'How do I say ‘the landlord raised the rent’ in Spanish?', date: 'today', concern: 'spanish' };

// Bundle order is fixed by each concern's latest chat in Meera's data (§11: groups stay put, a new chat never reorders them).
const latestOf = (key) => NON_PROJECT.find((ch) => ch.concern === key)?.date || '';
const BUNDLE_KEYS = Object.keys(CONCERNS).sort((a, b) => latestOf(b).localeCompare(latestOf(a)));

// J-3 in the spec: Claude named a bundle Apartment hunt; Meera types Anaya’s flat.
const RENAME_KEY = 'apartment';
const RENAME_FROM = CONCERNS[RENAME_KEY].defaultName;
const RENAME_TO = 'Anaya’s flat';
const TYPE_STOPS = Array.from({ length: RENAME_TO.length }, (_, i) => Math.round((0.3 + i * 0.04) * 100) / 100);

const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06'];
const NAV = ['New', 'Chats and tasks', 'Projects', 'Artifacts', 'Scheduled', 'Customize'];

/* Progress thresholds per scene. The step index is how many thresholds the chapter's progress has passed. */
const STOPS = {
  arrive: [0.16, 0.34, 0.52, 0.72, 0.86],
  toggle: [0.5],
  anatomy: [0.08, 0.2, 0.32, 0.44, 0.56, 0.68],
  rename: [0.1, 0.22, ...TYPE_STOPS, 0.84],
  remove: [0.16, 0.36, 0.56],
  hide: [0.12, 0.26, 0.42, 0.62],
  join: [0.3, 0.62],
  off: [0.4],
};
const NO_STOPS = [];

function stepOf(value, stops) {
  let step = 0;
  while (step < stops.length && value >= stops[step]) step += 1;
  return step;
}

function setReady(v) {
  v.toggleOn = true;
  v.phase = 'ready';
}

/**
 * Builds what the window shows for one scene at one step.
 * Input: scene name, step index. Output: a plain view object (toggle, phase, corrections, menus, toast, focus).
 */
function deriveView(scene, step) {
  const v = {
    account: 'meera',
    chats: NON_PROJECT,
    projects: PROJECT_CHATS,
    toggleOn: false,
    disabled: false,
    pulse: false,
    tip: false,
    phase: 'off', // off | generating | ready | thin | failed
    memoryOff: false,
    note: false,
    collapsed: { spanish: true, health: true, apartment: true },
    removed: {},
    hidden: {},
    names: {},
    renaming: null,
    bundleMenu: null,
    rowMenu: null,
    dialog: false,
    toast: null,
    outline: [],
    joinChat: null,
    joinPending: false,
    highlight: null,
    flash: null,
    sensitive: null,
    markers: 0,
    dots: null,
    focus: null,
    focusBelow: 0,
  };

  switch (scene) {
    case 'arrive': {
      const upto = MONTHS[Math.min(step, MONTHS.length - 1)];
      v.chats = NON_PROJECT.filter((ch) => ch.date.slice(0, 7) <= upto);
      v.projects = PROJECT_CHATS.filter((ch) => ch.date.slice(0, 7) <= upto);
      if (step >= 4) v.outline = ['r2'];
      if (step >= 5) {
        v.outline = ['r2', 'r5'];
        v.focus = 'row-r5';
      }
      break;
    }
    case 'toggle':
      v.tip = true;
      v.pulse = step === 0;
      v.toggleOn = step >= 1;
      break;
    case 'generating':
      v.toggleOn = true;
      v.phase = 'generating';
      break;
    case 'ready':
      setReady(v);
      v.note = true;
      break;
    case 'anatomy':
      setReady(v);
      v.note = true;
      v.markers = step;
      v.dots = 'retirement';
      break;
    case 'rename':
      setReady(v);
      if (step >= 1) v.focus = `head-${RENAME_KEY}`;
      if (step === 1) {
        v.bundleMenu = { key: RENAME_KEY, pick: 'rename' };
        v.focusBelow = 96;
      }
      if (step >= 2 && step <= TYPE_STOPS.length + 1) {
        v.renaming = { key: RENAME_KEY, text: step === 2 ? RENAME_FROM : RENAME_TO.slice(0, step - 2), selected: step === 2 };
      }
      if (step > TYPE_STOPS.length + 1) {
        v.names = { [RENAME_KEY]: RENAME_TO };
        v.flash = RENAME_KEY;
      }
      break;
    case 'remove':
      setReady(v);
      v.focus = 'row-r4';
      if (step === 1 || step === 2) v.rowMenu = { id: 'r4', pick: step === 2 };
      if (step >= 3) {
        v.removed = { r4: true };
        v.toast = 'Removed from bundle.';
        v.focusBelow = 72;
      }
      break;
    case 'hide':
      setReady(v);
      if (step >= 1) v.focus = 'head-health';
      if (step === 1 || step === 2) {
        v.bundleMenu = { key: 'health', pick: step === 2 ? 'hide' : null };
        v.focusBelow = 96;
      }
      if (step === 3) v.dialog = true;
      if (step >= 4) {
        v.hidden = { health: true };
        v.toast = 'Bundle hidden.';
        v.focus = 'all-label';
        v.focusBelow = 190;
      }
      break;
    case 'failed':
      v.toggleOn = true;
      v.phase = 'failed';
      break;
    case 'memory-off':
      v.memoryOff = true;
      v.disabled = true;
      break;
    case 'thin':
      v.account = 'fresh';
      v.chats = FRESH;
      v.projects = [];
      v.toggleOn = true;
      v.phase = 'thin';
      break;
    case 'sensitive':
      setReady(v);
      v.collapsed = { spanish: true, apartment: true };
      v.sensitive = 'health';
      v.focus = 'head-health';
      v.focusBelow = 150;
      break;
    case 'join':
      setReady(v);
      v.collapsed = { retirement: true, spanish: step < 2, health: true, apartment: true };
      if (step >= 1) v.joinChat = JOIN_CHAT;
      v.joinPending = step === 1;
      if (step === 1) v.focus = `row-${JOIN_CHAT.id}`;
      if (step >= 2) {
        v.highlight = JOIN_CHAT.id;
        v.focus = 'head-spanish';
        v.focusBelow = 40;
      }
      break;
    case 'off':
      if (step === 0) {
        setReady(v);
        v.note = true;
      }
      break;
    default:
      break;
  }
  return v;
}

/**
 * Splits the scene's chats into bundles and the chronological list, the way selectIndex does.
 * Input: a view from deriveView. Output: { bundles, list }; every chat is in exactly one of them (INV-2), and the list is always present (INV-1).
 */
function buildIndex(v) {
  const chats = v.joinChat ? [v.joinChat, ...v.chats] : v.chats;
  if (v.phase !== 'ready') return { bundles: [], list: chats };
  const bundles = BUNDLE_KEYS.filter((key) => !v.hidden[key])
    .map((key) => ({
      key,
      name: v.names[key] || CONCERNS[key].defaultName,
      collapsed: Boolean(v.collapsed[key]),
      chats: chats.filter((ch) => ch.concern === key && !v.removed[ch.id] && !(v.joinPending && ch.id === JOIN_CHAT.id)),
    }))
    .filter((b) => b.chats.length > 0);
  const bundled = new Set(bundles.flatMap((b) => b.chats.map((ch) => ch.id)));
  return { bundles, list: chats.filter((ch) => !bundled.has(ch.id)) };
}

/* Distance from el to ancestor, summed through offset parents; transforms from running animations do not count. */
function offsetIn(el, ancestor) {
  let top = 0;
  let node = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return node === ancestor ? top : null;
}

function Switch({ on, disabled = false, mini = false, label }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      aria-disabled={disabled || undefined}
      aria-label={label}
      className={`cl-switch sc-switch ${mini ? 'is-mini' : ''} ${on ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <span className="cl-switch-knob" />
    </span>
  );
}

/* A numbered Fig. 4 marker that pops in once the anatomy scene reaches its number. */
function Mark({ n, count, row = false, left = false }) {
  return (
    <AnimatePresence initial={false}>
      {count >= n && (
        <motion.span
          key="m"
          className={`sc-mark ${row ? 'is-row' : ''} ${left ? 'is-left' : ''}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 26 }}
          aria-hidden="true"
        >
          {n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Row({ chat, v, fresh, compact, marks = 0 }) {
  const classes = ['cl-row', 'sc-row'];
  if (v.outline.includes(chat.id)) classes.push('is-outline');
  if (v.highlight === chat.id) classes.push('is-join');
  const menuOpen = v.rowMenu?.id === chat.id;
  return (
    <motion.div
      layout="position"
      layoutId={`sc-${chat.id}`}
      transition={rowSpring}
      initial={fresh ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={classes.join(' ')}
      data-sc-key={`row-${chat.id}`}
    >
      <span className="cl-row-glyph"><ChatGlyph size={compact ? 13 : 15} /></span>
      <span className="cl-row-title">{chat.title}</span>
      <span className="cl-row-date">{dateLabel(chat.date)}</span>
      <span className={`cl-row-dots ${menuOpen ? 'is-open' : ''}`}><Dots /></span>
      <Mark n={6} count={marks} row />
    </motion.div>
  );
}

function BundleSection({ b, v, isFresh, compact }) {
  const marks = b.key === 'retirement' ? v.markers : 0;
  const renaming = v.renaming?.key === b.key ? v.renaming : null;
  const dotsOpen = v.bundleMenu?.key === b.key || v.dots === b.key;
  return (
    <motion.section
      layout
      transition={rowSpring}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
      className={`cl-bundle sc-bundle ${v.sensitive === b.key ? 'is-sensitive' : ''}`}
    >
      <div className="cl-bundle-head" data-sc-key={`head-${b.key}`}>
        <span className="sc-part">
          <span className="cl-bundle-chevron"><Chevron open={!b.collapsed} /></span>
          <Mark n={1} count={marks} />
        </span>
        <span className="sc-part">
          {renaming ? (
            <span className={`cl-rename-input sc-rename ${renaming.selected ? 'is-selected' : ''}`}>
              <span className="sc-rename-text">{renaming.text}</span>
              {!renaming.selected && <span className="sc-caret" aria-hidden="true" />}
            </span>
          ) : (
            <span key={b.name} className={`cl-bundle-name ${v.flash === b.key ? 'sc-flash' : ''}`}>{b.name}</span>
          )}
          <Mark n={2} count={marks} />
        </span>
        <span className="sc-part">
          <span className="cl-bundle-count">{b.chats.length}</span>
          <Mark n={3} count={marks} left />
        </span>
        <span className="sc-part">
          <Spark size={11} />
          <Mark n={4} count={marks} />
        </span>
        <span className="grow" />
        <span className="sc-part">
          <span className={`cl-bundle-dots ${dotsOpen ? 'is-open' : ''}`}><Dots /></span>
          <Mark n={5} count={marks} />
        </span>
      </div>
      <AnimatePresence initial={false}>
        {!b.collapsed && (
          <motion.div
            key="rows"
            className="cl-bundle-rows"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: EASE }}
          >
            {b.chats.map((ch, i) => (
              <Row key={ch.id} chat={ch} v={v} fresh={isFresh(ch.id)} compact={compact} marks={i === 0 ? marks : 0} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function StateCard({ children }) {
  return (
    <motion.div
      layout
      className="cl-statecard"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.14 } }}
    >
      {children}
    </motion.div>
  );
}

function Skeletons() {
  return (
    <motion.div
      layout
      className="cl-skel"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="cl-skel-label">
        <span className="cl-spin" aria-hidden="true" />
        Finding related chats…
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="cl-skel-section" aria-hidden="true">
          <div className="cl-skel-line" style={{ paddingLeft: 0 }}>
            <div className="cl-skel-bar cl-skel-dot" />
            <div className="cl-skel-bar" style={{ width: i ? 128 : 156 }} />
          </div>
          <div className="cl-skel-line"><div className="cl-skel-bar cl-skel-dot" /><div className="cl-skel-bar" style={{ width: i ? 210 : 244 }} /></div>
          <div className="cl-skel-line"><div className="cl-skel-bar cl-skel-dot" /><div className="cl-skel-bar" style={{ width: i ? 176 : 198 }} /></div>
        </div>
      ))}
    </motion.div>
  );
}

function MenuItem({ label, kbd, hot = false, isNew = false, danger = false, submarker = false }) {
  const cls = ['cl-menu-item', hot && 'sc-hot', isNew && 'is-new', danger && 'is-danger'].filter(Boolean).join(' ');
  return (
    <div className={cls} role="menuitem">
      <span className="grow">{label}</span>
      {submarker && <span className="sc-sub">›</span>}
      {kbd && <span className="kbd">{kbd}</span>}
    </div>
  );
}

/* The sidebar mirror: projects, Recents with the mini toggle, the same bundles and the newest chats. */
function SideBar({ v, index }) {
  return (
    <aside className="sc-side" aria-hidden="true">
      <div className="cl-brand">Claude</div>
      <div className="cl-nav">
        {NAV.map((item) => (
          <div key={item} className={`cl-nav-item ${item === 'Chats and tasks' ? 'is-active' : ''}`}>{item}</div>
        ))}
      </div>
      <div className="sc-side-scroll">
        {v.projects.length > 0 && (
          <div>
            <div className="cl-side-section-head">
              <Chevron open size={11} />
              <span className="sc-grow">{PROJECT_NAME}</span>
              <span className="count">{v.projects.length}</span>
            </div>
            <div className="cl-side-indent">
              {v.projects.map((ch) => (
                <motion.div key={ch.id} layout="position" layoutId={`scs-${ch.id}`} transition={rowSpring} className="cl-side-row">
                  <ChatGlyph size={13} />
                  <span className="t">{ch.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <div className="cl-side-label">
          Recents
          <span className="grow" />
          <Switch mini on={v.toggleOn && !v.memoryOff} disabled={v.disabled} label="Bundle chats" />
        </div>
        <AnimatePresence initial={false}>
          {index.bundles.map((b) => (
            <motion.div
              key={b.key}
              layout="position"
              transition={rowSpring}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
            >
              <div className="cl-side-section-head">
                <Chevron open={!b.collapsed} size={11} />
                <span className="sc-grow">{b.name}</span>
                <span className="count">{b.chats.length}</span>
                <Spark size={10} />
              </div>
              {!b.collapsed && (
                <div className="cl-side-indent">
                  {b.chats.map((ch) => (
                    <motion.div key={ch.id} layout="position" layoutId={`scs-${ch.id}`} transition={rowSpring} className="cl-side-row">
                      <ChatGlyph size={13} />
                      <span className="t">{ch.title}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {index.list.slice(0, 14).map((ch) => (
          <motion.div key={ch.id} layout="position" layoutId={`scs-${ch.id}`} transition={rowSpring} className="cl-side-row">
            <ChatGlyph size={13} />
            <span className="t">{ch.title}</span>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}

/**
 * Meera's Chats and tasks page for one landing scene.
 * Input: scene ('list' | 'arrive' | 'toggle' | 'generating' | 'ready' | 'anatomy' | 'rename' | 'remove' | 'hide' | 'failed' | 'memory-off' | 'thin' | 'sensitive' | 'join' | 'off'), progress (a motion value 0..1 for steps inside the scene; undefined means 1), compact (phones: no sidebar, smaller type, about 10 list rows).
 * Output: a window body that fills its parent; rows carry layoutId `sc-<chat id>` inside LayoutGroup "showcase", so they fly when the scene or step changes.
 */
export default function ShowcaseApp({ scene = 'list', progress, compact = false }) {
  const idle = useMotionValue(1);
  const p = progress || idle;
  const stops = STOPS[scene] || NO_STOPS;
  // useStep re-renders this component when a threshold is crossed; the step itself is read from the current value so a scene change never renders with the previous scene's step.
  useStep(p, stops);
  const step = stepOf(p.get(), stops);
  const reduced = useReducedMotion();

  const v = useMemo(() => deriveView(scene, step), [scene, step]);
  const index = useMemo(() => buildIndex(v), [v]);

  // Compact windows keep about ten list rows, plus any row the scene points at.
  let list = index.list;
  if (compact) {
    const wanted = [...v.outline, v.focus?.startsWith('row-') ? v.focus.slice(4) : null]
      .filter(Boolean)
      .map((id) => list.findIndex((ch) => ch.id === id));
    list = list.slice(0, Math.max(10, ...wanted.map((i) => i + 1)));
  }

  // Rows that were not on screen in the previous render fade in; rows that were on screen fly to their new place.
  const seen = useRef(null);
  const ids = [...index.bundles.flatMap((b) => (b.collapsed ? [] : b.chats.map((ch) => ch.id))), ...list.map((ch) => ch.id)];
  const isFresh = (id) => seen.current !== null && !seen.current.has(id);
  const idsKey = ids.join(',');
  useEffect(() => {
    seen.current = new Set(idsKey.split(','));
  }, [idsKey]);

  const scrollRef = useRef(null);
  const pageRef = useRef(null);
  const [menuTop, setMenuTop] = useState(null);
  const anchor = v.bundleMenu ? `head-${v.bundleMenu.key}` : v.rowMenu ? `row-${v.rowMenu.id}` : null;

  // Menus sit under the row or bundle head they belong to, measured once per step.
  useEffect(() => {
    const page = pageRef.current;
    const el = anchor && page ? page.querySelector(`[data-sc-key="${anchor}"]`) : null;
    const top = el ? offsetIn(el, page) : null;
    setMenuTop(top === null ? null : top + el.offsetHeight + 2);
  }, [anchor, scene, step, compact]);

  // The page scrolls just enough to show the part of the scene that changes; with no focus it returns to the top.
  useEffect(() => {
    const scroller = scrollRef.current;
    const page = pageRef.current;
    if (!scroller || !page) return;
    let target = 0;
    const el = v.focus ? page.querySelector(`[data-sc-key="${v.focus}"]`) : null;
    if (el) {
      const top = offsetIn(el, page) ?? 0;
      const bottom = top + el.offsetHeight + v.focusBelow;
      const h = scroller.clientHeight;
      target = scroller.scrollTop;
      if (bottom > target + h - 16) target = bottom - h + 16;
      if (top < target + 8) target = Math.max(0, top - 8);
    }
    if (Math.abs(target - scroller.scrollTop) > 1) scroller.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
  }, [v, compact, reduced]);

  const menu = v.bundleMenu || v.rowMenu;
  const showBundles = v.phase === 'ready';

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="showcase">
        <div className={`cl-app sc-app ${compact ? 'is-compact' : ''}`} data-scene={scene}>
          {!compact && <SideBar v={v} index={index} />}

          <motion.div className="sc-main" ref={scrollRef} layoutScroll>
            <div className="cl-page sc-page" ref={pageRef}>
              <h1 className="cl-page-title">Chats and tasks</h1>

              <div className="cl-controls">
                <span className="cl-chip">Filter by All ▾</span>
                <span className="cl-chip sc-opt">Select</span>
                <span className="grow" />
                <div className={`cl-toggle-wrap ${v.tip ? 'is-tip' : ''}`}>
                  <span className="cl-toggle-label">Bundle chats</span>
                  <span className={`sc-switch-wrap ${v.pulse ? 'is-pulse' : ''}`}>
                    <Switch on={v.toggleOn && !v.memoryOff} disabled={v.disabled} label="Bundle chats" />
                  </span>
                  <div className="cl-tooltip" role="tooltip">
                    Group related chats into bundles you can rename, edit, or hide.
                  </div>
                </div>
                <span className="cl-new-btn sc-opt">New</span>
              </div>

              {v.memoryOff && (
                <div className="cl-memory-note">
                  <span>
                    Bundle uses memory to understand your chats.{' '}
                    <span className="sc-door">Turn on memory</span> to bundle them.
                  </span>
                </div>
              )}

              <AnimatePresence initial={false} mode="popLayout">
                {v.phase === 'generating' && <Skeletons key="skel" />}
                {v.phase === 'failed' && (
                  <StateCard key="failed">
                    Claude couldn’t bundle your chats. Your list is unchanged.
                    <div>
                      <span className="cl-try">Try again</span>
                    </div>
                  </StateCard>
                )}
                {v.phase === 'thin' && (
                  <StateCard key="thin">Bundles will appear once you have a few chats about the same thing.</StateCard>
                )}
                {v.note && showBundles && (
                  <motion.div
                    key="note"
                    layout
                    className="cl-note"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.14 } }}
                  >
                    <Spark size={11} />
                    <span className="grow">Bundled by Claude. Rename, remove chats, or hide any bundle.</span>
                    <span className="cl-note-x" aria-hidden="true">×</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bundles render above the chronological list, never instead of it (INV-1). */}
              <div className="cl-bundles sc-bundles">
                <AnimatePresence initial={false}>
                  {index.bundles.map((b) => (
                    <BundleSection key={b.key} b={b} v={v} isFresh={isFresh} compact={compact} />
                  ))}
                </AnimatePresence>
              </div>

              <AnimatePresence initial={false}>
                {showBundles && (
                  <motion.div
                    key="all"
                    layout="position"
                    transition={rowSpring}
                    className="cl-all-label"
                    data-sc-key="all-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  >
                    All chats
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="cl-list">
                {list.map((ch) => (
                  <Row key={ch.id} chat={ch} v={v} fresh={isFresh(ch.id)} compact={compact} />
                ))}
              </div>

              <AnimatePresence>
                {menu && menuTop !== null && (
                  <motion.div
                    key={anchor}
                    className="cl-menu sc-menu"
                    role="menu"
                    style={{ top: menuTop }}
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.16, ease: EASE }}
                  >
                    {v.bundleMenu ? (
                      <>
                        <MenuItem label="Rename bundle" hot={v.bundleMenu.pick === 'rename'} />
                        <MenuItem label="Hide bundle" hot={v.bundleMenu.pick === 'hide'} />
                      </>
                    ) : (
                      <>
                        <MenuItem label="Pin" kbd="P" />
                        <MenuItem label="Mark as unread" kbd="U" />
                        <MenuItem label="Rename" kbd="R" />
                        <MenuItem label="Remove from bundle" kbd="B" isNew hot={v.rowMenu.pick} />
                        <MenuItem label="Change project" submarker />
                        <MenuItem label="Remove from project" />
                        <div className="cl-menu-sep" />
                        <MenuItem label="Delete" kbd="D" danger />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <AnimatePresence>
            {v.toast && (
              <motion.div
                key={v.toast}
                className="cl-toast sc-toast"
                role="status"
                initial={{ opacity: 0, y: 18, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 12, x: '-50%' }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {v.toast}
                <span className="sc-undo">Undo</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {v.dialog && (
              <motion.div
                key="dialog"
                className="cl-overlay sc-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <motion.div
                  className="cl-dialog sc-dialog"
                  role="alertdialog"
                  aria-modal="false"
                  initial={{ opacity: 0, scale: 0.88, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                >
                  <p className="sc-dialog-text">
                    <strong>Hide this bundle?</strong> Your chats stay in your list. The bundle just stops appearing.
                  </p>
                  <div className="cl-dialog-actions">
                    <span className="cl-btn-ghost">Cancel</span>
                    <span className="cl-btn-solid sc-default">Hide bundle</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

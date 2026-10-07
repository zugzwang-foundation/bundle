import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { MenuBar } from '../components/cc/MenuBar';
import MacWindow from '../components/cc/MacWindow';
import { TodoList } from '../components/cc/Transcript';
import { ScrollProgress } from '../components/cc/scroll';
import { useActiveSection } from '../components/cc/motion';
import { CHAPTERS } from '../components/landing/story';
import { MEERA_CHATS } from '../data/chats';
import Hero from '../components/landing/chapters/Hero';
import Problem from '../components/landing/chapters/Problem';
import Live from '../components/landing/chapters/Live';
import Anatomy from '../components/landing/chapters/Anatomy';
import Verbs from '../components/landing/chapters/Verbs';
import Invariants from '../components/landing/chapters/Invariants';
import States from '../components/landing/chapters/States';
import Sensitive from '../components/landing/chapters/Sensitive';
import Stability from '../components/landing/chapters/Stability';
import Engine from '../components/landing/chapters/Engine';
import Scope from '../components/landing/chapters/Scope';
import Journeys, { FinalCta } from '../components/landing/chapters/Journeys';
import Footer from '../components/landing/chapters/Footer';

const SPEC = '/Bundle_ZW-FS-001_v1_0.pdf';
const IDS = CHAPTERS.map((c) => c.id);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats an ISO date ("2026-03-12") as the menu bar clock shows it ("Thu 12 Mar 2026"), in UTC so server and browser agree. */
function clockDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Meera's first retirement chat opens the story; the June re-ask covers chapters 01 to 09; the last two chapters are about the product today.
const FIRST_CHAT = clockDate(
  MEERA_CHATS.filter((c) => c.concern === 'retirement').map((c) => c.date).sort()[0],
);
const REASK = 'Tue 9 Jun 2026';
const TODAY_IDS = new Set(['scope', 'journeys']);

/** Returns the clock text for the chapter the reader is in. */
function clockFor(id) {
  if (id === 'top') return FIRST_CHAT;
  if (TODAY_IDS.has(id)) return 'Today';
  return REASK;
}

const MENUS = [
  { label: 'Zugzwang Foundation', spark: true, href: '#top' },
  {
    label: 'Bundle',
    items: [
      { label: 'Open the prototype', as: Link, to: '/prototype' },
      { label: 'Read the spec (PDF)', href: SPEC },
      { divider: true },
      { label: 'Back to the top', href: '#top' },
    ],
  },
  { label: 'Chapters', items: CHAPTERS.map((c) => ({ label: `${c.num} ${c.title}`, href: `#${c.id}` })) },
  { label: 'Spec', href: SPEC, target: '_blank', rel: 'noreferrer' },
  { label: 'Prototype', as: Link, to: '/prototype' },
];

/** The floating "Chapters" utility window shown at 1200 px and wider: passed chapters are checked, the current one shows the spinner glyph, and clicking an item scrolls to it. */
function StoryRail({ active, passed }) {
  const reduced = useReducedMotion();
  const items = CHAPTERS.map((c) => ({ id: c.id, label: `${c.num} ${c.title}`, done: passed.has(c.id), href: `#${c.id}` }));
  const onSelect = useCallback(
    (id, e) => {
      const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
      if (!el) return;
      e?.preventDefault?.();
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    },
    [reduced],
  );
  return (
    <nav className="lp-rail" aria-label="Chapters">
      <MacWindow title="Chapters" variant="utility" enter={false}>
        <div className="lp-rail-body">
          <TodoList items={items} current={active} onSelect={onSelect} />
        </div>
      </MacWindow>
    </nav>
  );
}

// Chapter order and ids follow CHAPTERS in src/components/landing/story.js.
export default function Landing() {
  const { active, passed } = useActiveSection(IDS);
  return (
    <div className="zw-page lp-page">
      <MenuBar items={MENUS} clock={clockFor(active)} />
      <ScrollProgress />
      <StoryRail active={active} passed={passed} />
      <main className="lp-main">
        <Hero />
        <Problem />
        <Live />
        <Anatomy />
        <Verbs />
        <Invariants />
        <States />
        <Sensitive />
        <Stability />
        <Engine />
        <Scope />
        <Journeys />
        <FinalCta />
        <Footer />
      </main>
    </div>
  );
}

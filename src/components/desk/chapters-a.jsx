import { PushButton } from '../cc/PushButton';
import Token from '../cc/Token';
import { Keycap } from '../cc/Transcript';
import { Spark } from '../Icons';

// The chapter list carries its window bodies; fast refresh reloads this file in full when it changes.
/* oxlint-disable react/only-export-components */

/* Chapters 00 to 04 of the landing desktop. Each chapter names the Claude window's scene and the small windows that fly in around it; the engine is Desktop.jsx and FlyingWindow.jsx. */

const SPEC = '/Bundle_ZW-FS-001_v1_0.pdf';
const GITHUB = 'https://github.com/Zugzwang-world/bundle';

/** Chapter 00 headline: the name, one sentence on what Bundle is, and the two buttons. */
function HeroHead() {
  return (
    <>
      <p className="dk-label">00 · ZW-FS-001</p>
      <h1 className="dk-h dk-h--hero">Bundle</h1>
      <p className="dk-p">Bundle is one toggle on Claude’s chat index that groups related chats into named sections above the full chronological list.</p>
      <div className="dk-cta">
        <PushButton isDefault as="a" href={SPEC} target="_blank" rel="noreferrer">Read the spec</PushButton>
        <PushButton as="a" href={GITHUB} target="_blank" rel="noreferrer">Source on GitHub</PushButton>
      </div>
    </>
  );
}

function HeroProposal() {
  return (
    <>
      <p className="dk-label">Zugzwang Foundation</p>
      <p className="dk-p">ZW-FS-001 · An independent feature proposal for Claude</p>
    </>
  );
}

function HeroFigure() {
  return (
    <>
      <p className="dk-label">Figure 1</p>
      <p className="dk-p">Meera’s chats from March to June 2026. Nine of them are about retirement.</p>
      <p className="dk-small">Bundle gathers those nine into one section called Retirement planning, and her other chats stay where they were.</p>
    </>
  );
}

function ProblemHead() {
  return (
    <>
      <p className="dk-label">01 · §2</p>
      <h2 className="dk-h">Meera has had one conversation for four months.</h2>
      <p className="dk-p">Her chat index has recorded it as nine unrelated items.</p>
    </>
  );
}

function ProblemMonths() {
  return (
    <>
      <p className="dk-p">In March she asks Claude what a defined-contribution pension is. Three weeks later she asks whether a letter from her bank is genuine.</p>
      <p className="dk-p">In April she asks how annuities work and how withdrawals are taxed. In May she asks what the senior citizen savings scheme pays.</p>
      <p className="dk-small">The nine chats sit between recipes and birthday messages. Each one drifts further down a newest-first list as newer chats arrive.</p>
    </>
  );
}

function ProblemReask() {
  return (
    <>
      <p className="dk-p">She asked the same tax question on 15 April and again on 9 June.</p>
      <ul className="dk-list">
        <li><span className="dk-date">15 Apr</span> Tax on pension withdrawals</li>
        <li><span className="dk-date">9 Jun</span> <Token label="Pension withdrawal tax rules" size="sm" /></li>
      </ul>
      <p className="dk-small">In June she asks again because she cannot find the chat that holds the answer.</p>
    </>
  );
}

function ProblemMisses() {
  return (
    <>
      <ul className="dk-list">
        <li><b>Search</b> works when you know what to look for. Her chats have no shared place to look in.</li>
        <li><b>Projects</b> work when you plan ahead. Few people create a project on the day of one pension question.</li>
        <li><b>Memory</b> helps Claude understand her better with each chat. The index she scrolls has no way to show it.</li>
      </ul>
      <p className="dk-p">Bundle adds retroactive, zero-effort structure for people who will never build structure themselves.</p>
    </>
  );
}

function LiveHead() {
  return (
    <>
      <p className="dk-label">02 · §7</p>
      <h2 className="dk-h">One toggle. Off, nothing changes.</h2>
      <p className="dk-p">Turned on, bundles appear as sections above the chronological list.</p>
    </>
  );
}

function LiveToggle() {
  return (
    <>
      <p className="dk-small">The toggle on Chats and tasks reads</p>
      <p className="dk-p"><b>Bundle chats</b></p>
      <p className="dk-small">Its tooltip reads</p>
      <p className="dk-p">Group related chats into bundles you can rename, edit, or hide.</p>
    </>
  );
}

function LiveGenerating() {
  return (
    <>
      <p className="dk-p">While Claude groups her chats, skeleton sections and the line “Finding related chats…” sit above the list.</p>
      <p className="dk-small">The chronological list stays on screen the whole time.</p>
    </>
  );
}

function LiveReady() {
  return (
    <>
      <p className="dk-p">Bundles use the same layout as project sections. Each one carries the mark <Spark size={11} /> because Claude formed it.</p>
      <p className="dk-p">The full list continues below them under All chats.</p>
      <p className="dk-small">First formation note: “Bundled by Claude. Rename, remove chats, or hide any bundle.”</p>
    </>
  );
}

const PARTS = [
  ['Chevron', 'Collapse and expand; the state persists per bundle.'],
  ['Name', 'Specific or the bundle does not form. Once you rename it, it is yours; Claude never renames it back.'],
  ['Count', 'How many chats the bundle holds.'],
  ['The mark ✦', 'Formed by Claude. Project sections carry no mark, so the two kinds of section are easy to tell apart.'],
  ['Bundle menu', 'Two verbs, no more: Rename bundle, Hide bundle.'],
  ['Rows', 'Ordinary chat rows. Their menus gain exactly one item while bundled: Remove from bundle, shortcut B.'],
];

function AnatomyHead() {
  return (
    <>
      <p className="dk-label">03 · §7.1</p>
      <h2 className="dk-h">Everything a bundle is, on one card.</h2>
      <p className="dk-p">Figure 4 labels the six parts of a bundle section, and its menu holds two verbs.</p>
    </>
  );
}

function AnatomyParts() {
  return (
    <ol className="dk-list dk-list--num">
      {PARTS.map(([name, text], i) => (
        <li key={name}>
          <span className="dk-num">{i + 1}</span>
          <span><b>{name}</b> <span className="dk-small-inline">{text}</span></span>
        </li>
      ))}
    </ol>
  );
}

function AnatomyVerbs() {
  return (
    <>
      <p className="dk-p">The bundle menu holds two verbs and nothing else.</p>
      <ul className="dk-list">
        <li>Rename bundle</li>
        <li>Hide bundle</li>
      </ul>
      <p className="dk-small">While a chat sits in a bundle, its row menu gains one item: Remove from bundle, shortcut <Keycap>B</Keycap>.</p>
    </>
  );
}

function VerbsHead() {
  return (
    <>
      <p className="dk-label">04 · G4</p>
      <h2 className="dk-h">Correction is optional and two clicks from the name.</h2>
      <p className="dk-p">When Claude gets a bundle wrong, three verbs fix it, and Claude remembers every correction.</p>
    </>
  );
}

function VerbRename() {
  return (
    <>
      <p className="dk-p">The name becomes an inline text field with the text selected. After a rename, Claude never renames the bundle back.</p>
      <p className="dk-demo"><span className="dk-dim">Apartment hunt →</span> Anaya’s flat</p>
    </>
  );
}

function VerbRemove() {
  return (
    <>
      <p className="dk-p">The row leaves the section and sits in All chats exactly where its date puts it. A removal is remembered.</p>
      <p className="dk-demo">Removed from bundle. <span className="dk-undo">Undo</span></p>
      <p className="dk-small">Shortcut: <Keycap>B</Keycap> while the row menu is open.</p>
    </>
  );
}

function VerbHide() {
  return (
    <>
      <p className="dk-p">The section disappears and every chat shows in date order. A hidden bundle does not form again under another name.</p>
      <p className="dk-demo">Bundle hidden. <span className="dk-undo">Undo</span></p>
    </>
  );
}

export const CHAPTERS_A = [
  {
    id: 'top',
    num: '00',
    spec: 'ZW-FS-001',
    title: 'Bundle',
    scene: 'list',
    length: 1.2,
    windows: [
      { key: 'top-head', title: 'Bundle', slot: 'l', from: 'left', w: 400, at: 0, tone: 'light', Body: HeroHead },
      { key: 'top-fig', title: 'Figure 1', slot: 'br', from: 'bottom', w: 320, at: 0.3, tone: 'light', Body: HeroFigure },
      { key: 'top-proposal', title: 'ZW-FS-001', slot: 'tr', from: 'right', w: 300, at: 0, tone: 'light', Body: HeroProposal },
    ],
  },
  {
    id: 'problem',
    num: '01',
    spec: '§2',
    title: 'Meera’s four months',
    scene: 'arrive',
    length: 2,
    windows: [
      { key: 'problem-head', title: 'Meera’s chats', slot: 'tl', from: 'left', w: 360, at: 0.02, tone: 'light', Body: ProblemHead },
      { key: 'problem-months', title: 'Meera, 71', slot: 'bl', from: 'left', w: 360, at: 0.2, tone: 'light', Body: ProblemMonths },
      { key: 'problem-reask', title: 'The same question twice', slot: 'tr', from: 'right', w: 330, at: 0.5, tone: 'light', Body: ProblemReask },
      { key: 'problem-misses', title: 'What misses her', slot: 'br', from: 'bottom', w: 360, at: 0.7, tone: 'light', Body: ProblemMisses },
    ],
  },
  {
    id: 'live',
    num: '02',
    spec: '§7',
    title: 'One toggle',
    scene: ['toggle', 'generating', 'ready'],
    length: 2.4,
    windows: [
      { key: 'live-head', title: 'One toggle', slot: 'tl', from: 'left', w: 360, at: 0.02, tone: 'light', Body: LiveHead },
      { key: 'live-toggle', title: 'Bundle chats', slot: 'tr', from: 'right', w: 320, at: 0.1, tone: 'light', Body: LiveToggle },
      { key: 'live-generating', title: 'Generating', slot: 'bl', from: 'left', w: 340, at: 0.36, tone: 'light', Body: LiveGenerating },
      { key: 'live-ready', title: 'Ready', slot: 'br', from: 'bottom', w: 360, at: 0.7, tone: 'light', Body: LiveReady },
    ],
  },
  {
    id: 'anatomy',
    num: '03',
    spec: '§7.1',
    title: 'What a bundle is',
    scene: 'anatomy',
    length: 1.6,
    windows: [
      { key: 'anatomy-head', title: 'Anatomy', slot: 'tl', from: 'left', w: 340, at: 0.02, tone: 'light', Body: AnatomyHead },
      { key: 'anatomy-parts', title: 'Figure 4 · Parts', slot: 'bl', from: 'left', w: 380, at: 0.22, tone: 'light', Body: AnatomyParts },
      { key: 'anatomy-verbs', title: 'Two verbs', slot: 'r', from: 'right', w: 300, at: 0.5, tone: 'light', Body: AnatomyVerbs },
    ],
  },
  {
    id: 'verbs',
    num: '04',
    spec: 'G4',
    title: 'She corrects it',
    scene: ['rename', 'remove', 'hide'],
    length: 2.4,
    windows: [
      { key: 'verbs-head', title: 'Corrections', slot: 'tl', from: 'left', w: 360, at: 0.02, tone: 'light', Body: VerbsHead },
      { key: 'verbs-rename', title: 'Rename · J-3', slot: 'bl', from: 'left', w: 330, at: 0.08, out: 0.3, tone: 'light', Body: VerbRename },
      { key: 'verbs-remove', title: 'Remove · J-4', slot: 'bl', from: 'bottom', w: 330, at: 0.38, out: 0.63, tone: 'light', Body: VerbRemove },
      { key: 'verbs-hide', title: 'Hide · J-5', slot: 'bl', from: 'left', w: 330, at: 0.71, tone: 'light', Body: VerbHide },
    ],
  },
];

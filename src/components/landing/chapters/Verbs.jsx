import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';

/* Chapter 04 (G4): the three correction verbs, each in its own window with the product's response underneath. */

const VERBS = [
  {
    title: 'Rename',
    j: 'J-3',
    text: 'The name becomes an inline text field with the text selected. After a rename, Claude never renames the bundle back.',
    demo: <><span className="dim">Apartment hunt →</span> Anaya’s flat</>,
  },
  {
    title: 'Remove',
    j: 'J-4',
    text: 'The row leaves the section and sits in All chats exactly where its date puts it. A removal is remembered.',
    demo: <>Removed from bundle. <span className="undo">Undo</span></>,
  },
  {
    title: 'Hide',
    j: 'J-5',
    text: 'The section disappears and every chat shows in date order. A hidden bundle does not form again under another name.',
    demo: <>Bundle hidden. <span className="undo">Undo</span></>,
  },
];

export default function Verbs() {
  return (
    <Chapter
      id="verbs"
      num="04"
      spec="G4"
      title="Correction is optional and two clicks from the name."
      lead="Bundles form without any setup from her. When Claude gets one wrong, three verbs fix it. Each verb is two clicks from the bundle name, and Claude remembers every correction."
      band
    >
      <div className="lp-verbs">
        {VERBS.map((v, i) => (
          <Reveal key={v.title} y={12} duration={0.33} delay={0.5 + i * 0.17}>
            <MacWindow title={v.title} leading={v.j} className="lp-verb">
              <div className="lp-verb-body">
                <p>{v.text}</p>
                <div className="lp-verb-demo">{v.demo}</div>
              </div>
            </MacWindow>
          </Reveal>
        ))}
      </div>
    </Chapter>
  );
}

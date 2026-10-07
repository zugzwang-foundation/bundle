import { useState } from 'react';
import Chapter from '../../cc/Chapter';
import MacWindow from '../../cc/MacWindow';
import { Reveal } from '../../cc/motion';
import { ChatGlyph, Spark } from '../../Icons';

/* Chapter 03 (§7.1): the six parts of a bundle section. Hovering or focusing a part in the legend lights the same part on the card, and the reverse. */

const ANATOMY = [
  { n: 1, tt: 'Chevron', td: 'Collapse and expand; the state persists per bundle.' },
  { n: 2, tt: 'Name', td: 'Specific or the bundle does not form. Once you rename it, it is yours; Claude never renames it back.' },
  { n: 3, tt: 'Count', td: 'How many chats the bundle holds.' },
  { n: 4, tt: 'The mark ✦', td: 'Formed by Claude. Project sections carry no mark, so the two kinds of section are easy to tell apart.' },
  { n: 5, tt: 'Bundle menu', td: 'Two verbs, no more: Rename bundle, Hide bundle.' },
  { n: 6, tt: 'Rows', td: 'Ordinary chat rows. Their menus gain exactly one item while bundled: Remove from bundle, shortcut B.' },
];

export default function Anatomy() {
  const [lit, setLit] = useState(null);
  const hit = (n) => ({
    className: `anat-hit ${lit === n ? 'is-lit' : ''}`,
    onMouseEnter: () => setLit(n),
    onMouseLeave: () => setLit(null),
    style: { position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '2px 5px' },
  });

  return (
    <Chapter
      id="anatomy"
      num="03"
      spec="§7.1"
      title="Everything a bundle is, on one card."
      lead="Figure 4 labels the six parts of a bundle section. Its menu holds two verbs."
    >
        <div className="lp-anatomy">
          <div>
            <Reveal y={12} duration={0.33} delay={0.5}>
              <MacWindow title="Figure 4 · Parts" leading="Six parts, two verbs" className="lp-anat-legend-win">
              <div className="anat-legend">
                {ANATOMY.map((a) => (
                  <button
                    key={a.n}
                    type="button"
                    className={`anat-item ${lit === a.n ? 'is-lit' : ''}`}
                    onMouseEnter={() => setLit(a.n)}
                    onMouseLeave={() => setLit(null)}
                    onFocus={() => setLit(a.n)}
                    onBlur={() => setLit(null)}
                  >
                    <span className="n">{a.n}</span>
                    <span>
                      <span className="tt">{a.tt}</span>
                      <div className="td">{a.td}</div>
                    </span>
                  </button>
                ))}
              </div>
              </MacWindow>
            </Reveal>
          </div>

          <Reveal y={12} duration={0.33} delay={0.67} className="lp-anat-cardwrap">
            <MacWindow title="Retirement planning" tone="dark">
            <div className="anat-card">
              <div className="cl-bundle-head" style={{ gap: 6 }}>
                <span {...hit(1)}>
                  <span className="anat-badge">1</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)', color: 'var(--cl-faint)' }}>
                    <path d="m9 5 8 7-8 7" />
                  </svg>
                </span>
                <span {...hit(2)}>
                  <span className="anat-badge">2</span>
                  <span className="cl-bundle-name">Retirement planning</span>
                </span>
                <span {...hit(3)}>
                  <span className="anat-badge">3</span>
                  <span className="cl-bundle-count">9</span>
                </span>
                <span {...hit(4)}>
                  <span className="anat-badge">4</span>
                  <Spark size={11} />
                </span>
                <span className="grow" style={{ flex: 1 }} />
                <span {...hit(5)}>
                  <span className="anat-badge">5</span>
                  <span style={{ color: 'var(--cl-faint)', letterSpacing: 2, fontSize: 13 }}>···</span>
                </span>
              </div>

              <div {...hit(6)} style={{ display: 'block', position: 'relative', borderRadius: 10 }}>
                <span className="anat-badge" style={{ top: 18 }}>6</span>
                {[
                  ['Questions to ask a financial adviser', 'Jun 26'],
                  ['Pension withdrawal tax rules', 'Jun 9'],
                  ['Senior citizen savings scheme rates', 'May 21'],
                ].map(([t, d]) => (
                  <div key={t} className="cl-row" style={{ paddingLeft: 20 }}>
                    <span className="cl-row-glyph"><ChatGlyph size={14} /></span>
                    <span className="cl-row-title" style={{ cursor: 'default' }}>{t}</span>
                    <span className="cl-row-date">{d}</span>
                  </div>
                ))}
              </div>

              <div style={{ margin: '10px 8px 4px', borderRadius: 10, border: '1px solid var(--cl-hair)', background: '#191816', padding: 5, width: 180 }}>
                <div className="cl-menu-item"><span className="grow">Rename bundle</span></div>
                <div className="cl-menu-item"><span className="grow">Hide bundle</span></div>
              </div>
            </div>
            </MacWindow>
          </Reveal>
        </div>
    </Chapter>
  );
}

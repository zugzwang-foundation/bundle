import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Spark } from '../Icons';
import Token from '../cc/Token';

/*
  Figure 1, animated: Meera's chats from March to June. Her nine retirement chats gather into one section named Retirement planning while her other chats stay in place, then scatter again. The loop repeats every 6.2 s.
  The followed chat, "Pension withdrawal tax rules", is the coral Token. With reduced motion the figure shows the gathered state and does not loop.
*/

const TOKEN = 'Pension withdrawal tax rules';

const CONCERN_PILLS = [
  { t: 'Defined benefit vs defined contribution', l: 2, top: 15 },
  { t: 'EPF withdrawal rules after retirement', l: 27, top: 15 },
  { t: 'Is this bank letter about my pension genuine', l: 56, top: 15 },
  { t: 'How annuities work', l: 5, top: 29 },
  { t: 'Tax on pension withdrawals', l: 24, top: 29 },
  { t: 'Monthly budget on a fixed income', l: 51, top: 29 },
  { t: 'Senior citizen savings scheme rates', l: 2, top: 43 },
  { t: TOKEN, l: 34, top: 43, token: true },
  { t: 'Questions to ask a financial adviser', l: 62, top: 43 },
];

const NOISE_PILLS = [
  { t: 'Recipe for masala oats', l: 78, top: 29 },
  { t: 'Draft a birthday message for Ravi', l: 62, top: 57 },
  { t: 'Weekend trip ideas near Lonavala', l: 8, top: 57 },
  { t: 'What does deductible mean', l: 38, top: 57 },
];

const CARD_ROWS = [
  ['Questions to ask a financial adviser', 'Jun 26'],
  [TOKEN, 'Jun 9'],
];

export default function HeroGather() {
  const reduced = useReducedMotion();
  const [gathered, setGathered] = useState(Boolean(reduced));

  useEffect(() => {
    if (reduced) return undefined;
    const t = setTimeout(() => setGathered((g) => !g), gathered ? 3600 : 2600);
    return () => clearTimeout(t);
  }, [gathered, reduced]);

  const shown = reduced || gathered;

  return (
    <div className="gather" aria-hidden="true">
      <div className="gather-months">
        {['Mar', 'Apr', 'May', 'Jun'].map((m) => (
          <span key={m}>{m.toUpperCase()}</span>
        ))}
      </div>

      {CONCERN_PILLS.map((p, i) => (
        <motion.div
          key={p.t}
          className={`gather-pill is-concern ${p.token ? 'is-token' : ''}`}
          initial={false}
          animate={
            shown
              ? { left: '50%', top: '74%', x: '-50%', scale: 0.35, opacity: 0 }
              : { left: `${p.l}%`, top: `${p.top}%`, x: '0%', scale: 1, opacity: 1 }
          }
          transition={{
            duration: reduced ? 0 : 0.65,
            delay: reduced ? 0 : (shown ? i : CONCERN_PILLS.length - 1 - i) * 0.045,
            ease: [0.6, 0.05, 0.2, 1],
          }}
        >
          {p.token ? <Token label={p.t} size="sm" /> : p.t}
        </motion.div>
      ))}

      {NOISE_PILLS.map((p) => (
        <motion.div
          key={p.t}
          className="gather-pill is-noise"
          initial={false}
          animate={{ opacity: shown ? 0.4 : 0.85 }}
          transition={{ duration: reduced ? 0 : 0.6 }}
          style={{ left: `${p.l}%`, top: `${p.top}%` }}
        >
          {p.t}
        </motion.div>
      ))}

      <motion.div
        className="gather-card"
        initial={false}
        animate={shown ? { opacity: 1, scale: 1, y: 0, x: '-50%' } : { opacity: 0, scale: 0.95, y: 16, x: '-50%' }}
        transition={{ duration: reduced ? 0 : 0.5, delay: shown && !reduced ? 0.32 : 0, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="gather-card-head">
          <span className="chev">▾</span>
          <span className="nm">Retirement planning</span>
          <span className="ct">9</span>
          <Spark size={10} />
        </div>
        {CARD_ROWS.map(([t, d]) => (
          <div key={t} className="gather-card-row">
            <span className="grow">{t === TOKEN ? <Token label={t} size="sm" /> : t}</span>
            <span className="dt">{d}</span>
          </div>
        ))}
        <div className="gather-card-row is-more">
          <span className="grow">Seven more, back to 12 March</span>
        </div>
      </motion.div>
    </div>
  );
}

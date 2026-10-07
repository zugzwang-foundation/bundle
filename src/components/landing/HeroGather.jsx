import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Spark } from '../Icons';
import Token from '../cc/Token';

/*
  Figure 1, animated: Meera's chats from March to June. Her nine retirement chats gather into one section named Retirement planning while her other chats stay in place, then scatter again. The loop repeats every 6.2 s.
  The followed chat, "Pension withdrawal tax rules", is the coral Token. With reduced motion the figure shows the gathered state and does not loop.
*/

const TOKEN = 'Pension withdrawal tax rules';

// All thirteen chats in date order, laid out as a wrapping flow so no chip overlaps or truncates at any width. `concern` marks the nine retirement chats that gather into the section.
const PILLS = [
  { t: 'Defined benefit vs defined contribution', concern: true },
  { t: 'EPF withdrawal rules after retirement', concern: true },
  { t: 'Recipe for masala oats' },
  { t: 'Is this bank letter about my pension genuine', concern: true },
  { t: 'How annuities work', concern: true },
  { t: 'Weekend trip ideas near Lonavala' },
  { t: 'Tax on pension withdrawals', concern: true },
  { t: 'Monthly budget on a fixed income', concern: true },
  { t: 'Draft a birthday message for Ravi' },
  { t: 'Senior citizen savings scheme rates', concern: true },
  { t: 'What does deductible mean' },
  { t: TOKEN, concern: true, token: true },
  { t: 'Questions to ask a financial adviser', concern: true },
];
const CONCERN_COUNT = PILLS.filter((p) => p.concern).length;

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

      <div className="gather-flow">
        {PILLS.map((p) => {
          if (!p.concern) {
            return (
              <motion.div
                key={p.t}
                className="gather-pill is-noise"
                initial={false}
                animate={{ opacity: shown ? 0.4 : 0.85 }}
                transition={{ duration: reduced ? 0 : 0.6 }}
              >
                {p.t}
              </motion.div>
            );
          }
          const i = PILLS.filter((q) => q.concern).indexOf(p);
          return (
            <motion.div
              key={p.t}
              className={`gather-pill is-concern ${p.token ? 'is-token' : ''}`}
              initial={false}
              animate={shown ? { y: 56, scale: 0.35, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }}
              transition={{
                duration: reduced ? 0 : 0.65,
                delay: reduced ? 0 : (shown ? i : CONCERN_COUNT - 1 - i) * 0.045,
                ease: [0.6, 0.05, 0.2, 1],
              }}
            >
              {p.token ? <Token label={p.t} size="sm" /> : p.t}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="gather-card"
        initial={false}
        animate={shown ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
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

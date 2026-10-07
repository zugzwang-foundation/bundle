import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import MacWindow from '../../cc/MacWindow';
import { DrawPath, ScrollScene } from '../../cc/scroll';
import Token from '../../cc/Token';
import { MEERA_CHATS } from '../../../data/chats';
import { Reveal } from '../shared';

/* Chapter 01 (§2): Meera's chats drop onto a March to June axis as the reader scrolls, then a dotted line links her June re-ask (r2) back to the April chat (r5) that asked the same question. */

const SHOWN_IDS = ['r9', 'r8', 'u7', 'r7', 'r6', 'r5', 'u5', 'r4', 'r3', 'u2', 'r2', 'u1', 'r1'];
const SHOWN = SHOWN_IDS.map((id) => MEERA_CHATS.find((c) => c.id === id)).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
const START = Date.UTC(2026, 2, 1);
const SPAN = Date.UTC(2026, 6, 1) - START;
const LANES = 7; // lane count before the chips are measured
const LANE_TOP = 40; // px from the plot top to lane 0
const LANE_STEP = 30; // px between lanes
const LANE_GAP = 10; // px of clear space between two chips in one lane
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Distance in px from the plot top to the axis line, for a given number of lanes. */
function axisY(lanes) {
  return LANE_TOP + lanes * LANE_STEP + 8;
}

/**
 * Puts each chip in the first lane where it overlaps no chip already placed there.
 * Input: the plot width in px and each chip's width in px, in date order. Output: one lane index per chip.
 */
function packLanes(plotW, widths) {
  const lanes = [];
  return DROPS.map((d, i) => {
    const w = widths[i];
    const left = (d.x / 100) * (plotW - w);
    const right = left + w;
    let lane = lanes.findIndex((spans) => spans.every(([l, r]) => right + LANE_GAP <= l || left >= r + LANE_GAP));
    if (lane === -1) {
      lanes.push([]);
      lane = lanes.length - 1;
    }
    lanes[lane].push([left, right]);
    return lane;
  });
}

/** Position of an ISO date on the March to June axis, from 0 to 100. */
function xOf(iso) {
  const t = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return ((t - START) / SPAN) * 100;
}

const DROPS = SHOWN.map((chat, i) => ({ chat, x: xOf(chat.date), start: 0.05 + i * 0.045 }));
const R5 = DROPS.find((d) => d.chat.id === 'r5');
const R2 = DROPS.find((d) => d.chat.id === 'r2');

/** One chat: a pill in its lane and a dot on the axis, both dropping in once progress passes `start`. */
function Drop({ progress, drop, lane, axis, chipRef }) {
  const { chat, x, start } = drop;
  const opacity = useTransform(progress, [start, start + 0.05], [0, 1]);
  const y = useTransform(progress, [start, start + 0.05], [-28, 0]);
  const key = chat.id === 'r5' || chat.id === 'r2';
  const kind = chat.concern === 'retirement' ? 'is-ret' : 'is-other';
  const date = new Date(`${chat.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return (
    <>
      <div ref={chipRef} className={`pb-chat ${kind} ${key ? 'is-key' : ''}`} style={{ left: `${x}%`, top: LANE_TOP + lane * LANE_STEP, transform: `translateX(-${x}%)` }}>
        <motion.div style={{ opacity, y }}>
          {chat.id === 'r2' ? (
            <Token label={chat.title} size="sm" />
          ) : (
            <span className="pb-pill" title={`${chat.title}, ${date}`}>
              {chat.title}
              {key && <span className="pb-date"> · {date}</span>}
            </span>
          )}
        </motion.div>
      </div>
      <motion.span className={`pb-dot ${kind} ${chat.id === 'r2' ? 'is-token' : ''}`} style={{ left: `${x}%`, top: axis, opacity }} />
    </>
  );
}

/** The pinned stage: header, the timeline window, and the caption that appears once the dotted link has drawn. */
function ProblemStage({ progress }) {
  const captionOpacity = useTransform(progress, [0.8, 0.88], [0, 1]);
  // The dashed link starts as a zero-length round cap, which shows as a lone dot under the axis, so it stays hidden until it starts drawing.
  const linkOpacity = useTransform(progress, [0.66, 0.67], [0, 1]);
  const plotRef = useRef(null);
  const chipRefs = useRef([]);
  const [lanes, setLanes] = useState(() => DROPS.map((_, i) => i % LANES));

  useIsoLayoutEffect(() => {
    const plot = plotRef.current;
    if (!plot) return undefined;
    const measure = () => {
      const widths = DROPS.map((_, i) => chipRefs.current[i]?.offsetWidth || 0);
      const next = packLanes(plot.clientWidth, widths);
      setLanes((prev) => (prev.join() === next.join() ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(plot);
    return () => ro.disconnect();
  }, []);

  const laneCount = Math.max(...lanes) + 1;
  const AXIS_Y = axisY(laneCount);
  const linkD = `M ${R2.x * 10} ${AXIS_Y + 6} C ${R2.x * 10} ${AXIS_Y + 60}, ${R5.x * 10} ${AXIS_Y + 60}, ${R5.x * 10} ${AXIS_Y + 6}`;
  return (
    <div className="pb-stage lp-wrap">
      <header className="pb-head">
        <p className="ch-label">01 · §2</p>
        <h2 className="lp-h2">Meera has had one conversation for four months.</h2>
        <p className="lp-lead">Her chat index has recorded it as nine unrelated items.</p>
      </header>
      <MacWindow title="Recents, March to June 2026" leading={`${SHOWN.length} of ${MEERA_CHATS.length} chats`} toolbar="Newest last" enter={false}>
        <div className="pb-plot" ref={plotRef} style={{ height: AXIS_Y + 72 }}>
          <div className="pb-months" aria-hidden="true">
            {['Mar', 'Apr', 'May', 'Jun'].map((m) => <span key={m}>{m}</span>)}
          </div>
          <div className="pb-axis" style={{ top: AXIS_Y }} aria-hidden="true" />
          <motion.svg className="pb-link" viewBox={`0 0 1000 ${AXIS_Y + 72}`} preserveAspectRatio="none" aria-hidden="true" style={{ opacity: linkOpacity }}>
            <DrawPath d={linkD} progress={progress} from={0.66} to={0.8} dashed strokeWidth={2} />
          </motion.svg>
          {DROPS.map((d, i) => (
            <Drop key={d.chat.id} progress={progress} drop={d} lane={lanes[i]} axis={AXIS_Y} chipRef={(el) => { chipRefs.current[i] = el; }} />
          ))}
        </div>
      </MacWindow>
      <motion.p className="pb-caption" style={{ opacity: captionOpacity }}>
        She asked the same tax question on 15 April and again on 9 June.
      </motion.p>
    </div>
  );
}

export default function Problem() {
  return (
    <>
      <ScrollScene id="problem" height="240vh" className="pb-scene">
        {(progress) => <ProblemStage progress={progress} />}
      </ScrollScene>

      <section className="lp-section">
        <div className="lp-wrap">
          <Reveal>
            <p className="lp-prose">
              In March she asks Claude what a defined-contribution pension is. Three weeks later she asks whether a letter from her bank is genuine. In April she asks how annuities work and how withdrawals are taxed. In May she asks what the senior citizen savings scheme pays. In June she asks the tax question <strong>again</strong>, because she cannot find the chat that holds the answer.
            </p>
            <p className="lp-prose">
              The nine chats sit between recipes and birthday messages. Each one drifts further down a newest-first list as newer chats arrive.
            </p>
          </Reveal>

          <div className="lp-cards">
            <Reveal delay={0.05}>
              <MacWindow title="Search" leading="Misses her · 1" className="lp-card-win">
                <p className="lp-card-text">Search works when you know what to look for. Her chats have no shared place to look in.</p>
              </MacWindow>
            </Reveal>
            <Reveal delay={0.1}>
              <MacWindow title="Projects" leading="Misses her · 2" className="lp-card-win">
                <p className="lp-card-text">Projects work when you plan ahead. Few people create a project on the day of one pension question.</p>
              </MacWindow>
            </Reveal>
            <Reveal delay={0.15}>
              <MacWindow title="Memory" leading="Misses her · 3" className="lp-card-win">
                <p className="lp-card-text">Claude understands her better with each chat. The index she scrolls has no way to show it.</p>
              </MacWindow>
            </Reveal>
          </div>

          <Reveal>
            <p className="lp-pull">
              Bundle adds <span className="hl">retroactive, zero-effort structure</span> for people who will never build structure themselves.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

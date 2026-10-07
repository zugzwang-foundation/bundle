// The concern map (B8): every chat is a dot and similar chats are joined. d3-force lays it out once, synchronously (a few hundred ticks for 40 nodes take a couple of ms), so React only renders positions; the new chat's node animates in with framer-motion.
// Classic Mac look: dots are ink outlines on --cc-surface, each formed cluster gets a 1-bit fill pattern, and the followed cluster (the new chat's, or the hovered dot's) is solid coral.
import { useId, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { CONFIG } from '../../engine/config.js';

export const W = 600;
export const H = 320;

// 1-bit fill patterns, one per formed cluster in sorted key order; 'plain' is the bare surface.
const PATTERNS = ['plain', 'dither', 'hatch', 'vlines', 'checker', 'hlines', 'cross'];

/**
 * Builds the fill lookup for cluster keys.
 * Input: groupKeys (every node's cluster key, nulls allowed), focusKey (the cluster drawn coral), pid (the prefix of the pattern ids in this map's <defs>).
 * Output: a function from a cluster key to a CSS fill value.
 */
function groupFill(groupKeys, focusKey, pid) {
  const keys = [...new Set(groupKeys)].filter(Boolean).sort();
  const map = new Map(keys.map((k, i) => [k, PATTERNS[i % PATTERNS.length]]));
  return (k) => {
    if (k && k === focusKey) return 'var(--cc-accent)';
    const p = k ? map.get(k) : null;
    return !p || p === 'plain' ? 'var(--cc-surface)' : `url(#${pid}-${p})`;
  };
}

// The pattern tiles, drawn in ink on the surface colour with crisp pixels.
function PatternDefs({ pid }) {
  const tile = (name, size, body) => (
    <pattern id={`${pid}-${name}`} width={size} height={size} patternUnits="userSpaceOnUse" shapeRendering="crispEdges">
      <rect width={size} height={size} className="zw-map-pat-bg" />
      {body}
    </pattern>
  );
  return (
    <defs>
      {tile('dither', 4, <><rect x="0" y="0" width="1" height="1" className="zw-map-pat-ink" /><rect x="2" y="2" width="1" height="1" className="zw-map-pat-ink" /></>)}
      {tile('hatch', 4, <path d="M0 4L4 0" className="zw-map-pat-line" />)}
      {tile('vlines', 3, <rect x="0" y="0" width="1" height="3" className="zw-map-pat-ink" />)}
      {tile('checker', 2, <><rect x="0" y="0" width="1" height="1" className="zw-map-pat-ink" /><rect x="1" y="1" width="1" height="1" className="zw-map-pat-ink" /></>)}
      {tile('hlines', 3, <rect x="0" y="0" width="3" height="1" className="zw-map-pat-ink" />)}
      {tile('cross', 4, <><rect x="0" y="0" width="1" height="4" className="zw-map-pat-ink" /><rect x="0" y="0" width="4" height="1" className="zw-map-pat-ink" /></>)}
    </defs>
  );
}

// A 10 px key square in a cluster's fill, for the neighbour list.
function Key({ fill }) {
  return (
    <svg className="zw-map-key" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <rect x="0.5" y="0.5" width="9" height="9" style={{ fill }} />
    </svg>
  );
}

function layout(nodes, links, newId) {
  const n = nodes.length || 1;
  const sim = forceSimulation(nodes)
    .force('link', forceLink(links).id((d) => d.id).distance((l) => 40 + (1 - l.score) * 140).strength((l) => 0.3 + l.score * 0.6))
    .force('charge', forceManyBody().strength(-70))
    .force('center', forceCenter(W / 2, H / 2))
    .force('collide', forceCollide(9))
    .stop();
  // Deterministic start: a ring, so the same life draws the same map twice (D11 in spirit).
  nodes.forEach((d, i) => {
    const a = (i / n) * Math.PI * 2;
    d.x = W / 2 + Math.cos(a) * 110;
    d.y = H / 2 + Math.sin(a) * 90;
    if (d.id === newId) { d.x = 24; d.y = 24; }
  });
  const ticks = Math.min(300, 60 + n * 5);
  for (let i = 0; i < ticks; i++) sim.tick();
  const pad = 12;
  for (const d of nodes) {
    d.x = Math.max(pad, Math.min(W - pad, d.x));
    d.y = Math.max(pad, Math.min(H - pad, d.y));
  }
  return nodes;
}

/**
 * @param {{ event: StageEvent|null, cards: Chat[], groups: Map<string,string>|null, newId?: string|null, tauEdge?: number, compact?: boolean }} props
 *   groups — chatId → bundle id, once bundles exist (sets each dot's cluster fill); null before formation.
 */
export default function ConcernMap({ event, cards = [], groups = null, newId = null, tauEdge = CONFIG.tauEdge, compact = false }) {
  const reduce = useReducedMotion();
  const pid = `zwmap${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [hover, setHover] = useState(null);
  const out = event?.output || {};
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const theNew = newId ?? out.newId ?? null;

  const { nodes, links } = useMemo(() => {
    const raw = Array.isArray(out.nodes) && out.nodes.length ? out.nodes : cards.map((c) => ({ id: c.id, title: c.title, group: null }));
    const nodes = raw.map((d) => ({
      id: d.id,
      title: d.title || byId.get(d.id)?.title || d.id,
      group: groups?.get(d.id) ?? d.group ?? null,
    }));
    const ids = new Set(nodes.map((d) => d.id));
    const links = (out.edges || [])
      .filter((e) => e.score >= tauEdge && ids.has(e.a) && ids.has(e.b))
      .map((e) => ({ source: e.a, target: e.b, score: e.score }));
    layout(nodes, links, theNew);
    return { nodes, links };
  }, [out.nodes, out.edges, cards, groups, tauEdge, theNew, byId]);

  // Neighbour list beneath: the new chat's top-3 (form: keyed by id; attach: a flat array).
  const near = useMemo(() => {
    const nb = out.neighbours;
    if (!nb) return null;
    if (Array.isArray(nb)) return nb.slice(0, 3);
    if (theNew && nb[theNew]) return nb[theNew].slice(0, 3);
    return null;
  }, [out.neighbours, theNew]);

  const hovered = hover ? nodes.find((d) => d.id === hover) : null;
  // The coral cluster: the hovered dot's cluster, else the new chat's.
  const focusKey = hovered?.group ?? nodes.find((d) => d.id === theNew)?.group ?? null;
  const fillOf = groupFill(nodes.map((d) => d.group), focusKey, pid);

  return (
    <div className={`zw-map ${compact ? 'is-compact' : ''}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="zw-map-svg" role="img" aria-label="Concern map: chats as dots, similar chats joined">
        <PatternDefs pid={pid} />
        <g className="zw-map-links">
          {links.map((l, i) => (
            <line
              key={i}
              x1={l.source.x} y1={l.source.y} x2={l.target.x} y2={l.target.y}
              strokeWidth={0.8 + (l.score - tauEdge) * 4}
            />
          ))}
        </g>
        <g className="zw-map-nodes">
          {nodes.map((d) => {
            const isNew = d.id === theNew;
            const r = isNew ? 7 : 5;
            const common = {
              r,
              className: `zw-map-node${isNew ? ' is-new' : ''}${d.group ? '' : ' is-loose'}${d.group && d.group === focusKey ? ' is-focus' : ''}`,
              onMouseEnter: () => setHover(d.id),
              onMouseLeave: () => setHover((h) => (h === d.id ? null : h)),
              style: { cursor: 'default', fill: fillOf(d.group) },
            };
            return isNew ? (
              <motion.circle
                key={d.id}
                {...common}
                initial={reduce ? { cx: d.x, cy: d.y, opacity: 1 } : { cx: 18, cy: 18, opacity: 0 }}
                animate={{ cx: d.x, cy: d.y, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                <title>{d.title}</title>
              </motion.circle>
            ) : (
              <circle key={d.id} {...common} cx={d.x} cy={d.y} opacity={hover && hover !== d.id ? 0.55 : 1}>
                <title>{d.title}</title>
              </circle>
            );
          })}
        </g>
        {hovered && (
          <g transform={`translate(${Math.min(hovered.x + 10, W - 190)}, ${Math.max(hovered.y - 14, 12)})`} pointerEvents="none">
            <rect x={2} y={-9} width={Math.min(190, hovered.title.length * 6.7 + 12)} height={20} className="zw-map-tip-shadow" />
            <rect x={0} y={-11} width={Math.min(190, hovered.title.length * 6.7 + 12)} height={20} className="zw-map-tip-box" />
            <text x={6} y={3} className="zw-map-tip">{hovered.title.length > 28 ? hovered.title.slice(0, 27) + '…' : hovered.title}</text>
          </g>
        )}
      </svg>
      <div className="zw-map-foot">
        <span className="zw-mono">{nodes.length} chats · {links.length} edges ≥ τ_edge {tauEdge}</span>
        {near && near.length > 0 && (
          <ol className="zw-map-near">
            {near.map((n) => (
              <li key={n.id}>
                <Key fill={fillOf(groups?.get(n.id) ?? nodes.find((d) => d.id === n.id)?.group)} />
                <span className="t">{byId.get(n.id)?.title || nodes.find((d) => d.id === n.id)?.title || n.id}</span>
                <span className="zw-mono s">{n.score.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

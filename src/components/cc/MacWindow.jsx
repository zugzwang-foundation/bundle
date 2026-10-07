import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* A classic Mac OS window (System 7 to Mac OS 8). All chrome styling lives in the "MacWindow" blocks of src/styles/cc.css. */

const ZOOM_STEPS = [0.2, 0.4, 0.6, 0.8, 1]; // each zoom rect's position between the start rect and the window bounds
const ZOOM_STEP_MS = 56; // 5 steps, 280 ms in all
const SHADE = { duration: 0.24, ease: [0.16, 1, 0.3, 1] };

// Glyphs drawn inside the 11 px boxes (9 px inner area), 1-bit style.
function CloseBurst() {
  return (
    <svg viewBox="0 0 9 9" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M4.5 0v3M4.5 6v3M0 4.5h3M6 4.5h3M1 1l2 2M6 6l2 2M8 1L6 3M3 6L1 8" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

function ZoomGlyph() {
  return (
    <svg viewBox="0 0 9 9" aria-hidden="true" shapeRendering="crispEdges">
      <rect x="0.5" y="0.5" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

function ShadeGlyph() {
  return (
    <svg viewBox="0 0 9 9" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M0 3.5h9M0 5.5h9" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

const BOXES = {
  close: { label: 'Close', Glyph: CloseBurst },
  zoom: { label: 'Zoom', Glyph: ZoomGlyph },
  shade: { label: 'Collapse', Glyph: ShadeGlyph },
};

/**
 * One title-bar box: 'close' (left; shows an X burst on hover), 'zoom' or 'shade' (the Mac OS 8 windowshade box).
 * Input: kind, onClick (makes it a labelled button; without it the box is decorative and aria-hidden), label (overrides the default aria-label), className.
 */
export function WindowBox({ kind, onClick, label, className = '' }) {
  const { label: defaultLabel, Glyph } = BOXES[kind];
  const cls = `mw-box mw-box--${kind} ${className}`.trim();
  if (onClick) {
    return (
      <button type="button" className={cls} aria-label={label || defaultLabel} onClick={onClick}>
        <Glyph />
      </button>
    );
  }
  return (
    <span className={cls} aria-hidden="true">
      <Glyph />
    </span>
  );
}

/**
 * The close, zoom and windowshade boxes in one row, for chrome outside MacWindow.
 * Kept under its first name from the modern design; onMinimize drives the windowshade box.
 * Input: onClose, onMinimize, onZoom, inactive (hides decorative boxes), className.
 */
export function TrafficLights({ onClose, onMinimize, onZoom, inactive = false, className = '' }) {
  const cls = ['mw-boxes', inactive && 'is-off', className].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      <WindowBox kind="close" onClick={onClose} />
      <WindowBox kind="zoom" onClick={onZoom} />
      <WindowBox kind="shade" onClick={onMinimize} />
    </span>
  );
}

// A small rect at the centre of `bounds`, where the zoom rects start when no origin element is given.
function centreRect(bounds) {
  const width = Math.max(16, bounds.width * 0.08);
  const height = Math.max(12, bounds.height * 0.08);
  return { left: bounds.left + (bounds.width - width) / 2, top: bounds.top + (bounds.height - height) / 2, width, height };
}

function zoomRects(from, to) {
  const at = (a, b, t) => a + (b - a) * t;
  return ZOOM_STEPS.map((t) => ({
    left: at(from.left, to.left, t),
    top: at(from.top, to.top, t),
    width: at(from.width, to.width, t),
    height: at(from.height, to.height, t),
  }));
}

/**
 * A classic Mac window: square frame with a 1 px ink outline and a 4 px hard shadow, a 22 px platinum title bar (pinstripes when active, close box left, zoom and windowshade boxes right, centred title), an optional 28 px toolbar strip, and the body on --cc-surface.
 * Input:
 * - title, leading (left end of the toolbar strip), toolbar (right end of the toolbar strip); the strip renders when either is given.
 * - tone: 'auto', or 'dark' for a dark body that a .cl-app fills edge to edge (the chrome stays platinum).
 * - inactive: no pinstripes, grey title, decorative boxes hidden.
 * - enter: on first view, five ink outline rects step from the window centre (or from `origin`) out to the window bounds over 280 ms, then the window appears; none with reduced motion.
 * - origin: a ref or element the zoom rects start from.
 * - shaded: rolls the window up to its title bar (the height animates and the content clips).
 * - scroll: the body scrolls with classic scroll bars (give the window or body a bounded height).
 * - variant: 'document', or 'utility' for a floating palette with a thin title bar and no zoom box.
 * - className, bodyClassName, style, bodyStyle, as (root tag), children (the body), onClose, onMinimize (windowshade box), onZoom, ref, and any other props for the root (a framer motion element).
 */
export default function MacWindow({
  title,
  leading,
  toolbar,
  tone = 'auto',
  inactive = false,
  enter = true,
  shaded = false,
  origin,
  scroll = false,
  variant = 'document',
  className = '',
  bodyClassName = '',
  style,
  bodyStyle,
  as = 'div',
  children,
  onClose,
  onMinimize,
  onZoom,
  ref: outerRef,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Root = useMemo(() => (typeof as === 'string' ? motion[as] : motion.create(as)), [as]);
  const frameRef = useRef(null);
  const setFrame = useCallback((node) => {
    frameRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  }, [outerRef]);

  const zooms = enter && !reduced;
  // 15% of the window on screen starts the zoom; a threshold (not a viewport margin) still fires for a small window at the very end of a page.
  const inView = useInView(frameRef, { once: true, amount: 0.15 });
  const [shown, setShown] = useState(!zooms);
  const [rects, setRects] = useState(null);
  const [clipping, setClipping] = useState(shaded);
  const started = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    if (!zooms) {
      setShown(true);
      return undefined;
    }
    if (!inView || started.current || finished.current) return undefined;
    started.current = true;
    const bounds = frameRef.current.getBoundingClientRect();
    const originEl = origin && typeof origin === 'object' && 'current' in origin ? origin.current : origin;
    const from = originEl?.getBoundingClientRect ? originEl.getBoundingClientRect() : centreRect(bounds);
    setRects(zoomRects(from, bounds));
    const timer = setTimeout(() => {
      finished.current = true;
      setRects(null);
      setShown(true);
    }, ZOOM_STEPS.length * ZOOM_STEP_MS);
    return () => {
      clearTimeout(timer);
      started.current = false;
    };
  }, [zooms, inView, origin]);

  const cls = [
    'mw',
    `mw--${variant}`,
    tone === 'dark' && 'mw--dark',
    inactive && 'mw--inactive',
    shaded && 'mw--shaded',
    !shown && 'mw--pending',
    className,
  ].filter(Boolean).join(' ');
  const hasStrip = leading != null || toolbar != null;

  return (
    <Root ref={setFrame} className={cls} style={style} {...rest}>
      <div className="mw-titlebar">
        <span className="mw-plate mw-plate--start">
          <WindowBox kind="close" onClick={onClose} />
        </span>
        {title != null && <span className="mw-plate mw-title">{title}</span>}
        <span className="mw-plate mw-plate--end">
          {variant !== 'utility' && <WindowBox kind="zoom" onClick={onZoom} />}
          <WindowBox kind="shade" onClick={onMinimize} />
        </span>
      </div>
      <motion.div
        className={`mw-pane${clipping || shaded ? ' is-clipped' : ''}`}
        initial={false}
        animate={{ height: shaded ? 0 : 'auto' }}
        transition={reduced ? { duration: 0 } : SHADE}
        onAnimationStart={() => setClipping(true)}
        onAnimationComplete={() => setClipping(false)}
        inert={shaded || undefined}
      >
        {hasStrip && (
          <div className="mw-toolbar">
            {leading != null && <div className="mw-leading">{leading}</div>}
            {toolbar != null && <div className="mw-tools">{toolbar}</div>}
          </div>
        )}
        <div className={`mw-body ${scroll ? 'mw-body--scroll ' : ''}${bodyClassName}`} style={bodyStyle}>
          {children}
        </div>
      </motion.div>
      {rects && createPortal(
        <div className="mw-zoom" aria-hidden="true">
          {rects.map((r, i) => (
            <span
              key={i}
              className="mw-zoomrect"
              style={{ left: r.left, top: r.top, width: r.width, height: r.height, animationDelay: `${i * ZOOM_STEP_MS}ms` }}
            />
          ))}
        </div>,
        document.body,
      )}
    </Root>
  );
}

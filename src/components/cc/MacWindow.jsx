import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion } from 'framer-motion';

/* A modern macOS window (Sonoma style). All chrome styling lives in the "MacWindow" blocks of src/styles/cc.css. */

const OPEN = { duration: 0.26, ease: [0.16, 1, 0.3, 1] };
const SHADE = { duration: 0.24, ease: [0.16, 1, 0.3, 1] };

// useLayoutEffect warns under renderToString; on the server nothing runs, so a plain effect stands in.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Glyphs drawn inside the 12 px lights on hover, in a 10 px box.
function CloseGlyph() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.8 2.8l4.4 4.4M7.2 2.8l-4.4 4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function MinimizeGlyph() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.2 5h5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ZoomGlyph() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2.6 2.6h3.9L2.6 6.5zM7.4 7.4H3.5L7.4 3.5z" fill="currentColor" />
    </svg>
  );
}

const LIGHTS = {
  close: { label: 'Close', Glyph: CloseGlyph },
  minimize: { label: 'Minimize', Glyph: MinimizeGlyph },
  zoom: { label: 'Zoom', Glyph: ZoomGlyph },
};
LIGHTS.shade = LIGHTS.minimize; // the classic windowshade box became the yellow minimise light

/**
 * One traffic light: 'close' (red), 'minimize' (yellow; 'shade' is an old name for it) or 'zoom' (green).
 * Input: kind, onClick (makes it a labelled button; without it the light is decorative and aria-hidden), label (overrides the default aria-label), className.
 */
export function WindowBox({ kind, onClick, label, className = '' }) {
  const { label: defaultLabel, Glyph } = LIGHTS[kind];
  const tone = kind === 'shade' ? 'minimize' : kind;
  const cls = `mw-light mw-light--${tone} ${className}`.trim();
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
 * The close, minimise and zoom lights in one row, for chrome outside MacWindow.
 * Input: onClose, onMinimize, onZoom, inactive (greys the lights), className.
 * Hovering the row shows the ×, − and zoom glyphs.
 */
export function TrafficLights({ onClose, onMinimize, onZoom, inactive = false, className = '' }) {
  const cls = ['mw-lights', inactive && 'is-off', className].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      <WindowBox kind="close" onClick={onClose} />
      <WindowBox kind="minimize" onClick={onMinimize} />
      <WindowBox kind="zoom" onClick={onZoom} />
    </span>
  );
}

// True when the caller animates the root's opacity or scale itself, so the open animation must not touch them.
function callerDrivesOpen(style, rest) {
  if (rest.initial !== undefined || rest.animate !== undefined || rest.variants !== undefined) return true;
  if (!style) return false;
  return style.opacity !== undefined || style.scale !== undefined || style.transform !== undefined;
}

/**
 * A modern macOS window: 14 px rounded corners, a hairline edge and a large soft shadow, a 28 px translucent title bar with red, yellow and green traffic lights at the left and the title centred, an optional 38 px unified toolbar under it, and the body on --cc-surface.
 * Input:
 * - title, leading (left end of the toolbar), toolbar (right end of the toolbar); the toolbar renders when either is given.
 * - tone: 'auto', or 'dark' for a dark title bar and a dark body that a .cl-app fills edge to edge.
 * - inactive: grey traffic lights, a dimmed title and a smaller shadow.
 * - enter: on first view the window opens from 94% scale and transparent to full size over 260 ms; none with reduced motion, and none when the caller sets initial, animate, variants, or opacity, scale or transform in style.
 * - origin: accepted for compatibility with the classic window; the open animation no longer uses it.
 * - shaded: rolls the window up to its title bar (the height animates and the content clips).
 * - scroll: the body scrolls with thin overlay scroll bars (give the window or body a bounded height).
 * - variant: 'document', or 'utility' for a floating panel with a 22 px title bar, smaller lights and no zoom light.
 * - className, bodyClassName, style, bodyStyle, as (root tag), children (the body), onClose, onMinimize, onZoom, ref, and any other props for the root (a framer motion element).
 * Server rendering and the first paint show the window at full size and opacity, so its content is never hidden without JavaScript.
 */
export default function MacWindow({
  title,
  leading,
  toolbar,
  tone = 'auto',
  inactive = false,
  enter = true,
  shaded = false,
  // eslint-disable-next-line no-unused-vars -- kept in the signature so it never reaches the DOM through rest
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

  const opens = enter && !reduced && !callerDrivesOpen(style, rest);
  // 15% of the window on screen starts the open; a threshold (not a viewport margin) still fires for a small window at the very end of a page.
  const inView = useInView(frameRef, { once: true, amount: 0.15 });
  const openScale = useMotionValue(1);
  const openOpacity = useMotionValue(1);
  const opened = useRef(false);
  const [clipping, setClipping] = useState(shaded);

  // Before the first client paint, a window that will open is set to its closed state; the server HTML stays fully visible.
  useIsomorphicLayoutEffect(() => {
    if (!opens || opened.current) return;
    openScale.set(0.94);
    openOpacity.set(0);
  }, [opens, openScale, openOpacity]);

  useEffect(() => {
    if (!opens) {
      openScale.set(1);
      openOpacity.set(1);
      return undefined;
    }
    if (!inView || opened.current) return undefined;
    opened.current = true;
    const grow = animate(openScale, 1, OPEN);
    const fade = animate(openOpacity, 1, OPEN);
    return () => {
      grow.stop();
      fade.stop();
      // A cleanup before the animation ends (StrictMode, or a new dependency) lets the next run start it again.
      if (openOpacity.get() < 1) opened.current = false;
    };
  }, [opens, inView, openScale, openOpacity]);

  const cls = [
    'mw',
    `mw--${variant}`,
    tone === 'dark' && 'mw--dark',
    inactive && 'mw--inactive',
    shaded && 'mw--shaded',
    className,
  ].filter(Boolean).join(' ');
  const hasStrip = leading != null || toolbar != null;
  const rootStyle = opens ? { ...style, scale: openScale, opacity: openOpacity } : style;

  return (
    <Root ref={setFrame} className={`${cls}${hasStrip ? ' mw--toolbar' : ''}`} style={rootStyle} {...rest}>
      <div className="mw-titlebar">
        <span className="mw-lights">
          <WindowBox kind="close" onClick={onClose} />
          <WindowBox kind="minimize" onClick={onMinimize} />
          {variant !== 'utility' && <WindowBox kind="zoom" onClick={onZoom} />}
        </span>
        {title != null && <span className="mw-title">{title}</span>}
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
    </Root>
  );
}

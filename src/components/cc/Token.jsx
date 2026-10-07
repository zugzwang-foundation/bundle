import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];
const LAYOUT_SPRING = { type: 'spring', stiffness: 380, damping: 32 };
const INSTANT = { duration: 0 };

/**
 * The pill that follows one of Meera's chats through the page: coral fill, white label, a soft coral shadow.
 * Input: label (the chat's current name), active (the dot blinks), done (the dot turns green), size ('sm' 11 px, 'md' 12 px, 'lg' 14 px label), layoutId (lets the pill fly between positions in a scene), className.
 * When label changes, the old label fades up and out, the new one fades in, and the pill width eases to fit.
 * With reduced motion the label swaps and the pill moves without animation.
 */
export function Token({ label, active = true, done = false, size = 'md', layoutId, className = '' }) {
  const reduced = useReducedMotion();
  const trackRef = useRef(null);
  const [width, setWidth] = useState(null);

  // The label slot animates its width to the incoming label's width; the outgoing label is popped out of layout, so the track measures only the new one.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0]?.inlineSize ?? track.offsetWidth;
      setWidth(Math.ceil(box));
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const spring = reduced ? INSTANT : LAYOUT_SPRING;
  const fade = reduced ? INSTANT : { duration: 0.33, ease: EASE };
  const widthEase = reduced ? INSTANT : { duration: 0.33, ease: EASE }; // a tween, so the width never overshoots
  const cls = ['cc-token', `cc-token--${size}`, done ? 'is-done' : active && 'is-active', className].filter(Boolean).join(' ');

  return (
    <motion.span layout layoutId={layoutId} className={cls} transition={spring}>
      <motion.span layout="position" className="cc-token-dot" aria-hidden="true" transition={spring} />
      <motion.span
        layout="position"
        className="cc-token-label"
        initial={false}
        animate={width == null ? undefined : { width }}
        transition={{ default: spring, width: widthEase }}
      >
        <span ref={trackRef} className="cc-token-track">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              className="cc-token-text"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={fade}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.span>
    </motion.span>
  );
}

export default Token;

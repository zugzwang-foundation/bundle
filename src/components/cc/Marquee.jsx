import { motion } from 'framer-motion';

/**
 * A marching-ants selection rectangle, absolutely positioned inside the nearest positioned ancestor.
 * Input: x, y, w, h (px numbers or framer motion values, so a scroll scene can grow the selection), active (shown with marching dashes; false hides it), className.
 * The dashes are ink over a light under-stroke so they read on any background. With reduced motion they stand still.
 */
export function Marquee({ x = 0, y = 0, w = 0, h = 0, active = true, className = '' }) {
  const cls = ['cc-marquee', active && 'is-active', className].filter(Boolean).join(' ');
  return (
    <motion.div className={cls} style={{ left: x, top: y, width: w, height: h }} aria-hidden="true">
      <svg className="cc-marquee-svg" width="100%" height="100%">
        <rect className="cc-marquee-base" x="0.5" y="0.5" width="100%" height="100%" />
        <rect className="cc-marquee-ants" x="0.5" y="0.5" width="100%" height="100%" />
      </svg>
    </motion.div>
  );
}

export default Marquee;

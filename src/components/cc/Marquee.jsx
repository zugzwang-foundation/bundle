import { motion } from 'framer-motion';

/**
 * A Finder-style drag selection rectangle (a translucent coral fill inside a 1 px coral edge), absolutely positioned inside the nearest positioned ancestor.
 * Input: x, y, w, h (px numbers or framer motion values, so a scroll scene can grow the selection), active (shown; false fades it out), className.
 */
export function Marquee({ x = 0, y = 0, w = 0, h = 0, active = true, className = '' }) {
  const cls = ['cc-marquee', active && 'is-active', className].filter(Boolean).join(' ');
  return (
    <motion.div className={cls} style={{ left: x, top: y, width: w, height: h }} aria-hidden="true" />
  );
}

export default Marquee;

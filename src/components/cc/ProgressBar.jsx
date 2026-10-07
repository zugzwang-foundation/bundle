import { motion } from 'framer-motion';

/* The classic Mac progress bar: a 1 px ink border that fills with coral, or a barber-pole stripe while indeterminate. */

const isMotionValue = (v) => v != null && typeof v === 'object' && typeof v.get === 'function';

/**
 * Input: value (fraction 0 to 1, or a framer motion value from 0 to 1 for scroll-driven fills), indeterminate (stepped barber-pole stripes instead of a fill), label (accessible name), className.
 * With reduced motion the stripes stand still.
 */
export function ProgressBar({ value = 0, indeterminate = false, label, className = '' }) {
  const live = isMotionValue(value);
  const fraction = live ? null : Math.min(1, Math.max(0, Number(value) || 0));
  const cls = ['cc-progressbar', indeterminate && 'is-indeterminate', className].filter(Boolean).join(' ');

  let fill;
  if (indeterminate) fill = <span className="cc-progressbar-pole" />;
  else if (live) fill = <motion.span className="cc-progressbar-fill is-live" style={{ scaleX: value }} />;
  else fill = <span className="cc-progressbar-fill" style={{ transform: `scaleX(${fraction})` }} />;

  return (
    <div
      className={cls}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={fraction == null || indeterminate ? undefined : Math.round(fraction * 100)}
    >
      {fill}
    </div>
  );
}

export default ProgressBar;

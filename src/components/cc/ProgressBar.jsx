import { motion, useTransform } from 'framer-motion';

/* The macOS progress bar: a 6 px rounded track that fills with the coral accent, or a highlight that slides across while indeterminate. */

const isMotionValue = (v) => v != null && typeof v === 'object' && typeof v.get === 'function';

// The fill is full width and slides in from the left: a fraction f puts its left edge at (f - 1) of the track width.
const offset = (f) => `${(Math.min(1, Math.max(0, Number(f) || 0)) - 1) * 100}%`;

/** The fill for a framer motion value from 0 to 1. Input: value. */
function LiveFill({ value }) {
  const x = useTransform(value, offset);
  return <motion.span className="cc-progressbar-fill is-live" style={{ x }} />;
}

/**
 * Input: value (fraction 0 to 1, or a framer motion value from 0 to 1 for scroll-driven fills), indeterminate (a highlight slides across instead of a fill), label (accessible name), className.
 * With reduced motion the highlight stands still in the middle of the track.
 */
export function ProgressBar({ value = 0, indeterminate = false, label, className = '' }) {
  const live = isMotionValue(value);
  const fraction = live ? null : Math.min(1, Math.max(0, Number(value) || 0));
  const cls = ['cc-progressbar', indeterminate && 'is-indeterminate', className].filter(Boolean).join(' ');

  let fill;
  if (indeterminate) fill = <span className="cc-progressbar-pole" />;
  else if (live) fill = <LiveFill value={value} />;
  else fill = <span className="cc-progressbar-fill" style={{ transform: `translateX(${offset(fraction)})` }} />;

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

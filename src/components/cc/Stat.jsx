import { Counter } from './motion';

// Number of digits after the decimal point in a number such as 0.26 (2) or 384 (0).
function decimalsOf(value) {
  const match = /\.(\d+)$/.exec(String(value));
  return match ? match[1].length : 0;
}

/**
 * A big sourced number: a mono caps label above, the number in the display face counting up over 1.2 s with its unit beside it, and "source: …" below in mono.
 * Input: value (a number counts up with its own decimal places; a string renders as is), unit, source, label, notStated (shows a dashed box reading "not stated in the repo" in place of the number and unit).
 */
export function Stat({ value, unit, source, label, notStated = false }) {
  const decimals = typeof value === 'number' ? decimalsOf(value) : 0;
  const format = decimals ? (n) => n.toFixed(decimals) : (n) => Math.round(n).toLocaleString('en');

  return (
    <div className={`cc-stat${notStated ? ' is-not-stated' : ''}`}>
      {label != null && <div className="cc-stat-label">{label}</div>}
      <div className="cc-stat-figure">
        {notStated ? (
          <span className="cc-stat-none">not stated in the repo</span>
        ) : (
          <>
            {/* The final value's width is reserved so the unit stays put while the number counts up. */}
            <span className="cc-stat-value" style={typeof value === 'number' ? { minWidth: `${format(value).length}ch` } : undefined}>
              {typeof value === 'number' ? <Counter to={value} duration={1.2} format={format} /> : value}
            </span>
            {unit != null && <span className="cc-stat-unit">{unit}</span>}
          </>
        )}
      </div>
      {source != null && (
        <div className="cc-stat-source">{typeof source === 'string' ? `source: ${source}` : <>source: {source}</>}</div>
      )}
    </div>
  );
}

export default Stat;

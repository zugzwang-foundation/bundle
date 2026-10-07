/* A macOS checkbox: a 14 px box with 4 px corners that fills with the accent and shows a white tick when checked. */

/**
 * Input: checked, label (optional text or node), onChange(checked, event) (optional; makes it a real, focusable checkbox), disabled, className.
 * Without onChange it is a read-only indicator: with a label it is exposed as a read-only checkbox, without one it is decorative.
 * When it turns checked the tick draws on left to right.
 */
export function Checkbox({ checked = false, label, onChange, disabled = false, className = '' }) {
  const box = (
    <span className={`cc-check-box${checked ? ' is-checked' : ''}`} aria-hidden="true">
      <svg className="cc-check-mark" viewBox="0 0 14 14">
        <path d="M3.6 7.3l2.4 2.4 4.4-5" />
      </svg>
    </span>
  );

  if (onChange) {
    return (
      <label className={`cc-check${disabled ? ' is-disabled' : ''} ${className}`.trim()}>
        <input
          type="checkbox"
          className="cc-check-input"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked, e)}
        />
        {box}
        {label != null && <span className="cc-check-label">{label}</span>}
      </label>
    );
  }

  if (label == null) return <span className={`cc-check ${className}`.trim()}>{box}</span>;
  return (
    <span className={`cc-check ${className}`.trim()} role="checkbox" aria-checked={checked} aria-readonly="true" aria-disabled={disabled || undefined}>
      {box}
      <span className="cc-check-label">{label}</span>
    </span>
  );
}

export default Checkbox;

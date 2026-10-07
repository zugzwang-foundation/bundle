/* The Claude Code spinner and its verb text. */

// The ping-pong cycle · ✢ ✳ ✶ ✻ ✽ ✻ ✶ ✳ ✢, started at ✻ so the static frame (reduced motion, server render) is ✻.
// U+FE0E asks for the text form of ✳, which some platforms otherwise draw as an emoji.
const FRAMES = ['✻', '✽', '✻', '✶', '✳︎', '✢', '·', '✢', '✳︎', '✶'];

/**
 * Text with a highlight band that sweeps left to right every 2 s.
 * Input: children (text), className. With reduced motion it is plain text.
 */
export function Shimmer({ children, className = '' }) {
  return <span className={`cc-shimmer ${className}`.trim()}>{children}</span>;
}

/**
 * The Claude Code spinner: a coral glyph stepping through · ✢ ✳ ✶ ✻ ✽ and back at 120 ms a frame (CSS steps()), then an optional verb.
 * Input: verb (text, optional), size (glyph size in px), className.
 * The glyph is aria-hidden; with a verb the spinner is a polite status region. With reduced motion the glyph is a static ✻.
 */
export function Spinner({ verb, size = 14, className = '' }) {
  return (
    <span className={`cc-spinner ${className}`.trim()} role={verb ? 'status' : undefined}>
      <span className="cc-spinner-glyph" aria-hidden="true" style={{ fontSize: size }}>
        <span className="cc-spinner-strip">
          {FRAMES.map((glyph, i) => <span key={i}>{glyph}</span>)}
        </span>
      </span>
      {verb ? <Shimmer className="cc-spinner-verb">{verb}</Shimmer> : null}
    </span>
  );
}

export default Spinner;

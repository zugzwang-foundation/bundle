import { Reveal, StreamText } from './motion';

/**
 * A landing chapter: a section with a header (mono label "num · spec", a bold display title that streams in word by word, one-paragraph lead) and the chapter content in a 1080 px column.
 * Input: id (section id, also the scroll target), num ("01"), spec ("§2"; omitted from the label when absent), title (string), lead, children, className, band (alternate --cc-bg-2 background).
 * Entry order: label, then title 170 ms later, then lead 170 ms after that; each rises 12 px over 330 ms.
 */
export default function Chapter({ id, num, spec, title, lead, children, className = '', band = false }) {
  const cls = ['ch', band && 'ch--band', className].filter(Boolean).join(' ');
  return (
    <section id={id} className={cls}>
      <div className="ch-wrap">
        <header className="ch-head">
          <Reveal as="p" className="ch-label" y={12} duration={0.33}>
            {spec ? `${num} · ${spec}` : num}
          </Reveal>
          <h2 className="ch-title" aria-label={typeof title === 'string' ? title : undefined}>
            <StreamText text={title} delay={0.17} />
          </h2>
          {lead != null && (
            <Reveal as="p" className="ch-lead" y={12} duration={0.33} delay={0.34}>
              {lead}
            </Reveal>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

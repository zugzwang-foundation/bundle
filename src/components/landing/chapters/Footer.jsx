import { ZwMark } from '../../Icons';

/* The page foot: the Foundation mark, the document number, and the non-affiliation disclaimer (kept word for word). */

export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer-top">
          <span className="lp-footer-org">
            <ZwMark size={20} />
            <span>The Zugzwang Foundation</span>
          </span>
          <span className="grow" />
          <span className="lp-footer-doc">ZW-FS-001 · v1.0 · Published</span>
        </div>
        <p>
          Bundle — a feature specification for Claude, published by the Zugzwang Foundation
          (zugzwangworld.com) · An independent proposal. The Zugzwang Foundation is not affiliated with,
          commissioned by, or endorsed by Anthropic. “Claude” is used nominatively to name the product
          this proposal addresses; all interface depictions are illustrative reconstructions, not
          screenshots. Product facts verified against the live product on 2026-08-06; Claude ships
          gradually, and individual accounts may differ. ·{' '}
          <a href="/Bundle_ZW-FS-001_v1_0.pdf" target="_blank" rel="noreferrer">Specification (PDF)</a>
        </p>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import MacWindow from '../../cc/MacWindow';
import { PushButton } from '../../cc/PushButton';
import { Reveal } from '../../cc/motion';
import HeroGather from '../HeroGather';

/* Chapter 00: the title, one sentence on what Bundle is, the two calls to action, and Meera's chats gathering into one bundle. */

export default function Hero() {
  return (
    <section className="lp-hero" id="top">
      <div className="lp-wrap">
        <Reveal y={12} duration={0.33}>
          <p className="lp-eyebrow">ZW-FS-001 · An independent feature proposal for Claude</p>
        </Reveal>
        <Reveal y={12} duration={0.33} delay={0.17}>
          <h1 className="lp-display">Bundle</h1>
        </Reveal>
        <Reveal y={12} duration={0.33} delay={0.34}>
          <p className="lp-hero-sub">
            Bundle is one toggle on Claude’s chat index that groups related chats into named sections above the full chronological list.
          </p>
        </Reveal>
        <Reveal y={12} duration={0.33} delay={0.51}>
          <div className="lp-ctas">
            <PushButton isDefault as={Link} to="/prototype">Open the prototype</PushButton>
            <PushButton as="a" href="/Bundle_ZW-FS-001_v1_0.pdf" target="_blank" rel="noreferrer">Read the spec</PushButton>
          </div>
        </Reveal>

        <div className="lp-hero-fig">
          <MacWindow title="Meera’s chats" leading="March to June 2026" toolbar="13 chats shown">
            <HeroGather />
          </MacWindow>
          <p className="lp-figcap">
            <b>Figure 1</b> · Meera’s chats from March to June. Nine are about retirement. Bundle gathers those nine into one section called Retirement planning, and her other chats stay where they were.
          </p>
        </div>
      </div>
    </section>
  );
}

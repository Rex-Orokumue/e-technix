import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SPEC = [
  ['Tracks', '10'],
  ['Duration', '6–9 months'],
  ['Format', 'Online · live'],
  ['Backed by', 'UK × Nigeria'],
];

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '7.5rem 2.5rem 4.5rem',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Faint editorial baseline grid (very subtle, no glow) */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '25% 100%',
          opacity: 0.5,
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 auto' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <span className="eyebrow">Digital Careers Programme</span>
          <span style={{ flex: 1, maxWidth: '120px', height: '1px', background: 'var(--border-bright)' }} />
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>UK × Nigeria</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.9rem, 7vw, 5.6rem)',
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            margin: 0,
            maxWidth: '14ch',
          }}
        >
          Build the judgment{' '}
          <span style={{ color: 'var(--cyan)' }}>AI cannot replace.</span>
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--muted)',
            maxWidth: '560px',
            lineHeight: 1.7,
            margin: '1.75rem 0 2.5rem',
          }}
        >
          A structured 6–9 month digital skills programme. Start with Phase 1, specialise
          in one of ten tracks, build real products, and leave with the judgment, portfolio,
          and certificate the market actually hires for.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link href="/register" className="hero-cta-primary">
            Enrol now <ArrowRight size={17} strokeWidth={2.4} />
          </Link>
          <Link href="/curriculum" className="hero-cta-ghost">
            Explore the curriculum
          </Link>
        </div>

        {/* Spec row */}
        <div
          style={{
            marginTop: '4rem',
            borderTop: '1px solid var(--border-bright)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          }}
        >
          {SPEC.map(([label, value], i) => (
            <div
              key={label}
              style={{
                padding: '1.25rem 1.5rem 1.25rem 0',
                borderLeft: i === 0 ? 'none' : '1px solid var(--border)',
                paddingLeft: i === 0 ? 0 : '1.5rem',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--cyan); color: #070D1A;
          font-family: var(--font-head); font-weight: 700; font-size: 0.95rem;
          padding: 0.85rem 1.6rem; border-radius: 6px; text-decoration: none;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .hero-cta-primary:hover { transform: translateY(-1px); opacity: 0.9; }
        .hero-cta-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: transparent; color: var(--text);
          font-family: var(--font-head); font-weight: 600; font-size: 0.95rem;
          padding: 0.85rem 1.6rem; border-radius: 6px; text-decoration: none;
          border: 1px solid var(--border-bright);
          transition: border-color 0.18s ease, color 0.18s ease;
        }
        .hero-cta-ghost:hover { border-color: var(--cyan-border); color: var(--cyan); }
      `}</style>
    </section>
  );
}

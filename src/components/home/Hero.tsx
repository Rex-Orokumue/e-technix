import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TRACKS } from '@/lib/data/curriculum';

const ticker = TRACKS.map((t) => `${t.code} · ${t.name}`);

export default function Hero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
      {/* Faint structural grid for depth (no glow) */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(90deg, var(--border) 1px, transparent 1px), linear-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '12.5% 130px',
          opacity: 0.45,
          maskImage: 'radial-gradient(120% 80% at 15% 0%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(120% 80% at 15% 0%, black, transparent 75%)',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '1180px', margin: '0 auto', padding: '7rem 2.5rem 3rem' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <span className="section-num mono" style={{ fontSize: '0.78rem', color: 'var(--orange)' }}>(01)</span>
          <span className="eyebrow">Digital Careers Programme</span>
          <span style={{ flex: 1, maxWidth: '160px', height: '1px', background: 'var(--border-bright)' }} />
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>UK × Nigeria</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(3rem, 8.5vw, 6.6rem)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            margin: 0,
          }}
        >
          Build the <span style={{ color: 'var(--cyan)' }}>judgment</span><br />
          AI cannot replace.
        </h1>

        {/* Sub + CTAs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '2.5rem',
            flexWrap: 'wrap',
            marginTop: '2.5rem',
          }}
        >
          <p style={{ fontSize: '1.12rem', color: 'var(--muted)', maxWidth: '440px', lineHeight: 1.65, margin: 0 }}>
            A structured 6–9 month digital skills programme. Specialise in one of ten tracks,
            build real products, and leave with the judgment, portfolio, and certificate the
            market actually hires for.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/register" className="hero-cta-primary">
              Enrol now <ArrowRight size={17} strokeWidth={2.4} />
            </Link>
            <Link href="/curriculum" className="hero-cta-ghost">
              Explore the curriculum
            </Link>
          </div>
        </div>
      </div>

      {/* Ticker band — all tracks, scrolling (departures-board motif) */}
      <div
        style={{
          position: 'relative',
          borderTop: '1px solid var(--border-bright)',
          background: 'var(--surface)',
          overflow: 'hidden',
          padding: '0.85rem 0',
          maskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
        }}
      >
        <div className="hero-ticker" style={{ display: 'inline-flex', whiteSpace: 'nowrap', willChange: 'transform' }}>
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: 'inline-flex' }} aria-hidden={dup === 1}>
              {ticker.map((label) => (
                <span
                  key={dup + label}
                  className="mono"
                  style={{ fontSize: '0.78rem', color: 'var(--muted)', padding: '0 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '1.75rem' }}
                >
                  {label}
                  <span style={{ width: '4px', height: '4px', background: 'var(--cyan)', borderRadius: '50%' }} />
                </span>
              ))}
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
          display: inline-flex; align-items: center;
          color: var(--text);
          font-family: var(--font-head); font-weight: 600; font-size: 0.95rem;
          padding: 0.85rem 1.6rem; border-radius: 6px; text-decoration: none;
          border: 1px solid var(--border-bright);
          transition: border-color 0.18s ease, color 0.18s ease;
        }
        .hero-cta-ghost:hover { border-color: var(--cyan-border); color: var(--cyan); }
        .hero-ticker { animation: heroTicker 38s linear infinite; }
        @keyframes heroTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .hero-ticker { animation: none; } }
      `}</style>
    </section>
  );
}

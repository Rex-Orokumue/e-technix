'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TRACKS, type Track } from '@/lib/data/curriculum';
import { PRICING, fmtPrice } from '@/lib/data/pricing';

const WHATSAPP_NUMBER = '2348120288390';

const phase1 = TRACKS.find((t) => t.code === 'DT-101')!;
const specialisations = TRACKS.filter((t) => t.code !== 'DT-101' && !t.isAdvanced);
const advancedTracks = TRACKS.filter((t) => t.isAdvanced);

const accentColor = (a: Track['accent']) => (a === 'cyan' ? 'var(--cyan)' : 'var(--orange)');
const accentDim = (a: Track['accent']) => (a === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)');
const accentBorder = (a: Track['accent']) => (a === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)');

function TrackCard({ track }: { track: Track }) {
  const price = PRICING[track.code];
  const ac = accentColor(track.accent);
  return (
    <Link
      href={`/curriculum#${track.slug}`}
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.85rem',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.5rem', textDecoration: 'none', color: 'var(--text)',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentBorder(track.accent); e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', background: accentDim(track.accent), flexShrink: 0 }}>
          {track.icon}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {track.isAdvanced && (
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--orange)', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)', borderRadius: '4px', padding: '0.15rem 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>▲ Advanced</span>
          )}
          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.15rem 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>● Enrolling</span>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.25rem' }}>{track.name}</h3>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600 }}>{track.code} · {track.duration} · {track.hoursPerWeek}/week</div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {track.summary}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {track.careerPaths.slice(0, 3).map((c) => (
          <span key={c} style={{ fontSize: '0.72rem', fontWeight: 500, padding: '0.2rem 0.55rem', borderRadius: '5px', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>{c}</span>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <div>
          {price ? (
            <>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>{fmtPrice(price.full.NGN, 'NGN')}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>or {fmtPrice(price.install.NGN, 'NGN')} × 2 · USD/GBP on register</div>
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Included in every track</div>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ac, whiteSpace: 'nowrap' }}>View curriculum →</span>
      </div>
    </Link>
  );
}

export default function ProgramsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>

        {/* ── Hero ── */}
        <section style={{ padding: '5rem 2.5rem 3.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <span style={{ width: '20px', height: '1px', background: 'var(--cyan)' }} />
            The Programme
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: '760px' }}>
            One foundation.<br /><span style={{ color: 'var(--cyan)' }}>Ten ways to specialise.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '600px', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            Every student starts with Phase 1 (Foundation), then chooses a specialisation track —
            and continues through Project Labs and Career Launch. Browse the tracks below, or
            open the full week-by-week curriculum.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/curriculum" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem', padding: '0.85rem 1.85rem', borderRadius: '8px', textDecoration: 'none' }}>
              See the full curriculum →
            </Link>
            <Link href="/how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.92rem', padding: '0.85rem 1.85rem', borderRadius: '8px', border: '1px solid var(--border-bright)', textDecoration: 'none' }}>
              How it works
            </Link>
          </div>
        </section>

        {/* ── Phase 1 ── */}
        <section style={{ padding: '3.5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <Link href={`/curriculum#${phase1.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '16px', padding: '2rem', flexWrap: 'wrap' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', background: 'rgba(0,200,255,0.12)', flexShrink: 0 }}>{phase1.icon}</div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '0.35rem' }}>Phase 1 · Compulsory for everyone</div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.4rem' }}>Digital &amp; Business Foundations</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{phase1.summary}</p>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan)', whiteSpace: 'nowrap' }}>View Phase 1 →</span>
            </div>
          </Link>
        </section>

        {/* ── Specialisation tracks ── */}
        <section style={{ padding: '3.5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)', color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.25rem' }}>
            Phase 2 · Choose one
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Specialisation Tracks
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '560px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            After completing Phase 1 (60% cumulative), go deep in one track. Each is 12 weeks of
            structured, project-based learning.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {specialisations.map((t) => <TrackCard key={t.code} track={t} />)}
          </div>
        </section>

        {/* ── Advanced tracks ── */}
        <section style={{ padding: '3.5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)', color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.25rem' }}>
            ▲ Advanced · By application
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Advanced Tracks
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '560px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Open for enrolment now, but they require completing the prerequisite track — or passing
            a placement assessment if you already have the experience.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {advancedTracks.map((t) => <TrackCard key={t.code} track={t} />)}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ margin: '3.5rem 2.5rem 6rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem', position: 'relative' }}>
              Not Sure Which Track Is Right?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative' }}>
              Chat with us on WhatsApp and we&apos;ll help you pick the best track based on your goals.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', padding: '0.9rem 2rem', borderRadius: '8px', textDecoration: 'none' }}>
                Register Now →
              </Link>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.95rem', padding: '0.9rem 2rem', borderRadius: '8px', border: '1px solid var(--border-bright)', textDecoration: 'none' }}>
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

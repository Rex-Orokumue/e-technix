'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { PROGRAMME, TrackStatus, Accent } from '@/lib/data/curriculum';

const WHATSAPP_NUMBER = '2348120288390';

export interface ClientWeek {
  n: number;
  title: string;
  theme: string;
  deliverable: string;
  sessions?: string[];
  aiChallenge?: string;
  aiAudit?: string;
  note?: string;
  hasAiChallenge?: boolean;
  hasAiAudit?: boolean;
}
export interface ClientTrack {
  code: string;
  slug: string;
  name: string;
  status: TrackStatus;
  accent: Accent;
  icon: string;
  duration: string;
  prerequisite: string;
  hoursPerWeek: string;
  summary: string;
  outcomes: string[];
  careerPaths: string[];
  weeks: ClientWeek[];
  isAdvanced?: boolean;
  whatToExpect?: string[];
}

interface Props {
  programme: typeof PROGRAMME;
  tracks: ClientTrack[];
}

const STATUS_META: Record<TrackStatus, { label: string; color: string; bg: string; border: string }> = {
  enrolling: { label: '● Enrolling now', color: 'var(--cyan)', bg: 'var(--cyan-dim)', border: 'var(--cyan-border)' },
  coming_soon: { label: '◎ Coming soon', color: 'var(--muted)', bg: 'rgba(255,255,255,0.05)', border: 'var(--border)' },
  advanced: { label: '▲ Advanced', color: 'var(--orange)', bg: 'var(--orange-dim)', border: 'rgba(255,107,43,0.25)' },
};

const accentColor = (a: Accent) => (a === 'cyan' ? 'var(--cyan)' : 'var(--orange)');
const accentDim = (a: Accent) => (a === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)');
const accentBorder = (a: Accent) => (a === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)');

const eyebrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.6rem',
  fontFamily: 'var(--font-mono)',
  color: 'var(--muted)',
  fontSize: '0.72rem',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  marginBottom: '1rem',
};
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: '0.85rem',
};

export default function CurriculumClient({ programme, tracks }: Props) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        {/* ── Hero ── */}
        <section
          style={{
            position: 'relative',
            padding: '5rem 2.5rem 3.5rem',
            maxWidth: '1180px',
            margin: '0 auto',
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={eyebrow}>
            <span style={{ width: '20px', height: '1px', background: 'var(--cyan)' }} />
            Master Curriculum · {programme.location}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              maxWidth: '760px',
            }}
          >
            Build the judgment<br />
            <span style={{ color: 'var(--cyan)' }}>AI cannot replace.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '600px', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            {programme.overview}
          </p>
          <p style={{ fontSize: '0.92rem', color: 'var(--muted)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '1.75rem', opacity: 0.85 }}>
            {programme.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--cyan)', color: '#070D1A',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem',
                padding: '0.85rem 1.85rem', borderRadius: '8px', textDecoration: 'none',
              }}
            >
              Enrol now →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', color: 'var(--text)',
                fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.92rem',
                padding: '0.85rem 1.85rem', borderRadius: '8px',
                border: '1px solid var(--border-bright)', textDecoration: 'none',
              }}
            >
              How it works
            </Link>
          </div>
        </section>

        {/* ── At a glance ── */}
        <section className="atglance-section" style={{ padding: '3.5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={sectionLabel}>Tracks at a glance</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {tracks.map((t, i) => {
              const sm = STATUS_META[t.status];
              return (
                <a
                  key={t.code}
                  href={`#${t.slug}`}
                  className="atglance-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.9rem 1.25rem', textDecoration: 'none', color: 'var(--text)',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}
                >
                  <span style={{ fontSize: '1.15rem', width: '26px', flexShrink: 0 }}>{t.icon}</span>
                  <span className="atglance-code" style={{ width: '64px', flexShrink: 0, fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--font-head)' }}>{t.code}</span>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  <span className="atglance-dur" style={{ width: '80px', flexShrink: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{t.duration}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {t.isAdvanced && (
                      <span className="atglance-adv" style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--orange)', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)', padding: '0.25rem 0.55rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                        ▲ Advanced
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
                        padding: '0.25rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap',
                      }}
                    >
                      {sm.label}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── How the programme works ── */}
        <section className="phase-section" style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={sectionLabel}>How the programme works</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem', maxWidth: '640px' }}>
            Four phases. <span style={{ color: 'var(--cyan)' }}>One outcome.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '640px', marginTop: 0, marginBottom: '2rem' }}>
            Every student moves through the same journey — foundation, specialisation, a real
            team-built product, and a focused career launch. One fee covers all four.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {programme.journey.map((p, i) => (
              <div key={p.n} style={{ position: 'relative', background: 'var(--surface)', border: `1px solid ${i < 2 ? 'var(--cyan-border)' : 'var(--border)'}`, borderRadius: '14px', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: i < 2 ? 'var(--cyan-border)' : 'rgba(255,255,255,0.12)', marginBottom: '0.6rem' }}>
                  0{p.n}
                </div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{p.name}</h3>
                <div className="mono" style={{ fontSize: '0.66rem', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>{p.tag}</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>

          {/* Progression gate */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '12px', padding: '1.1rem 1.25rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>🎯</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 0 }}>
              <strong>Advancing to Phase 2</strong> requires a cumulative score of at least <strong style={{ color: 'var(--cyan)' }}>60%</strong> in Phase 1 — attendance, assignments, participation, and the capstone project all count.
            </p>
          </div>

          {/* Fee note */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>💳</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 0 }}>
              {programme.howItWorks.feeNote}
            </p>
          </div>
        </section>

        {/* ── Philosophy ── */}
        <section className="phase-section" style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Our Teaching Philosophy
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', fontStyle: 'italic', maxWidth: '620px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            “{programme.philosophyQuestion}”
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {programme.philosophy.map((p) => (
              <div key={p.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How we integrate AI ── */}
        <section className="phase-section" style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={sectionLabel}>How we integrate AI</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '2rem', maxWidth: '640px' }}>
            AI is not the enemy of this programme — <span style={{ color: 'var(--cyan)' }}>it is the test.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {programme.aiIntegration.map((p, i) => (
              <div
                key={p.title}
                style={{
                  background: i === 0 ? 'var(--cyan-dim)' : 'var(--surface)',
                  border: `1px solid ${i === 0 ? 'var(--cyan-border)' : 'var(--border)'}`,
                  borderRadius: '14px', padding: '1.5rem',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Track sections ── */}
        <section style={{ padding: '4rem 2.5rem 2rem', maxWidth: '1180px', margin: '0 auto' }}>
          <div style={sectionLabel}>Phase 1 &amp; 2 · The taught curriculum</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
            Every track, week by week
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {tracks.map((t) => (
              <TrackSection key={t.code} track={t} advancedEntry={programme.howItWorks.advancedEntry} />
            ))}
          </div>
        </section>

        {/* ── Phase 3 — Real Project Labs ── */}
        <section className="phase-section" style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={sectionLabel}>Phase 3 · Real Project Labs · 12 weeks</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem', maxWidth: '640px' }}>
            Build something real, <span style={{ color: 'var(--cyan)' }}>with a team.</span>
          </h2>
          <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-bright)', aspectRatio: '16 / 6', minHeight: '220px', marginBottom: '2rem' }}>
            <Image src="/images/demo-day.jpg" alt="A team presenting their product at Demo Day" fill sizes="(max-width: 1180px) 100vw, 1180px" style={{ objectFit: 'cover', filter: 'saturate(0.75) contrast(1.03)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,13,26,0.85) 0%, rgba(7,13,26,0.4) 55%, rgba(7,13,26,0.1) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'var(--cyan)', opacity: 0.09, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, bottom: 0, padding: 'clamp(1rem, 3vw, 2rem)' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Demo Day · open to employers</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '12px', padding: '1.1rem 1.25rem', marginBottom: '2rem', maxWidth: '760px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>🚀</span>
            <p style={{ fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 0 }}>{programme.phase3.outcome}</p>
          </div>
          <div className="sprint-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
            {programme.phase3.sprints.map((s, i) => (
              <div key={s.name} style={{ background: 'var(--surface)', padding: '1.25rem' }}>
                <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--cyan)', marginBottom: '0.4rem' }}>SPRINT {i + 1}</div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{s.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teams build across:</span>
            {programme.phase3.domains.map((d) => (
              <span key={d} style={{ fontSize: '0.78rem', fontWeight: 500, padding: '0.25rem 0.7rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }}>{d}</span>
            ))}
          </div>
        </section>

        {/* ── Phase 4 — Career Launch ── */}
        <section className="phase-section" style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={sectionLabel}>Phase 4 · Career Launch · 4 weeks</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem', maxWidth: '640px' }}>
            From trained <span style={{ color: 'var(--cyan)' }}>to earning.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '640px', marginTop: 0, marginBottom: '2rem' }}>{programme.phase4.intro}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {programme.phase4.paths.map((p) => (
              <div key={p.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem' }}>{p.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={sectionLabel}>What every graduate leaves with</div>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem', margin: 0, padding: 0 }}>
              {programme.phase4.outcomes.map((o) => (
                <li key={o} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--cyan)', flexShrink: 0 }}>✓</span>{o}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ margin: '2rem 2.5rem 6rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem', position: 'relative' }}>
              Ready to start building?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
              Every student begins with Phase 1, then chooses a specialisation. Enrol now or chat with us to find the right track.
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

      <style>{`
        .atglance-row:hover { background: var(--cyan-dim) !important; }
        @media (max-width: 860px) { .sprint-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .sprint-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .atglance-dur, .atglance-code, .atglance-adv { display: none !important; }
          .atglance-row { padding: 0.7rem 0.85rem !important; gap: 0.6rem !important; }
          .atglance-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .phase-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
      `}</style>
    </>
  );
}

function TrackSection({ track, advancedEntry }: { track: ClientTrack; advancedEntry: string }) {
  const sm = STATUS_META[track.status];
  const ac = accentColor(track.accent);
  const [weeksOpen, setWeeksOpen] = useState(false);
  return (
    <div id={track.slug} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', scrollMarginTop: '84px' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, background: accentDim(track.accent) }}>
          {track.icon}
        </div>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{track.name}</h3>
            {track.isAdvanced && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--orange)', background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)', padding: '0.2rem 0.65rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>▲ Advanced</span>
            )}
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`, padding: '0.2rem 0.65rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>{sm.label}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[track.code, track.duration, `${track.hoursPerWeek}/week`].map((m) => (
              <span key={m} style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.7rem', borderRadius: '4px' }}>{m}</span>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            <span style={{ color: ac, fontWeight: 600 }}>Prerequisite:</span> {track.prerequisite}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.75rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.75, marginTop: 0, marginBottom: '1.5rem' }}>{track.summary}</p>

        {/* Advanced entry: what to expect + placement assessment */}
        {track.isAdvanced && (
          <div style={{ background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '0.75rem' }}>
              ▲ Advanced track — what to expect
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0 0 0.85rem', padding: 0 }}>
              {(track.whatToExpect ?? []).map((x) => (
                <li key={x} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--orange)', flexShrink: 0 }}>→</span>
                  {x}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0, paddingTop: '0.75rem', borderTop: '1px solid rgba(255,107,43,0.2)' }}>
              {advancedEntry}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={sectionLabel}>What you&apos;ll be able to do</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
              {track.outcomes.map((o) => (
                <li key={o} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.5 }}>
                  <span style={{ color: ac, flexShrink: 0 }}>→</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={sectionLabel}>Career paths this opens</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {track.careerPaths.map((c) => (
                <span key={c} style={{ fontSize: '0.78rem', fontWeight: 500, padding: '0.3rem 0.7rem', borderRadius: '6px', background: accentDim(track.accent), border: `1px solid ${accentBorder(track.accent)}`, color: 'var(--text)' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setWeeksOpen((o) => !o)}
          aria-expanded={weeksOpen}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px',
            padding: '0.85rem 1.1rem', cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Week by week · {track.weeks.length} weeks
          </span>
          <span style={{ fontSize: '0.78rem', color: ac, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {weeksOpen ? 'Hide ▲' : 'Show ▾'}
          </span>
        </button>
        {weeksOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.85rem' }}>
            {track.weeks.map((w) => (
              <WeekRow key={w.n} week={w} accent={track.accent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WeekRow({ week, accent }: { week: ClientWeek; accent: Accent }) {
  const ac = accentColor(accent);
  const hasChallenge = week.hasAiChallenge ?? !!week.aiChallenge;
  const hasAudit = week.hasAiAudit ?? !!week.aiAudit;

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flexShrink: 0, width: '46px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em' }}>WEEK</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800, color: ac, lineHeight: 1 }}>{week.n}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.98rem' }}>{week.title}</div>
          {week.theme ? <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1px' }}>{week.theme}</div> : null}

          {/* AI badges */}
          {(hasChallenge || hasAudit) && (
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {hasChallenge && (
                <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', color: '#070D1A', background: 'var(--cyan)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>AI CHALLENGE</span>
              )}
              {hasAudit && (
                <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', background: 'var(--orange)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>AI AUDIT</span>
              )}
            </div>
          )}

          {/* Deliverable */}
          <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: '0.6rem', lineHeight: 1.5 }}>
            <span style={{ color: ac, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deliverable · </span>
            {week.deliverable}
          </div>
        </div>
      </div>
    </div>
  );
}

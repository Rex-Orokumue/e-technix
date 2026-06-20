'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CurriculumUnlockModal from '@/components/curriculum/CurriculumUnlockModal';
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
}

interface Props {
  programme: typeof PROGRAMME;
  tracks: ClientTrack[];
  trackChoices: { code: string; name: string }[];
  unlocked: boolean;
  leadName: string | null;
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
  gap: '0.5rem',
  color: 'var(--cyan)',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '1rem',
};
const sectionLabel: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: '0.85rem',
};

export default function CurriculumClient({ programme, tracks, trackChoices, unlocked: initialUnlocked, leadName }: Props) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState(leadName);

  const handleUnlocked = (n: string) => {
    setName(n);
    setUnlocked(true);
    setModal(false);
    // Re-render the server component with the new cookie so full session detail arrives.
    router.refresh();
  };

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
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '460px',
              height: '320px',
              background: 'radial-gradient(ellipse, rgba(0,200,255,0.10) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={eyebrow}>
            <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
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
            {unlocked ? (
              <a
                href="/api/curriculum/pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'transparent', color: 'var(--text)',
                  fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.92rem',
                  padding: '0.85rem 1.85rem', borderRadius: '8px',
                  border: '1px solid var(--cyan-border)', textDecoration: 'none',
                }}
              >
                ⬇ Download curriculum PDF
              </a>
            ) : (
              <button
                onClick={() => setModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'transparent', color: 'var(--text)',
                  fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.92rem',
                  padding: '0.85rem 1.85rem', borderRadius: '8px',
                  border: '1px solid var(--border-bright)', cursor: 'pointer',
                }}
              >
                Get the full curriculum (PDF)
              </button>
            )}
          </div>
          {unlocked && name && (
            <p style={{ fontSize: '0.82rem', color: 'var(--cyan)', marginTop: '1rem', marginBottom: 0 }}>
              ✓ Unlocked for {name} — every session is visible below.
            </p>
          )}
        </section>

        {/* ── At a glance ── */}
        <section style={{ padding: '3.5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
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
                  <span style={{ fontSize: '1.2rem', width: '28px', flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ width: '64px', flexShrink: 0, fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--font-head)' }}>{t.code}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem' }}>{t.name}</span>
                  <span className="atglance-dur" style={{ width: '80px', flexShrink: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{t.duration}</span>
                  <span
                    style={{
                      flexShrink: 0, fontSize: '0.68rem', fontWeight: 700,
                      color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
                      padding: '0.25rem 0.65rem', borderRadius: '999px', whiteSpace: 'nowrap',
                    }}
                  >
                    {sm.label}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── Philosophy ── */}
        <section style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
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
        <section style={{ padding: '4rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
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
          <div style={sectionLabel}>The full programme</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
            Every track, week by week
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {tracks.map((t) => (
              <TrackSection key={t.code} track={t} unlocked={unlocked} onUnlock={() => setModal(true)} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ margin: '2rem 2.5rem 6rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(0,200,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
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

      {modal && (
        <CurriculumUnlockModal tracks={trackChoices} onUnlocked={handleUnlocked} onClose={() => setModal(false)} />
      )}

      <style>{`
        .atglance-row:hover { background: var(--cyan-dim) !important; }
        @media (max-width: 640px) {
          .atglance-dur { display: none !important; }
        }
      `}</style>
    </>
  );
}

function TrackSection({ track, unlocked, onUnlock }: { track: ClientTrack; unlocked: boolean; onUnlock: () => void }) {
  const sm = STATUS_META[track.status];
  const ac = accentColor(track.accent);
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

        <div style={sectionLabel}>Week by week</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {track.weeks.map((w) => (
            <WeekRow key={w.n} week={w} accent={track.accent} unlocked={unlocked} onUnlock={onUnlock} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekRow({ week, accent, unlocked, onUnlock }: { week: ClientWeek; accent: Accent; unlocked: boolean; onUnlock: () => void }) {
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

          {/* Gated session detail */}
          {unlocked && week.sessions ? (
            <div style={{ marginTop: '0.85rem', borderTop: '1px dashed var(--border)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {week.sessions.map((blk, i) => {
                const lines = blk.split('\n');
                const head = lines[0];
                const bullets = lines.slice(1).filter(Boolean);
                return (
                  <div key={i}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: bullets.length ? '0.35rem' : 0 }}>{head}</div>
                    {bullets.length > 0 && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {bullets.map((b, j) => (
                          <li key={j} style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5, paddingLeft: '0.5rem' }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              {week.aiChallenge && <Callout label="AI Challenge" color="var(--cyan)" bg="var(--cyan-dim)" border="var(--cyan-border)" text={week.aiChallenge} />}
              {week.aiAudit && <Callout label="AI Audit" color="var(--orange)" bg="var(--orange-dim)" border="rgba(255,107,43,0.25)" text={week.aiAudit} />}
              {week.note && <Callout label="Note" color="var(--muted)" bg="rgba(255,255,255,0.03)" border="var(--border)" text={week.note} />}
            </div>
          ) : !unlocked ? (
            <button
              onClick={onUnlock}
              style={{
                marginTop: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-bright)',
                borderRadius: '8px', padding: '0.5rem 0.85rem', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '0.76rem', fontWeight: 600, fontFamily: 'var(--font-head)',
              }}
            >
              🔒 Unlock full session detail
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Callout({ label, color, bg, border, text }: { label: string; color: string; bg: string; border: string; text: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>{label}</span>
      <p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.55, margin: '0.25rem 0 0' }}>{text}</p>
    </div>
  );
}

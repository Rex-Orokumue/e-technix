// ─── Stats ────────────────────────────────────────────────────────────────────
'use client';

import { stats } from '@/lib/data/tracks';

export function Stats() {
  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '2.5rem',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 0,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: '1 1 160px',
          maxWidth: '220px',
          textAlign: 'center',
          padding: '1rem 1.5rem',
          borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-head)',
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}>
            <span style={{ color: 'var(--cyan)' }}>{s.num}</span>
          </div>
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--muted)',
            fontWeight: 500,
            marginTop: '0.2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--cyan)',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: '1rem',
    }}>
      <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
      {children}
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
import { steps } from '@/lib/data/tracks';

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '6rem 2.5rem', maxWidth: '1180px', margin: '0 auto' }}>
      <SectionLabel>The Journey</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-head)',
        fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        maxWidth: '600px',
        marginBottom: '1rem',
      }}>
        From Foundation to{' '}
        <span style={{ color: 'var(--cyan)' }}>Future-Ready</span>
      </h2>
      <p style={{
        color: 'var(--muted)',
        fontSize: '1.05rem',
        maxWidth: '540px',
        marginBottom: '3.5rem',
        lineHeight: 1.7,
      }}>
        A structured progression that takes you from zero to career-ready in 9 months —
        no fluff, just real skills and real projects.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0',
      }}>
        {steps.map((step) => (
          <div key={step.num} style={{ padding: '2rem 1.5rem 2rem 0' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--cyan-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-head)',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: 'var(--cyan)',
              marginBottom: '1.5rem',
            }}>
              {step.num}
            </div>
            <h3 style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '1rem',
              marginBottom: '0.5rem',
              color: 'var(--text)',
            }}>
              {step.title}
            </h3>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--muted)',
              lineHeight: 1.6,
              marginBottom: 0,
            }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Track Grid ───────────────────────────────────────────────────────────────
import { tracks } from '@/lib/data/tracks';

export function TrackGrid() {
  return (
    <section id="programs" style={{ padding: '0 2.5rem 6rem', maxWidth: '1180px', margin: '0 auto' }}>
      <SectionLabel>Specialisation Tracks</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-head)',
        fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        maxWidth: '600px',
        marginBottom: '1rem',
      }}>
        6 Tracks.{' '}
        <span style={{ color: 'var(--cyan)' }}>One Career</span> Transformation.
      </h2>
      <p style={{
        color: 'var(--muted)',
        fontSize: '1.05rem',
        maxWidth: '540px',
        marginBottom: '3.5rem',
        lineHeight: 1.7,
      }}>
        Choose the path that aligns with your goals. Every track includes tools,
        projects, and a capstone you&apos;ll be proud to show.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
      }}>
        {tracks.map((track) => (
          <div
            key={track.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'border-color 0.25s, transform 0.25s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cyan-border)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div style={{
              width: '44px', height: '44px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: '1.2rem',
              background: track.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
            }}>
              {track.icon}
            </div>

            <h3 style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '1rem',
              marginBottom: '0.5rem',
              color: 'var(--text)',
            }}>
              {track.name}
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: 'var(--muted)',
              marginBottom: '1.2rem',
              lineHeight: 1.6,
            }}>
              {track.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {track.tools.map((tool, i) => (
                <span key={tool} style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: i === 0
                    ? (track.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)')
                    : 'rgba(255,255,255,0.06)',
                  color: i === 0
                    ? (track.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)')
                    : 'var(--muted)',
                  letterSpacing: '0.03em',
                }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Foundation ───────────────────────────────────────────────────────────────
import { foundationCourses } from '@/lib/data/tracks';

export function Foundation() {
  return (
    <section style={{ padding: '0 2.5rem 6rem', maxWidth: '1180px', margin: '0 auto' }}>
      <SectionLabel>Phase 1 — Month 1 & 2</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-head)',
        fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        maxWidth: '600px',
        marginBottom: '1rem',
      }}>
        Everyone Starts with{' '}
        <span style={{ color: 'var(--cyan)' }}>Strong Foundations</span>
      </h2>
      <p style={{
        color: 'var(--muted)',
        fontSize: '1.05rem',
        maxWidth: '540px',
        marginBottom: '3.5rem',
        lineHeight: 1.7,
      }}>
        Before you specialise, you&apos;ll master the core skills every tech
        professional needs — no matter the track you choose.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
      }}>
        {foundationCourses.map((course) => (
          <div
            key={course.title}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '1.5rem 1.25rem',
              textAlign: 'center',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{course.icon}</div>
            <h4 style={{
              fontFamily: 'var(--font-head)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '0.3rem',
            }}>
              {course.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 0 }}>
              {course.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Certifications ───────────────────────────────────────────────────────────
import { tracks as allTracks } from '@/lib/data/tracks';

export function Certifications() {
  return (
    <section id="certifications" style={{ padding: '0 2.5rem 6rem', maxWidth: '1180px', margin: '0 auto' }}>
      <SectionLabel>Credentials That Matter</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-head)',
        fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        maxWidth: '600px',
        marginBottom: '1rem',
      }}>
        Earn a <span style={{ color: 'var(--cyan)' }}>Certificate</span> Worth Showing
      </h2>
      <p style={{
        color: 'var(--muted)',
        fontSize: '1.05rem',
        maxWidth: '540px',
        marginBottom: '3.5rem',
        lineHeight: 1.7,
      }}>
        Every graduate receives a track-specific certification — recognised,
        verifiable, and backed by a UK-Nigeria programme.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
      }}>
        {allTracks.map((track) => (
          <div
            key={track.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan-border)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '8px',
              background: 'var(--cyan-dim)',
              border: '1px solid var(--cyan-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '1.1rem',
            }}>
              {track.icon}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
              {track.cert}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
import Link from 'next/link';

const WHATSAPP_NUMBER = '2348000000000'; // ← replace with real number

export function CTASection() {
  return (
    <div id="register" style={{ margin: '0 2.5rem 6rem' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '5rem 3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '-80px', left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(0,200,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--cyan)',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          position: 'relative',
        }}>
          <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
          Ready to Start?
        </div>

        <h2 style={{
          fontFamily: 'var(--font-head)',
          fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-0.025em',
          margin: '0.5rem auto 1rem',
          maxWidth: '600px',
          position: 'relative',
        }}>
          Take the First Step Towards{' '}
          <span style={{ color: 'var(--cyan)' }}>Your Digital Future</span>
        </h2>

        <p style={{
          color: 'var(--muted)',
          fontSize: '1.05rem',
          marginBottom: '2.5rem',
          position: 'relative',
        }}>
          Register now to secure your spot in the next cohort. Have questions first?
          Chat with us on WhatsApp — no pressure, just honest answers.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          position: 'relative',
        }}>
          <Link
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--cyan)',
              color: '#070D1A',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '0.9rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,200,255,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Register & Enrol →
          </Link>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              color: 'var(--text)',
              fontFamily: 'var(--font-head)',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '0.9rem 2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-bright)',
              textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#25D366';
              e.currentTarget.style.color = '#25D366';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-bright)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
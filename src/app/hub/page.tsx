'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  upcomingSession,
  pastSessions,
  resourceCategories,
  assignments,
  type ResourceType,
} from '@/lib/data/hub';

const WHATSAPP_NUMBER = '2348120288390';

type Tab = 'sessions' | 'resources' | 'assignments' | 'reviews';

const RESOURCE_TYPE_META: Record<ResourceType, { label: string; color: string; bg: string; icon: string }> = {
  document: { label: 'Document', color: '#00C8FF', bg: 'rgba(0,200,255,0.1)', icon: '📄' },
  video:    { label: 'Video',    color: '#FF6B2B', bg: 'rgba(255,107,43,0.1)', icon: '🎥' },
  link:     { label: 'Link',     color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', icon: '🔗' },
  notion:   { label: 'Notion',   color: '#34D399', bg: 'rgba(52,211,153,0.1)', icon: '📝' },
};

const TRACK_OPTIONS = [
  'Data Analytics',
  'Web App Development',
  'Mobile & Desktop Apps',
  'AI & Agentic Systems',
  'Product Design (UI/UX)',
  'Business Development',
];

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function HubPage() {
  const [tab, setTab] = useState<Tab>('sessions');

  // Assignment form
  const [aForm, setAForm] = useState({ name: '', track: '', assignment: '', link: '', note: '' });
  const [aSubmitted, setASubmitted] = useState(false);

  // Review form
  const [rForm, setRForm] = useState({ name: '', session: '', rating: 0, feedback: '' });
  const [rSubmitted, setRSubmitted] = useState(false);

  const setA = (k: keyof typeof aForm, v: string) => setAForm(f => ({ ...f, [k]: v }));
  const setR = (k: keyof typeof rForm, v: string | number) => setRForm(f => ({ ...f, [k]: v }));

  const handleAssignmentSubmit = () => {
    if (!aForm.name || !aForm.track || !aForm.assignment || !aForm.link) return;
    const msg = `📚 *Assignment Submission*\n\n*Name:* ${aForm.name}\n*Track:* ${aForm.track}\n*Assignment:* ${aForm.assignment}\n*Google Drive Link:* ${aForm.link}${aForm.note ? `\n*Note:* ${aForm.note}` : ''}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setASubmitted(true);
  };

  const handleReviewSubmit = () => {
    if (!rForm.name || !rForm.session || !rForm.rating || !rForm.feedback) return;
    const stars = '⭐'.repeat(rForm.rating as number);
    const msg = `✍️ *Session Review*\n\n*From:* ${rForm.name}\n*Session:* ${rForm.session}\n*Rating:* ${stars} (${rForm.rating}/5 — ${STAR_LABELS[rForm.rating as number]})\n*Feedback:* ${rForm.feedback}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setRSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 600 as const, color: 'var(--muted)',
    letterSpacing: '0.05em', textTransform: 'uppercase' as const,
    marginBottom: '0.4rem', display: 'block',
  };
  const groupStyle = { display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'sessions',    label: 'Past Sessions',  icon: '🎬' },
    { id: 'resources',   label: 'Resources',      icon: '📚' },
    { id: 'assignments', label: 'Assignments',    icon: '📝' },
    { id: 'reviews',     label: 'Leave a Review', icon: '⭐' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,200,255,0.06) 0%, rgba(255,107,43,0.04) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '4rem 2.5rem 3rem',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
              Student Hub
            </div>
            <h1 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 800, lineHeight: 1.1,
              letterSpacing: '-0.03em', marginBottom: '0.75rem',
            }}>
              Your Learning <span style={{ color: 'var(--cyan)' }}>Dashboard</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: '560px', lineHeight: 1.7, marginBottom: 0 }}>
              Everything you need in one place — session replays, resources, assignment submissions, and more.
            </p>

            {/* Upcoming session card */}
            {upcomingSession && (
              <div style={{
                marginTop: '2rem',
                background: 'var(--surface)', border: '1px solid var(--cyan-border)',
                borderRadius: '14px', padding: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '1.5rem', flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(52,211,102,0.12)', border: '1px solid rgba(52,211,102,0.25)',
                    borderRadius: '999px', padding: '0.2rem 0.75rem',
                    fontSize: '0.7rem', fontWeight: 700, color: '#34D366',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    marginBottom: '0.6rem',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D366', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    Next Session
                  </div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    {upcomingSession.title}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--muted)' }}>
                    {upcomingSession.date} · {upcomingSession.time}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px', maxWidth: '480px', lineHeight: 1.5 }}>
                    {upcomingSession.description}
                  </div>
                </div>
                <a
                  href={upcomingSession.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--cyan)', color: '#070D1A',
                    padding: '0.75rem 1.5rem', borderRadius: '8px',
                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem',
                    textDecoration: 'none', whiteSpace: 'nowrap' as const,
                    transition: 'opacity 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  🎥 Join Session
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          position: 'sticky', top: '68px', zIndex: 50,
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2.5rem', display: 'flex', gap: '0', overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '1rem 1.25rem', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${tab === t.id ? 'var(--cyan)' : 'transparent'}`,
                color: tab === t.id ? 'var(--cyan)' : 'var(--muted)',
                fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', whiteSpace: 'nowrap' as const,
                transition: 'color 0.2s, border-color 0.2s',
              }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2.5rem 6rem' }}>

          {/* SESSIONS */}
          {tab === 'sessions' && (
            <div>
              <SectionHeader
                title="Past Sessions"
                subtitle="Watch replays of every live session. Catch up on anything you missed or revisit a topic."
              />
              {pastSessions.length === 0 ? (
                <EmptyState icon="🎬" message="No recorded sessions yet. Check back after the first live session!" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {pastSessions.map(session => (
                    <div key={session.id} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '14px', overflow: 'hidden',
                    }}>
                      <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '10px',
                          background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem',
                          color: 'var(--cyan)', flexShrink: 0,
                        }}>
                          {String(session.id).padStart(2, '0')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                              {session.title}
                            </h3>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                            {session.date} · {session.duration}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {session.topics.map(topic => (
                              <span key={topic} style={{
                                fontSize: '0.72rem', background: 'var(--surface2)',
                                border: '1px solid var(--border)', borderRadius: '4px',
                                padding: '0.2rem 0.5rem', color: 'var(--muted)',
                              }}>
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <a
                          href={session.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            background: '#FF0000', color: '#fff',
                            padding: '0.6rem 1.1rem', borderRadius: '7px',
                            fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem',
                            textDecoration: 'none', flexShrink: 0,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          ▶ Watch Replay
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESOURCES */}
          {tab === 'resources' && (
            <div>
              <SectionHeader
                title="Resources"
                subtitle="All documents, videos, Notion pages, and external links shared during the programme."
              />
              {resourceCategories.map(cat => (
                cat.items.length > 0 && (
                  <div key={cat.name} style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem',
                      color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
                      marginBottom: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <span>{cat.icon}</span> {cat.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {cat.items.map(item => {
                        const meta = RESOURCE_TYPE_META[item.type];
                        return (
                          <a
                            key={item.title}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '1rem',
                              background: 'var(--surface)', border: '1px solid var(--border)',
                              borderRadius: '12px', padding: '1.1rem 1.25rem',
                              textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--border-bright)';
                              e.currentTarget.style.background = 'var(--surface2)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.background = 'var(--surface)';
                            }}
                          >
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '8px',
                              background: meta.bg, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
                            }}>
                              {meta.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '3px' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                                {item.description}
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 700,
                              color: meta.color, background: meta.bg,
                              border: `1px solid ${meta.color}40`,
                              borderRadius: '4px', padding: '0.2rem 0.5rem',
                              textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                              flexShrink: 0,
                            }}>
                              {meta.label}
                            </span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* ASSIGNMENTS */}
          {tab === 'assignments' && (
            <div>
              <SectionHeader
                title="Assignments"
                subtitle="View your current assignments and submit your Google Drive link when ready."
              />

              {/* Assignment cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                {assignments.map(assignment => (
                  <div key={assignment.id} style={{
                    background: 'var(--surface)', border: `1px solid ${assignment.status === 'active' ? 'var(--cyan-border)' : 'var(--border)'}`,
                    borderRadius: '14px', padding: '1.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.75rem',
                          color: 'var(--cyan)', background: 'var(--cyan-dim)',
                          border: '1px solid var(--cyan-border)', borderRadius: '5px',
                          padding: '0.2rem 0.6rem', letterSpacing: '0.04em',
                        }}>
                          {assignment.id}
                        </span>
                        <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
                          {assignment.title}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          color: assignment.status === 'active' ? '#34D366' : 'var(--muted)',
                          background: assignment.status === 'active' ? 'rgba(52,211,102,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${assignment.status === 'active' ? 'rgba(52,211,102,0.25)' : 'var(--border)'}`,
                          borderRadius: '999px', padding: '0.25rem 0.7rem',
                          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                        }}>
                          {assignment.status === 'active' ? '● Open' : '✓ Closed'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          Due: {assignment.dueDate}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.87rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: assignment.guidelines ? '1rem' : 0 }}>
                      {assignment.description}
                    </p>
                    {assignment.guidelines && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          Guidelines
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {assignment.guidelines.map(g => (
                            <li key={g} style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submission form */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '2rem',
              }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
                  Submit Your Assignment
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Save your work to Google Drive, set sharing to &ldquo;Anyone with the link can view&rdquo;, then paste the link below.
                </p>

                {aSubmitted ? (
                  <SuccessState
                    icon="📬"
                    title="Submission sent!"
                    message="Your assignment link has been sent via WhatsApp. You'll receive a confirmation from the instructor."
                    onReset={() => { setASubmitted(false); setAForm({ name: '', track: '', assignment: '', link: '', note: '' }); }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="hub-form-grid">
                      <div style={groupStyle}>
                        <label style={labelStyle}>Your Full Name *</label>
                        <input
                          style={inputStyle} placeholder="John Doe"
                          value={aForm.name} onChange={e => setA('name', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />
                      </div>
                      <div style={groupStyle}>
                        <label style={labelStyle}>Your Track *</label>
                        <select
                          style={{ ...inputStyle, cursor: 'pointer' }}
                          value={aForm.track} onChange={e => setA('track', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        >
                          <option value="">Select your track</option>
                          {TRACK_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={groupStyle}>
                      <label style={labelStyle}>Assignment *</label>
                      <select
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={aForm.assignment} onChange={e => setA('assignment', e.target.value)}
                        onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      >
                        <option value="">Select assignment</option>
                        {assignments.filter(a => a.status === 'active').map(a => (
                          <option key={a.id} value={`${a.id} — ${a.title}`}>{a.id} — {a.title}</option>
                        ))}
                      </select>
                    </div>
                    <div style={groupStyle}>
                      <label style={labelStyle}>Google Drive Link *</label>
                      <input
                        style={inputStyle} placeholder="https://drive.google.com/..."
                        value={aForm.link} onChange={e => setA('link', e.target.value)}
                        onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                    <div style={groupStyle}>
                      <label style={labelStyle}>Additional Note (optional)</label>
                      <textarea
                        style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
                        placeholder="Anything you'd like to add..."
                        value={aForm.note} onChange={e => setA('note', e.target.value)}
                        onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                    <button
                      onClick={handleAssignmentSubmit}
                      disabled={!aForm.name || !aForm.track || !aForm.assignment || !aForm.link}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.9rem 2rem',
                        background: (aForm.name && aForm.track && aForm.assignment && aForm.link) ? '#25D366' : 'rgba(37,211,102,0.2)',
                        color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem',
                        border: 'none', borderRadius: '9px',
                        cursor: (aForm.name && aForm.track && aForm.assignment && aForm.link) ? 'pointer' : 'not-allowed',
                        transition: 'opacity 0.2s', alignSelf: 'flex-start' as const,
                      }}
                      onMouseEnter={e => { if (aForm.name && aForm.track && aForm.assignment && aForm.link) e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <WAIcon /> Submit via WhatsApp
                    </button>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '-0.5rem' }}>
                      Your submission will open WhatsApp with a pre-filled message to the instructor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {tab === 'reviews' && (
            <div>
              <SectionHeader
                title="Leave a Review"
                subtitle="Your feedback helps improve every session. Tell us what worked, what didn't, and what you'd like more of."
              />
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '2rem',
              }}>
                {rSubmitted ? (
                  <SuccessState
                    icon="🙏"
                    title="Thank you for the feedback!"
                    message="Your review has been sent. It genuinely helps us improve every session."
                    onReset={() => { setRSubmitted(false); setRForm({ name: '', session: '', rating: 0, feedback: '' }); }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="hub-form-grid">
                      <div style={groupStyle}>
                        <label style={labelStyle}>Your Name *</label>
                        <input
                          style={inputStyle} placeholder="John Doe"
                          value={rForm.name} onChange={e => setR('name', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        />
                      </div>
                      <div style={groupStyle}>
                        <label style={labelStyle}>Session to Review *</label>
                        <select
                          style={{ ...inputStyle, cursor: 'pointer' }}
                          value={rForm.session} onChange={e => setR('session', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                        >
                          <option value="">Select a session</option>
                          {pastSessions.map(s => (
                            <option key={s.id} value={s.title}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Star rating */}
                    <div style={groupStyle}>
                      <label style={labelStyle}>Rating *</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setR('rating', star)}
                            style={{
                              background: 'transparent', border: 'none',
                              fontSize: '2rem', cursor: 'pointer',
                              opacity: (rForm.rating as number) >= star ? 1 : 0.25,
                              transition: 'opacity 0.15s, transform 0.15s',
                              transform: (rForm.rating as number) >= star ? 'scale(1.1)' : 'scale(1)',
                              padding: 0, lineHeight: 1,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = (rForm.rating as number) >= star ? '1' : '0.25')}
                          >
                            ⭐
                          </button>
                        ))}
                        {rForm.rating > 0 && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>
                            {STAR_LABELS[rForm.rating as number]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={groupStyle}>
                      <label style={labelStyle}>Your Feedback *</label>
                      <textarea
                        style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', lineHeight: 1.6 }}
                        placeholder="What did you learn? What was most useful? What could be improved? Was the pace right? Any topics you'd like covered next?"
                        value={rForm.feedback} onChange={e => setR('feedback', e.target.value)}
                        onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>

                    <button
                      onClick={handleReviewSubmit}
                      disabled={!rForm.name || !rForm.session || !rForm.rating || !rForm.feedback}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.9rem 2rem',
                        background: (rForm.name && rForm.session && rForm.rating && rForm.feedback) ? '#25D366' : 'rgba(37,211,102,0.2)',
                        color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem',
                        border: 'none', borderRadius: '9px',
                        cursor: (rForm.name && rForm.session && rForm.rating && rForm.feedback) ? 'pointer' : 'not-allowed',
                        transition: 'opacity 0.2s', alignSelf: 'flex-start' as const,
                      }}
                      onMouseEnter={e => { if (rForm.name && rForm.session && rForm.rating && rForm.feedback) e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <WAIcon /> Send Review via WhatsApp
                    </button>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '-0.75rem' }}>
                      Your review opens WhatsApp with a pre-filled message to the instructor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 640px) {
          .hub-form-grid { grid-template-columns: 1fr !important; }
        }
        select option { background: #0D1526; }
      `}</style>
    </>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '4rem 2rem',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '14px',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

function SuccessState({ icon, title, message, onReset }: { icon: string; title: string; message: string; onReset: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>{message}</p>
      <button onClick={onReset} style={{
        background: 'transparent', border: '1px solid var(--border)',
        color: 'var(--muted)', padding: '0.6rem 1.25rem', borderRadius: '7px',
        fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        Submit another
      </button>
    </div>
  );
}

function WAIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.534 5.856L0 24l6.293-1.513A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.662-.5-5.197-1.375l-.372-.221-3.857.927.973-3.746-.241-.384A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

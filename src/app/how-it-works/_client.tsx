'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WHATSAPP_NUMBER = '2348000000000'; // ← replace with real number

const phases = [
  {
    num: '01',
    tag: 'Month 1–2',
    title: 'Digital & Business Foundations',
    subtitle: 'Everyone starts here.',
    accent: 'cyan' as const,
    description:
      'Before you specialise, you need to understand how to think, communicate, and create value. This phase is mandatory for all students and gives you the mindset and tools that make everything else click.',
    details: [
      {
        icon: '💻',
        title: 'Digital Literacy & Productivity',
        desc: 'Master the tools professionals use every day — Notion for documentation, Google Workspace for collaboration, and AI tools for research and productivity.',
      },
      {
        icon: '🧠',
        title: 'Problem Solving & Critical Thinking',
        desc: 'Learn structured frameworks for breaking down complex problems and making better decisions — the skill that separates good professionals from great ones.',
      },
      {
        icon: '🏢',
        title: 'Business Fundamentals',
        desc: 'Understand business models, how companies make money, customer discovery, market research, and how to identify opportunities.',
      },
      {
        icon: '🗣️',
        title: 'Communication & Presentation',
        desc: 'Learn to write clearly, speak confidently, and present ideas in a way that gets buy-in — whether to clients, employers, or investors.',
      },
      {
        icon: '⚡',
        title: 'AI Productivity',
        desc: 'Learn to use ChatGPT, prompt engineering, and AI research tools to work 10x faster. AI is not your replacement — it\'s your advantage.',
      },
    ],
    outcome: 'By the end of Phase 1, every student has a working digital toolkit, a business mindset, and the communication skills to operate professionally in any environment.',
  },
  {
    num: '02',
    tag: 'Month 3–5',
    title: 'Specialisation Track',
    subtitle: 'Go deep in what matters to you.',
    accent: 'orange' as const,
    description:
      'After foundations, you choose one of six career tracks. This is where you develop deep, marketable skills in your chosen field — guided by structured curriculum and real tools.',
    details: [
      {
        icon: '📊',
        title: 'Data Analytics',
        desc: 'Excel, SQL, Python, Power BI, Tableau — turn raw data into business intelligence.',
      },
      {
        icon: '🌐',
        title: 'Web App Development',
        desc: 'React, Next.js, Node.js, PostgreSQL — build full-stack web applications that work.',
      },
      {
        icon: '📱',
        title: 'Mobile & Desktop Apps',
        desc: 'Flutter, Dart, Firebase, Supabase — create cross-platform apps for Android, iOS, and Windows.',
      },
      {
        icon: '🤖',
        title: 'AI & Agentic Systems',
        desc: 'Python, LangChain, CrewAI — build intelligent tools and automation workflows.',
      },
      {
        icon: '🎨',
        title: 'Product Design (UI/UX)',
        desc: 'Figma, Adobe XD — design digital products people love to use.',
      },
      {
        icon: '📈',
        title: 'Business Development',
        desc: 'CRM, funnels, growth strategy — learn to build and scale real businesses.',
      },
    ],
    outcome: 'By the end of Phase 2, you have deep, job-ready skills in your chosen track — with a portfolio of mini-projects to prove it.',
  },
  {
    num: '03',
    tag: 'Month 6–8',
    title: 'Real Project Labs',
    subtitle: 'Build things that actually exist.',
    accent: 'cyan' as const,
    description:
      'This is where theory becomes reality. Students work in cross-functional teams — just like a startup — to build real products from scratch. You won\'t just learn to code or design or analyse. You\'ll learn to ship.',
    details: [
      {
        icon: '🚀',
        title: 'Startup-Style Teams',
        desc: 'You\'ll be grouped into teams with students from different tracks — developers, designers, data analysts, and business strategists — just like a real product team.',
      },
      {
        icon: '🏗️',
        title: 'Real Products',
        desc: 'Teams build actual products: fintech apps, AI chatbots, data dashboards, e-commerce platforms, and SaaS tools — not toy projects.',
      },
      {
        icon: '🎯',
        title: 'Defined Roles',
        desc: 'Every student operates in their specialisation — developers build, designers design, analysts analyse, and business students define strategy and GTM.',
      },
      {
        icon: '📋',
        title: 'Product Management Process',
        desc: 'Teams follow a real product development process — ideation, planning, sprints, reviews, and demos — building professional habits that employers look for.',
      },
    ],
    outcome: 'By the end of Phase 3, every student has a real, live project they built with a team — something they can show employers, clients, or investors.',
  },
  {
    num: '04',
    tag: 'Month 9',
    title: 'Career Launch',
    subtitle: 'Leave ready for the real world.',
    accent: 'orange' as const,
    description:
      'The final phase prepares you to enter the market on your own terms. Whether you want a job, freelance clients, or to launch your own startup — we give you the tools and strategy to make it happen.',
    details: [
      {
        icon: '💼',
        title: 'Employment Path',
        desc: 'Portfolio review, CV building, GitHub optimisation, LinkedIn setup, interview preparation, and mock technical interviews.',
      },
      {
        icon: '🌍',
        title: 'Freelancing Path',
        desc: 'Set up on Upwork and Fiverr, write winning proposals, price your services, acquire your first clients, and build a sustainable freelance income.',
      },
      {
        icon: '🏢',
        title: 'Startup Path',
        desc: 'Learn MVP development, pitch deck creation, fundraising basics, early marketing, and how to turn your project lab product into a real company.',
      },
      {
        icon: '🎓',
        title: 'Certification',
        desc: 'Every graduate receives a track-specific certificate — Certified Data Analyst, Certified Web Developer, Certified AI Systems Builder, and more.',
      },
    ],
    outcome: 'By the end of Phase 4, you leave with a certificate, a portfolio, a career plan, and the confidence to execute it.',
  },
];

const timeline = [
  { month: 'Month 1–2', label: 'Foundations', accent: 'cyan' },
  { month: 'Month 3–5', label: 'Specialisation', accent: 'orange' },
  { month: 'Month 6–8', label: 'Project Labs', accent: 'cyan' },
  { month: 'Month 9', label: 'Career Launch', accent: 'orange' },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>

        {/* ── Hero ── */}
        <section style={{
          padding: '5rem 2.5rem 4rem',
          maxWidth: '1180px',
          margin: '0 auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
            The Journey
          </div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: '700px',
          }}>
            How the Programme<br />
            <span style={{ color: 'var(--cyan)' }}>Actually Works.</span>
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'var(--muted)',
            maxWidth: '580px', lineHeight: 1.7, marginBottom: '3rem',
          }}>
            No shortcuts. No fluff. Just a clear, structured path from where you are
            now to where you want to be — in 6 to 9 months.
          </p>

          {/* Timeline grid — 2x2 on mobile, 4 columns on desktop */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            maxWidth: '700px',
          }}>
            {timeline.map((t, i) => (
              <div key={t.label} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: t.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                  marginBottom: '4px',
                }}>
                  {t.month}
                </div>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '0.88rem', fontWeight: 700,
                  color: 'var(--text)',
                }}>
                  {t.label}
                </div>
                <div style={{
                  marginTop: '6px',
                  width: '24px', height: '2px',
                  background: t.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                  borderRadius: '1px', margin: '6px auto 0',
                }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Phases ── */}
        {phases.map((phase, idx) => (
          <section key={phase.num} style={{
            padding: '5rem 2.5rem',
            maxWidth: '1180px',
            margin: '0 auto',
            borderBottom: idx < phases.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>

              {/* Left — phase info */}
              <div style={{ flex: '0 0 280px' }}>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '4rem', fontWeight: 800,
                  color: phase.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.2)',
                  lineHeight: 1, marginBottom: '1rem',
                  letterSpacing: '-0.04em',
                }}>
                  {phase.num}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: phase.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                  border: `1px solid ${phase.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)'}`,
                  color: phase.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.25rem',
                }}>
                  {phase.tag}
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                  fontWeight: 800, lineHeight: 1.15,
                  letterSpacing: '-0.025em', marginBottom: '0.5rem',
                }}>
                  {phase.title}
                </h2>
                <p style={{
                  fontSize: '0.88rem', color: phase.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                  fontWeight: 600, marginBottom: '1rem',
                }}>
                  {phase.subtitle}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 0 }}>
                  {phase.description}
                </p>
              </div>

              {/* Right — details */}
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '0.85rem',
                }}>
                  {phase.details.map((detail) => (
                    <div key={detail.title} style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: phase.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                      }}>
                        {detail.icon}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: 'var(--font-head)',
                          fontWeight: 700, fontSize: '0.85rem',
                          marginBottom: '0.35rem', color: 'var(--text)',
                        }}>
                          {detail.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                          {detail.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Outcome */}
                <div style={{
                  background: phase.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                  border: `1px solid ${phase.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)'}`,
                  borderRadius: '10px', padding: '1.25rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>✦</span>
                  <p style={{
                    fontSize: '0.85rem',
                    color: phase.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                    lineHeight: 1.65, fontWeight: 500, marginBottom: 0,
                  }}>
                    {phase.outcome}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── CTA ── */}
        <div style={{ margin: '0 2.5rem 6rem' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '4rem 3rem',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-80px', left: '50%',
              transform: 'translateX(-50%)', width: '600px', height: '300px',
              background: 'radial-gradient(ellipse, rgba(0,200,255,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 800, letterSpacing: '-0.025em',
              marginBottom: '1rem', position: 'relative',
            }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative' }}>
              Join the next cohort and go from where you are now to career-ready in 9 months.
            </p>
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '1rem', flexWrap: 'wrap', position: 'relative',
            }}>
              <Link href="/programs" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', color: 'var(--text)',
                fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.95rem',
                padding: '0.9rem 2rem', borderRadius: '8px',
                border: '1px solid var(--border-bright)', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan-border)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
              >
                View All Tracks →
              </Link>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--cyan)', color: '#070D1A',
                  fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem',
                  padding: '0.9rem 2rem', borderRadius: '8px',
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
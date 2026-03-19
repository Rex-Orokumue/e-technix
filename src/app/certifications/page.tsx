'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WHATSAPP_NUMBER = '2348000000000'; // ← replace with real number

const certifications = [
  {
    id: 'data-analytics',
    icon: '📊',
    title: 'Certified Data Analyst',
    track: 'Data Analytics',
    accent: 'cyan' as const,
    description:
      'Awarded to students who complete the Data Analytics track and demonstrate the ability to clean, analyse, and visualise real business data using industry-standard tools.',
    skills: [
      'Data cleaning & preparation',
      'SQL querying & database management',
      'Python for data analysis',
      'Power BI & Tableau dashboards',
      'Business intelligence reporting',
      'Data storytelling & presentation',
    ],
    capstone: 'Analyse a real business dataset and present a full dashboard with insights and recommendations.',
    roles: ['Data Analyst', 'BI Analyst', 'Reporting Analyst', 'Freelance Data Consultant'],
  },
  {
    id: 'web-development',
    icon: '🌐',
    title: 'Certified Web Developer',
    track: 'Web App Development',
    accent: 'orange' as const,
    description:
      'Awarded to students who complete the Web App Development track and successfully build and deploy a full-stack web application with a live URL.',
    skills: [
      'HTML, CSS & JavaScript',
      'React & Next.js',
      'Node.js & REST APIs',
      'PostgreSQL database design',
      'Authentication & security',
      'Deployment on Vercel',
    ],
    capstone: 'Design, build, and deploy a full-stack web application with authentication, a database, and a live URL.',
    roles: ['Frontend Developer', 'Full-Stack Developer', 'Freelance Web Developer', 'Startup Founder'],
  },
  {
    id: 'mobile-apps',
    icon: '📱',
    title: 'Certified Mobile App Developer',
    track: 'Mobile & Desktop Apps',
    accent: 'cyan' as const,
    description:
      'Awarded to students who complete the Mobile & Desktop Apps track and publish a cross-platform application with a live backend and real users.',
    skills: [
      'Flutter & Dart development',
      'Cross-platform mobile UI',
      'Firebase & Supabase backend',
      'Authentication & user management',
      'Real-time data & notifications',
      'App store publishing',
    ],
    capstone: 'Build and publish a cross-platform mobile app with a live backend, authentication, and real data.',
    roles: ['Mobile App Developer', 'Flutter Developer', 'Freelance App Developer', 'Tech Startup Founder'],
  },
  {
    id: 'ai-systems',
    icon: '🤖',
    title: 'Certified AI Systems Builder',
    track: 'AI & Agentic Systems',
    accent: 'orange' as const,
    description:
      'Awarded to students who complete the AI & Agentic Systems track and build a fully functional AI agent that solves a real business problem end-to-end.',
    skills: [
      'AI & LLM fundamentals',
      'Prompt engineering',
      'LangChain & agent frameworks',
      'CrewAI multi-agent systems',
      'RAG (retrieval-augmented generation)',
      'Python for AI development',
    ],
    capstone: 'Build and deploy a fully functional AI agent that solves a real business problem end-to-end.',
    roles: ['AI Engineer', 'Automation Specialist', 'Freelance AI Developer', 'AI Product Builder'],
  },
  {
    id: 'ui-ux-design',
    icon: '🎨',
    title: 'Certified UX/UI Designer',
    track: 'Product Design (UI/UX)',
    accent: 'cyan' as const,
    description:
      'Awarded to students who complete the Product Design track and deliver a complete product design — from user research to high-fidelity prototype ready for developer handoff.',
    skills: [
      'UX research & user interviews',
      'Wireframing & information architecture',
      'High-fidelity UI design in Figma',
      'Design systems & component libraries',
      'Usability testing & iteration',
      'Product thinking & strategy',
    ],
    capstone: 'Design a complete product from user research to high-fidelity prototype — ready for a developer handoff.',
    roles: ['UI/UX Designer', 'Product Designer', 'Freelance Designer', 'Design Lead'],
  },
  {
    id: 'business-development',
    icon: '📈',
    title: 'Certified Business Development Specialist',
    track: 'Business Development & Growth',
    accent: 'orange' as const,
    description:
      'Awarded to students who complete the Business Development track and successfully launch a real go-to-market campaign or small business with measurable results.',
    skills: [
      'Market research & validation',
      'Sales systems & CRM',
      'Customer acquisition funnels',
      'Growth strategy & partnerships',
      'Digital marketing & ads',
      'Startup strategy & MVP planning',
    ],
    capstone: 'Launch a small business or growth campaign — from market research to first customers.',
    roles: ['Business Development Manager', 'Growth Marketer', 'Startup Founder', 'Sales Strategist'],
  },
];

export default function CertificationsPage() {
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
            Credentials
          </div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: '700px',
          }}>
            Certificates That<br />
            <span style={{ color: 'var(--cyan)' }}>Mean Something.</span>
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'var(--muted)',
            maxWidth: '580px', lineHeight: 1.7, marginBottom: '3rem',
          }}>
            Every E-Technix graduate earns a track-specific certificate backed by
            a UK-Nigeria programme. Not a participation trophy — a proof of real,
            demonstrated skill.
          </p>

          {/* Quick nav pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {certifications.map((cert) => (
              <a
                key={cert.id}
                href={`#${cert.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '0.5rem 1rem',
                  fontSize: '0.82rem', fontWeight: 500, color: 'var(--muted)',
                  textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--cyan-border)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--muted)';
                }}
              >
                <span>{cert.icon}</span>
                {cert.track}
              </a>
            ))}
          </div>
        </section>

        {/* ── What Makes Our Certificates Different ── */}
        <section style={{
          padding: '5rem 2.5rem',
          maxWidth: '1180px',
          margin: '0 auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '2.5rem',
          }}>
            What Makes Our Certificates{' '}
            <span style={{ color: 'var(--cyan)' }}>Different</span>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {[
              {
                icon: '🏗️',
                title: 'Project-Based',
                desc: 'Every certificate requires a completed capstone project — not just an exam. You prove what you can do, not just what you know.',
              },
              {
                icon: '🇬🇧',
                title: 'UK-Nigeria Backed',
                desc: 'The programme is a joint venture between Nigeria and the UK — giving your certificate credibility in both markets.',
              },
              {
                icon: '✅',
                title: 'Skill-Verified',
                desc: 'Certificates reflect real, demonstrated skills using industry-standard tools that employers and clients actually care about.',
              },
              {
                icon: '🌍',
                title: 'Globally Relevant',
                desc: 'The skills and tools taught are used by professionals worldwide — your certificate opens doors locally and internationally.',
              },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.75rem',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'var(--cyan-dim)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', marginBottom: '1rem',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-head)', fontWeight: 700,
                  fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text)',
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── All 6 Certificates ── */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '3rem',
          }}>
            All <span style={{ color: 'var(--cyan)' }}>6 Certificates</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {certifications.map((cert) => (
              <div
                key={cert.id}
                id={cert.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  scrollMarginTop: '88px',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  background: cert.accent === 'cyan'
                    ? 'linear-gradient(135deg, rgba(0,200,255,0.04) 0%, transparent 60%)'
                    : 'linear-gradient(135deg, rgba(255,107,43,0.04) 0%, transparent 60%)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.6rem', flexShrink: 0,
                      background: cert.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                      border: `1px solid ${cert.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)'}`,
                    }}>
                      {cert.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: cert.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                        marginBottom: '4px',
                      }}>
                        {cert.track}
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-head)',
                        fontSize: '1.2rem', fontWeight: 800,
                        letterSpacing: '-0.02em', color: 'var(--text)',
                      }}>
                        {cert.title}
                      </h3>
                    </div>
                  </div>

                  <Link href="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: cert.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                    color: '#070D1A', fontFamily: 'var(--font-head)',
                    fontWeight: 700, fontSize: '0.85rem',
                    padding: '0.65rem 1.5rem', borderRadius: '7px',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Earn This Certificate →
                  </Link>
                </div>

                {/* Body */}
                <div style={{
                  padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '2rem',
                }}>
                  {/* Description */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: 0 }}>
                      {cert.description}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.85rem',
                    }}>
                      Skills Covered
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cert.skills.map((skill) => (
                        <li key={skill} style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          fontSize: '0.85rem', color: 'var(--text)',
                        }}>
                          <span style={{
                            width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                            background: cert.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                          }} />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capstone + Roles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      background: cert.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                      border: `1px solid ${cert.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)'}`,
                      borderRadius: '10px', padding: '1.25rem',
                    }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: cert.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                        marginBottom: '0.6rem',
                      }}>
                        🏁 Capstone Requirement
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.65, marginBottom: 0 }}>
                        {cert.capstone}
                      </p>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '1.25rem',
                    }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem',
                      }}>
                        🎯 Career Roles This Unlocks
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {cert.roles.map((role) => (
                          <span key={role} style={{
                            fontSize: '0.78rem', fontWeight: 500,
                            padding: '0.25rem 0.7rem', borderRadius: '5px',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text)',
                          }}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
              Start Earning Your Certificate Today
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative' }}>
              Register for the next cohort and walk away 9 months later with a certificate,
              a portfolio, and a career plan.
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
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
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
      <style>{`
        @media (max-width: 600px) {
          .cert-header { flex-direction: column !important; align-items: flex-start !important; }
          .cert-header a { width: 100% !important; text-align: center !important; justify-content: center !important; }
          .cert-body { padding: 1.25rem !important; }
          .cert-body > div:first-child { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </>
  );
}
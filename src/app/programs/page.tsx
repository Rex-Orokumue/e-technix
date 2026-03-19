'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WHATSAPP_NUMBER = '2348120288390'; // ← replace with real number

interface Track {
  id: string;
  icon: string;
  name: string;
  accent: 'cyan' | 'orange';
  cert: string;
  overview: string;
  duration: string;
  level: string;
  skills: string[];
  tools: string[];
  projects: string[];
  capstone: string;
  careerPaths: string[];
}

const tracks: Track[] = [
  {
    id: 'data-analytics',
    icon: '📊',
    name: 'Data Analytics',
    accent: 'cyan',
    cert: 'Certified Data Analyst',
    overview:
      'Learn to collect, clean, analyse, and visualise data that drives real business decisions. This track is perfect for anyone who wants to work with numbers, spot trends, and communicate insights clearly.',
    duration: '3 months (Month 3–5)',
    level: 'Beginner to Intermediate',
    skills: [
      'Data cleaning & preparation',
      'Exploratory data analysis',
      'Business intelligence',
      'Dashboard building',
      'Data storytelling',
      'Statistical thinking',
    ],
    tools: ['Microsoft Excel', 'SQL', 'Python', 'Power BI', 'Tableau'],
    projects: [
      'Sales performance dashboard',
      'Customer behaviour analysis',
      'Financial data report',
    ],
    capstone: 'Analyse a real business dataset and present a full dashboard with insights and recommendations.',
    careerPaths: ['Data Analyst', 'Business Intelligence Analyst', 'Reporting Analyst', 'Freelance Data Consultant'],
  },
  {
    id: 'web-development',
    icon: '🌐',
    name: 'Web App Development',
    accent: 'orange',
    cert: 'Certified Web Developer',
    overview:
      'Build modern, full-stack web applications from the ground up. You will learn frontend and backend development, databases, and how to ship real products that work in the browser.',
    duration: '3 months (Month 3–5)',
    level: 'Beginner to Intermediate',
    skills: [
      'HTML, CSS & JavaScript',
      'React & Next.js',
      'Node.js & REST APIs',
      'Database design',
      'Authentication & security',
      'Deployment & hosting',
    ],
    tools: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git'],
    projects: [
      'SaaS dashboard',
      'E-commerce marketplace',
      'Portfolio builder',
    ],
    capstone: 'Design, build, and deploy a full-stack web application with authentication, a database, and a live URL.',
    careerPaths: ['Frontend Developer', 'Full-Stack Developer', 'Freelance Web Developer', 'Startup Founder'],
  },
  {
    id: 'mobile-apps',
    icon: '📱',
    name: 'Mobile & Desktop Apps',
    accent: 'cyan',
    cert: 'Certified Mobile App Developer',
    overview:
      'Create cross-platform applications that run on Android, iOS, and Windows. You will build real apps with modern tools used by top companies — from fintech to marketplaces.',
    duration: '3 months (Month 3–5)',
    level: 'Beginner to Intermediate',
    skills: [
      'Mobile UI development',
      'State management',
      'Backend integration',
      'Authentication & user management',
      'Real-time data',
      'App publishing',
    ],
    tools: ['Flutter', 'Dart', 'Firebase', 'Supabase', 'Android Studio'],
    projects: [
      'Fintech wallet app',
      'School management app',
      'Marketplace app',
    ],
    capstone: 'Build and publish a cross-platform mobile app with a live backend, authentication, and real data.',
    careerPaths: ['Mobile App Developer', 'Flutter Developer', 'Freelance App Developer', 'Tech Startup Founder'],
  },
  {
    id: 'ai-systems',
    icon: '🤖',
    name: 'AI & Agentic Systems',
    accent: 'orange',
    cert: 'Certified AI Systems Builder',
    overview:
      'The most future-proof track. Learn how to build AI-powered tools, automation workflows, and intelligent agents using the latest frameworks. No prior AI experience required.',
    duration: '3 months (Month 3–5)',
    level: 'Intermediate',
    skills: [
      'AI & LLM fundamentals',
      'Prompt engineering',
      'AI workflow automation',
      'Building AI agents',
      'Retrieval-augmented generation (RAG)',
      'Python for AI',
    ],
    tools: ['Python', 'LangChain', 'CrewAI', 'AutoGPT', 'ChatGPT API', 'Flowise'],
    projects: [
      'AI research assistant',
      'AI customer support bot',
      'AI business analyst agent',
    ],
    capstone: 'Build and deploy a fully functional AI agent that solves a real business problem end-to-end.',
    careerPaths: ['AI Engineer', 'Automation Specialist', 'Freelance AI Developer', 'AI Product Builder'],
  },
  {
    id: 'ui-ux-design',
    icon: '🎨',
    name: 'Product Design (UI/UX)',
    accent: 'cyan',
    cert: 'Certified UX/UI Designer',
    overview:
      'Learn to design digital products that people actually want to use. This track covers user research, wireframing, prototyping, and building full design systems — the skills every product team needs.',
    duration: '3 months (Month 3–5)',
    level: 'Beginner to Intermediate',
    skills: [
      'User experience (UX) research',
      'Wireframing & prototyping',
      'Visual design principles',
      'Design systems',
      'Usability testing',
      'Product thinking',
    ],
    tools: ['Figma', 'Adobe XD', 'Maze', 'Notion'],
    projects: [
      'Fintech app UI design',
      'Mobile app redesign',
      'SaaS dashboard design system',
    ],
    capstone: 'Design a complete product from user research to high-fidelity prototype — ready for a developer handoff.',
    careerPaths: ['UI/UX Designer', 'Product Designer', 'Freelance Designer', 'Design Lead'],
  },
  {
    id: 'business-development',
    icon: '📈',
    name: 'Business Development',
    accent: 'orange',
    cert: 'Certified Business Development Specialist',
    overview:
      'Learn how to build, grow, and scale businesses in the digital age. This track is ideal for aspiring entrepreneurs, sales professionals, and anyone who wants to understand how businesses actually make money.',
    duration: '3 months (Month 3–5)',
    level: 'Beginner to Intermediate',
    skills: [
      'Market research',
      'Sales systems & funnels',
      'Customer acquisition',
      'Partnership strategy',
      'Growth hacking',
      'Startup strategy',
    ],
    tools: ['HubSpot CRM', 'Notion', 'Google Analytics', 'Mailchimp', 'Meta Ads Manager'],
    projects: [
      'Full go-to-market strategy',
      'Sales funnel build',
      'Growth campaign launch',
    ],
    capstone: 'Launch a small business or growth campaign — from market research to first customers.',
    careerPaths: ['Business Development Manager', 'Growth Marketer', 'Startup Founder', 'Sales Strategist'],
  },
];

const foundation = [
  { icon: '💻', title: 'Digital Literacy & Productivity', desc: 'Notion, Google Workspace, internet research' },
  { icon: '🧠', title: 'Problem Solving & Critical Thinking', desc: 'Structured frameworks for real-world problems' },
  { icon: '🏢', title: 'Business Fundamentals', desc: 'Business models, customer discovery, monetisation' },
  { icon: '🗣️', title: 'Communication & Presentation', desc: 'Professional writing, pitching, storytelling' },
  { icon: '⚡', title: 'AI Productivity', desc: 'ChatGPT, prompt engineering, AI research tools' },
];

export default function ProgramsPage() {
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
            Full Programme
          </div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            maxWidth: '700px',
          }}>
            Everything We Teach.<br />
            <span style={{ color: 'var(--cyan)' }}>Nothing Wasted.</span>
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--muted)',
            maxWidth: '580px',
            lineHeight: 1.7,
            marginBottom: 0,
          }}>
            A 6–9 month structured programme built around real skills, real tools,
            and real projects. Start with foundations, pick your track, build something
            real, then launch your career.
          </p>
        </section>

        {/* ── Phase 1 Foundation ── */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap' }}>

            <div style={{ flex: '1 1 320px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)',
                color: 'var(--cyan)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.25rem',
              }}>
                Phase 1 · Month 1–2
              </div>
              <h2 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800, lineHeight: 1.15,
                letterSpacing: '-0.025em', marginBottom: '1rem',
              }}>
                Digital & Business<br />
                <span style={{ color: 'var(--cyan)' }}>Foundations</span>
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Everyone takes this phase — regardless of their track. It ensures
                you don&apos;t just learn tools, but understand how to solve problems
                and create value in the real world.
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.75rem 1rem',
                fontSize: '0.82rem', color: 'var(--muted)',
              }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>Duration:</span> 2 months · Mandatory for all students
              </div>
            </div>

            <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {foundation.map((f) => (
                <div key={f.title} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '1rem 1.25rem',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: 'var(--cyan-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>{f.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Phase 2 Tracks ── */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)',
            color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.25rem',
          }}>
            Phase 2 · Month 3–5
          </div>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-0.025em', marginBottom: '0.75rem',
          }}>
            Choose Your <span style={{ color: 'var(--cyan)' }}>Specialisation Track</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '540px', lineHeight: 1.7, marginBottom: '3rem' }}>
            After foundations, students choose one track to go deep in. Each track
            includes guided learning, hands-on tools, and real projects.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {tracks.map((track) => (
              <div key={track.id} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}>
                {/* Track header */}
                <div style={{
                  padding: '2rem 2.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '2rem',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1 }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', flexShrink: 0,
                      background: track.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                    }}>
                      {track.icon}
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-head)',
                        fontSize: '1.25rem', fontWeight: 800,
                        marginBottom: '0.4rem', letterSpacing: '-0.02em',
                      }}>
                        {track.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: track.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                          background: track.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                          padding: '0.2rem 0.7rem', borderRadius: '4px',
                        }}>
                          {track.duration}
                        </span>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: 'var(--muted)',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '0.2rem 0.7rem', borderRadius: '4px',
                        }}>
                          {track.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: track.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                    color: '#070D1A', fontFamily: 'var(--font-head)',
                    fontWeight: 700, fontSize: '0.85rem',
                    padding: '0.65rem 1.5rem', borderRadius: '7px',
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Enrol in This Track →
                  </Link>
                </div>

                {/* Track body */}
                <div style={{
                  padding: '2rem 2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '2rem',
                }}>
                  {/* Overview */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: 0 }}>
                      {track.overview}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--muted)',
                      marginBottom: '0.85rem',
                    }}>
                      What You&apos;ll Learn
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {track.skills.map((skill) => (
                        <li key={skill} style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          fontSize: '0.85rem', color: 'var(--text)',
                        }}>
                          <span style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: track.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                            flexShrink: 0,
                          }} />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tools */}
                  <div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--muted)',
                      marginBottom: '0.85rem',
                    }}>
                      Tools & Technologies
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {track.tools.map((tool) => (
                        <span key={tool} style={{
                          fontSize: '0.78rem', fontWeight: 600,
                          padding: '0.3rem 0.75rem', borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--muted)',
                      marginBottom: '0.85rem',
                    }}>
                      Projects You&apos;ll Build
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {track.projects.map((project) => (
                        <li key={project} style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          fontSize: '0.85rem', color: 'var(--text)',
                        }}>
                          <span style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>▸</span>
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capstone + Career */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{
                      flex: '1 1 280px',
                      background: track.accent === 'cyan' ? 'var(--cyan-dim)' : 'var(--orange-dim)',
                      border: `1px solid ${track.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.25)'}`,
                      borderRadius: '10px', padding: '1.25rem',
                    }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: track.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                        marginBottom: '0.6rem',
                      }}>
                        🏁 Capstone Project
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.65, marginBottom: 0 }}>
                        {track.capstone}
                      </p>
                    </div>

                    <div style={{
                      flex: '1 1 280px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '1.25rem',
                    }}>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem',
                      }}>
                        🎯 Career Paths
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {track.careerPaths.map((path) => (
                          <span key={path} style={{
                            fontSize: '0.78rem', fontWeight: 500,
                            padding: '0.25rem 0.7rem', borderRadius: '5px',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text)',
                          }}>
                            {path}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Certificate */}
                  <div style={{
                    gridColumn: '1 / -1',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    borderTop: '1px solid var(--border)', paddingTop: '1.25rem',
                  }}>
                    <span style={{ fontSize: '1rem' }}>🎓</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      Graduates receive:{' '}
                      <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{track.cert}</strong>
                    </span>
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
            borderRadius: '20px', padding: '4rem 3rem', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
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
              Not Sure Which Track Is Right?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative' }}>
              Chat with us on WhatsApp and we&apos;ll help you pick the best track based on your goals.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--cyan)', color: '#070D1A',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem',
                padding: '0.9rem 2rem', borderRadius: '8px', textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Register Now →
              </Link>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'transparent', color: 'var(--text)',
                  fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.95rem',
                  padding: '0.9rem 2rem', borderRadius: '8px',
                  border: '1px solid var(--border-bright)', textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#25D366'; e.currentTarget.style.color = '#25D366'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text)'; }}
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <style>{`
        @media (max-width: 600px) {
          .track-badges span { font-size: 0.68rem !important; padding: 0.15rem 0.5rem !important; }
          .track-header-row { flex-direction: column !important; gap: 1rem !important; }
          .track-header-row a { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </>
  );
}
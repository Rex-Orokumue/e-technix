'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WHATSAPP_NUMBER = '2348120288390';

const team = [
  {
    name: 'Okeoma Ihunwo',
    role: 'Programme Director',
    location: 'United Kingdom 🇬🇧',
    photo: '/team/okeoma.png',
    linkedin: 'https://www.linkedin.com/in/okeoma-ihunwo-b69b3664/',
    accent: 'cyan' as const,
    bio: 'Okeoma is a Software Engineer and Data Analyst with over 20 years of cross-functional experience in the IT sector. Based in the UK, he specialises in cloud computing, software development, and data analytics — and has spent his career leading teams, mentoring developers, and building systems that solve real business problems. His vision for E-Technix is simple: create a structured pathway that gives talented people across Africa and beyond access to the kind of training that actually translates to careers.',
    highlights: [
      '20+ years in software engineering & data analytics',
      'Expert in cloud computing, Agile & DevOps',
      'Led teams and projects across multiple continents',
      'Passionate mentor and technical leader',
    ],
  },
  {
    name: 'Rex Orokumue',
    role: 'Lead Instructor',
    location: 'Nigeria 🇳🇬',
    photo: '/team/rex.png',
    linkedin: 'https://www.linkedin.com/in/rexorokumue/',
    accent: 'orange' as const,
    bio: 'Rex is a full-stack developer and the Lead Instructor at E-Technix, based in Nigeria. With hands-on experience building production-grade web and mobile applications — including systems like Zolarux and EduPanion — Rex brings real-world technical depth to everything he teaches. He is the engine behind the day-to-day delivery of the programme, ensuring every student gets the structure, accountability, and mentorship they need to go from learning to doing.',
    highlights: [
      'Full-stack developer with production experience',
      'Builder of real SaaS and mobile products',
      'Specialist in Next.js, Flutter, and AI systems',
      'Focused on practical, project-based learning',
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>

        {/* ── Hero ── */}
        <section style={{
          padding: '5rem 2.5rem 4rem',
          maxWidth: '1180px', margin: '0 auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
            Our Story
          </div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: '750px',
          }}>
            Built to Turn Talent<br />
            <span style={{ color: 'var(--cyan)' }}>Into Careers.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '640px', lineHeight: 1.8 }}>
            E-Technix is a UK-directed digital skills training programme with strong roots in Africa. We train motivated people — wherever they are — in the tech and business skills that the real world actually demands. Our primary focus right now is Africa, but our doors are open to anyone ready to build a digital career.
          </p>
        </section>

        {/* ── How It Started ── */}
        <section style={{
          padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }} className="about-grid">
            <div>
              <h2 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                fontWeight: 800, lineHeight: 1.15,
                letterSpacing: '-0.025em', marginBottom: '1.5rem',
              }}>
                How It Started
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                E-Technix started with a conversation between a director in the United Kingdom and a developer in Nigeria. The shared observation was clear — there is an enormous amount of raw talent across Africa and beyond that never gets the right structure to turn into a career.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                Most training available is either too shallow, too expensive, or completely disconnected from what employers and clients actually need. People finish courses and still don&apos;t know how to build anything real. That gap is what we set out to close.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 0 }}>
                The director brought 20+ years of international tech experience and a UK-based network. The team in Nigeria brought hands-on technical depth and proximity to the students we serve. Together, we built something structured, practical, and genuinely outcome-focused.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '🌍', title: 'Africa-First, Globally Open', desc: 'Our primary market is Africa — Nigeria, Ghana, Kenya, and beyond. But the programme is open to anyone in the world who is serious about building a digital career.' },
                { icon: '🇬🇧', title: 'UK-Directed', desc: 'Programme direction, standards, and strategy come from the UK — giving our students and their certificates international credibility.' },
                { icon: '🇳🇬', title: 'Nigeria-Delivered', desc: 'Day-to-day delivery is run from Nigeria, which means we are available, accessible, and deeply understand the context our students are working in.' },
                { icon: '🏗️', title: 'Built on Real Projects', desc: 'Every track ends with a real capstone project. Students leave with a portfolio of actual work — not just a piece of paper.' },
              ].map(item => (
                <div key={item.title} style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '1.25rem',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '9px',
                    background: 'var(--cyan-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section style={{
          padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem',
            }}>
              <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
              Our Mission
            </div>
            <blockquote style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              fontWeight: 800, lineHeight: 1.25,
              letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: '2rem',
            }}>
              &ldquo;To turn motivated people into digital professionals — through structure, real projects, and relentless accountability.&rdquo;
            </blockquote>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              We measure our success by one thing: what our students are able to do after the programme that they could not do before. Not just knowledge — capability. Not just certificates — careers.
            </p>
          </div>
        </section>

        {/* ── Team ── */}
        <section style={{
          padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
            The People Behind It
          </div>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
            fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-0.025em', marginBottom: '0.75rem',
          }}>
            Who We Are
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '540px', lineHeight: 1.7, marginBottom: '3rem' }}>
            E-Technix is not a faceless platform. Here are the people who built it and who will be with you through the programme.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }} className="team-grid">
            {team.map(person => (
              <div key={person.name} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '20px', overflow: 'hidden',
              }}>
                {/* Top accent bar */}
                <div style={{
                  height: '4px',
                  background: person.accent === 'cyan'
                    ? 'linear-gradient(90deg, var(--cyan), transparent)'
                    : 'linear-gradient(90deg, var(--orange), transparent)',
                }} />

                <div style={{ padding: '2rem' }}>
                  {/* Photo + name row */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '88px', height: '88px', borderRadius: '14px',
                      overflow: 'hidden', flexShrink: 0,
                      border: `2px solid ${person.accent === 'cyan' ? 'var(--cyan-border)' : 'rgba(255,107,43,0.3)'}`,
                      position: 'relative',
                    }}>
                      <Image
                        src={person.photo}
                        alt={person.name}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-head)',
                        fontSize: '1.2rem', fontWeight: 800,
                        letterSpacing: '-0.02em', marginBottom: '4px',
                      }}>
                        {person.name}
                      </h3>
                      <div style={{
                        fontSize: '0.78rem', fontWeight: 700,
                        color: person.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        marginBottom: '4px',
                      }}>
                        {person.role}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {person.location}
                      </div>
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          marginTop: '8px', fontSize: '0.75rem', fontWeight: 600,
                          color: '#0A66C2', textDecoration: 'none',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        View LinkedIn Profile
                      </a>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                    {person.bio}
                  </p>

                  {/* Highlights */}
                  <div style={{
                    borderTop: '1px solid var(--border)', paddingTop: '1.25rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}>
                    {person.highlights.map(h => (
                      <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text)' }}>
                        <span style={{
                          width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                          background: person.accent === 'cyan' ? 'var(--cyan)' : 'var(--orange)',
                        }} />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Values ── */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
            fontWeight: 800, letterSpacing: '-0.025em',
            marginBottom: '2.5rem', textAlign: 'center',
          }}>
            What We Stand For
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🎯', title: 'Outcomes over Attendance', desc: "We do not care how many classes you sat through. We care what you can build, design, analyse, or sell when you finish." },
              { icon: '🔨', title: 'Real Work, Real Skills', desc: "Every concept we teach is backed by a real tool and a real project. We do not teach theory for theory's sake." },
              { icon: '🤝', title: 'Accountability', desc: "We check in, we follow up, and we hold students to deadlines. That is what a serious training programme looks like." },
              { icon: '🌱', title: 'Access for Everyone', desc: "We built flexible pricing and instalment options specifically so that cost does not stop someone with real potential." },
              { icon: '📈', title: 'Long-Term Vision', desc: "We are building a talent pipeline — not just a training business. E-Technix graduates should be known for quality." },
              { icon: '🌍', title: 'Africa to the World', desc: "Our students come from across Africa and beyond. The standard we train them to is globally competitive." },
            ].map(v => (
              <div key={v.title} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '1.75rem',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'var(--cyan-dim)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', marginBottom: '1rem',
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Long-term vision ── */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="about-grid">
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--orange)', fontSize: '0.78rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
              }}>
                <span style={{ width: '24px', height: '2px', background: 'var(--orange)', borderRadius: '1px' }} />
                Where We&apos;re Going
              </div>
              <h2 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                fontWeight: 800, lineHeight: 1.15,
                letterSpacing: '-0.025em', marginBottom: '1.25rem',
              }}>
                From Training Programme<br />to Tech Ecosystem
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                E-Technix starts as a training programme — but the long-term vision is much bigger. We are building a talent pipeline that connects trained graduates directly with employers, freelance clients, and startup ecosystems across Africa, the UK, and beyond.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 0 }}>
                Every cohort is a step toward that. The best graduates become part of a network that keeps opening doors — long after the programme ends.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { phase: 'Now', label: 'Digital Skills Training', desc: 'Structured 6–9 month programme across 6 tracks — Africa-first, globally open' },
                { phase: 'Next', label: 'Talent Placement Network', desc: 'Connecting graduates with employers and clients directly across Africa and the UK' },
                { phase: 'Future', label: 'Startup Incubator', desc: 'Supporting the best graduates to launch their own ventures with mentorship and funding access' },
              ].map((item, i) => (
                <div key={item.phase} style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  background: i === 0 ? 'var(--cyan-dim)' : 'var(--surface)',
                  border: `1px solid ${i === 0 ? 'var(--cyan-border)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '1.25rem',
                }}>
                  <div style={{
                    background: i === 0 ? 'var(--cyan)' : 'var(--surface2)',
                    color: i === 0 ? '#070D1A' : 'var(--muted)',
                    fontFamily: 'var(--font-head)', fontWeight: 700,
                    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                  }}>
                    {item.phase}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '3px', color: i === 0 ? 'var(--cyan)' : 'var(--text)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
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
              Ready to Be Part of This?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative' }}>
              Join the next cohort and start building the career you actually want — wherever you are in the world.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
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
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--cyan)', color: '#070D1A',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem',
                padding: '0.9rem 2rem', borderRadius: '8px', textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Register Now →
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
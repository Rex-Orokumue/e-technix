'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const WHATSAPP_NUMBER = '2348120288390';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>

        {/* Hero */}
        <section style={{ padding: '5rem 2.5rem 4rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
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
            letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: '700px',
          }}>
            Built to Close the<br />
            <span style={{ color: 'var(--cyan)' }}>Tech Skills Gap.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '620px', lineHeight: 1.8 }}>
            E-Technix is a UK-Nigeria digital skills training programme built to turn talent into careers. We believe the gap between where most people are and where they want to be is not intelligence — it&apos;s access to the right structure, the right tools, and people who will hold them accountable.
          </p>
        </section>

        {/* The story */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
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
                E-Technix started with a conversation between a director in the United Kingdom and a developer in Nigeria. The vision was simple: there are thousands of people in Nigeria with real potential and the drive to build digital careers — but most of the training available is either too shallow, too expensive, or disconnected from what the real world actually needs.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                The director had the network, the experience, and the vision. The team in Nigeria had the time, the technical depth, and the understanding of the local landscape. Together, we decided to build something that actually works.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 0 }}>
                E-Technix is not a generic online course. It is a structured, 6–9 month programme built around real projects, real tools, and real outcomes — whether that&apos;s a job, a freelance income, or a startup.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  icon: '🇬🇧',
                  title: 'UK-Based Direction',
                  desc: 'Our director is based in the United Kingdom and brings international perspective, network, and standards to everything we build.',
                },
                {
                  icon: '🇳🇬',
                  title: 'Nigeria-Based Delivery',
                  desc: 'Our training team operates in Nigeria — which means we understand the realities our students face and we are available when they need us.',
                },
                {
                  icon: '🌍',
                  title: 'Global Relevance',
                  desc: 'The skills we teach, the tools we use, and the standards we hold our students to are the same ones employers and clients use globally.',
                },
                {
                  icon: '🏗️',
                  title: 'Built on Real Projects',
                  desc: 'Every track ends with a real capstone project. Students leave with a portfolio, not just a certificate.',
                },
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

        {/* Mission */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
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
              letterSpacing: '-0.025em', color: 'var(--text)',
              marginBottom: '2rem',
            }}>
              &ldquo;To turn everyday people into digital professionals — through structure, real projects, and relentless accountability.&rdquo;
            </blockquote>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              We measure our success by one thing: what our students are able to do after the programme that they could not do before. Not just knowledge — capability. Not just certificates — careers.
            </p>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '1180px', margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
            fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '2.5rem',
            textAlign: 'center',
          }}>
            What We Stand For
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🎯', title: 'Outcomes over Attendance', desc: 'We do not care how many classes you sat through. We care what you can build, design, analyse, or sell when you finish.' },
              { icon: '🔨', title: 'Real Work, Real Skills', desc: 'Every concept we teach is backed by a real tool and a real project. We do not teach theory for theory\'s sake.' },
              { icon: '🤝', title: 'Accountability', desc: 'We check in, we follow up, and we hold students to deadlines. That is what a good training programme looks like.' },
              { icon: '🌱', title: 'Access for Everyone', desc: 'We built flexible pricing and instalment options specifically so that cost does not stop someone with real potential.' },
              { icon: '📈', title: 'Long-Term Vision', desc: 'We are building a talent pipeline — not just a training business. E-Technix graduates should be known for quality.' },
              { icon: '🌍', title: 'Africa to the World', desc: 'Our students are in Nigeria but their work should be competitive anywhere — and we build the programme with that standard in mind.' },
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

        {/* Long-term vision */}
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
                E-Technix is starting as a training programme. But the long-term vision is bigger — a full tech talent pipeline that connects trained graduates directly with employers, freelance clients, and startup ecosystems in Nigeria and the UK.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 0 }}>
                Think of what Andela built — a talent network that placed African developers globally. That is the direction we are building towards. Every cohort is a step in that direction.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { phase: 'Now', label: 'Digital Skills Training', desc: 'Structured 6–9 month programme across 6 tracks' },
                { phase: 'Next', label: 'Talent Placement Network', desc: 'Connecting graduates with employers and clients directly' },
                { phase: 'Future', label: 'Startup Incubator', desc: 'Supporting the best graduates to launch their own ventures' },
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
                    padding: '3px 8px', borderRadius: '4px', flexShrink: 0,
                    marginTop: '2px',
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

        {/* CTA */}
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
              Join the next cohort and start building the career you actually want.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
              <Link href="/programs" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', color: 'var(--text)',
                fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.95rem',
                padding: '0.9rem 2rem', borderRadius: '8px',
                border: '1px solid var(--border-bright)', textDecoration: 'none',
              }}>
                View All Tracks →
              </Link>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--cyan)', color: '#070D1A',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem',
                padding: '0.9rem 2rem', borderRadius: '8px', textDecoration: 'none',
              }}>
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
        }
      `}</style>
    </>
  );
}
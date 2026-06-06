'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const WHATSAPP_NUMBER = '2348120288390';

const faqs = [
  {
    category: 'About the Programme',
    questions: [
      {
        q: 'Do I need any prior experience to join?',
        a: 'No. The programme starts with a 2-month Foundation phase that everyone takes — regardless of their background. It is designed to take complete beginners to a level where they can confidently enter a specialisation track. If you have prior experience, the foundation phase will sharpen your professional and business thinking.',
      },
      {
        q: 'Is the programme online or in-person?',
        a: 'The programme is fully online, so you can join from anywhere in Nigeria, the UK, or anywhere else in the world. Sessions are live with recordings available so you never miss anything.',
      },
      {
        q: 'How many hours per week does this require?',
        a: 'Plan for approximately 10–15 hours per week — a mix of live sessions, self-paced learning, and project work. This is a serious programme, not a passive course. The more you put in, the more you get out.',
      },
      {
        q: 'When does the next cohort start?',
        a: 'We run cohorts periodically throughout the year. The best way to secure your spot is to register now — we will confirm your start date via WhatsApp after payment.',
      },
      {
        q: 'How long is the full programme?',
        a: 'The full programme runs 6–9 months. Month 1–2 is the Foundation phase (mandatory for all students), Month 3–5 is your Specialisation Track, Month 6–8 is the Real Project Labs, and Month 9 is Career Launch preparation.',
      },
    ],
  },
  {
    category: 'Tracks & Curriculum',
    questions: [
      {
        q: 'Can I switch tracks after I start?',
        a: 'You can switch tracks before the Specialisation phase begins (i.e. during Month 1–2). Once you begin Month 3, we ask that you commit to your chosen track to get the full depth of the programme.',
      },
      {
        q: 'Can I take more than one track?',
        a: 'Not simultaneously. Each track is designed to take you deep rather than wide. However, graduates who want to learn a second track after completing the programme can re-enrol at a discounted rate.',
      },
      {
        q: 'What tools and software will I need?',
        a: 'You will need a laptop (Windows, Mac, or Linux) with a reliable internet connection. All the software and tools used in the programme are either free or have free tiers — you will not need to purchase any paid tools during your training.',
      },
      {
        q: 'Are the projects real or just exercises?',
        a: 'Real. In the Project Labs phase, teams build actual products — fintech apps, SaaS dashboards, AI tools, data pipelines, and more. These are products you can put in your portfolio and show to employers or clients.',
      },
    ],
  },
  {
    category: 'Payment & Pricing',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept card payments (debit/credit), bank transfers, and USSD via Paystack. For students in the UK, you can also reach out via WhatsApp to arrange a manual bank transfer in GBP.',
      },
      {
        q: 'How does the instalment payment work?',
        a: 'You pay the first instalment upfront when you register. The second instalment is due at the beginning of Month 3 when you enter your Specialisation Track. If the second payment is not made on time, access to the track may be paused until it is settled.',
      },
      {
        q: 'Is there a money-back guarantee?',
        a: 'Yes. If you enrol and decide within 7 days that the programme is not right for you, we will issue a full refund — no questions asked. After 7 days, payments are non-refundable, but you can defer your enrolment to the next cohort.',
      },
      {
        q: 'Are there any hidden fees or additional costs?',
        a: 'No. The programme fee covers everything — curriculum, live sessions, recordings, mentor access, project labs, career preparation, and your certificate. There are no surprise charges.',
      },
      {
        q: 'Do you offer scholarships or discounts?',
        a: 'We occasionally offer early-bird discounts for the first few spots in each cohort. We also have a referral programme — refer a friend who enrols and get a discount on your own fee. Message us on WhatsApp for the latest offers.',
      },
    ],
  },
  {
    category: 'Certificates & Career',
    questions: [
      {
        q: 'What certificate will I receive?',
        a: 'Every graduate receives a track-specific certificate — for example, "Certified Data Analyst" or "Certified Web Developer". Certificates are issued on completion of your Capstone project, which proves you have the skills, not just the attendance.',
      },
      {
        q: 'Will the certificate be recognised by employers?',
        a: 'Our certificate is backed by a UK-Nigeria programme, which gives it credibility in both markets. More importantly, your portfolio of real projects will be far more valuable to employers than any certificate — and that is exactly what we help you build.',
      },
      {
        q: 'What happens after the programme ends?',
        a: 'You leave with a certificate, a project portfolio, and a career plan tailored to one of three paths — employment, freelancing, or starting your own business. We give you the tools for all three and help you execute the one that fits your goal.',
      },
      {
        q: 'Do you help with job placement?',
        a: 'We do not guarantee job placement, but we actively prepare you for it — CV building, GitHub optimisation, LinkedIn setup, mock interviews, and connections to our employer and client network. Your outcome depends on the effort you put in.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

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
            FAQs
          </div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: '700px',
          }}>
            Questions We Get<br />
            <span style={{ color: 'var(--cyan)' }}>All the Time.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '540px', lineHeight: 1.7, marginBottom: 0 }}>
            Everything you need to know before you enrol. Can&apos;t find what you&apos;re looking for? Chat with us directly on WhatsApp.
          </p>
        </section>

        {/* FAQ sections */}
        <section style={{ padding: '5rem 2.5rem', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '1.1rem', fontWeight: 800,
                  letterSpacing: '-0.02em', marginBottom: '1.25rem',
                  color: 'var(--cyan)',
                }}>
                  {section.category}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {section.questions.map((item, i) => {
                    const key = `${section.category}-${i}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={key} style={{
                        background: 'var(--surface)',
                        border: `1px solid ${isOpen ? 'var(--cyan-border)' : 'var(--border)'}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s',
                      }}>
                        <button
                          onClick={() => toggle(key)}
                          style={{
                            width: '100%', padding: '1.25rem 1.5rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: '1rem', background: 'transparent', border: 'none',
                            cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <span style={{
                            fontFamily: 'var(--font-head)', fontWeight: 700,
                            fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.4,
                          }}>
                            {item.q}
                          </span>
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: isOpen ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isOpen ? 'var(--cyan-border)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: '0.75rem',
                            color: isOpen ? 'var(--cyan)' : 'var(--muted)',
                            transition: 'all 0.2s',
                            transform: isOpen ? 'rotate(45deg)' : 'none',
                          }}>
                            +
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{
                            padding: '0 1.5rem 1.25rem',
                            fontSize: '0.92rem', color: 'var(--muted)',
                            lineHeight: 1.75, borderTop: '1px solid var(--border)',
                            paddingTop: '1.25rem',
                          }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still have questions CTA */}
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
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800, letterSpacing: '-0.025em',
              marginBottom: '1rem', position: 'relative',
            }}>
              Still Have a Question?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '2rem', position: 'relative' }}>
              Message us directly on WhatsApp and we&apos;ll get back to you within a few hours.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: '#25D366', color: '#fff',
                  fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem',
                  padding: '0.9rem 2rem', borderRadius: '8px', textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Chat on WhatsApp →
              </a>
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
    </>
  );
}
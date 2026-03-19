'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const WHATSAPP_NUMBER = '2348120288390'; // ← replace with real number
const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

// ─── Pricing Data ─────────────────────────────────────────────────────────────
const tracks = [
  { id: 'data-analytics',       icon: '📊', name: 'Data Analytics',           full: 180000, install: 95000 },
  { id: 'web-development',      icon: '🌐', name: 'Web App Development',       full: 220000, install: 115000 },
  { id: 'mobile-apps',          icon: '📱', name: 'Mobile & Desktop Apps',     full: 220000, install: 115000 },
  { id: 'ai-systems',           icon: '🤖', name: 'AI & Agentic Systems',      full: 280000, install: 145000 },
  { id: 'ui-ux-design',         icon: '🎨', name: 'Product Design (UI/UX)',    full: 160000, install: 85000 },
  { id: 'business-development', icon: '📈', name: 'Business Development',      full: 150000, install: 80000 },
];

const experienceLevels = [
  'Complete beginner — no tech background',
  'Some basic knowledge — used computers/internet',
  'Intermediate — done some online courses',
  'Advanced — working in a related field',
];

const educationLevels = [
  "Secondary school / O-Level",
  "Diploma / OND / HND",
  "Bachelor's degree",
  "Postgraduate / Masters",
  "Self-taught / No formal education",
];

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG');

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  track: string;
  education: string;
  experience: string;
  motivation: string;
  goal: string;
  paymentType: 'full' | 'installment';
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', country: 'Nigeria',
  track: '', education: '', experience: '', motivation: '', goal: '',
  paymentType: 'full',
};

// ─── Paystack inline JS types ─────────────────────────────────────────────────
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata: object;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

const redirectToWhatsApp = (data: FormData, amount: number) => {
  const track = tracks.find(t => t.id === data.track);
  const msg = `Hello! I just registered for E-Technix. Here are my details:

*Name:* ${data.firstName} ${data.lastName}
*Email:* ${data.email}
*Phone:* ${data.phone}
*Country:* ${data.country}
*Track:* ${track?.name}
*Payment:* ${fmt(amount)} (${data.paymentType === 'full' ? 'Full payment' : '1st Instalment'})
*Education:* ${data.education}
*Experience:* ${data.experience}
*Motivation:* ${data.motivation}
*Goal:* ${data.goal}

Looking forward to starting! 🚀`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [success, setSuccess] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById('paystack-script')) { setScriptLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const set = (field: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const selectedTrack = tracks.find(t => t.id === form.track);
  const amount = selectedTrack
    ? form.paymentType === 'full' ? selectedTrack.full : selectedTrack.install
    : 0;

  const isComplete =
    form.firstName && form.lastName && form.email && form.phone &&
    form.track && form.education && form.experience &&
    form.motivation && form.goal;

  const handlePay = () => {
    if (!scriptLoaded || !window.PaystackPop) return;
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: form.email,
      amount: amount * 100, // kobo
      currency: 'NGN',
      ref: `etechnix_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Full Name',     variable_name: 'full_name',     value: `${form.firstName} ${form.lastName}` },
          { display_name: 'Track',         variable_name: 'track',         value: form.track },
          { display_name: 'Payment Type',  variable_name: 'payment_type',  value: form.paymentType },
          { display_name: 'Phone',         variable_name: 'phone',         value: form.phone },
        ],
      },
      callback: () => {
        setSuccess(true);
        redirectToWhatsApp(form, amount);
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 600 as const,
    color: 'var(--muted)', letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: '0.4rem', display: 'block',
  };

  const groupStyle = { display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' };

  // ── Success screen ──
  if (success) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '68px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎉</div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
              Payment Successful!
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Your registration is confirmed. You should have been redirected to WhatsApp —
              if not, click below and we&apos;ll get you set up right away.
            </p>
            <button onClick={() => redirectToWhatsApp(form, amount)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#25D366', color: '#fff',
              fontFamily: 'var(--font-head)', fontWeight: 700,
              fontSize: '0.95rem', padding: '0.9rem 2rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
            }}>
              Open WhatsApp →
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '5rem 2.5rem 6rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '3.5rem', maxWidth: '600px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              <span style={{ width: '24px', height: '2px', background: 'var(--cyan)', borderRadius: '1px' }} />
              Enrol Now
            </div>
            <h1 style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(2.2rem, 4vw, 3rem)',
              fontWeight: 800, lineHeight: 1.1,
              letterSpacing: '-0.03em', marginBottom: '1rem',
            }}>
              Secure Your Spot in the<br />
              <span style={{ color: 'var(--cyan)' }}>Next Cohort</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              Fill in your details, choose your track, and complete your payment.
              After payment you&apos;ll be redirected to WhatsApp where we&apos;ll send you
              everything you need to get started.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }} className="register-grid">

            {/* ── Left — Form ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* 01 Personal Info */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  01 — Personal Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-grid">
                  <div style={groupStyle}>
                    <label style={labelStyle}>First Name *</label>
                    <input style={inputStyle} placeholder="John" value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Last Name *</label>
                    <input style={inputStyle} placeholder="Doe" value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Email Address *</label>
                    <input style={inputStyle} type="email" placeholder="john@example.com" value={form.email}
                      onChange={e => set('email', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Phone Number *</label>
                    <input style={inputStyle} placeholder="+234 800 000 0000" value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Country *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.country}
                      onChange={e => set('country', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
                      <option value="Nigeria">Nigeria 🇳🇬</option>
                      <option value="United Kingdom">United Kingdom 🇬🇧</option>
                      <option value="Ghana">Ghana 🇬🇭</option>
                      <option value="Kenya">Kenya 🇰🇪</option>
                      <option value="South Africa">South Africa 🇿🇦</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 02 Track Selection */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  02 — Choose Your Track
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tracks.map((track) => (
                    <div key={track.id} onClick={() => set('track', track.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '1rem', padding: '1rem 1.25rem',
                      background: form.track === track.id ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${form.track === track.id ? 'var(--cyan-border)' : 'var(--border)'}`,
                      borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{track.icon}</span>
                        <span style={{
                          fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem',
                          color: form.track === track.id ? 'var(--cyan)' : 'var(--text)',
                        }}>
                          {track.name}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: form.track === track.id ? 'var(--cyan)' : 'var(--text)' }}>
                          {fmt(track.full)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>or {fmt(track.install)} × 2</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 03 Background */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  03 — Your Background
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Highest Education Level *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.education}
                      onChange={e => set('education', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
                      <option value="">Select your education level</option>
                      {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Current Experience Level *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.experience}
                      onChange={e => set('experience', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
                      <option value="">Select your experience level</option>
                      {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 04 Motivation */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  04 — Your Motivation & Goals
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Why do you want to join this programme? *</label>
                    <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }}
                      placeholder="Tell us what motivated you to enrol and what you hope to get out of the programme..."
                      value={form.motivation} onChange={e => set('motivation', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Where do you want to be in 12 months? *</label>
                    <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }}
                      placeholder="Describe your career goal — a new job, freelance income, launching a product, or something else..."
                      value={form.goal} onChange={e => set('goal', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right — Sticky Summary ── */}
            <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Order Summary
                </h3>

                {/* Selected track */}
                <div style={{
                  padding: '1rem', borderRadius: '10px',
                  background: selectedTrack ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedTrack ? 'var(--cyan-border)' : 'var(--border)'}`,
                  marginBottom: '1.25rem',
                }}>
                  {selectedTrack ? (
                    <>
                      <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        Selected Track
                      </div>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {selectedTrack.icon} {selectedTrack.name}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
                      No track selected yet
                    </div>
                  )}
                </div>

                {/* Payment type toggle */}
                {selectedTrack && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '0.6rem' }}>
                      Payment Type
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {(['full', 'installment'] as const).map((type) => (
                        <button key={type} onClick={() => set('paymentType', type)} style={{
                          padding: '0.65rem', borderRadius: '8px',
                          border: `1px solid ${form.paymentType === type ? 'var(--cyan-border)' : 'var(--border)'}`,
                          background: form.paymentType === type ? 'var(--cyan-dim)' : 'transparent',
                          color: form.paymentType === type ? 'var(--cyan)' : 'var(--muted)',
                          fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem',
                          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' as const,
                        }}>
                          {type === 'full' ? 'Full Payment' : 'Instalment'}
                        </button>
                      ))}
                    </div>
                    {form.paymentType === 'installment' && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        Pay the 1st instalment now. 2nd instalment is due at the start of Month 3.
                      </p>
                    )}
                  </div>
                )}

                {/* Price breakdown */}
                {selectedTrack && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <span>{form.paymentType === 'full' ? 'Programme fee' : '1st Instalment'}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(amount)}</span>
                    </div>
                    {form.paymentType === 'installment' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        <span>2nd Instalment (later)</span>
                        <span>{fmt(selectedTrack.install)}</span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '1rem', fontFamily: 'var(--font-head)', fontWeight: 800,
                      borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem',
                    }}>
                      <span>Due Today</span>
                      <span style={{ color: 'var(--cyan)' }}>{fmt(amount)}</span>
                    </div>
                  </div>
                )}

                {/* Pay button */}
                <button
                  onClick={handlePay}
                  disabled={!isComplete || !selectedTrack || !scriptLoaded}
                  style={{
                    width: '100%', padding: '1rem',
                    background: isComplete && selectedTrack ? 'var(--cyan)' : 'rgba(0,200,255,0.25)',
                    color: '#070D1A', fontFamily: 'var(--font-head)',
                    fontWeight: 700, fontSize: '1rem',
                    border: 'none', borderRadius: '10px',
                    cursor: isComplete && selectedTrack ? 'pointer' : 'not-allowed',
                    transition: 'opacity 0.2s', marginTop: '0.5rem',
                  }}
                  onMouseEnter={e => { if (isComplete && selectedTrack) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {!selectedTrack
                    ? 'Select a track to continue'
                    : !isComplete
                    ? 'Fill all fields to continue'
                    : `Pay ${fmt(amount)} →`}
                </button>

                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                  Secured by Paystack. Your payment info is never stored on our servers.
                </p>
              </div>

              {/* WhatsApp alternative */}
              <div style={{
                background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)',
                borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  Prefer to pay manually or have questions first?
                </p>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    color: '#25D366', fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'none', fontFamily: 'var(--font-head)',
                  }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.534 5.856L0 24l6.293-1.513A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.662-.5-5.197-1.375l-.372-.221-3.857.927.973-3.746-.241-.384A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .register-grid { grid-template-columns: 1fr !important; }
          .register-grid > div:last-child { position: static !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
        select option { background: #0D1526; }
      `}</style>
    </>
  );
}
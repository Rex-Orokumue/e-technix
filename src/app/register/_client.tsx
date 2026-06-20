'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TRACKS } from '@/lib/data/curriculum';
import { PRICING, CURRENCY_META, fmtPrice, type Currency } from '@/lib/data/pricing';

const WHATSAPP_NUMBER = '2348120288390';

// Registerable tracks = everything except Phase 1 (Phase 1 is included in the fee).
const regTracks = TRACKS.filter((t) => t.code !== 'DT-101').map((t) => ({
  code: t.code,
  icon: t.icon,
  name: t.name,
  isAdvanced: !!t.isAdvanced,
  price: PRICING[t.code],
}));

const experienceLevels = [
  'Complete beginner — no tech background',
  'Some basic knowledge — used computers/internet',
  'Intermediate — done some online courses',
  'Advanced — working in a related field',
];

const educationLevels = [
  'Secondary school / O-Level',
  'Diploma / OND / HND',
  "Bachelor's degree",
  'Postgraduate / Masters',
  'Self-taught / No formal education',
];

interface FormData {
  firstName: string; lastName: string; email: string; phone: string;
  country: string; track: string; education: string; experience: string;
  motivation: string; goal: string; paymentType: 'full' | 'installment';
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', country: 'Nigeria',
  track: '', education: '', experience: '', motivation: '', goal: '',
  paymentType: 'full',
};

const amountFor = (code: string, currency: Currency, paymentType: 'full' | 'installment') => {
  const p = PRICING[code];
  if (!p) return 0;
  return paymentType === 'full' ? p.full[currency] : p.install[currency];
};

const buildWhatsAppMessage = (data: FormData, currency: Currency) => {
  const track = regTracks.find((t) => t.code === data.track);
  const amount = amountFor(data.track, currency, data.paymentType);
  const displayAmount = fmtPrice(amount, currency);
  return `Hello! I'd like to register for E-Technix. Here are my details:\n\n*Name:* ${data.firstName} ${data.lastName}\n*Email:* ${data.email}\n*Phone:* ${data.phone}\n*Country:* ${data.country}\n*Track:* ${track?.name}${track?.isAdvanced ? ' (Advanced)' : ''}\n*Payment:* ${displayAmount} (${data.paymentType === 'full' ? 'Full payment' : '1st instalment of 2'})\n*Education:* ${data.education}\n*Experience:* ${data.experience}\n*Motivation:* ${data.motivation}\n*Goal:* ${data.goal}\n\nLooking forward to starting! 🚀`;
};

const redirectToWhatsApp = (data: FormData, currency: Currency) => {
  const msg = buildWhatsAppMessage(data, currency);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};

// USD/GBP are disabled until the prices in those currencies are reviewed/approved.
const CURRENCY_ENABLED: Record<Currency, boolean> = { NGN: true, USD: false, GBP: false };

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [currency, setCurrency] = useState<Currency>('NGN');

  // Auto-detect currency by country
  useEffect(() => {
    // Auto-detect currency by country, but only switch to a currency that is
    // currently enabled (USD/GBP are disabled until prices are approved).
    const target: Currency = form.country === 'United Kingdom' ? 'GBP'
      : ['Ghana', 'Kenya', 'South Africa', 'Other'].includes(form.country) ? 'USD'
      : 'NGN';
    if (CURRENCY_ENABLED[target]) setCurrency(target);
  }, [form.country]);

  const set = (field: keyof FormData, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const selectedTrack = regTracks.find((t) => t.code === form.track);
  const amount = selectedTrack ? amountFor(form.track, currency, form.paymentType) : 0;

  const isComplete = form.firstName && form.lastName && form.email && form.phone &&
    form.track && form.education && form.experience && form.motivation && form.goal;

  const handleRegister = () => {
    if (!isComplete || !selectedTrack) return;
    redirectToWhatsApp(form, currency);
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

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>

        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '5rem 2.5rem 6rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '3.5rem', maxWidth: '700px' }}>
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

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { icon: '🎯', text: 'Two phases, one fee' },
                { icon: '💬', text: 'Register via WhatsApp' },
                { icon: '🇬🇧', text: 'UK–Nigeria backed programme' },
                { icon: '🎓', text: 'Certificate on completion' },
              ].map((b) => (
                <div key={b.text} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500,
                }}>
                  <span style={{ fontSize: '0.85rem' }}>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              Fill in your details, choose your track, and register via WhatsApp. Every track
              starts with Phase 1 (Foundation) and your fee covers your full programme. Our team
              will get you set up and ready to start.
            </p>
          </div>

          {/* Currency switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              View prices in:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {(Object.keys(CURRENCY_META) as Currency[]).map((c) => {
                const enabled = CURRENCY_ENABLED[c];
                const active = currency === c;
                return (
                  <button
                    key={c}
                    onClick={() => enabled && setCurrency(c)}
                    disabled={!enabled}
                    title={enabled ? undefined : 'Coming soon — prices under review'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '0.4rem 1rem', borderRadius: '7px',
                      cursor: enabled ? 'pointer' : 'not-allowed',
                      border: `1px solid ${active ? 'var(--cyan-border)' : 'var(--border)'}`,
                      background: active ? 'var(--cyan-dim)' : 'transparent',
                      color: active ? 'var(--cyan)' : 'var(--muted)',
                      opacity: enabled ? 1 : 0.4,
                      fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {CURRENCY_META[c].flag} {CURRENCY_META[c].label}
                    {!enabled && <span className="mono" style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.8 }}>soon</span>}
                  </button>
                );
              })}
            </div>
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
                      onChange={(e) => set('firstName', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Last Name *</label>
                    <input style={inputStyle} placeholder="Doe" value={form.lastName}
                      onChange={(e) => set('lastName', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Email Address *</label>
                    <input style={inputStyle} type="email" placeholder="john@example.com" value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Phone Number *</label>
                    <input style={inputStyle} placeholder="+234 800 000 0000" value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Country *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}>
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
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  02 — Choose Your Track
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                  Every track includes Phase 1 (Foundation). Advanced tracks require a prerequisite track or a placement assessment.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {regTracks.map((track) => {
                    const isSelected = form.track === track.code;
                    return (
                      <div key={track.code} onClick={() => set('track', track.code)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '1rem', padding: '1rem 1.25rem',
                        background: isSelected ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? 'var(--cyan-border)' : 'var(--border)'}`,
                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{track.icon}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem',
                              color: isSelected ? 'var(--cyan)' : 'var(--text)',
                            }}>
                              {track.name}
                            </span>
                            {track.isAdvanced && (
                              <span style={{
                                fontSize: '0.62rem', fontWeight: 800, color: 'var(--orange)',
                                background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)',
                                borderRadius: '4px', padding: '0.12rem 0.45rem',
                                letterSpacing: '0.05em', textTransform: 'uppercase',
                              }}>
                                ▲ Advanced
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem',
                            color: isSelected ? 'var(--cyan)' : 'var(--text)',
                          }}>
                            {track.price ? fmtPrice(track.price.full[currency], currency) : '—'}
                          </div>
                          {track.price && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                              or {fmtPrice(track.price.install[currency], currency)} × 2
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                      onChange={(e) => set('education', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}>
                      <option value="">Select your education level</option>
                      {educationLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Current Experience Level *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.experience}
                      onChange={(e) => set('experience', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}>
                      <option value="">Select your experience level</option>
                      {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
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
                      value={form.motivation} onChange={(e) => set('motivation', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Where do you want to be in 12 months? *</label>
                    <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }}
                      placeholder="Describe your career goal — a new job, freelance income, launching a product, or something else..."
                      value={form.goal} onChange={(e) => set('goal', e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--cyan-border)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                  </div>
                </div>
              </div>

              {/* What's included */}
              <div style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  What&apos;s Included in Your Enrolment
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }} className="form-grid">
                  {[
                    '✅ Phase 1 Foundation + your track',
                    '✅ Live sessions & recordings',
                    '✅ 1-on-1 mentor support',
                    '✅ Real project experience',
                    '✅ Project Labs & Career Launch',
                    '✅ Private student community',
                    '✅ Tools & resource library',
                    '✅ Track certificate on completion',
                  ].map((item) => (
                    <div key={item} style={{ fontSize: '0.83rem', color: 'var(--text)', fontWeight: 500 }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right — Sticky Summary ── */}
            <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Registration Summary
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
                      {selectedTrack.isAdvanced && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'var(--orange-dim)', border: '1px solid rgba(255,107,43,0.25)',
                          borderRadius: '4px', padding: '0.2rem 0.6rem', marginTop: '0.5rem',
                          fontSize: '0.68rem', fontWeight: 700, color: 'var(--orange)', letterSpacing: '0.05em',
                        }}>
                          ▲ Advanced — prerequisite or placement test
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
                      No track selected yet
                    </div>
                  )}
                </div>

                {/* Payment type toggle */}
                {selectedTrack && selectedTrack.price && (
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
                        Two instalments. Pay the 1st now; the 2nd is due at the start of Phase 2.
                      </p>
                    )}
                  </div>
                )}

                {/* Price breakdown */}
                {selectedTrack && selectedTrack.price && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <span>{form.paymentType === 'full' ? 'Programme fee' : '1st instalment'}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmtPrice(amount, currency)}</span>
                    </div>
                    {form.paymentType === 'installment' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        <span>2nd instalment (later)</span>
                        <span>{fmtPrice(selectedTrack.price.install[currency], currency)}</span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '1rem', fontFamily: 'var(--font-head)', fontWeight: 800,
                      borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem',
                    }}>
                      <span>Due Today</span>
                      <span style={{ color: 'var(--cyan)' }}>{fmtPrice(amount, currency)}</span>
                    </div>
                  </div>
                )}

                {/* Register button */}
                <button
                  onClick={handleRegister}
                  disabled={!isComplete || !selectedTrack}
                  style={{
                    width: '100%', padding: '1rem',
                    background: isComplete && selectedTrack ? 'var(--cyan)' : 'rgba(0,200,255,0.25)',
                    color: '#fff', fontFamily: 'var(--font-head)',
                    fontWeight: 700, fontSize: '1rem',
                    border: 'none', borderRadius: '10px',
                    cursor: isComplete && selectedTrack ? 'pointer' : 'not-allowed',
                    transition: 'opacity 0.2s, transform 0.2s', marginTop: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => { if (isComplete && selectedTrack) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.534 5.856L0 24l6.293-1.513A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.662-.5-5.197-1.375l-.372-.221-3.857.927.973-3.746-.241-.384A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  {!selectedTrack ? 'Select a track to continue'
                    : !isComplete ? 'Fill all fields to continue'
                    : `Register via WhatsApp — ${fmtPrice(amount, currency)}`}
                </button>

                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                  💬 You&apos;ll be redirected to WhatsApp with your details pre-filled
                </p>
              </div>

              {/* WhatsApp info */}
              <div style={{
                background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)',
                borderRadius: '12px', padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💬</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '4px' }}>
                      How Registration Works
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: 0 }}>
                      When you click register, WhatsApp opens with your details pre-filled. Send the message and our team will confirm your enrolment within 24 hours.
                    </p>
                  </div>
                </div>
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

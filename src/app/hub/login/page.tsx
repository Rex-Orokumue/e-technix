'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Step = 'email' | 'otp';

export default function HubLoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      setError(error.message === 'Signups not allowed for otp'
        ? 'This email is not registered. Please contact your instructor.'
        : error.message);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);
    if (error) {
      setError('Invalid or expired code. Please try again.');
    } else {
      router.push('/hub');
      router.refresh();
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)',
    fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none',
    textAlign: 'center' as const, letterSpacing: step === 'otp' ? '0.2em' : '0',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{ width: '7px', height: '7px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '4px', marginLeft: '2px' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
            {step === 'email' ? 'Student Hub' : 'Check your email'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
            {step === 'email'
              ? 'Enter your email to receive a sign-in code.'
              : `We sent a 6-digit code to ${email}`}
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ padding: '0.9rem', background: loading ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending…' : 'Send Sign-In Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" required maxLength={6} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            {error && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{error}</div>}
            <button type="submit" disabled={loading || otp.length < 6} style={{ padding: '0.9rem', background: (loading || otp.length < 6) ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Verifying…' : 'Sign In'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

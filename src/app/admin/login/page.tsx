'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      router.push(redirectTo);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Invalid email or password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2.5rem',
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: '1.5rem',
            fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem',
          }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{
              width: '7px', height: '7px', background: 'var(--orange)',
              borderRadius: '50%', display: 'inline-block',
              marginBottom: '4px', marginLeft: '2px',
            }} />
          </div>
          <div style={{ fontSize: '0.83rem', color: 'var(--muted)' }}>Admin Dashboard</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@e-technix.com" required
              style={{
                padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)', borderRadius: '8px',
                color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{
                padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)', borderRadius: '8px',
                color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          {error && (
            <div style={{
              padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)',
              border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px',
              fontSize: '0.82rem', color: '#FF5555',
            }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            padding: '0.9rem', background: loading ? 'rgba(0,200,255,0.3)' : 'var(--cyan)',
            color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700,
            fontSize: '0.9rem', border: 'none', borderRadius: '9px',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
            marginTop: '0.25rem',
          }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/programs',        label: 'Programs' },
  { href: '/how-it-works',    label: 'How It Works' },
  { href: '/certifications',  label: 'Certifications' },
  { href: '/about',           label: 'About' },
  { href: '/faq',             label: 'FAQ' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('etechnix-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('etechnix-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.5rem',
      height: '68px',
      background: theme === 'dark' ? 'rgba(7,13,26,0.88)' : 'rgba(244,247,252,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      transition: 'background 0.25s ease',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'var(--font-head)',
        fontSize: '1.4rem',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
      }}>
        <span style={{ color: 'var(--cyan)' }}>e-</span>
        technix
        <span style={{
          width: '8px', height: '8px',
          background: 'var(--orange)',
          borderRadius: '50%',
          display: 'inline-block',
          marginBottom: '4px', marginLeft: '2px',
        }} />
      </Link>

      {/* Desktop links */}
      <ul style={{
        display: 'flex', alignItems: 'center',
        gap: '2rem', listStyle: 'none',
      }} className="nav-desktop">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} style={{
              color: 'var(--muted)', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {/* Theme toggle */}
        <li>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-bright)',
              borderRadius: '8px',
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '1rem',
              transition: 'border-color 0.2s, background 0.2s',
              color: 'var(--muted)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan-border)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </li>

        <li>
          <Link href="/register" style={{
            background: 'var(--cyan)',
            color: '#070D1A',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            fontWeight: 700,
            fontFamily: 'var(--font-head)',
            fontSize: '0.88rem',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Register Now
          </Link>
        </li>
      </ul>

      {/* Mobile right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="nav-mobile-right">
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent', border: 'none',
            fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '68px', left: 0, right: 0,
          background: theme === 'dark' ? 'rgba(7,13,26,0.97)' : 'rgba(244,247,252,0.98)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem 2.5rem',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setOpen(false)}
              style={{
                color: 'var(--muted)', textDecoration: 'none',
                fontSize: '1rem', fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/register" onClick={() => setOpen(false)} style={{
            background: 'var(--cyan)', color: '#070D1A',
            padding: '0.75rem 1.5rem', borderRadius: '6px',
            fontWeight: 700, fontFamily: 'var(--font-head)',
            fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center',
          }}>
            Register Now
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-right { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-right { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
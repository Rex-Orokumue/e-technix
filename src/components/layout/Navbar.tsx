'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/programs',        label: 'Programs' },
  { href: '/how-it-works',    label: 'How It Works' },
  { href: '/certifications',  label: 'Certifications' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
      background: 'rgba(7,13,26,0.85)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
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
        <span style={{ color: 'var(--cyan)' }}>e</span>
        technix
        <span style={{
          width: '8px',
          height: '8px',
          background: 'var(--orange)',
          borderRadius: '50%',
          display: 'inline-block',
          marginBottom: '4px',
          marginLeft: '2px',
        }} />
      </Link>

      {/* Desktop links */}
      <ul style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        listStyle: 'none',
      }} className="nav-desktop">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} style={{
              color: 'var(--muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {link.label}
            </Link>
          </li>
        ))}
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

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
        className="nav-mobile-btn"
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '68px', left: 0, right: 0,
          background: 'rgba(7,13,26,0.97)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          padding: '1.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                color: 'var(--muted)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            style={{
              background: 'var(--cyan)',
              color: '#070D1A',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontFamily: 'var(--font-head)',
              fontSize: '0.95rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Register Now
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
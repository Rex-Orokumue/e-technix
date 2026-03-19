'use client';

import Link from 'next/link';

const links = [
  { href: '#programs',       label: 'Programs' },
  { href: '#how-it-works',   label: 'How It Works' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#register',       label: 'Register' },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1.5rem',
      maxWidth: '1180px',
      margin: '0 auto',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'var(--font-head)',
        fontSize: '1.1rem',
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
          width: '7px', height: '7px',
          background: 'var(--orange)',
          borderRadius: '50%',
          display: 'inline-block',
          marginBottom: '3px',
          marginLeft: '2px',
        }} />
      </Link>

      {/* Links */}
      <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', flexWrap: 'wrap' }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} style={{
              color: 'var(--muted)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
        &copy; {new Date().getFullYear()} E-Technix. All rights reserved.
      </p>
    </footer>
  );
}
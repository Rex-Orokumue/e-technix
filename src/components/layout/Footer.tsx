'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const groups: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Programme',
    links: [
      { href: '/curriculum', label: 'Curriculum' },
      { href: '/programs', label: 'Tracks' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/certifications', label: 'Certifications' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
      { href: '/register', label: 'Register' },
      { href: '/hub', label: 'Student hub' },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-bright)', marginTop: '2rem' }}>
      <div
        style={{
          maxWidth: '1180px', margin: '0 auto', padding: '4rem 2.5rem 2.5rem',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) repeat(2, minmax(0, 1fr))',
          gap: '2.5rem',
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <Link href="/" style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ color: 'var(--cyan)' }}>e-</span>technix
            <span style={{ width: '7px', height: '7px', background: 'var(--orange)', borderRadius: '50%', display: 'inline-block', marginBottom: '3px', marginLeft: '2px' }} />
          </Link>
          <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', margin: '1.25rem 0 0', maxWidth: '300px', lineHeight: 1.3 }}>
            Build the judgment AI cannot replace.
          </p>
          <p className="eyebrow" style={{ marginTop: '1rem' }}>UK-directed · Nigeria-delivered</p>
        </div>

        {/* Link groups */}
        {groups.map((g) => (
          <div key={g.title}>
            <div className="eyebrow" style={{ marginBottom: '1.1rem' }}>{g.title}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: 0, padding: 0 }}>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.88rem' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom meta */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
            © {new Date().getFullYear()} E-Technix. All rights reserved.
          </span>
          <Link href="/admin/login" className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', textDecoration: 'none', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Admin <ArrowUpRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <style>{`
        .footer-link { transition: color 0.18s ease; }
        .footer-link:hover { color: var(--text) !important; }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } .footer-grid > div:first-child { grid-column: 1 / -1 !important; } }
      `}</style>
    </footer>
  );
}

'use client';

const actions = [
  { href: '/admin/sessions/new',   label: '+ Add Session',       primary: true },
  { href: '/admin/resources/new',  label: '+ Add Resource',      primary: false },
  { href: '/admin/assignments/new',label: '+ Add Assignment',    primary: false },
  { href: '/admin/students/new',   label: '+ Enrol Student',     primary: false },
  { href: '/admin/submissions',    label: 'Review Submissions',  primary: false },
];

export default function AdminQuickActions() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {actions.map(action => (
        <a key={action.href} href={action.href} style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.6rem 1.25rem', borderRadius: '8px',
          background: action.primary ? 'var(--cyan)' : 'transparent',
          color: action.primary ? '#070D1A' : 'var(--muted)',
          border: action.primary ? 'none' : '1px solid var(--border)',
          fontFamily: 'var(--font-head)', fontWeight: 700,
          fontSize: '0.83rem', textDecoration: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!action.primary) {
            e.currentTarget.style.borderColor = 'var(--border-bright)';
            e.currentTarget.style.color = 'var(--text)';
          } else {
            e.currentTarget.style.opacity = '0.85';
          }
        }}
        onMouseLeave={e => {
          if (!action.primary) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--muted)';
          } else {
            e.currentTarget.style.opacity = '1';
          }
        }}>
          {action.label}
        </a>
      ))}
    </div>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

const TYPE_META: Record<string, { label: string; color: string }> = {
  document: { label: 'Document', color: 'var(--cyan)' },
  video:    { label: 'Video',    color: 'var(--orange)' },
  link:     { label: 'Link',     color: '#A78BFA' },
  notion:   { label: 'Notion',   color: '#34D399' },
};

export default async function AdminResourcesPage() {
  const supabase = createAdminClient();
  const { data: resources } = await supabase
    .from('resources').select('*').order('phase').order('week').order('sort_order');

  const grouped: Record<string, typeof resources> = {};
  for (const r of resources ?? []) {
    const key = `Phase ${r.phase} — Week ${r.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(r);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Resources</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{resources?.length ?? 0} resources</p>
        </div>
        <Link href="/admin/resources/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A',
          borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
        }}>+ Add Resource</Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No resources yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{group}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {items?.map(r => {
                const meta = TYPE_META[r.type] ?? { label: r.type, color: 'var(--muted)' };
                return (
                  <div key={r.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '1rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>{r.title}</div>
                      {r.description && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.description}</div>}
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, color: meta.color,
                      background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
                      borderRadius: '4px', padding: '0.15rem 0.5rem',
                      textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                    }}>{meta.label}</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--muted)', textDecoration: 'none', flexShrink: 0 }}>↗ View</a>
                    <AdminDeleteButton endpoint={`/api/resources/${r.id}`} />
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

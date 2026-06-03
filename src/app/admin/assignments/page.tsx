import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminToggleStatus from '@/components/admin/AdminToggleStatus';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

export default async function AdminAssignmentsPage() {
  const supabase = createAdminClient();
  const { data: assignments } = await supabase
    .from('assignments').select('*').order('phase').order('week').order('assignment_code');

  const grouped: Record<string, typeof assignments> = {};
  for (const a of assignments ?? []) {
    const key = `Phase ${a.phase} — Week ${a.week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(a);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Assignments</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{assignments?.length ?? 0} assignments</p>
        </div>
        <Link href="/admin/assignments/new" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
          + Add Assignment
        </Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <p style={{ color: 'var(--muted)' }}>No assignments yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{group}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items?.map(a => (
                <div key={a.id} style={{
                  background: 'var(--surface)', border: `1px solid ${a.status === 'active' ? 'var(--cyan-border)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.72rem',
                    color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)',
                    borderRadius: '4px', padding: '0.15rem 0.5rem', flexShrink: 0,
                  }}>{a.assignment_code}</span>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>{a.title}</div>
                    {a.due_date && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Due: {a.due_date}</div>}
                  </div>
                  <AdminToggleStatus id={a.id} currentStatus={a.status} endpoint="/api/assignments" />
                  <AdminDeleteButton endpoint={`/api/assignments/${a.id}`} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

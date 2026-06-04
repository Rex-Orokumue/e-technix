export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import AdminSubmissionStatusSelect from '@/components/admin/AdminSubmissionStatusSelect';
import AdminDeleteSubmission from '@/components/admin/AdminDeleteSubmission';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  submitted:         { label: 'Submitted',         color: '#7A8FAD', bg: 'rgba(122,143,173,0.1)' },
  reviewing:         { label: 'Reviewing',         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  approved:          { label: 'Approved',          color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  needs_corrections: { label: 'Needs Corrections', color: '#FF6B2B', bg: 'rgba(255,107,43,0.1)' },
};

export default async function AdminSubmissionsPage() {
  const supabase = createAdminClient();
  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select('*, students(full_name, email, track), assignments(title, assignment_code)')
    .order('submitted_at', { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Submissions</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
          {submissions?.filter(s => s.status === 'submitted').length ?? 0} pending review · {submissions?.length ?? 0} total
        </p>
      </div>

      {!submissions?.length ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
          <p style={{ color: 'var(--muted)' }}>No submissions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {submissions.map(sub => {
            const meta = STATUS_META[sub.status] ?? STATUS_META.submitted;
            const student = sub.students as { full_name: string; email: string; track: string } | null;
            const assignment = sub.assignments as { title: string; assignment_code: string } | null;
            return (
              <div key={sub.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '1.25rem',
                display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem' }}>
                      {student?.full_name ?? 'Unknown'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{student?.track}</span>
                    {sub.edit_count > 0 && (
                      <span style={{ fontSize: '0.65rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                        edited {sub.edit_count}×
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '6px' }}>
                    {assignment?.assignment_code} — {assignment?.title}
                  </div>
                  <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.75rem', color: 'var(--cyan)', textDecoration: 'none',
                  }}>
                    ↗ View Submission
                  </a>
                  {sub.note && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic' }}>&ldquo;{sub.note}&rdquo;</div>}
                  {sub.admin_feedback && (
                    <div style={{ marginTop: '6px', padding: '0.5rem 0.7rem', background: 'rgba(255,107,43,0.05)', border: '1px solid rgba(255,107,43,0.15)', borderRadius: '6px', fontSize: '0.74rem', color: 'var(--muted)' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>Remarks</span>
                      {sub.admin_feedback}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, color: meta.color,
                    background: meta.bg, border: `1px solid ${meta.color}40`,
                    borderRadius: '999px', padding: '0.2rem 0.7rem',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{meta.label}</span>
                  <AdminSubmissionStatusSelect id={sub.id} currentStatus={sub.status} currentFeedback={sub.admin_feedback} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <AdminDeleteSubmission id={sub.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import AdminSubmissionsView from '@/components/admin/AdminSubmissionsView';

export default async function AdminSubmissionsPage() {
  const supabase = createAdminClient();
  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select('*, students(full_name, email, track), assignments(title, assignment_code)')
    .order('submitted_at', { ascending: false });

  const pending = submissions?.filter(s => s.status === 'submitted').length ?? 0;
  const total = submissions?.length ?? 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Submissions</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
          {pending} pending review · {total} total
        </p>
      </div>
      <AdminSubmissionsView submissions={(submissions ?? []) as any} />
    </div>
  );
}

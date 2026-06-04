export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import AdminReviewCard from '@/components/admin/AdminReviewCard';

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from('session_reviews')
    .select('*, students(full_name, track), sessions(title, session_number, phase, week)')
    .order('session_id')
    .order('rating', { ascending: false });

  const bySession: Record<string, { session: any; reviews: any[] }> = {};
  for (const r of reviews ?? []) {
    if (!bySession[r.session_id]) bySession[r.session_id] = { session: r.sessions, reviews: [] };
    bySession[r.session_id].reviews.push(r);
  }

  const sessionGroups = Object.values(bySession);
  const total = reviews?.length ?? 0;
  const avg = total > 0
    ? (reviews!.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : '—';

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Session Reviews</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
          {total} review{total !== 1 ? 's' : ''} · Overall average <strong style={{ color: 'var(--text)' }}>{avg}</strong> / 5
        </p>
      </div>

      {sessionGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⭐</div>
          <p style={{ color: 'var(--muted)' }}>No session reviews yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sessionGroups.map(({ session, reviews: sReviews }) => {
            const avg = sReviews.reduce((s: number, r: any) => s + r.rating, 0) / sReviews.length;
            return (
              <div key={sReviews[0].session_id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.92rem' }}>
                      {session ? `S${session.session_number} — ${session.title}` : 'Unknown session'}
                    </div>
                    {session && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>Phase {session.phase} · Week {session.week}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem', color: avg >= 4 ? '#34D366' : avg >= 3 ? '#F59E0B' : '#FF5555' }}>{avg.toFixed(1)}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>avg</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--cyan)' }}>{sReviews.length}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>total</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {sReviews.map((r: any, i: number) => (
                    <AdminReviewCard
                      key={`${r.student_id}_${r.session_id}`}
                      reviewId={`${r.student_id}_${r.session_id}`}
                      studentName={r.students?.full_name ?? 'Unknown'}
                      track={r.students?.track ?? ''}
                      rating={r.rating}
                      feedback={r.feedback}
                      adminReply={r.admin_reply ?? null}
                      isLast={i === sReviews.length - 1}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

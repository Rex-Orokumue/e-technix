export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminStudentsPage() {
  const supabase = createAdminClient();
  const [{ data: students }, { data: attendance }, { data: sessions }, { data: submissions }, { data: assignments }] = await Promise.all([
    supabase.from('students').select('*').order('enrolled_at', { ascending: false }),
    supabase.from('attendance').select('student_id, session_id'),
    supabase.from('sessions').select('id').not('youtube_url', 'is', null),
    supabase.from('assignment_submissions').select('student_id, assignment_id'),
    supabase.from('assignments').select('id'),
  ]);

  const totalSessions = sessions?.length ?? 0;
  const totalAssignments = assignments?.length ?? 0;

  const attByStudent = new Map<string, number>();
  for (const a of attendance ?? []) {
    attByStudent.set(a.student_id, (attByStudent.get(a.student_id) ?? 0) + 1);
  }
  const subByStudent = new Map<string, number>();
  for (const s of submissions ?? []) {
    subByStudent.set(s.student_id, (subByStudent.get(s.student_id) ?? 0) + 1);
  }

  return (
    <div>
      <style>{`
        .students-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .students-table { width: 100%; border-collapse: collapse; }
        .students-table th { padding: 0.75rem 1.25rem; text-align: left; font-size: 0.72rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .students-table td { padding: 1rem 1.25rem; vertical-align: middle; }
        .students-table tr { border-bottom: 1px solid var(--border); }
        .students-table tbody tr:last-child { border-bottom: none; }

        @media (max-width: 700px) {
          .students-table-wrap { background: transparent; border: none; border-radius: 0; overflow: visible; }
          .students-table thead { display: none; }
          .students-table, .students-table tbody { display: flex; flex-direction: column; gap: 0.65rem; }
          .students-table tr {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "name name" "track enrolled" "att assign" "status status";
            gap: 0.6rem 1rem;
            background: var(--surface);
            border: 1px solid var(--border) !important;
            border-radius: 12px;
            padding: 1rem;
          }
          .students-table td { padding: 0; border: none; font-size: 0.82rem; }
          .students-table td[data-col="name"]     { grid-area: name; }
          .students-table td[data-col="track"]    { grid-area: track; }
          .students-table td[data-col="enrolled"] { grid-area: enrolled; align-self: center; }
          .students-table td[data-col="att"]      { grid-area: att; }
          .students-table td[data-col="assign"]   { grid-area: assign; }
          .students-table td[data-col="status"]   { grid-area: status; }
          .students-td-label {
            display: block;
            font-size: 0.62rem;
            font-weight: 700;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 0.2rem;
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Students</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{students?.length ?? 0} enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/students/bulk" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.65rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            ↑ Bulk Enrol CSV
          </Link>
          <Link href="/admin/students/new" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            + Enrol Student
          </Link>
        </div>
      </div>

      {!students?.length ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
          <p style={{ color: 'var(--muted)' }}>No students enrolled yet. Add your first student.</p>
        </div>
      ) : (
        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {['Name', 'Track', 'Enrolled', 'Attendance', 'Assignments', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const att = attByStudent.get(student.id) ?? 0;
                const sub = subByStudent.get(student.id) ?? 0;
                const attPct = totalSessions > 0 ? Math.round((att / totalSessions) * 100) : 0;
                const attColor = attPct >= 80 ? '#34D366' : attPct >= 50 ? '#F59E0B' : totalSessions === 0 ? 'var(--muted)' : '#FF5555';
                return (
                  <tr key={student.id}>
                    <td data-col="name">
                      <Link href={`/admin/students/${student.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem' }}>{student.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{student.email}</div>
                      </Link>
                    </td>
                    <td data-col="track">
                      <span className="students-td-label">Track</span>
                      <span style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 600 }}>
                        {student.track}
                      </span>
                    </td>
                    <td data-col="enrolled" style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                      <span className="students-td-label">Enrolled</span>
                      {new Date(student.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td data-col="att">
                      <span className="students-td-label">Attendance</span>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', color: attColor }}>
                        {totalSessions === 0 ? '–' : `${attPct}%`}
                      </span>
                      {totalSessions > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>({att}/{totalSessions})</span>}
                    </td>
                    <td data-col="assign">
                      <span className="students-td-label">Assignments</span>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--cyan)', fontSize: '0.82rem' }}>{sub}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>/{totalAssignments}</span>
                    </td>
                    <td data-col="status">
                      <span className="students-td-label">Status</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        color: student.is_active ? '#34D366' : 'var(--muted)',
                        background: student.is_active ? 'rgba(52,211,102,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${student.is_active ? 'rgba(52,211,102,0.25)' : 'var(--border)'}`,
                        borderRadius: '999px', padding: '0.2rem 0.6rem',
                      }}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

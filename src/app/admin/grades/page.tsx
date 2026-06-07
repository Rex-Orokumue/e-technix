'use client';

import { useEffect, useState, useCallback } from 'react';
import { calcCapstoneScore, GRADE_WEIGHTS } from '@/lib/grades';

const SCORE_LABELS = ['', 'No engagement', 'Distracted', 'Passive', 'Engaged', 'Active contributor'];
const SCORE_COLORS = ['', '#FF5555', '#FF6B2B', '#F59E0B', '#34D366', '#00C8FF'];
const CONTRIBUTION_OPTS = [
  { value: 'full',    label: 'Full contribution', mult: '100%' },
  { value: 'partial', label: 'Partial',           mult: '75%' },
  { value: 'minimal', label: 'Minimal',           mult: '50%' },
];

function ScorePill({ score, max = 100, label }: { score: number | null; max?: number; label?: string }) {
  if (score === null) return <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>—</span>;
  const pct   = Math.round((score / max) * 100);
  const color = pct >= 60 ? '#34D366' : pct >= 40 ? '#F59E0B' : '#FF5555';
  return (
    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.88rem', color }}>
      {label ?? `${score}%`}
    </span>
  );
}

function ScoreButton({ value, current, onClick }: { value: number; current: number | null; onClick: (v: number) => void }) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        width: '36px', height: '36px', borderRadius: '8px', border: `2px solid ${active ? SCORE_COLORS[value] : 'var(--border)'}`,
        background: active ? `${SCORE_COLORS[value]}22` : 'transparent',
        color: active ? SCORE_COLORS[value] : 'var(--muted)',
        fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.88rem',
        cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
      }}
    >
      {value}
    </button>
  );
}

export default function AdminGradesPage() {
  const [students,        setStudents]        = useState<any[]>([]);
  const [selectedId,      setSelectedId]      = useState<string>('');
  const [detail,          setDetail]          = useState<any>(null);
  const [loadingList,     setLoadingList]     = useState(true);
  const [loadingDetail,   setLoadingDetail]   = useState(false);
  const [savingPart,      setSavingPart]      = useState<Record<string, boolean>>({});
  const [savingAssign,    setSavingAssign]    = useState<Record<string, boolean>>({});
  const [savingCapstone,  setSavingCapstone]  = useState(false);
  const [penaltyForm,     setPenaltyForm]     = useState<Record<string, { action: 'enforce' | 'lift'; reason: string; saving: boolean }>>({});
  const [assignEdits,     setAssignEdits]     = useState<Record<string, { score: string; contribution: string }>>({});
  const [capstoneForm,    setCapstoneForm]    = useState({ content_score: 0, presentation_score: 0, delivery_score: 0, qa_score: 0, notes: '' });
  const [capstoneEdit,    setCapstoneEdit]    = useState(false);
  const [toast,           setToast]           = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const loadStudents = useCallback(async () => {
    setLoadingList(true);
    const r = await fetch('/api/admin/grades');
    setStudents(await r.json());
    setLoadingList(false);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setDetail(null);
    const r = await fetch(`/api/admin/grades?student_id=${id}`);
    const d = await r.json();
    setDetail(d);
    // Pre-fill assignment edit forms
    const edits: Record<string, { score: string; contribution: string }> = {};
    for (const sub of d.submissions ?? []) {
      edits[sub.id] = { score: sub.score !== null ? String(sub.score) : '', contribution: sub.contribution ?? 'full' };
    }
    setAssignEdits(edits);
    // Pre-fill capstone form
    if (d.capstone) {
      setCapstoneForm({
        content_score:      d.capstone.content_score      ?? 0,
        presentation_score: d.capstone.presentation_score ?? 0,
        delivery_score:     d.capstone.delivery_score     ?? 0,
        qa_score:           d.capstone.qa_score           ?? 0,
        notes:              d.capstone.notes              ?? '',
      });
      setCapstoneEdit(false);
    } else {
      setCapstoneForm({ content_score: 0, presentation_score: 0, delivery_score: 0, qa_score: 0, notes: '' });
      setCapstoneEdit(true);
    }
    setLoadingDetail(false);
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);
  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId, loadDetail]);

  const saveParticipation = async (sessionId: string, score: number) => {
    setSavingPart(p => ({ ...p, [sessionId]: true }));
    const res = await fetch('/api/admin/grades/participation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: selectedId, session_id: sessionId, score }),
    });
    setSavingPart(p => ({ ...p, [sessionId]: false }));
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(`❌ Save failed: ${err.error ?? res.status}`);
      return;
    }
    // Optimistic update in detail
    setDetail((d: any) => ({
      ...d,
      participation_scores: [
        ...(d.participation_scores ?? []).filter((p: any) => p.session_id !== sessionId),
        { student_id: selectedId, session_id: sessionId, score },
      ],
    }));
    showToast('Participation saved');
    loadStudents();
  };

  const saveAssignment = async (subId: string) => {
    const edit = assignEdits[subId];
    if (!edit || edit.score === '') return;
    setSavingAssign(s => ({ ...s, [subId]: true }));
    await fetch(`/api/admin/grades/submission/${subId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: Number(edit.score), contribution: edit.contribution }),
    });
    setSavingAssign(s => ({ ...s, [subId]: false }));
    showToast('Assignment grade saved');
    loadStudents();
    loadDetail(selectedId);
  };

  const savePenalty = async (subId: string) => {
    const form = penaltyForm[subId];
    if (!form || !form.reason.trim()) return;
    setPenaltyForm(p => ({ ...p, [subId]: { ...form, saving: true } }));
    await fetch(`/api/admin/grades/submission/${subId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ penalty_action: form.action, penalty_note: form.reason }),
    });
    setPenaltyForm(p => { const n = { ...p }; delete n[subId]; return n; });
    showToast(form.action === 'lift' ? 'Penalty lifted' : 'Penalty enforced');
    loadStudents();
    loadDetail(selectedId);
  };

  const saveCapstone = async () => {
    setSavingCapstone(true);
    await fetch('/api/admin/grades/capstone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: selectedId, phase: 1, ...capstoneForm }),
    });
    setSavingCapstone(false);
    setCapstoneEdit(false);
    showToast('Capstone grades saved');
    loadStudents();
    loadDetail(selectedId);
  };

  const selectedStudent  = students.find(s => s.id === selectedId);
  const participationMap = Object.fromEntries((detail?.participation_scores ?? []).map((p: any) => [p.session_id, p.score]));
  const sessionsWithPart = detail?.sessions ?? [];
  const allSubmissions   = (detail?.submissions ?? []);
  const capstonePreview  = (capstoneForm.content_score && capstoneForm.presentation_score && capstoneForm.delivery_score && capstoneForm.qa_score)
    ? Math.round(calcCapstoneScore(capstoneForm as any))
    : null;

  const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', ...extra }}>
      {children}
    </div>
  );

  const sectionTitle = (icon: string, label: string, right?: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{label}</h3>
      </div>
      {right}
    </div>
  );

  return (
    <div>
      <style>{`
        .ag-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: start; }
        .ag-student-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: calc(100vh - 160px); overflow-y: auto; }
        @media (max-width: 900px) {
          .ag-layout { grid-template-columns: 1fr; }
          .ag-student-list { max-height: 260px; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999, background: toast.startsWith('❌') ? '#FF5555' : '#34D366', color: '#070D1A', padding: '0.65rem 1.25rem', borderRadius: '10px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', boxShadow: toast.startsWith('❌') ? '0 8px 30px rgba(255,85,85,0.3)' : '0 8px 30px rgba(52,211,102,0.3)' }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Phase 1 Grading</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: 0 }}>Grade participation, assignments, and capstone for each student.</p>
      </div>

      <div className="ag-layout">

        {/* Student list */}
        <div>
          {card(
            <>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Students ({students.length})
              </div>
              <div className="ag-student-list">
                {loadingList ? (
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem', padding: '1rem' }}>Loading…</div>
                ) : students.map(s => {
                  const ov    = s.summary?.overall ?? null;
                  const color = ov === null ? 'var(--muted)' : ov >= 60 ? '#34D366' : ov >= 40 ? '#F59E0B' : '#FF5555';
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '0.65rem 0.85rem', borderRadius: '9px',
                        border: selectedId === s.id ? '1px solid var(--cyan-border)' : '1px solid transparent',
                        background: selectedId === s.id ? 'var(--cyan-dim)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                      }}
                    >
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.track}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.88rem', color, flexShrink: 0 }}>
                        {ov !== null ? `${ov}%` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Grading panel */}
        <div>
          {!selectedId ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👈</div>
              <p style={{ fontSize: '0.88rem' }}>Select a student to start grading.</p>
            </div>
          ) : loadingDetail ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Summary strip */}
              {selectedStudent && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--cyan-border)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem' }}>{selectedStudent.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{selectedStudent.track}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Attendance',    score: detail?.summary?.attendance?.score },
                      { label: 'Assignments',   score: detail?.summary?.assignments?.score },
                      { label: 'Participation', score: detail?.summary?.participation?.score },
                      { label: 'Capstone',      score: detail?.summary?.capstone?.score },
                      { label: 'Overall',       score: detail?.summary?.overall },
                    ].map(({ label, score }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
                        <ScorePill score={score ?? null} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participation */}
              {card(
                <>
                  {sectionTitle('🎙️', 'Participation', (
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Rate 1–5 per session</span>
                  ))}
                  {sessionsWithPart.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>No Phase 1 sessions yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {sessionsWithPart.map((session: any) => {
                        const current = participationMap[session.id] ?? null;
                        return (
                          <div key={session.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.75rem', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', borderRadius: '9px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.82rem' }}>{session.title}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                                {session.date} · Session {session.session_number}
                                {current !== null && (
                                  <span style={{ marginLeft: '0.5rem', color: SCORE_COLORS[current], fontWeight: 700 }}>
                                    {SCORE_LABELS[current]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              {[1, 2, 3, 4, 5].map(v => (
                                <ScoreButton
                                  key={v} value={v} current={current}
                                  onClick={score => saveParticipation(session.id, score)}
                                />
                              ))}
                              {savingPart[session.id] && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '0.25rem' }}>Saving…</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Assignment grading */}
              {card(
                <>
                  {sectionTitle('📝', 'Assignments', (
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Score 0–100 + contribution</span>
                  ))}
                  {allSubmissions.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>No submissions yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {allSubmissions.map((sub: any) => {
                        const edit   = assignEdits[sub.id] ?? { score: '', contribution: 'full' };
                        const saving = savingAssign[sub.id];
                        const graded = sub.score !== null;
                        const penaltyActive = sub.penalty_status === 'auto' || sub.penalty_status === 'penalty_enforced';
                        const penaltyLifted = sub.penalty_status === 'lifted';
                        const penF = penaltyForm[sub.id];

                        return (
                          <div key={sub.id} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.025)', border: `1px solid ${sub.is_late && !penaltyLifted ? 'rgba(255,107,43,0.25)' : graded ? 'rgba(52,211,102,0.2)' : 'var(--border)'}`, borderRadius: '9px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--cyan)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
                                  {sub.assignments?.assignment_code}
                                </span>
                                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.82rem' }}>{sub.assignments?.title}</span>
                                {sub.is_late && (
                                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: penaltyLifted ? '#34D366' : '#FF6B2B', background: penaltyLifted ? 'rgba(52,211,102,0.1)' : 'rgba(255,107,43,0.12)', border: `1px solid ${penaltyLifted ? 'rgba(52,211,102,0.25)' : 'rgba(255,107,43,0.3)'}`, borderRadius: '4px', padding: '0.1rem 0.4rem', textTransform: 'uppercase' }}>
                                    {penaltyLifted ? '✓ Lifted' : sub.penalty_status === 'enforced' ? '⚠ Enforced' : '⚠ Late −20%'}
                                  </span>
                                )}
                              </div>
                              <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--cyan)', textDecoration: 'none', flexShrink: 0 }}>↗ View</a>
                            </div>

                            {/* Penalty audit trail */}
                            {sub.penalty_note && (
                              <div style={{ marginBottom: '0.6rem', padding: '0.5rem 0.65rem', background: penaltyLifted ? 'rgba(52,211,102,0.06)' : 'rgba(255,107,43,0.06)', border: `1px solid ${penaltyLifted ? 'rgba(52,211,102,0.2)' : 'rgba(255,107,43,0.2)'}`, borderRadius: '7px' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: penaltyLifted ? '#34D366' : '#FF6B2B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                  {penaltyLifted ? 'Penalty lifted' : 'Penalty enforced'} by {sub.penalty_changed_by ?? 'Admin'} · {sub.penalty_changed_at ? new Date(sub.penalty_changed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{sub.penalty_note}</p>
                              </div>
                            )}

                            {/* Grade inputs */}
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: sub.is_late ? '0.6rem' : 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</label>
                                <input
                                  type="number" min={0} max={100}
                                  value={edit.score}
                                  onChange={e => setAssignEdits(prev => ({ ...prev, [sub.id]: { ...edit, score: e.target.value } }))}
                                  style={{ width: '64px', padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', outline: 'none' }}
                                  placeholder="0–100"
                                />
                              </div>
                              <select
                                value={edit.contribution}
                                onChange={e => setAssignEdits(prev => ({ ...prev, [sub.id]: { ...edit, contribution: e.target.value } }))}
                                style={{ padding: '0.35rem 0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.78rem', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
                              >
                                {CONTRIBUTION_OPTS.map(o => (
                                  <option key={o.value} value={o.value} style={{ background: '#0f1829' }}>{o.label} ({o.mult})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => saveAssignment(sub.id)}
                                disabled={saving || edit.score === ''}
                                style={{ padding: '0.35rem 0.85rem', background: saving || edit.score === '' ? 'rgba(0,200,255,0.1)' : 'var(--cyan)', color: saving || edit.score === '' ? 'var(--muted)' : '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.78rem', border: 'none', borderRadius: '6px', cursor: saving || edit.score === '' ? 'not-allowed' : 'pointer' }}
                              >
                                {saving ? 'Saving…' : graded ? 'Update' : 'Save'}
                              </button>
                              {graded && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34D366' }}>✓ Graded ({sub.score})</span>
                              )}
                            </div>

                            {/* Penalty override (only for late submissions) */}
                            {sub.is_late && (
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                                {penF ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: penF.action === 'lift' ? '#34D366' : '#FF6B2B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      {penF.action === 'lift' ? 'Lift penalty — reason required' : 'Enforce penalty — reason required'}
                                    </div>
                                    <textarea
                                      placeholder="Explain why you are changing this penalty (required)…"
                                      value={penF.reason}
                                      onChange={e => setPenaltyForm(p => ({ ...p, [sub.id]: { ...penF, reason: e.target.value } }))}
                                      rows={2}
                                      style={{ width: '100%', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.04)', border: `1px solid ${penF.action === 'lift' ? 'rgba(52,211,102,0.3)' : 'rgba(255,107,43,0.3)'}`, borderRadius: '7px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                      <button
                                        onClick={() => savePenalty(sub.id)}
                                        disabled={penF.saving || !penF.reason.trim()}
                                        style={{ padding: '0.35rem 0.85rem', background: penF.action === 'lift' ? '#34D366' : '#FF6B2B', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', border: 'none', borderRadius: '6px', cursor: penF.saving || !penF.reason.trim() ? 'not-allowed' : 'pointer', opacity: penF.saving || !penF.reason.trim() ? 0.5 : 1 }}
                                      >
                                        {penF.saving ? 'Saving…' : 'Confirm'}
                                      </button>
                                      <button
                                        onClick={() => setPenaltyForm(p => { const n = { ...p }; delete n[sub.id]; return n; })}
                                        style={{ padding: '0.35rem 0.7rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Penalty override:</span>
                                    {!penaltyLifted && (
                                      <button
                                        onClick={() => setPenaltyForm(p => ({ ...p, [sub.id]: { action: 'lift', reason: '', saving: false } }))}
                                        style={{ padding: '0.25rem 0.65rem', background: 'rgba(52,211,102,0.1)', border: '1px solid rgba(52,211,102,0.25)', color: '#34D366', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.7rem', borderRadius: '5px', cursor: 'pointer' }}
                                      >
                                        Lift penalty
                                      </button>
                                    )}
                                    {penaltyLifted && (
                                      <button
                                        onClick={() => setPenaltyForm(p => ({ ...p, [sub.id]: { action: 'enforce', reason: '', saving: false } }))}
                                        style={{ padding: '0.25rem 0.65rem', background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.25)', color: '#FF6B2B', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.7rem', borderRadius: '5px', cursor: 'pointer' }}
                                      >
                                        Re-enforce penalty
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Capstone grading */}
              {card(
                <>
                  {sectionTitle('🏆', 'Capstone Presentation', (
                    capstoneEdit
                      ? null
                      : <button onClick={() => setCapstoneEdit(true)} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan)', background: 'transparent', border: '1px solid var(--cyan-border)', borderRadius: '6px', padding: '0.25rem 0.65rem', cursor: 'pointer' }}>Edit</button>
                  ))}
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem', marginTop: '-0.4rem' }}>
                    Each category scored 1–10 (Content 35%, Presentation 25%, Delivery 20%, Q&amp;A 20%)
                  </p>
                  {capstoneEdit ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { field: 'content_score',      label: 'Content & Depth',     weight: '35%' },
                        { field: 'presentation_score', label: 'Presentation',         weight: '25%' },
                        { field: 'delivery_score',     label: 'Delivery & Confidence',weight: '20%' },
                        { field: 'qa_score',           label: 'Responding to Q&A',   weight: '20%' },
                      ].map(({ field, label, weight }) => (
                        <div key={field}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{label} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({weight})</span></span>
                            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--cyan)' }}>
                              {(capstoneForm as any)[field] || '—'}/10
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {[1,2,3,4,5,6,7,8,9,10].map(v => {
                              const cur = (capstoneForm as any)[field];
                              const active = cur === v;
                              const color = v >= 7 ? '#34D366' : v >= 5 ? '#F59E0B' : '#FF5555';
                              return (
                                <button
                                  key={v}
                                  onClick={() => setCapstoneForm(f => ({ ...f, [field]: v }))}
                                  style={{
                                    flex: 1, height: '32px', borderRadius: '6px',
                                    border: `2px solid ${active ? color : 'var(--border)'}`,
                                    background: active ? `${color}22` : 'transparent',
                                    color: active ? color : 'var(--muted)',
                                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem',
                                    cursor: 'pointer', transition: 'all 0.12s',
                                  }}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Tutor Notes (optional)</label>
                        <textarea
                          value={capstoneForm.notes}
                          onChange={e => setCapstoneForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Feedback to display to the student…"
                          rows={3}
                          style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                        />
                      </div>
                      {capstonePreview !== null && (
                        <div style={{ padding: '0.65rem 1rem', background: 'rgba(0,200,255,0.06)', border: '1px solid var(--cyan-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Capstone score preview</span>
                          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: capstonePreview >= 60 ? '#34D366' : '#F59E0B' }}>{capstonePreview}%</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          onClick={saveCapstone}
                          disabled={savingCapstone || !capstoneForm.content_score || !capstoneForm.presentation_score || !capstoneForm.delivery_score || !capstoneForm.qa_score}
                          style={{ padding: '0.65rem 1.5rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          {savingCapstone ? 'Saving…' : 'Save Capstone Grades'}
                        </button>
                        {detail?.capstone && (
                          <button onClick={() => setCapstoneEdit(false)} style={{ padding: '0.65rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.82rem', borderRadius: '8px', cursor: 'pointer' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ) : detail?.capstone ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { label: 'Content & Depth',     val: detail.capstone.content_score,      w: '35%' },
                        { label: 'Presentation',        val: detail.capstone.presentation_score, w: '25%' },
                        { label: 'Delivery',            val: detail.capstone.delivery_score,     w: '20%' },
                        { label: 'Q&A Response',        val: detail.capstone.qa_score,           w: '20%' },
                      ].map(({ label, val, w }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{label} <span style={{ color: 'var(--muted)' }}>({w})</span></span>
                          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--cyan)' }}>{val}/10</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Capstone Score</span>
                        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', color: (detail?.summary?.capstone?.score ?? 0) >= 60 ? '#34D366' : '#F59E0B' }}>{detail?.summary?.capstone?.score ?? 0}%</span>
                      </div>
                      {detail?.capstone?.notes && (
                        <div style={{ padding: '0.65rem', background: 'rgba(0,200,255,0.04)', border: '1px solid var(--cyan-border)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{detail.capstone.notes}</div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Capstone not yet graded. Use the form above to grade.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

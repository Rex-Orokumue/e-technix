'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TRACKS } from '@/lib/tracks';

interface Row { full_name: string; email: string; password: string; track: string; }
interface Result { email: string; ok: boolean; error?: string; }

export default function BulkEnrollPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<Row[]>([]);
  const [parseError, setParseError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const parseCSV = (text: string) => {
    setParseError('');
    setResults(null);
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { setParseError('CSV must have a header row and at least one data row.'); return; }
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredCols = ['full_name', 'email', 'password', 'track'];
    const missing = requiredCols.filter(c => !header.includes(c));
    if (missing.length) { setParseError(`Missing columns: ${missing.join(', ')}`); return; }
    const rows: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const row: any = {};
      header.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
      if (!TRACKS.includes(row.track)) {
        setParseError(`Row ${i + 1}: Unknown track "${row.track}". Must be one of: ${TRACKS.join(', ')}`);
        return;
      }
      rows.push(row as Row);
    }
    setParsed(rows);
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    setResults(null);
    const res = await fetch('/api/admin/students/bulk-enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });
    const data = await res.json();
    setResults(data.results ?? []);
    setEnrolling(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none' };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem', display: 'block' };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>← Back</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Bulk Enrol Students</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Upload a CSV with columns: <code style={{ background: 'var(--surface)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.78rem' }}>full_name, email, password, track</code></p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Example */}
        <div style={{ background: 'rgba(0,200,255,0.04)', border: '1px solid var(--cyan-border)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
          <div style={{ ...labelStyle, color: 'var(--cyan)', marginBottom: '0.5rem' }}>CSV Format Example</div>
          <pre style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0, lineHeight: 1.7, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`full_name,email,password,track
Ada Okoye,ada@example.com,SecurePass1,Data Analytics
Tunde Bello,tunde@example.com,SecurePass2,Web App Development`}
          </pre>
        </div>

        <div>
          <label style={labelStyle}>Upload CSV File</label>
          <input type="file" accept=".csv,.txt" onChange={handleFile}
            style={{ ...inputStyle, cursor: 'pointer', padding: '0.6rem 1rem' }} />
        </div>

        <div>
          <label style={labelStyle}>Or Paste CSV</label>
          <textarea
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', lineHeight: 1.6 }}
            value={csvText}
            onChange={e => { setCsvText(e.target.value); parseCSV(e.target.value); }}
            placeholder="full_name,email,password,track&#10;Ada Okoye,ada@example.com,pass123,Data Analytics"
            onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {parseError && <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#FF5555' }}>{parseError}</div>}

        {parsed.length > 0 && !parseError && (
          <div style={{ padding: '0.6rem 1rem', background: 'rgba(52,211,102,0.08)', border: '1px solid rgba(52,211,102,0.25)', borderRadius: '7px', fontSize: '0.82rem', color: '#34D366' }}>
            {parsed.length} student{parsed.length !== 1 ? 's' : ''} ready to enrol
          </div>
        )}

        <button
          onClick={handleEnroll}
          disabled={enrolling || parsed.length === 0 || !!parseError}
          style={{ alignSelf: 'flex-start', padding: '0.7rem 1.5rem', background: enrolling ? 'rgba(0,200,255,0.3)' : 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', border: 'none', borderRadius: '9px', cursor: enrolling || parsed.length === 0 ? 'not-allowed' : 'pointer' }}>
          {enrolling ? `Enrolling ${parsed.length} students…` : `Enrol ${parsed.length} Student${parsed.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {results && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
            Results — {results.filter(r => r.ok).length} enrolled, {results.filter(r => !r.ok).length} failed
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '7px', background: r.ok ? 'rgba(52,211,102,0.06)' : 'rgba(255,51,51,0.06)', border: `1px solid ${r.ok ? 'rgba(52,211,102,0.2)' : 'rgba(255,51,51,0.2)'}` }}>
                <span style={{ fontSize: '0.85rem' }}>{r.ok ? '✓' : '✗'}</span>
                <span style={{ fontSize: '0.82rem', flex: 1 }}>{r.email}</span>
                {r.error && <span style={{ fontSize: '0.75rem', color: '#FF5555' }}>{r.error}</span>}
              </div>
            ))}
          </div>
          {results.every(r => r.ok) && (
            <button onClick={() => router.push('/admin/students')} style={{ marginTop: '1rem', padding: '0.65rem 1.25rem', background: 'var(--cyan)', color: '#070D1A', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Back to Students
            </button>
          )}
        </div>
      )}
    </div>
  );
}

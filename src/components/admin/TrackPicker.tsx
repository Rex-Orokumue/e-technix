'use client';

import { TRACKS } from '@/lib/tracks';

interface Props {
  value: string[] | null; // null = General
  onChange: (val: string[] | null) => void;
}

export default function TrackPicker({ value, onChange }: Props) {
  const isGeneral = value === null || value.length === 0;

  const toggle = (track: string) => {
    if (isGeneral) {
      // switching from General to a specific track
      onChange([track]);
    } else {
      const next = value!.includes(track)
        ? value!.filter(t => t !== track)
        : [...value!, track];
      onChange(next.length === 0 ? null : next);
    }
  };

  const checkboxStyle = { accentColor: 'var(--cyan)', width: '15px', height: '15px', cursor: 'pointer', flexShrink: 0 };
  const rowStyle = { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.75rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)' };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {/* General option */}
      <label style={{ ...rowStyle, background: isGeneral ? 'var(--cyan-dim)' : 'transparent', border: isGeneral ? '1px solid var(--cyan-border)' : '1px solid transparent' }}>
        <input type="checkbox" style={checkboxStyle} checked={isGeneral} onChange={() => onChange(null)} />
        <span>🌍 General <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>(visible to all students)</span></span>
      </label>
      {/* Specific tracks */}
      {TRACKS.map(track => {
        const checked = !isGeneral && value!.includes(track);
        return (
          <label key={track} style={{ ...rowStyle, background: checked ? 'rgba(0,200,255,0.06)' : 'transparent', border: checked ? '1px solid var(--cyan-border)' : '1px solid transparent' }}>
            <input type="checkbox" style={checkboxStyle} checked={checked} onChange={() => toggle(track)} />
            <span>{track}</span>
          </label>
        );
      })}
    </div>
  );
}

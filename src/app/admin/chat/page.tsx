'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Channel { id: string; name: string; type: string; track?: string | null; }
interface Message {
  id: string; channel_id: string; sender_id?: string | null; sender_name: string; sender_type: string;
  content: string; is_pinned: boolean; created_at: string;
  reply_to_id?: string | null; reply_to_content?: string | null; reply_to_sender_name?: string | null;
  attachment_url?: string | null; attachment_type?: string | null; attachment_name?: string | null;
}
interface Student { id: string; full_name: string; track: string; }

const CHANNEL_ICONS: Record<string, string> = { general: '🌐', track: '📌', group: '👥', direct: '📩' };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Renders URLs as links and @mentions as highlighted spans
function renderContent(text: string) {
  if (!text) return null;
  const tokenRe = /https?:\/\/[^\s<>"]+|@\[[^\]]+\]|@all\b|@\w+/g;
  const parts: (string | React.ReactElement)[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = tokenRe.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('http')) {
      parts.push(<a key={m.index} href={token} target="_blank" rel="noopener noreferrer"
        style={{ color: 'var(--cyan)', textDecoration: 'underline', wordBreak: 'break-all' }}>{token}</a>);
    } else if (token === '@all') {
      parts.push(<span key={m.index} style={{ color: '#F59E0B', fontWeight: 700, background: 'rgba(245,158,11,0.12)', borderRadius: '3px', padding: '0 3px' }}>@all</span>);
    } else {
      const name = token.startsWith('@[') ? token.slice(2, -1) : token.slice(1);
      parts.push(<span key={m.index} style={{ color: 'var(--cyan)', fontWeight: 600, background: 'rgba(0,200,255,0.1)', borderRadius: '3px', padding: '0 3px' }}>@{name}</span>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : null;
}

function AttachmentPreview({ url, type, name }: { url: string; type: string; name?: string }) {
  if (type === 'image') {
    return <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '0.4rem' }}>
      <img src={url} alt={name ?? 'image'} style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '8px', display: 'block', border: '1px solid var(--border)' }} />
    </a>;
  }
  return <a href={url} target="_blank" rel="noopener noreferrer"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.78rem', color: 'var(--cyan)', textDecoration: 'none' }}>
    📄 {name ?? 'Download file'}
  </a>;
}

export default function AdminChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingChannel, setEditingChannel] = useState<{ id: string; name: string } | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<string | null>(null);
  const [active, setActive] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender_name: string } | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Group creation
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // DM initiation
  const [showNewDm, setShowNewDm] = useState(false);
  const [dmSearch, setDmSearch] = useState('');
  const [openingDm, setOpeningDm] = useState<string | null>(null);

  // @mention dropdown
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursor, setMentionCursor] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const loadStudents = useCallback(async () => {
    if (allStudents.length) return;
    const data = await fetch('/api/students').then(r => r.json());
    setAllStudents(Array.isArray(data) ? data : []);
  }, [allStudents.length]);

  const loadChannels = () =>
    fetch('/api/admin/chat/channels').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setChannels(d);
    });

  useEffect(() => {
    loadChannels().then(() => {
      fetch('/api/admin/chat/channels').then(r => r.json()).then(d => {
        if (Array.isArray(d) && d.length) setActive(prev => prev ?? d[0]);
      });
    });
    loadStudents();
  }, []);

  const fetchMessages = useCallback(async (channelId: string, before?: string) => {
    if (before) setLoadingMore(true);
    const url = `/api/admin/chat/messages?channel_id=${channelId}${before ? `&before=${encodeURIComponent(before)}` : ''}`;
    const data = await fetch(url).then(r => r.json());
    const msgs: Message[] = Array.isArray(data) ? data : [];
    if (before) { setMessages(prev => [...msgs, ...prev]); setLoadingMore(false); }
    else setMessages(msgs);
    setHasMore(msgs.length === 50);
  }, []);

  useEffect(() => {
    if (active) { setPinnedIndex(0); setReplyingTo(null); fetchMessages(active.id); }
  }, [active?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      const data = await fetch(`/api/admin/chat/messages?channel_id=${active.id}`).then(r => r.json());
      if (!Array.isArray(data)) return;
      setMessages(prev => {
        const prevMap = new Map(prev.map(m => [m.id, m]));
        const merged = prev.map(m => data.find((d: Message) => d.id === m.id) ?? m);
        const added = (data as Message[]).filter(m => !prevMap.has(m.id));
        return added.length ? [...merged, ...added] : merged;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [active?.id]);

  useEffect(() => {
    if (!active) return;
    const ch = supabase.channel(`admin-chat:${active.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${active.id}` }, p => {
        setMessages(prev => prev.some(m => m.id === (p.new as any).id) ? prev : [...prev, p.new as Message]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${active.id}` }, p => {
        setMessages(prev => prev.filter(m => m.id !== (p.old as any).id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${active.id}` }, p => {
        setMessages(prev => prev.map(m => m.id === (p.new as any).id ? p.new as Message : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active?.id]);

  // @mention detection: watch input for @word at cursor
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const cursor = e.target.selectionStart ?? val.length;
    const before = val.slice(0, cursor);
    const match = /@(\w*)$/.exec(before);
    if (match) {
      setMentionQuery(match[1]);
      setMentionCursor(match.index);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (name: string) => {
    const cursor = textareaRef.current?.selectionStart ?? input.length;
    const before = input.slice(0, cursor);
    const match = /@(\w*)$/.exec(before);
    if (!match) return;
    const prefix = input.slice(0, match.index);
    const suffix = input.slice(cursor);
    const inserted = name === '@all' ? '@all' : `@[${name}]`;
    setInput(prefix + inserted + ' ' + suffix);
    setMentionQuery(null);
    setTimeout(() => {
      const pos = prefix.length + inserted.length + 1;
      textareaRef.current?.setSelectionRange(pos, pos);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError('');
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/chat/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) setAttachment({ url: data.url, type: data.type, name: data.name });
      else setUploadError(data.error ?? 'Upload failed');
    } catch { setUploadError('Upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !attachment) || sending || !active) return;
    setSending(true);
    const savedAttachment = attachment;
    setInput(''); setAttachment(null); setMentionQuery(null);
    const res = await fetch('/api/admin/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: active.id, content: text,
        ...(replyingTo ? { reply_to_id: replyingTo.id, reply_to_content: replyingTo.content, reply_to_sender_name: replyingTo.sender_name } : {}),
        ...(savedAttachment ? { attachment_url: savedAttachment.url, attachment_type: savedAttachment.type, attachment_name: savedAttachment.name } : {}),
      }),
    });
    setSending(false);
    if (res.ok) {
      const newMsg = await res.json();
      setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      setReplyingTo(null);
    }
  };

  const deleteMsg = async (id: string) => {
    await fetch(`/api/admin/chat/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const togglePin = async (msg: Message) => {
    await fetch(`/api/admin/chat/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_pinned: !msg.is_pinned }) });
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_pinned: !m.is_pinned } : m));
  };

  const renameGroup = async (id: string, name: string) => {
    if (!name.trim()) return;
    await fetch(`/api/admin/chat/channels/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) });
    setEditingChannel(null);
    loadChannels();
  };

  const deleteGroup = async (id: string) => {
    await fetch(`/api/admin/chat/channels/${id}`, { method: 'DELETE' });
    setDeletingChannel(null);
    if (active?.id === id) { setActive(null); setMessages([]); }
    loadChannels();
  };

  const openNewGroup = () => {
    setShowNewGroup(true); setGroupName(''); setSelectedMembers([]); setMemberSearch('');
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setCreatingGroup(true);
    const res = await fetch('/api/admin/chat/channels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: groupName.trim(), member_ids: selectedMembers }) });
    setCreatingGroup(false);
    if (res.ok) {
      const newCh = await res.json();
      setShowNewGroup(false);
      loadChannels();
      setActive({ ...newCh, type: 'group' });
    }
  };

  const openDmWith = async (studentId: string) => {
    setOpeningDm(studentId);
    const res = await fetch('/api/admin/chat/dm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: studentId }) });
    setOpeningDm(null);
    if (res.ok) {
      const ch = await res.json();
      setChannels(prev => prev.some(c => c.id === ch.id) ? prev : [...prev, ch]);
      setActive({ ...ch, type: 'direct' });
      setShowNewDm(false);
    }
  };

  const pinnedMessages = messages.filter(m => m.is_pinned);

  // Students visible in @mention dropdown
  const mentionStudents = mentionQuery !== null
    ? allStudents.filter(s => mentionQuery === '' || s.full_name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6)
    : [];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)',
    fontSize: '0.88rem', outline: 'none',
  };

  const SidebarContent = ({ onSelect }: { onSelect?: () => void }) => (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {(['general', 'track', 'group', 'direct'] as const).map(type => {
          const group = channels.filter(c => c.type === type);
          if (!group.length) return null;
          const labels: Record<string, string> = { general: 'General', track: 'Tracks', group: 'Groups', direct: 'Direct Messages' };
          return (
            <div key={type} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', marginBottom: '0.2rem' }}>{labels[type]}</div>
              {group.map(ch => (
                <div key={ch.id}>
                  {editingChannel?.id === ch.id ? (
                    <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem 0.4rem' }}>
                      <input value={editingChannel.name} onChange={e => setEditingChannel({ id: ch.id, name: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') renameGroup(ch.id, editingChannel.name); if (e.key === 'Escape') setEditingChannel(null); }}
                        style={{ flex: 1, padding: '0.3rem 0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--cyan-border)', borderRadius: '5px', color: 'var(--text)', fontSize: '0.78rem', outline: 'none' }} autoFocus />
                      <button onClick={() => renameGroup(ch.id, editingChannel.name)} style={{ padding: '0.2rem 0.4rem', background: 'var(--cyan)', border: 'none', borderRadius: '4px', color: '#070D1A', fontSize: '0.7rem', cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditingChannel(null)} style={{ padding: '0.2rem 0.4rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)', fontSize: '0.7rem', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <button onClick={() => { setActive(ch); onSelect?.(); }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', borderRadius: '7px', border: 'none', cursor: 'pointer', background: active?.id === ch.id ? 'rgba(0,200,255,0.1)' : 'transparent', color: active?.id === ch.id ? 'var(--cyan)' : 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', textAlign: 'left', transition: 'background 0.15s' }}>
                        <span style={{ flexShrink: 0 }}>{CHANNEL_ICONS[ch.type]}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                      </button>
                      {ch.type === 'group' && (
                        <>
                          <button onClick={() => setEditingChannel({ id: ch.id, name: ch.name })} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.7rem', padding: '0.2rem', flexShrink: 0 }}>✏️</button>
                          {deletingChannel === ch.id ? (
                            <>
                              <button onClick={() => deleteGroup(ch.id)} style={{ background: 'rgba(255,51,51,0.15)', border: 'none', borderRadius: '3px', color: '#FF5555', cursor: 'pointer', fontSize: '0.65rem', padding: '0.15rem 0.3rem', flexShrink: 0 }}>Del</button>
                              <button onClick={() => setDeletingChannel(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.65rem', padding: '0.15rem', flexShrink: 0 }}>✕</button>
                            </>
                          ) : (
                            <button onClick={() => setDeletingChannel(ch.id)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.7rem', padding: '0.2rem', flexShrink: 0 }}>🗑</button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ padding: '0.6rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <button onClick={() => { setShowNewDm(true); setDmSearch(''); onSelect?.(); }}
          style={{ width: '100%', padding: '0.45rem', background: 'rgba(167,139,250,0.08)', border: '1px dashed rgba(167,139,250,0.35)', borderRadius: '7px', color: '#A78BFA', fontSize: '0.73rem', fontFamily: 'var(--font-head)', fontWeight: 600, cursor: 'pointer' }}>
          📩 New DM
        </button>
        <button onClick={() => { openNewGroup(); onSelect?.(); }}
          style={{ width: '100%', padding: '0.45rem', background: 'rgba(0,200,255,0.08)', border: '1px dashed var(--cyan-border)', borderRadius: '7px', color: 'var(--cyan)', fontSize: '0.73rem', fontFamily: 'var(--font-head)', fontWeight: 600, cursor: 'pointer' }}>
          + New Group
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        /*
          Use position:fixed to escape the shell's padding/minHeight entirely.
          The chat sits flush inside the viewport, below the fixed sidebar/topbar.
        */
        .ac-page {
          position: fixed;
          top: 0;
          left: 230px; /* desktop sidebar width */
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 2rem 1rem;
          background: var(--bg);
          z-index: 10;
        }
        .ac-page-header {
          flex-shrink: 0;
          margin-bottom: 0.75rem;
        }
        .ac-container {
          flex: 1;
          min-height: 0;
          display: flex;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .ac-sidebar {
          width: 210px;
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ac-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ac-mobile-bar { display: none; }
        .ac-overlay { display: none; }
        .ac-drawer { display: none; }
        .ac-hint { display: block; }
        .ac-desktop-header { display: flex; }
        @media (max-width: 768px) {
          .ac-page {
            left: 0;
            top: 60px; /* mobile topbar height */
            padding: 0.75rem 0.75rem 0.5rem;
          }
          .ac-page-header { display: none; }
          .ac-container { border-radius: 12px; }
          .ac-sidebar { display: none; }
          .ac-desktop-header { display: none !important; }
          .ac-mobile-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 0.85rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface);
            flex-shrink: 0;
          }
          .ac-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(0,0,0,0.55);
            backdrop-filter: blur(2px);
          }
          .ac-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: 270px;
            z-index: 210;
            background: var(--surface);
            border-right: 1px solid var(--border);
            overflow-y: auto;
          }
          .ac-hint { display: none; }
        }
        .ac-mention-item:hover { background: rgba(0,200,255,0.1) !important; color: var(--cyan) !important; }
      `}</style>

      <div className="ac-page">
      <div className="ac-page-header">
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Chat</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: 0 }}>Post messages, pin announcements, and moderate all channels.</p>
      </div>

      {/* Mobile drawer */}
      {mobileSidebarOpen && (
        <>
          <div className="ac-overlay" onClick={() => setMobileSidebarOpen(false)} />
          <div className="ac-drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Channels</span>
              <button onClick={() => setMobileSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <SidebarContent onSelect={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="ac-container">
        {/* Desktop sidebar */}
        <div className="ac-sidebar">
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Channels</div>
          <SidebarContent />
        </div>

        {/* Message area */}
        <div className="ac-body">

          {/* Mobile channel bar */}
          <div className="ac-mobile-bar">
            <button onClick={() => setMobileSidebarOpen(true)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-head)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
              ☰ Channels
            </button>
            {active && <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{CHANNEL_ICONS[active.type]} {active.name}</span>}
            <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '3px', padding: '0.05rem 0.4rem', textTransform: 'uppercase', flexShrink: 0 }}>Admin</span>
          </div>

          {/* Desktop channel header */}
          <div className="ac-desktop-header" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', flexShrink: 0 }}>
            {active ? (
              <>
                <span>{CHANNEL_ICONS[active.type]}</span>
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem' }}>{active.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '3px', padding: '0.05rem 0.4rem', textTransform: 'uppercase', fontWeight: 700 }}>Admin</span>
              </>
            ) : <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Select a channel</span>}
          </div>

          {/* Pinned carousel */}
          {pinnedMessages.length > 0 && (
            <div style={{ padding: '0.4rem 1rem', background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <span style={{ color: '#F59E0B', fontSize: '0.78rem', flexShrink: 0 }}>📌</span>
              <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>{pinnedMessages[pinnedIndex % pinnedMessages.length].sender_name}: </span>
                {pinnedMessages[pinnedIndex % pinnedMessages.length].content}
              </span>
              {pinnedMessages.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  <button onClick={() => setPinnedIndex(i => (i - 1 + pinnedMessages.length) % pinnedMessages.length)} style={{ background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '0.75rem' }}>‹</button>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{(pinnedIndex % pinnedMessages.length) + 1}/{pinnedMessages.length}</span>
                  <button onClick={() => setPinnedIndex(i => (i + 1) % pinnedMessages.length)} style={{ background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '0.75rem' }}>›</button>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {hasMore && (
              <button onClick={() => active && fetchMessages(active.id, messages[0]?.created_at)} disabled={loadingMore}
                style={{ alignSelf: 'center', padding: '0.4rem 1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                {loadingMore ? 'Loading…' : 'Load older messages'}
              </button>
            )}
            {messages.length === 0 && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No messages yet.</div>}
            {messages.map((msg, i) => {
              const isAdmin = msg.sender_type === 'admin';
              const showName = i === 0 || messages[i - 1].sender_id !== msg.sender_id || messages[i - 1].sender_name !== msg.sender_name;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isAdmin ? 'row-reverse' : 'row', gap: '0.4rem', alignItems: 'flex-end' }}>
                  <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                    {showName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3px', flexWrap: 'wrap' }}>
                        {isAdmin && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '3px', padding: '0.05rem 0.35rem', textTransform: 'uppercase' }}>Admin</span>}
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isAdmin ? '#F59E0B' : 'var(--muted)' }}>{msg.sender_name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{timeAgo(msg.created_at)}</span>
                        {msg.is_pinned && <span style={{ fontSize: '0.65rem' }}>📌</span>}
                      </div>
                    )}
                    {msg.reply_to_content && (
                      <div style={{ padding: '0.35rem 0.65rem', marginBottom: '3px', background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid var(--cyan)', borderRadius: '4px', maxWidth: '100%' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '1px' }}>{msg.reply_to_sender_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.reply_to_content}</div>
                      </div>
                    )}
                    <div style={{ padding: '0.6rem 0.9rem', background: isAdmin ? 'rgba(245,158,11,0.1)' : 'var(--surface)', border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`, borderRadius: isAdmin ? '12px 12px 4px 12px' : '12px 12px 12px 4px', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)', wordBreak: 'break-word' }}>
                      {msg.content && <span>{renderContent(msg.content)}</span>}
                      {msg.attachment_url && <AttachmentPreview url={msg.attachment_url} type={msg.attachment_type ?? 'file'} name={msg.attachment_name ?? undefined} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flexShrink: 0, alignSelf: 'center' }}>
                    <button onClick={() => setReplyingTo({ id: msg.id, content: msg.content, sender_name: msg.sender_name })} title="Reply" style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem', opacity: 0.5 }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>↩</button>
                    <button onClick={() => togglePin(msg)} title={msg.is_pinned ? 'Unpin' : 'Pin'} style={{ background: 'transparent', border: 'none', color: msg.is_pinned ? '#F59E0B' : 'var(--muted)', cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem', opacity: msg.is_pinned ? 1 : 0.5 }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = msg.is_pinned ? '1' : '0.5')}>📌</button>
                    <button onClick={() => deleteMsg(msg.id)} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.72rem', padding: '0.2rem', opacity: 0.5 }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>🗑</button>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input area — fixed at bottom, never expands the container */}
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {replyingTo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', background: 'rgba(0,200,255,0.04)', borderBottom: '1px solid var(--cyan-border)' }}>
                <div style={{ flex: 1, borderLeft: '3px solid var(--cyan)', paddingLeft: '0.5rem', minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)' }}>Replying to {replyingTo.sender_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyingTo.content}</div>
                </div>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>✕</button>
              </div>
            )}
            {(attachment || uploading || uploadError) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                {uploading && <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>⏳ Uploading…</span>}
                {uploadError && <span style={{ fontSize: '0.78rem', color: '#FF5555' }}>⚠ {uploadError}</span>}
                {attachment && !uploading && (
                  <>
                    <span>{attachment.type === 'image' ? '🖼' : '📄'}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>✕</button>
                  </>
                )}
              </div>
            )}

            {/* Input row — position:relative so the mention popup can anchor to it */}
            <div style={{ position: 'relative' }}>
            {/* @mention popup — floats above the input, doesn't affect layout height */}
            {mentionQuery !== null && (mentionStudents.length > 0 || mentionQuery === '') && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 50, border: '1px solid var(--border)', borderBottom: 'none', background: 'var(--surface)', maxHeight: '200px', overflowY: 'auto', borderRadius: '8px 8px 0 0' }}>
                {/* @all option */}
                <button className="ac-mention-item" onClick={() => insertMention('@all')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.45rem 1rem', background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}>
                  <span style={{ fontWeight: 700 }}>@all</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Notify everyone</span>
                </button>
                {mentionStudents.map(s => (
                  <button key={s.id} className="ac-mention-item" onClick={() => insertMention(s.full_name)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.45rem 1rem', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '0.83rem', textAlign: 'left' }}>
                    <span style={{ fontWeight: 600 }}>@{s.full_name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{s.track}</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!active || uploading} title="Attach image or file"
                style={{ padding: '0.55rem 0.65rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: (!active || uploading) ? 'not-allowed' : 'pointer', fontSize: '1rem', flexShrink: 0, lineHeight: 1 }}>
                📎
              </button>
              <textarea
                ref={textareaRef}
                style={{ ...inputStyle, flex: 1, minHeight: '40px', maxHeight: '96px', resize: 'none', lineHeight: 1.5 }}
                placeholder={active ? `Message ${active.name}… (@ to mention)` : 'Select a channel'}
                value={input} disabled={!active}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setMentionQuery(null); return; }
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button onClick={send} disabled={sending || (!input.trim() && !attachment) || !active}
                style={{ padding: '0.55rem 1rem', background: ((input.trim() || attachment) && active) ? 'var(--cyan)' : 'rgba(0,200,255,0.15)', color: ((input.trim() || attachment) && active) ? '#070D1A' : 'var(--muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', cursor: ((input.trim() || attachment) && active) ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                {sending ? '…' : 'Send'}
              </button>
            </div>
            <div className="ac-hint" style={{ padding: '0 1rem 0.45rem', fontSize: '0.67rem', color: 'var(--muted)' }}>Enter to send · Shift+Enter for new line · @ to mention · 📎 attach (max 5 MB)</div>
            </div>{/* end position:relative wrapper */}
          </div>
        </div>
      </div>

      {/* New Group Modal */}
      {showNewGroup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowNewGroup(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Create Group</h3>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Group Name</label>
              <input style={inputStyle} placeholder="e.g. Project Team A" value={groupName} onChange={e => setGroupName(e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Members</label>
              <input style={{ ...inputStyle, fontSize: '0.82rem', padding: '0.5rem 0.75rem' }} placeholder="Search…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '220px', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {allStudents.filter(s => !memberSearch || s.full_name.toLowerCase().includes(memberSearch.toLowerCase()) || s.track.toLowerCase().includes(memberSearch.toLowerCase())).map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.6rem', borderRadius: '7px', cursor: 'pointer', background: selectedMembers.includes(s.id) ? 'rgba(0,200,255,0.08)' : 'transparent', border: `1px solid ${selectedMembers.includes(s.id) ? 'var(--cyan-border)' : 'transparent'}` }}>
                    <input type="checkbox" checked={selectedMembers.includes(s.id)} onChange={e => setSelectedMembers(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))} style={{ accentColor: 'var(--cyan)', flexShrink: 0 }} />
                    <div><div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.full_name}</div><div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{s.track}</div></div>
                  </label>
                ))}
              </div>
              {selectedMembers.length > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--cyan)' }}>{selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={createGroup} disabled={creatingGroup || !groupName.trim()} style={{ flex: 1, padding: '0.7rem', background: groupName.trim() ? 'var(--cyan)' : 'rgba(0,200,255,0.2)', color: groupName.trim() ? '#070D1A' : 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', border: 'none', borderRadius: '8px', cursor: groupName.trim() ? 'pointer' : 'not-allowed' }}>
                {creatingGroup ? 'Creating…' : 'Create Group'}
              </button>
              <button onClick={() => setShowNewGroup(false)} style={{ padding: '0.7rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New DM Modal */}
      {showNewDm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowNewDm(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '380px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Message a Student</h3>
            <input
              style={{ ...inputStyle, fontSize: '0.85rem' }}
              placeholder="Search by name or track…"
              value={dmSearch}
              onChange={e => setDmSearch(e.target.value)}
              autoFocus
              onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {allStudents
                .filter(s => !dmSearch || s.full_name.toLowerCase().includes(dmSearch.toLowerCase()) || s.track.toLowerCase().includes(dmSearch.toLowerCase()))
                .map(s => (
                  <button key={s.id} onClick={() => openDmWith(s.id)} disabled={openingDm === s.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid transparent', background: 'transparent', cursor: openingDm === s.id ? 'wait' : 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(167,139,250,0.25)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{s.track}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#A78BFA', flexShrink: 0 }}>{openingDm === s.id ? '…' : '📩'}</span>
                  </button>
                ))}
              {allStudents.filter(s => !dmSearch || s.full_name.toLowerCase().includes(dmSearch.toLowerCase()) || s.track.toLowerCase().includes(dmSearch.toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.85rem' }}>No students found</div>
              )}
            </div>
            <button onClick={() => setShowNewDm(false)} style={{ padding: '0.6rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      </div>{/* end ac-page */}
    </>
  );
}

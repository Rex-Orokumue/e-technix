'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Channel { id: string; name: string; type: string; track?: string | null; }
interface Message {
  id: string; channel_id: string; sender_id?: string | null; sender_name: string; sender_type: string;
  content: string; is_pinned: boolean; created_at: string;
  reply_to_id?: string | null; reply_to_content?: string | null; reply_to_sender_name?: string | null;
}
interface Student { id: string; full_name: string; track: string; }

const CHANNEL_ICONS: Record<string, string> = { general: '🌐', track: '📌', group: '👥' };
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function AdminChatPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingChannel, setEditingChannel] = useState<{ id: string; name: string } | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<string | null>(null);
  const [active, setActive] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender_name: string } | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState(0);

  // Group creation
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const loadChannels = () =>
    fetch('/api/chat/channels').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setChannels(d);
    });

  useEffect(() => {
    loadChannels().then(() => {
      fetch('/api/chat/channels').then(r => r.json()).then(d => {
        if (Array.isArray(d) && d.length) setActive(prev => prev ?? d[0]);
      });
    });
  }, []);

  const fetchMessages = useCallback(async (channelId: string, before?: string) => {
    if (before) setLoadingMore(true);
    const url = `/api/chat/messages?channel_id=${channelId}${before ? `&before=${encodeURIComponent(before)}` : ''}`;
    const data = await fetch(url).then(r => r.json());
    const msgs: Message[] = Array.isArray(data) ? data : [];
    if (before) { setMessages(prev => [...msgs, ...prev]); setLoadingMore(false); }
    else { setMessages(msgs); }
    setHasMore(msgs.length === 50);
  }, []);

  useEffect(() => {
    if (active) { setPinnedIndex(0); setReplyingTo(null); fetchMessages(active.id); }
  }, [active?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  // Polling — full refetch every 2s, catches pin/delete updates
  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      const data = await fetch(`/api/chat/messages?channel_id=${active.id}`).then(r => r.json());
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

  // Realtime
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

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !active) return;
    setSending(true);
    setInput('');
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: active.id, content: text,
        ...(replyingTo ? { reply_to_id: replyingTo.id, reply_to_content: replyingTo.content, reply_to_sender_name: replyingTo.sender_name } : {}),
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
    await fetch(`/api/chat/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const togglePin = async (msg: Message) => {
    await fetch(`/api/chat/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_pinned: !msg.is_pinned }) });
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_pinned: !m.is_pinned } : m));
  };

  const renameGroup = async (id: string, name: string) => {
    if (!name.trim()) return;
    await fetch(`/api/chat/channels/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) });
    setEditingChannel(null);
    loadChannels();
  };

  const deleteGroup = async (id: string) => {
    await fetch(`/api/chat/channels/${id}`, { method: 'DELETE' });
    setDeletingChannel(null);
    if (active?.id === id) { setActive(null); setMessages([]); }
    loadChannels();
  };

  const openNewGroup = async () => {
    setShowNewGroup(true); setGroupName(''); setSelectedMembers([]); setMemberSearch('');
    if (!allStudents.length) {
      const data = await fetch('/api/students').then(r => r.json());
      setAllStudents(Array.isArray(data) ? data : []);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setCreatingGroup(true);
    const res = await fetch('/api/chat/channels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: groupName.trim(), member_ids: selectedMembers }) });
    setCreatingGroup(false);
    if (res.ok) {
      const newCh = await res.json();
      setShowNewGroup(false);
      loadChannels();
      setActive({ ...newCh, type: 'group' });
    }
  };

  const pinnedMessages = messages.filter(m => m.is_pinned);
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none' };

  return (
    <>
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>Chat</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Post messages, pin announcements, and moderate all channels.</p>
      </div>

      <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', height: '640px' }}>

        {/* Sidebar */}
        <div style={{ width: '210px', flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Channels</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {(['general', 'track', 'group'] as const).map(type => {
              const group = channels.filter(c => c.type === type);
              if (!group.length) return null;
              const labels: Record<string, string> = { general: 'General', track: 'Tracks', group: 'Groups' };
              return (
                <div key={type} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', marginBottom: '0.2rem' }}>{labels[type]}</div>
                  {group.map(ch => (
                    <div key={ch.id}>
                      {editingChannel?.id === ch.id ? (
                        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem 0.4rem' }}>
                          <input value={editingChannel.name} onChange={e => setEditingChannel({ id: ch.id, name: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') renameGroup(ch.id, editingChannel.name); if (e.key === 'Escape') setEditingChannel(null); }} style={{ flex: 1, padding: '0.3rem 0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--cyan-border)', borderRadius: '5px', color: 'var(--text)', fontSize: '0.78rem', outline: 'none' }} autoFocus />
                          <button onClick={() => renameGroup(ch.id, editingChannel.name)} style={{ padding: '0.2rem 0.4rem', background: 'var(--cyan)', border: 'none', borderRadius: '4px', color: '#070D1A', fontSize: '0.7rem', cursor: 'pointer' }}>✓</button>
                          <button onClick={() => setEditingChannel(null)} style={{ padding: '0.2rem 0.4rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)', fontSize: '0.7rem', cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <button onClick={() => setActive(ch)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', borderRadius: '7px', border: 'none', cursor: 'pointer', background: active?.id === ch.id ? 'rgba(0,200,255,0.1)' : 'transparent', color: active?.id === ch.id ? 'var(--cyan)' : 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', textAlign: 'left', transition: 'background 0.15s' }}>
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
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={openNewGroup} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,200,255,0.08)', border: '1px dashed var(--cyan-border)', borderRadius: '7px', color: 'var(--cyan)', fontSize: '0.75rem', fontFamily: 'var(--font-head)', fontWeight: 600, cursor: 'pointer' }}>+ New Group</button>
          </div>
        </div>

        {/* Message area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', flexShrink: 0 }}>
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
            <div style={{ padding: '0.4rem 1rem', background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {hasMore && (
              <button onClick={() => active && fetchMessages(active.id, messages[0]?.created_at)} disabled={loadingMore} style={{ alignSelf: 'center', padding: '0.4rem 1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                {loadingMore ? 'Loading…' : 'Load older messages'}
              </button>
            )}
            {messages.length === 0 && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No messages yet.</div>}
            {messages.map((msg, i) => {
              const isAdmin = msg.sender_type === 'admin';
              const showName = i === 0 || messages[i - 1].sender_id !== (msg as any).sender_id || messages[i - 1].sender_name !== msg.sender_name;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isAdmin ? 'row-reverse' : 'row', gap: '0.4rem', alignItems: 'flex-end' }}>
                  <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                    {showName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3px' }}>
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
                    <div style={{
                      padding: '0.6rem 0.9rem',
                      background: isAdmin ? 'rgba(245,158,11,0.1)' : 'var(--surface)',
                      border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                      borderRadius: isAdmin ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)', wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                  {/* Action buttons */}
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

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {replyingTo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.25rem', background: 'rgba(0,200,255,0.04)', borderBottom: '1px solid var(--cyan-border)' }}>
                <div style={{ flex: 1, borderLeft: '3px solid var(--cyan)', paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)' }}>Replying to {replyingTo.sender_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyingTo.content}</div>
                </div>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              </div>
            )}
            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
              <textarea
                style={{ ...inputStyle, flex: 1, minHeight: '42px', maxHeight: '100px', resize: 'none', lineHeight: 1.5 }}
                placeholder={active ? `Message ${active.name} as Admin…` : 'Select a channel'}
                value={input} disabled={!active}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button onClick={send} disabled={sending || !input.trim() || !active} style={{ padding: '0.6rem 1.1rem', background: (input.trim() && active) ? 'var(--cyan)' : 'rgba(0,200,255,0.15)', color: (input.trim() && active) ? '#070D1A' : 'var(--muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', cursor: (input.trim() && active) ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                Send
              </button>
            </div>
            <div style={{ padding: '0 1.25rem 0.5rem', fontSize: '0.68rem', color: 'var(--muted)' }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </div>

    {/* New Group Modal */}
    {showNewGroup && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowNewGroup(false)}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Create Group</h3>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>Group Name</label>
            <input style={inputStyle} placeholder="e.g. Project Team A" value={groupName} onChange={e => setGroupName(e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Add Members</label>
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
    </>
  );
}

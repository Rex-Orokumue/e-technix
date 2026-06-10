'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// Render message text with clickable URLs
function renderContent(text: string) {
  if (!text) return null;
  const urlRe = /https?:\/\/[^\s<>"]+/g;
  const parts: (string | React.ReactElement)[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = urlRe.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[0]} target="_blank" rel="noopener noreferrer"
        style={{ color: 'var(--cyan)', textDecoration: 'underline', wordBreak: 'break-all' }}>
        {m[0]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function AttachmentPreview({ url, type, name }: { url: string; type: string; name?: string }) {
  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '0.4rem' }}>
        <img src={url} alt={name ?? 'image'} style={{ maxWidth: '240px', maxHeight: '200px', borderRadius: '8px', display: 'block', border: '1px solid var(--border)' }} />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.78rem', color: 'var(--cyan)', textDecoration: 'none' }}>
      📄 {name ?? 'Download file'}
    </a>
  );
}

interface Channel {
  id: string;
  name: string;
  type: 'general' | 'track' | 'group' | 'direct';
  track?: string | null;
}

interface Message {
  id: string;
  channel_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_type: 'student' | 'admin';
  content: string;
  is_pinned: boolean;
  created_at: string;
  reply_to_id?: string | null;
  reply_to_content?: string | null;
  reply_to_sender_name?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

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

export default function ChatTab({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender_name: string } | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openingDm, setOpeningDm] = useState(false);
  const [dmError, setDmError] = useState('');
  const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTimestampRef = useRef<string | null>(null);
  // Track the active channel ID in a ref so async fetches can check if they're still relevant
  const activeChannelIdRef = useRef<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/chat/channels')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setChannels(data);
          setActiveChannel(prev => prev ?? data[0]);
        }
      })
      .catch(err => console.error('[Chat] channels error', err));
    return () => { cancelled = true; };
  }, []);

  const fetchMessages = useCallback(async (channelId: string, before?: string) => {
    setLoadingMessages(true);
    const url = `/api/chat/messages?channel_id=${channelId}${before ? `&before=${encodeURIComponent(before)}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    const msgs: Message[] = Array.isArray(data) ? data : [];
    // Discard if the user switched channels while this was in flight
    if (activeChannelIdRef.current !== channelId) return;
    if (before) {
      setMessages(prev => [...msgs, ...prev]);
    } else {
      setMessages(msgs);
    }
    setHasMore(msgs.length === 50);
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    // Update ref immediately so in-flight fetches from the previous channel are discarded
    activeChannelIdRef.current = activeChannel.id;
    setMessages([]);          // Clear stale messages instantly on switch
    lastTimestampRef.current = null;
    setPinnedIndex(0);
    setReplyingTo(null);
    fetchMessages(activeChannel.id);
  }, [activeChannel?.id]);

  useEffect(() => {
    if (!activeChannel) return;
    const channelId = activeChannel.id;
    const id = setInterval(async () => {
      const res = await fetch(`/api/chat/messages?channel_id=${channelId}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      // Discard if the user has switched away from this channel
      if (activeChannelIdRef.current !== channelId) return;
      setMessages(prev => {
        const prevMap = new Map(prev.map(m => [m.id, m]));
        const merged = prev.map(m => {
          const fresh = data.find((d: Message) => d.id === m.id);
          return fresh ?? m;
        });
        const added = (data as Message[]).filter(m => !prevMap.has(m.id));
        return added.length ? [...merged, ...added] : merged;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [activeChannel?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      lastTimestampRef.current = messages[messages.length - 1].created_at;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!activeChannel) return;
    const channel = supabase
      .channel(`chat:${activeChannel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeChannel.id}` }, payload => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeChannel.id}` }, payload => {
        setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeChannel.id}` }, payload => {
        setMessages(prev => prev.map(m => m.id === (payload.new as any).id ? payload.new as Message : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChannel?.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/chat/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setAttachment({ url: data.url, type: data.type, name: data.name });
      } else {
        setUploadError(data.error ?? 'Upload failed');
      }
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !attachment) || sending || !activeChannel) return;
    setSending(true);
    setSendError('');
    const savedInput = text;
    const savedAttachment = attachment;
    setInput('');
    setAttachment(null);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: activeChannel.id,
          content: text,
          ...(replyingTo ? { reply_to_id: replyingTo.id, reply_to_content: replyingTo.content, reply_to_sender_name: replyingTo.sender_name } : {}),
          ...(savedAttachment ? { attachment_url: savedAttachment.url, attachment_type: savedAttachment.type, attachment_name: savedAttachment.name } : {}),
        }),
      });
      const body = await res.json();
      if (res.ok) {
        setMessages(prev => prev.some(m => m.id === body.id) ? prev : [...prev, body]);
        setReplyingTo(null);
      } else {
        setSendError(body.error ?? `Error ${res.status}`);
        setInput(savedInput);
        setAttachment(savedAttachment);
      }
    } catch {
      setSendError('Network error');
      setInput(savedInput);
      setAttachment(savedAttachment);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const openDm = async (closeSidebar?: () => void) => {
    setOpeningDm(true);
    setDmError('');
    try {
      const res = await fetch('/api/chat/dm', { method: 'POST' });
      const ch = await res.json();
      if (res.ok && ch.id) {
        setChannels(prev => prev.some(c => c.id === ch.id) ? prev : [...prev, ch]);
        setActiveChannel(ch);
        closeSidebar?.();
      } else {
        setDmError(ch.error ?? `Error ${res.status}`);
      }
    } catch (e: any) {
      setDmError(e?.message ?? 'Network error');
    } finally {
      setOpeningDm(false);
    }
  };

  const pinnedMessages = messages.filter(m => m.is_pinned);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)',
    fontSize: '0.88rem', outline: 'none',
  };

  const ChannelList = ({ onSelect }: { onSelect?: () => void }) => (
    <>
      {(['general', 'track', 'group', 'direct'] as const).map(type => {
        const group = channels.filter(c => c.type === type);
        if (!group.length) return null;
        const labels: Record<string, string> = { general: 'General', track: 'My Track', group: 'Groups', direct: 'Admin' };
        return (
          <div key={type} style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', marginBottom: '0.2rem' }}>{labels[type]}</div>
            {group.map(ch => {
              const isDirect = ch.type === 'direct';
              const isActive = activeChannel?.id === ch.id;
              return (
                <button key={ch.id} onClick={() => { setActiveChannel(ch); onSelect?.(); }} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                  padding: '0.6rem 0.75rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  background: isActive ? (isDirect ? 'rgba(167,139,250,0.12)' : 'rgba(0,200,255,0.1)') : 'transparent',
                  color: isActive ? (isDirect ? '#A78BFA' : 'var(--cyan)') : 'var(--text)',
                  fontFamily: 'var(--font-body)', fontSize: '0.85rem', textAlign: 'left',
                  transition: 'background 0.15s',
                }}>
                  <span style={{ flexShrink: 0 }}>{CHANNEL_ICONS[ch.type]}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isDirect ? 'Admin' : ch.name}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
      {channels.length === 0 && (
        <div style={{ padding: '1rem 0.5rem', fontSize: '0.78rem', color: 'var(--muted)' }}>No channels available.</div>
      )}
      {/* Message Admin button — only shown if no DM channel yet */}
      {!channels.some(c => c.type === 'direct') && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => openDm(onSelect)}
            disabled={openingDm}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', borderRadius: '7px', border: '1px dashed rgba(167,139,250,0.35)', cursor: openingDm ? 'wait' : 'pointer', background: 'transparent', color: '#A78BFA', fontFamily: 'var(--font-body)', fontSize: '0.82rem', textAlign: 'left', transition: 'background 0.15s' }}
          >
            <span>📩</span>
            <span>{openingDm ? 'Opening…' : 'Message Admin'}</span>
          </button>
          {dmError && (
            <div style={{ fontSize: '0.72rem', color: '#FF5555', marginTop: '0.3rem', padding: '0 0.25rem' }}>
              {dmError}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <style>{`
        .chat-container {
          display: flex;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          height: 600px;
        }
        .chat-sidebar {
          width: 200px;
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }
        .chat-mobile-header { display: none; }
        .chat-mobile-overlay { display: none; }
        .chat-mobile-drawer { display: none; }
        .chat-hint { display: block; }

        @media (max-width: 640px) {
          .chat-container {
            height: calc(100dvh - 200px);
            min-height: 400px;
            border-radius: 12px;
          }
          .chat-sidebar { display: none; }
          .chat-mobile-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 0.85rem;
            border-bottom: 1px solid var(--border);
            background: var(--surface);
            flex-shrink: 0;
          }
          .chat-mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(0,0,0,0.55);
            backdrop-filter: blur(2px);
          }
          .chat-mobile-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 260px;
            z-index: 210;
            background: var(--surface);
            border-right: 1px solid var(--border);
            padding: 1rem 0.75rem;
            overflow-y: auto;
          }
          .chat-hint { display: none; }
        }
      `}</style>

      {/* Mobile channel drawer */}
      {mobileSidebarOpen && (
        <>
          <div className="chat-mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
          <div className="chat-mobile-drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Channels</span>
              <button onClick={() => setMobileSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <ChannelList onSelect={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="chat-container">
        {/* Desktop sidebar */}
        <div className="chat-sidebar">
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Channels
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            <ChannelList />
          </div>
        </div>

        {/* Message area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Mobile channel header */}
          <div className="chat-mobile-header">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-head)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
            >
              ☰ Channels
            </button>
            {activeChannel && (
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {CHANNEL_ICONS[activeChannel.type]} {activeChannel.name}
              </span>
            )}
          </div>

          {/* Desktop channel header */}
          {activeChannel ? (
            <div className="chat-desktop-header" style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface)', flexShrink: 0 }}>
              <span>{CHANNEL_ICONS[activeChannel.type]}</span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem' }}>{activeChannel.name}</span>
              {activeChannel.type === 'track' && (
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>Your track</span>
              )}
            </div>
          ) : (
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
              Select a channel
            </div>
          )}

          {/* Pinned messages */}
          {pinnedMessages.length > 0 && (
            <div style={{ padding: '0.4rem 1rem', background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#F59E0B', fontSize: '0.78rem', flexShrink: 0 }}>📌</span>
              <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>{pinnedMessages[pinnedIndex % pinnedMessages.length].sender_name}: </span>
                {pinnedMessages[pinnedIndex % pinnedMessages.length].content}
              </span>
              {pinnedMessages.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  <button onClick={() => setPinnedIndex(i => (i - 1 + pinnedMessages.length) % pinnedMessages.length)} style={{ background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '0.75rem', padding: '0 2px' }}>‹</button>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{(pinnedIndex % pinnedMessages.length) + 1}/{pinnedMessages.length}</span>
                  <button onClick={() => setPinnedIndex(i => (i + 1) % pinnedMessages.length)} style={{ background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '0.75rem', padding: '0 2px' }}>›</button>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {hasMore && (
              <button onClick={() => activeChannel && fetchMessages(activeChannel.id, messages[0]?.created_at)} disabled={loadingMessages} style={{ alignSelf: 'center', padding: '0.4rem 1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                {loadingMessages ? 'Loading…' : 'Load older messages'}
              </button>
            )}
            {messages.length === 0 && !loadingMessages && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No messages yet. Say hello! 👋</div>
            )}
            {messages.map((msg, i) => {
              const isAdmin = msg.sender_type === 'admin';
              const isMe = msg.sender_id === studentId;
              const showName = i === 0 || messages[i - 1].sender_id !== msg.sender_id;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '0.4rem', alignItems: 'flex-end' }}>
                  <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    {showName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3px', flexWrap: 'wrap' }}>
                        {isAdmin && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '3px', padding: '0.05rem 0.35rem', textTransform: 'uppercase' }}>Admin</span>}
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isMe ? 'var(--cyan)' : 'var(--muted)' }}>{isMe ? 'You' : msg.sender_name}</span>
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
                      background: isMe ? 'rgba(0,200,255,0.12)' : isAdmin ? 'rgba(245,158,11,0.08)' : 'var(--surface)',
                      border: `1px solid ${isMe ? 'var(--cyan-border)' : isAdmin ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`,
                      borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text)', wordBreak: 'break-word',
                    }}>
                      {msg.content && <span>{renderContent(msg.content)}</span>}
                      {msg.attachment_url && (
                        <AttachmentPreview url={msg.attachment_url} type={msg.attachment_type ?? 'file'} name={msg.attachment_name ?? undefined} />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo({ id: msg.id, content: msg.content, sender_name: isMe ? 'You' : msg.sender_name })}
                    title="Reply"
                    style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem', opacity: 0.5, flexShrink: 0, alignSelf: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                  >↩</button>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {replyingTo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(0,200,255,0.04)', borderBottom: '1px solid var(--cyan-border)' }}>
                <div style={{ flex: 1, borderLeft: '3px solid var(--cyan)', paddingLeft: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan)' }}>Replying to {replyingTo.sender_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyingTo.content}</div>
                </div>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem' }}>✕</button>
              </div>
            )}
            <div style={{ padding: '0.75rem 1rem' }}>
              {/* Attachment preview */}
              {(attachment || uploading || uploadError) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '7px' }}>
                  {uploading && <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>⏳ Uploading…</span>}
                  {uploadError && <span style={{ fontSize: '0.78rem', color: '#FF5555' }}>⚠ {uploadError}</span>}
                  {attachment && !uploading && (
                    <>
                      <span style={{ fontSize: '0.8rem' }}>{attachment.type === 'image' ? '🖼' : '📄'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
                      <button onClick={() => setAttachment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', padding: '0 2px', flexShrink: 0 }}>✕</button>
                    </>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} onChange={handleFileChange} />
                {/* Attach button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!activeChannel || uploading}
                  title="Attach image or file"
                  style={{ padding: '0.6rem 0.65rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: (!activeChannel || uploading) ? 'not-allowed' : 'pointer', fontSize: '1rem', flexShrink: 0, lineHeight: 1 }}
                >
                  📎
                </button>
                <textarea
                  style={{ ...inputStyle, flex: 1, minHeight: '42px', maxHeight: '120px', resize: 'none', lineHeight: 1.5 }}
                  placeholder={activeChannel ? `Message ${activeChannel.name}…` : 'Select a channel first'}
                  value={input}
                  disabled={!activeChannel}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onFocus={e => (e.target.style.borderColor = 'var(--cyan-border)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button onClick={send} disabled={sending || (!input.trim() && !attachment) || !activeChannel} style={{ padding: '0.6rem 1rem', background: ((input.trim() || attachment) && activeChannel) ? 'var(--cyan)' : 'rgba(0,200,255,0.15)', color: ((input.trim() || attachment) && activeChannel) ? '#070D1A' : 'var(--muted)', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', cursor: ((input.trim() || attachment) && activeChannel) ? 'pointer' : 'not-allowed', transition: 'all 0.15s', flexShrink: 0 }}>
                  Send
                </button>
              </div>
              <div className="chat-hint" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.35rem' }}>Enter to send · Shift+Enter for new line · 📎 attach image or file (max 5 MB)</div>
              {sendError && <div style={{ fontSize: '0.75rem', color: '#FF5555', marginTop: '0.25rem' }}>{sendError}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

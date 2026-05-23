'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// June 1, 2026 at 7:00 PM GMT+1 = 18:00 UTC
const TARGET_DATE = new Date('2026-06-01T18:00:00Z').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function DigitCard({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(0,200,255,0.12) 0%, rgba(0,200,255,0.04) 100%)',
        border: '1px solid rgba(0,200,255,0.2)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        minWidth: '72px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Inner glow */}
        <div style={{
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '60%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.5), transparent)',
        }} />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              display: 'block',
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--cyan)',
              lineHeight: 1.1,
            }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span style={{
        fontSize: '0.68rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
      }}>
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span style={{
      fontFamily: 'var(--font-head)',
      fontSize: 'clamp(1.4rem, 3vw, 2rem)',
      fontWeight: 800,
      color: 'rgba(0,200,255,0.3)',
      alignSelf: 'flex-start',
      paddingTop: '0.85rem',
      userSelect: 'none',
    }}>
      :
    </span>
  );
}

export default function CountdownTimer({ variant = 'hero' }: { variant?: 'hero' | 'banner' }) {
  const [time, setTime] = useState<TimeLeft | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Set initial time on client only to avoid hydration mismatch
    const initial = getTimeLeft();
    setTime(initial);
    if (initial.days === 0 && initial.hours === 0 && initial.minutes === 0 && initial.seconds === 0) {
      setExpired(true);
      return;
    }

    const interval = setInterval(() => {
      const t = getTimeLeft();
      setTime(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render until client-side hydration is done
  if (!time) return null;

  if (expired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(52,211,102,0.15), rgba(52,211,102,0.08))',
          border: '1px solid rgba(52,211,102,0.3)',
          borderRadius: '14px',
          padding: variant === 'hero' ? '1.5rem 2rem' : '0.75rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-head)',
          fontWeight: 700,
          fontSize: variant === 'hero' ? '1.15rem' : '0.9rem',
          color: '#34D366',
        }}>
          🎉 Free courses are NOW LIVE! Training has started!
        </span>
      </motion.div>
    );
  }

  if (variant === 'banner') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          ⏱️ Free courses start in:
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          {[
            { val: time.days, label: 'd' },
            { val: time.hours, label: 'h' },
            { val: time.minutes, label: 'm' },
            { val: time.seconds, label: 's' },
          ].map((item, i) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 800,
                fontSize: '0.88rem',
                color: 'var(--cyan)',
                background: 'rgba(0,200,255,0.1)',
                border: '1px solid rgba(0,200,255,0.2)',
                borderRadius: '6px',
                padding: '0.15rem 0.45rem',
                minWidth: '32px',
                textAlign: 'center',
                display: 'inline-block',
              }}>
                {String(item.val).padStart(2, '0')}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {item.label}
              </span>
              {i < 3 && (
                <span style={{ color: 'rgba(0,200,255,0.25)', fontWeight: 700, fontSize: '0.8rem', marginLeft: '0.1rem' }}>
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Hero variant — the big, visible countdown
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
      style={{
        position: 'relative',
        marginTop: '2.5rem',
        padding: '2rem 2rem 1.5rem',
        borderRadius: '18px',
        background: 'linear-gradient(180deg, rgba(0,200,255,0.06) 0%, rgba(0,200,255,0.02) 100%)',
        border: '1px solid rgba(0,200,255,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Animated glow pulse */}
      <div style={{
        position: 'absolute',
        top: '-50%', left: '50%',
        transform: 'translateX(-50%)',
        width: '300px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(0,200,255,0.1) 0%, transparent 70%)',
        animation: 'countdownGlow 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes countdownGlow {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
        }
      `}</style>

      <div style={{
        position: 'relative',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '1.25rem',
        }}>
          🚀 Free course training starts — <span style={{ color: 'var(--cyan)' }}>June 1, 7 PM (GMT+1)</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
        }}>
          <DigitCard value={time.days} label="Days" />
          <Separator />
          <DigitCard value={time.hours} label="Hours" />
          <Separator />
          <DigitCard value={time.minutes} label="Minutes" />
          <Separator />
          <DigitCard value={time.seconds} label="Seconds" />
        </div>
      </div>
    </motion.div>
  );
}

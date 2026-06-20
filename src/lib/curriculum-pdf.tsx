import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import { TRACKS, PROGRAMME, type Track, type TrackStatus } from '@/lib/data/curriculum';

const CY = '#00C8FF';
const OR = '#FF6B2B';
const DARK = '#070D1A';
const INK = '#1A2233';
const LINE = '#E2E8F0';

const accentOf = (t: Track) => (t.accent === 'cyan' ? CY : OR);

const STATUS_LABEL: Record<TrackStatus, string> = {
  enrolling: 'ENROLLING NOW',
  coming_soon: 'COMING SOON',
  advanced: 'ADVANCED',
};
const STATUS_COLOR: Record<TrackStatus, string> = {
  enrolling: CY,
  coming_soon: '#8A94A6',
  advanced: OR,
};

const s = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 46,
    fontSize: 9.5,
    color: INK,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
  },
  // Cover
  cover: { backgroundColor: DARK, color: '#fff', padding: 56, height: '100%', flexDirection: 'column', justifyContent: 'space-between' },
  coverTop: { flexDirection: 'row', alignItems: 'center' },
  wordmark: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#fff' },
  kicker: { fontSize: 9, letterSpacing: 3, color: CY, textTransform: 'uppercase', marginTop: 10, fontFamily: 'Helvetica-Bold' },
  docTitle: { fontSize: 11, letterSpacing: 2, color: '#AAB4C8', textTransform: 'uppercase', marginTop: 4 },
  coverRule: { height: 3, width: 60, backgroundColor: OR, marginTop: 22, marginBottom: 22 },
  tagline: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: CY, lineHeight: 1.15, maxWidth: 360 },
  coverSub: { fontSize: 11, color: '#AAB4C8', marginTop: 18, maxWidth: 380, lineHeight: 1.5 },
  coverMetaLabel: { fontSize: 8, letterSpacing: 1.5, color: '#6B7689', textTransform: 'uppercase' },
  coverMetaValue: { fontSize: 10, color: '#D7DEEA', marginTop: 2 },
  watermarkCover: { fontSize: 8.5, color: '#6B7689', marginTop: 26 },

  // Generic
  h1: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 4 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 8, marginTop: 6 },
  p: { color: '#33415C', marginBottom: 4 },
  label: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', letterSpacing: 1.2, color: '#6B7689', marginTop: 12, marginBottom: 5, textTransform: 'uppercase' },

  // Philosophy / AI cards
  card: { borderWidth: 0.75, borderColor: LINE, borderRadius: 6, padding: 10, marginBottom: 8 },
  cardTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 3 },

  // Index table
  indexRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 5, alignItems: 'center' },
  indexCode: { width: 56, fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: '#6B7689' },
  indexName: { flex: 1, fontSize: 9.5, color: INK },
  indexDur: { width: 64, fontSize: 8.5, color: '#6B7689' },
  indexStatus: { width: 92, fontSize: 7.5, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // Track section
  trackBand: { padding: 12, borderRadius: 6, marginBottom: 8 },
  trackName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#fff' },
  trackMeta: { fontSize: 8.5, color: '#fff', opacity: 0.92, marginTop: 3 },
  li: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDot: { width: 9, color: '#33415C' },
  liText: { flex: 1, color: '#33415C' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  chip: { fontSize: 8, color: '#33415C', backgroundColor: '#F1F4F9', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6, marginRight: 4, marginBottom: 4 },

  // Week timeline
  weekRow: { marginBottom: 7, paddingBottom: 7, borderBottomWidth: 0.5, borderBottomColor: LINE, flexDirection: 'row' },
  weekNum: { width: 40 },
  weekNumBadge: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#6B7689' },
  weekNumBig: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: INK },
  weekBody: { flex: 1 },
  weekTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: INK },
  weekTheme: { fontSize: 8.5, color: '#6B7689' },
  deliverable: { fontSize: 8.5, marginTop: 3, color: '#33415C' },
  aiBadgeRow: { flexDirection: 'row', marginTop: 3 },
  aiBadge: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, color: '#fff', borderRadius: 3, paddingVertical: 1.5, paddingHorizontal: 4, marginRight: 4 },

  footer: { position: 'absolute', bottom: 22, left: 46, right: 46, fontSize: 7, color: '#9AA4B8', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 6 },
});

function Footer({ mark }: { mark: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{mark}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={s.li}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.liText}>{children}</Text>
    </View>
  );
}

export async function renderCurriculumPdf(lead: { name: string; email: string }): Promise<Buffer> {
  const mark = `Prepared for ${lead.name} · ${lead.email} · ${new Date().toISOString().slice(0, 10)} · © E-Technix`;

  const doc = (
    <Document title="E-Technix Master Curriculum" author="E-Technix" subject="Digital Careers Programme">
      {/* ── Cover ── */}
      <Page size="A4" style={s.cover}>
        <View style={s.coverTop}>
          <Text style={s.wordmark}>
            <Text style={{ color: CY }}>e-</Text>
            <Text>technix</Text>
            <Text style={{ color: OR }}> .</Text>
          </Text>
        </View>
        <View>
          <Text style={s.kicker}>Digital Careers Programme</Text>
          <Text style={s.docTitle}>Master Curriculum</Text>
          <Text style={s.coverRule} />
          <Text style={s.tagline}>{PROGRAMME.tagline}</Text>
          <Text style={s.coverSub}>{PROGRAMME.overview}</Text>
          <Text style={s.watermarkCover}>{mark}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.coverMetaLabel}>Programme</Text>
            <Text style={s.coverMetaValue}>{PROGRAMME.subtitle}</Text>
          </View>
          <View>
            <Text style={s.coverMetaLabel}>Where</Text>
            <Text style={s.coverMetaValue}>{PROGRAMME.location}</Text>
          </View>
        </View>
      </Page>

      {/* ── Philosophy + AI integration + index ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Our Teaching Philosophy</Text>
        <Text style={s.p}>“{PROGRAMME.philosophyQuestion}”</Text>
        {PROGRAMME.philosophy.map((p) => (
          <View key={p.title} style={s.card}>
            <Text style={s.cardTitle}>{p.title}</Text>
            <Text style={{ color: '#33415C' }}>{p.body}</Text>
          </View>
        ))}

        <Text style={[s.h2, { marginTop: 12 }]}>How We Integrate AI</Text>
        {PROGRAMME.aiIntegration.map((p) => (
          <View key={p.title} style={s.card}>
            <Text style={s.cardTitle}>{p.title}</Text>
            <Text style={{ color: '#33415C' }}>{p.body}</Text>
          </View>
        ))}

        <Text style={[s.h2, { marginTop: 14 }]}>Tracks at a Glance</Text>
        {TRACKS.map((t) => (
          <View key={t.code} style={s.indexRow} wrap={false}>
            <Text style={s.indexCode}>{t.code}</Text>
            <Text style={s.indexName}>{t.name}</Text>
            <Text style={s.indexDur}>{t.duration}</Text>
            <Text style={[s.indexStatus, { color: STATUS_COLOR[t.status] }]}>{STATUS_LABEL[t.status]}</Text>
          </View>
        ))}
        <Footer mark={mark} />
      </Page>

      {/* ── One flow per track ── */}
      {TRACKS.map((t) => (
        <Page key={t.code} size="A4" style={s.page} wrap>
          <View style={[s.trackBand, { backgroundColor: accentOf(t) }]}>
            <Text style={s.trackName}>{t.name}</Text>
            <Text style={s.trackMeta}>
              {t.code} · {t.duration} · {t.hoursPerWeek}/week · {STATUS_LABEL[t.status]}
            </Text>
            <Text style={s.trackMeta}>Prerequisite: {t.prerequisite}</Text>
          </View>

          <Text style={s.p}>{t.summary}</Text>

          <Text style={s.label}>What you will be able to do</Text>
          {t.outcomes.map((o, i) => (
            <Bullet key={i}>{o}</Bullet>
          ))}

          <Text style={s.label}>Career paths this opens</Text>
          <View style={s.chipRow}>
            {t.careerPaths.map((c, i) => (
              <Text key={i} style={s.chip}>{c}</Text>
            ))}
          </View>

          <Text style={s.label}>Week by week</Text>
          {t.weeks.map((w) => (
            <View key={w.n} style={s.weekRow} wrap={false}>
              <View style={s.weekNum}>
                <Text style={s.weekNumBadge}>WEEK</Text>
                <Text style={s.weekNumBig}>{w.n}</Text>
              </View>
              <View style={s.weekBody}>
                <Text style={s.weekTitle}>{w.title}</Text>
                {w.theme ? <Text style={s.weekTheme}>{w.theme}</Text> : null}
                <Text style={s.deliverable}>Deliverable: {w.deliverable}</Text>
                {(w.aiChallenge || w.aiAudit) && (
                  <View style={s.aiBadgeRow}>
                    {w.aiChallenge ? <Text style={[s.aiBadge, { backgroundColor: CY, color: DARK }]}>AI CHALLENGE</Text> : null}
                    {w.aiAudit ? <Text style={[s.aiBadge, { backgroundColor: OR }]}>AI AUDIT</Text> : null}
                  </View>
                )}
              </View>
            </View>
          ))}
          <Footer mark={mark} />
        </Page>
      ))}
    </Document>
  );

  return renderToBuffer(doc);
}

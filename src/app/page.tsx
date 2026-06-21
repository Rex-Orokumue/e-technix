import type { Metadata } from 'next';
import { TRACKS } from '@/lib/data/curriculum';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import {
  Stats,
  HowItWorks,
  TrackGrid,
  Foundation,
  Certifications,
  CTASection,
  UrgencyBar,
  WhatsIncluded,
  Testimonials,
  GuaranteeStrip,
  CommunityBand,
} from '@/components/home/sections';

export const metadata: Metadata = {
  title: 'E-Technix — Build Your Digital Career',
  description:
    'E-Technix is a structured 6–9 month digital skills training programme, UK-directed and Nigeria-delivered. Start with Phase 1 (Foundation), then specialise in Data, Web, Mobile, AI, Product Design, Digital Entrepreneurship, AI Product Management, or Cybersecurity — with real projects, live mentorship, and a career-ready certificate.',
  alternates: { canonical: 'https://e-technix.com' },
};

/* ── Schemas ──────────────────────────────────────────────────────────────── */

const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://e-technix.com/#webpage',
  name: 'E-Technix — Build Your Digital Career',
  url: 'https://e-technix.com',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['#etechnix-definition', '#etechnix-tracks-summary', '#etechnix-guarantee'],
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    ],
  },
};

const homepageSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': 'https://e-technix.com/#organization',
  name: 'E-Technix',
  url: 'https://e-technix.com',
  logo: { '@type': 'ImageObject', url: 'https://e-technix.com/icon.png' },
  description:
    'E-Technix is a structured 6–9 month digital skills training programme, UK-directed and Nigeria-delivered. Every student completes Phase 1 (Foundation), then specialises across eight tracks plus two advanced tracks.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'E-Technix Training Tracks',
    numberOfItems: TRACKS.length,
    itemListElement: TRACKS.map((t) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Course', name: t.name },
    })),
  },
};

/* ── Definitional content block — server-rendered so AI crawlers always see it ── */
function AboutDefinition() {
  return (
    <section
      aria-label="About E-Technix"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '5rem 2.5rem',
        background: 'rgba(0,200,255,0.015)',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'start' }}>

        {/* Definition */}
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>
            What is E-Technix?
          </p>
          <h2
            id="etechnix-definition"
            style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.025em', marginBottom: '1rem' }}
          >
            A Structured Path from Beginner to Career-Ready
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            <strong style={{ color: 'var(--text)' }}>E-Technix</strong> is a structured 6–9 month digital skills training programme
            founded by a UK-Nigeria team of working engineers and data professionals.
            It is designed for complete beginners and career-changers who want to build
            real, job-ready skills — not just watch videos.
          </p>
          <p id="etechnix-guarantee" style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.8 }}>
            Every student starts with a mandatory 2-month <strong style={{ color: 'var(--text)' }}>Digital & Business Foundations</strong> phase,
            then — after scoring at least 60% — chooses one of eight specialisation tracks
            (two advanced tracks are also available). The programme continues through Project
            Labs and Career Launch, ending with a real project portfolio, a track-specific
            certificate, and a career plan. There is a 7-day full refund guarantee if the
            programme is not right for you.
          </p>
        </div>

        {/* Key facts grid */}
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>
            Key Facts
          </p>
          <div id="etechnix-tracks-summary" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Duration', value: '6–9 months (4 phases)' },
              { label: 'Format', value: 'Fully online — live sessions + recordings' },
              { label: 'Tracks', value: 'Data · Web · Mobile · AI · Design · Business · AI PM · Security (+ 2 advanced)' },
              { label: 'Time commitment', value: '10–15 hours per week' },
              { label: 'Who it is for', value: 'Complete beginners and career-changers' },
              { label: 'Based in', value: 'Nigeria and United Kingdom' },
              { label: 'Certificate', value: 'Track-specific certificate on completion of capstone' },
              { label: 'Guarantee', value: '7-day full refund, no questions asked' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', minWidth: '120px', flexShrink: 0, paddingTop: '1px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      <Navbar />
      <UrgencyBar />
      <main>
        <Hero />
        <GuaranteeStrip />
        <Stats />
        {/* AEO: server-rendered definitional block — always in HTML, always crawlable */}
        <AboutDefinition />
        <WhatsIncluded />
        <HowItWorks />
        <CommunityBand />
        <TrackGrid />
        <Testimonials />
        <Foundation />
        <Certifications />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import RegisterPageClient from './_client';
import { TRACKS } from '@/lib/data/curriculum';
import { PRICING } from '@/lib/data/pricing';

export const metadata: Metadata = {
  title: 'Register — Secure Your Spot',
  description:
    'Register for E-Technix. Start with Phase 1 (Foundation), then choose one of eight specialisation tracks — Data Analytics, Web & Mobile Development, AI, Product Design, Cybersecurity, and more. One fee covers your full programme. Full payment or instalments available.',
  alternates: { canonical: 'https://e-technix.com/register' },
  openGraph: {
    title: 'Register for E-Technix — Secure Your Spot',
    description:
      'Choose your specialisation track, fill in your details, and register via WhatsApp. One fee covers Phase 1 and your full programme.',
    url: 'https://e-technix.com/register',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const registerSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'E-Technix Cohort Enrolment',
  description:
    'Register for the next E-Technix cohort. Start with Phase 1, choose a specialisation track, and continue through Project Labs and Career Launch.',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  organizer: {
    '@type': 'EducationalOrganization',
    name: 'E-Technix',
    url: 'https://e-technix.com',
  },
  offers: TRACKS.filter((t) => t.code !== 'DT-101').map((t) => ({
    '@type': 'Offer',
    name: `${t.name} Track`,
    price: String(PRICING[t.code]?.full.NGN ?? ''),
    priceCurrency: 'NGN',
    availability: 'https://schema.org/InStock',
    url: 'https://e-technix.com/register',
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    { '@type': 'ListItem', position: 2, name: 'Register', item: 'https://e-technix.com/register' },
  ],
};

export default function RegisterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(registerSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <RegisterPageClient />
    </>
  );
}

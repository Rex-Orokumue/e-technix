import type { Metadata } from 'next';
import CertificationsPageClient from './_client';
import { TRACKS } from '@/lib/data/curriculum';
import { CERT_NAMES } from '@/lib/data/certs';

const certTracks = TRACKS.filter((t) => t.code !== 'DT-101');

export const metadata: Metadata = {
  title: 'Certifications — Track-Specific Credentials',
  description:
    'E-Technix awards a track-specific certificate for each specialisation and advanced track — from Certified Data Analyst to Certified Machine Learning Engineer. All earned through real capstone projects, not exams.',
  alternates: { canonical: 'https://e-technix.com/certifications' },
  openGraph: {
    title: 'E-Technix Certifications — Earn a Real Credential',
    description:
      'Project-based certificates backed by a UK-Nigeria programme. Prove real, demonstrated skills — not just attendance.',
    url: 'https://e-technix.com/certifications',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const certsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'E-Technix Certifications',
  description: 'Professional certificates awarded on successful completion of each specialisation or advanced track.',
  numberOfItems: certTracks.length,
  itemListElement: certTracks.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'EducationalOccupationalCredential',
      name: CERT_NAMES[t.code] ?? `Certified ${t.name}`,
      description: `Awarded to students who complete the ${t.name} track and prove their skills through a real capstone project.`,
      credentialCategory: 'Certificate',
      recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
      competencyRequired: `Completion of the ${t.name} capstone project`,
    },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    { '@type': 'ListItem', position: 2, name: 'Certifications', item: 'https://e-technix.com/certifications' },
  ],
};

export default function CertificationsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(certsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CertificationsPageClient />
    </>
  );
}

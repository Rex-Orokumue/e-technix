import type { Metadata } from 'next';
import ProgramsPageClient from './_client';
import { TRACKS } from '@/lib/data/curriculum';

export const metadata: Metadata = {
  title: 'Training Tracks & Programmes',
  description:
    'Start with Phase 1 (Foundation), then choose one of eight specialisation tracks — Data Analytics, Web App Development, Mobile & Desktop Apps, AI & Agentic Systems, Product Design, Digital Entrepreneurship, AI Product Management, or Cybersecurity — plus two advanced tracks. Real tools, real projects, real certificate.',
  alternates: { canonical: 'https://e-technix.com/programs' },
  openGraph: {
    title: 'Training Tracks & Programmes | E-Technix',
    description:
      'One foundation, ten ways to specialise. Browse every track and open the full week-by-week curriculum.',
    url: 'https://e-technix.com/programs',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const isoDuration = (d: string) => {
  const m = d.match(/(\d+)\s*weeks/i);
  return m ? `P${m[1]}W` : undefined;
};

const programsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'E-Technix Tracks',
  description: 'The mandatory Phase 1 Foundation plus eight specialisation tracks and two advanced tracks.',
  numberOfItems: TRACKS.length,
  itemListElement: TRACKS.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Course',
      name: t.name,
      description: t.summary,
      provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
      timeRequired: isoDuration(t.duration),
      educationalLevel: t.isAdvanced ? 'Advanced' : 'Beginner to Intermediate',
      teaches: t.outcomes,
      coursePrerequisites: t.prerequisite,
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', inLanguage: 'en' },
    },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    { '@type': 'ListItem', position: 2, name: 'Training Tracks', item: 'https://e-technix.com/programs' },
  ],
};

export default function ProgramsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(programsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProgramsPageClient />
    </>
  );
}

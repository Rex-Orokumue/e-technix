import type { Metadata } from 'next';
import AboutPageClient from './_client';

export const metadata: Metadata = {
  title: 'About E-Technix',
  description:
    'E-Technix is a UK-Nigeria digital skills training programme led by Okeoma Ihunwo (20+ years in software engineering, UK) and Rex Orokumue (full-stack developer & lead instructor, Nigeria). We build careers through real training.',
  alternates: { canonical: 'https://e-technix.com/about' },
  openGraph: {
    title: 'About E-Technix — Our Mission & Team',
    description:
      'Meet the team behind E-Technix — a UK-Nigeria programme built by working engineers and developers who train the next generation of digital professionals.',
    url: 'https://e-technix.com/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const aboutSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://e-technix.com/#organization',
      name: 'E-Technix',
      url: 'https://e-technix.com',
      description:
        'A structured 6–9 month digital skills training programme built by a UK-Nigeria team of engineers, data analysts, and tech professionals.',
      foundingLocation: { '@type': 'Place', name: 'Nigeria and United Kingdom' },
      member: [
        {
          '@type': 'Person',
          name: 'Okeoma Ihunwo',
          jobTitle: 'Programme Director',
          description:
            'Software Engineer and Data Analyst with over 20 years of cross-functional experience in the IT sector. Based in the UK, specialising in cloud computing, software development, and data analytics.',
          knowsAbout: ['Cloud Computing', 'Software Engineering', 'Data Analytics', 'Agile', 'DevOps'],
          sameAs: 'https://www.linkedin.com/in/okeoma-ihunwo-b69b3664/',
        },
        {
          '@type': 'Person',
          name: 'Rex Orokumue',
          jobTitle: 'Lead Instructor',
          description:
            'Full-stack developer and Lead Instructor at E-Technix, based in Nigeria. Builder of production-grade web and mobile applications. Specialist in Next.js, Flutter, and AI systems.',
          knowsAbout: ['Web Development', 'Mobile App Development', 'Next.js', 'Flutter', 'AI Systems'],
          sameAs: 'https://www.linkedin.com/in/rexorokumue/',
        },
      ],
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://e-technix.com/about' },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AboutPageClient />
    </>
  );
}

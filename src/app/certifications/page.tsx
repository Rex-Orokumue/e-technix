import type { Metadata } from 'next';
import CertificationsPageClient from './_client';

export const metadata: Metadata = {
  title: 'Certifications — Six Industry-Relevant Credentials',
  description:
    'E-Technix awards six track-specific certificates: Certified Data Analyst, Certified Web Developer, Certified Mobile App Developer, Certified AI Systems Builder, Certified UX/UI Designer, and Certified Business Development Specialist. All earned through real capstone projects.',
  alternates: { canonical: 'https://e-technix.com/certifications' },
  openGraph: {
    title: 'E-Technix Certifications — Earn a Real Credential',
    description:
      'Six project-based certificates backed by a UK-Nigeria programme. Prove real, demonstrated skills — not just attendance.',
    url: 'https://e-technix.com/certifications',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const certsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'E-Technix Certifications',
  description: 'Six professional certificates awarded on successful completion of each specialisation track.',
  numberOfItems: 6,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Certified Data Analyst',
        description: 'Awarded to students who complete the Data Analytics track and demonstrate the ability to clean, analyse, and visualise real business data using Excel, SQL, Python, Power BI, and Tableau.',
        credentialCategory: 'Certificate',
        recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        competencyRequired: 'Completion of Data Analytics capstone project',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Certified Web Developer',
        description: 'Awarded on successful deployment of a full-stack web application with authentication, a database, and a live URL.',
        credentialCategory: 'Certificate',
        recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        competencyRequired: 'Completion of Web App Development capstone project',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Certified Mobile App Developer',
        description: 'Awarded on successful publication of a cross-platform mobile app with a live backend, authentication, and real data.',
        credentialCategory: 'Certificate',
        recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        competencyRequired: 'Completion of Mobile & Desktop Apps capstone project',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Certified AI Systems Builder',
        description: 'Awarded on building and deploying a fully functional AI agent that solves a real business problem end-to-end.',
        credentialCategory: 'Certificate',
        recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        competencyRequired: 'Completion of AI & Agentic Systems capstone project',
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Certified UX/UI Designer',
        description: 'Awarded on delivery of a complete product design from user research to high-fidelity prototype ready for developer handoff.',
        credentialCategory: 'Certificate',
        recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        competencyRequired: 'Completion of Product Design (UI/UX) capstone project',
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: 'Certified Business Development Specialist',
        description: 'Awarded on successful launch of a go-to-market campaign or small business with measurable results.',
        credentialCategory: 'Certificate',
        recognizedBy: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        competencyRequired: 'Completion of Business Development capstone project',
      },
    },
  ],
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

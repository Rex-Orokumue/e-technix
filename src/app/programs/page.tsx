import type { Metadata } from 'next';
import ProgramsPageClient from './_client';

export const metadata: Metadata = {
  title: 'Training Tracks & Programmes',
  description:
    'Six specialisation tracks — Data Analytics, Web App Development, Mobile & Desktop Apps, AI & Agentic Systems, Product Design (UI/UX), and Business Development. 3 months deep, real tools, real projects, real certificate.',
  alternates: { canonical: 'https://e-technix.com/programs' },
  openGraph: {
    title: 'Training Tracks & Programmes | E-Technix',
    description:
      'Choose your track: Data Analytics, Web Development, Mobile Apps, AI Systems, UI/UX Design, or Business Development. 3 months of deep, structured training.',
    url: 'https://e-technix.com/programs',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const programsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'E-Technix Specialisation Tracks',
  description: 'Six career-focused specialisation tracks available after the 2-month Foundation phase.',
  numberOfItems: 6,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Course',
        name: 'Data Analytics',
        description: 'Learn to collect, clean, analyse, and visualise data using Excel, SQL, Python, Power BI, and Tableau. Earn the Certified Data Analyst credential.',
        provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        timeRequired: 'P3M',
        educationalLevel: 'Beginner to Intermediate',
        teaches: ['Data cleaning', 'SQL', 'Python for data', 'Power BI', 'Tableau', 'Business intelligence'],
        coursePrerequisites: 'E-Technix Foundation Phase (Month 1–2)',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Course',
        name: 'Web App Development',
        description: 'Build full-stack web applications using React, Next.js, Node.js, and PostgreSQL. Earn the Certified Web Developer credential.',
        provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        timeRequired: 'P3M',
        educationalLevel: 'Beginner to Intermediate',
        teaches: ['HTML/CSS/JavaScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Deployment'],
        coursePrerequisites: 'E-Technix Foundation Phase (Month 1–2)',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Course',
        name: 'Mobile & Desktop Apps',
        description: 'Create cross-platform apps for Android, iOS, and Windows using Flutter, Dart, Firebase, and Supabase. Earn the Certified Mobile App Developer credential.',
        provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        timeRequired: 'P3M',
        educationalLevel: 'Beginner to Intermediate',
        teaches: ['Flutter', 'Dart', 'Firebase', 'Supabase', 'Mobile UI', 'App publishing'],
        coursePrerequisites: 'E-Technix Foundation Phase (Month 1–2)',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Course',
        name: 'AI & Agentic Systems',
        description: 'Build AI-powered tools, automation workflows, and intelligent agents using Python, LangChain, and CrewAI. Earn the Certified AI Systems Builder credential.',
        provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        timeRequired: 'P3M',
        educationalLevel: 'Intermediate',
        teaches: ['AI fundamentals', 'Prompt engineering', 'LangChain', 'CrewAI', 'RAG', 'Python for AI'],
        coursePrerequisites: 'E-Technix Foundation Phase (Month 1–2)',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'Course',
        name: 'Product Design (UI/UX)',
        description: 'Design digital products from user research to high-fidelity prototype using Figma and Adobe XD. Earn the Certified UX/UI Designer credential.',
        provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        timeRequired: 'P3M',
        educationalLevel: 'Beginner to Intermediate',
        teaches: ['UX research', 'Wireframing', 'Figma', 'Design systems', 'Usability testing', 'Product thinking'],
        coursePrerequisites: 'E-Technix Foundation Phase (Month 1–2)',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'Course',
        name: 'Business Development',
        description: 'Learn to build, grow, and scale businesses using CRM, funnels, and growth strategy. Earn the Certified Business Development Specialist credential.',
        provider: { '@type': 'Organization', name: 'E-Technix', sameAs: 'https://e-technix.com' },
        timeRequired: 'P3M',
        educationalLevel: 'Beginner to Intermediate',
        teaches: ['Market research', 'Sales systems', 'Customer acquisition', 'Growth hacking', 'Digital marketing'],
        coursePrerequisites: 'E-Technix Foundation Phase (Month 1–2)',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          inLanguage: 'en',
        },
      },
    },
  ],
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

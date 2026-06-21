import type { Metadata } from 'next';
import HowItWorksPageClient from './_client';

export const metadata: Metadata = {
  title: 'How It Works — The 4-Phase Journey',
  description:
    'E-Technix runs in 4 phases: Month 1–2 Digital & Business Foundations (everyone), Month 3–5 Specialisation Track, Month 6–8 Real Project Labs, Month 9 Career Launch. No shortcuts, no fluff.',
  alternates: { canonical: 'https://e-technix.com/how-it-works' },
  openGraph: {
    title: 'How E-Technix Works — 4-Phase Programme',
    description:
      'Foundation → Specialisation → Project Labs → Career Launch. A clear 6–9 month path from beginner to career-ready.',
    url: 'https://e-technix.com/how-it-works',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const howItWorksSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'E-Technix Digital Skills Training Programme',
  description:
    'A structured 6–9 month programme with 4 phases: Digital & Business Foundations, Specialisation Track, Real Project Labs, and Career Launch.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'E-Technix',
    sameAs: 'https://e-technix.com',
  },
  timeRequired: 'P9M',
  educationalLevel: 'Beginner to Advanced',
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    inLanguage: 'en',
  },
  about: [
    { '@type': 'Thing', name: 'Digital Literacy' },
    { '@type': 'Thing', name: 'Data Analytics' },
    { '@type': 'Thing', name: 'Web Development' },
    { '@type': 'Thing', name: 'Mobile App Development' },
    { '@type': 'Thing', name: 'AI Systems' },
    { '@type': 'Thing', name: 'Product Design' },
    { '@type': 'Thing', name: 'Digital Entrepreneurship' },
    { '@type': 'Thing', name: 'AI Product Management' },
    { '@type': 'Thing', name: 'Cybersecurity' },
    { '@type': 'Thing', name: 'Career Preparation' },
  ],
  syllabusSections: [
    {
      '@type': 'Syllabus',
      name: 'Phase 1 — Digital & Business Foundations',
      description: 'Month 1–2: Mandatory for all students. Digital literacy, problem solving, business fundamentals, communication, and AI productivity.',
    },
    {
      '@type': 'Syllabus',
      name: 'Phase 2 — Specialisation Track',
      description: 'Month 3–5: Score at least 60% in Phase 1, then choose one of eight specialisation tracks — Data Analytics, Web App Development, Mobile & Desktop Apps, AI & Agentic Systems, Product Design, Digital Entrepreneurship, AI Product Management, or Cybersecurity. Two advanced tracks are also available.',
    },
    {
      '@type': 'Syllabus',
      name: 'Phase 3 — Real Project Labs',
      description: 'Month 6–8: Cross-functional teams build real products — fintech apps, SaaS dashboards, AI tools, data pipelines, and more.',
    },
    {
      '@type': 'Syllabus',
      name: 'Phase 4 — Career Launch',
      description: 'Month 9: Employment, freelancing, or startup path preparation. CV, portfolio, LinkedIn, mock interviews, and certificate.',
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Complete the E-Technix Programme',
  description: 'A step-by-step guide through the 4-phase E-Technix digital skills training programme.',
  totalTime: 'P9M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Phase 1 — Digital & Business Foundations (Month 1–2)',
      text: 'All students begin with a 2-month mandatory foundation phase covering digital literacy, problem solving, business fundamentals, communication, and AI productivity tools. This phase ensures every student enters their specialisation with the mindset and tools needed to succeed.',
      url: 'https://e-technix.com/how-it-works#phase-1',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Phase 2 — Specialisation Track (Month 3–5)',
      text: 'After scoring at least 60% in Phase 1, students choose one of eight specialisation tracks: Data Analytics, Web App Development, Mobile & Desktop Apps, AI & Agentic Systems, Product Design, Digital Entrepreneurship, AI Product Management, or Cybersecurity. Two advanced tracks (Data Engineering, Machine Learning) are also available by application. Twelve weeks of deep, guided learning with real tools and hands-on projects.',
      url: 'https://e-technix.com/how-it-works#phase-2',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Phase 3 — Real Project Labs (Month 6–8)',
      text: 'Students form cross-functional teams and build real products — fintech apps, SaaS dashboards, AI tools, data pipelines, and more. Teams follow a real product development process with defined roles, sprints, and demos.',
      url: 'https://e-technix.com/how-it-works#phase-3',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Phase 4 — Career Launch (Month 9)',
      text: 'The final phase prepares graduates for one of three paths: employment (CV, LinkedIn, GitHub, mock interviews), freelancing (Upwork, Fiverr, client acquisition), or startup (MVP, pitch deck, fundraising). Every graduate receives a track-specific certificate.',
      url: 'https://e-technix.com/how-it-works#phase-4',
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    { '@type': 'ListItem', position: 2, name: 'How It Works', item: 'https://e-technix.com/how-it-works' },
  ],
};

export default function HowItWorksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <HowItWorksPageClient />
    </>
  );
}

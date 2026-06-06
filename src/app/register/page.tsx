import type { Metadata } from 'next';
import RegisterPageClient from './_client';

export const metadata: Metadata = {
  title: 'Register — Secure Your Spot',
  description:
    'Register for E-Technix. Choose your track — Data Analytics, Web Development, Mobile Apps, AI Systems, UI/UX Design, or Business Development. 3 tracks currently FREE. Full payment or instalments available.',
  alternates: { canonical: 'https://e-technix.com/register' },
  openGraph: {
    title: 'Register for E-Technix — Secure Your Spot',
    description:
      '3 tracks completely FREE for a limited time. Choose your path, fill in your details, and register via WhatsApp.',
    url: 'https://e-technix.com/register',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const registerSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'E-Technix Cohort Enrolment',
  description:
    'Register for the next E-Technix cohort. Choose from 6 specialisation tracks and secure your place in the programme.',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  organizer: {
    '@type': 'EducationalOrganization',
    name: 'E-Technix',
    url: 'https://e-technix.com',
  },
  offers: [
    { '@type': 'Offer', name: 'Data Analytics Track',         price: '90000',  priceCurrency: 'NGN', availability: 'https://schema.org/InStock', url: 'https://e-technix.com/register' },
    { '@type': 'Offer', name: 'Web App Development Track',    price: '115000', priceCurrency: 'NGN', availability: 'https://schema.org/InStock', url: 'https://e-technix.com/register' },
    { '@type': 'Offer', name: 'Mobile & Desktop Apps Track',  price: '115000', priceCurrency: 'NGN', availability: 'https://schema.org/InStock', url: 'https://e-technix.com/register' },
    { '@type': 'Offer', name: 'AI & Agentic Systems Track',   price: '150000', priceCurrency: 'NGN', availability: 'https://schema.org/InStock', url: 'https://e-technix.com/register' },
    { '@type': 'Offer', name: 'Product Design (UI/UX) Track', price: '90000',  priceCurrency: 'NGN', availability: 'https://schema.org/InStock', url: 'https://e-technix.com/register' },
    { '@type': 'Offer', name: 'Business Development Track',   price: '90000',  priceCurrency: 'NGN', availability: 'https://schema.org/InStock', url: 'https://e-technix.com/register' },
  ],
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

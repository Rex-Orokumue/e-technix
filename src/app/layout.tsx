import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const SITE_URL = 'https://e-technix.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'E-Technix — Build Your Digital Career',
    template: '%s | E-Technix',
  },
  description:
    'E-Technix is a structured 6–9 month digital skills training programme covering Data Analytics, Web & Mobile Development, AI & Agentic Systems, Product Design, Digital Entrepreneurship, AI Product Management, and Cybersecurity. Nigeria × UK.',
  keywords: [
    'digital skills training Nigeria',
    'tech training programme Nigeria',
    'data analytics course Nigeria',
    'web development training Nigeria',
    'AI training Nigeria',
    'mobile app development course',
    'UI UX design training',
    'digital entrepreneurship course',
    'AI product management course',
    'cybersecurity training Nigeria',
    'online tech course UK Nigeria',
    'e-technix',
    'tech bootcamp Nigeria',
    'digital career Nigeria',
    'learn to code Nigeria',
    'data analyst course online',
  ],
  authors: [
    { name: 'E-Technix', url: SITE_URL },
  ],
  creator: 'E-Technix',
  publisher: 'E-Technix',
  category: 'Education',
  classification: 'Education, Technology, Training',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32x32.png',
  },
  openGraph: {
    title: 'E-Technix — Build Your Digital Career',
    description:
      'From foundations to future-ready. A structured 6–9 month digital skills training programme — Nigeria × UK.',
    url: SITE_URL,
    siteName: 'E-Technix',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'E-Technix — Build Your Digital Career',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Technix — Build Your Digital Career',
    description: 'From foundations to future-ready. A structured digital skills training programme — Nigeria × UK.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add your Google Search Console verification token here when you get it:
    // google: 'YOUR_VERIFICATION_TOKEN',
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: 'E-Technix',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/icon.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og-image.png`,
  description:
    'E-Technix is a structured 6–9 month digital skills training programme covering Data Analytics, Web & Mobile Development, AI & Agentic Systems, Product Design, Digital Entrepreneurship, AI Product Management, and Cybersecurity. Nigeria × UK.',
  foundingLocation: {
    '@type': 'Place',
    name: 'Nigeria and United Kingdom',
  },
  areaServed: [
    { '@type': 'Country', name: 'Nigeria' },
    { '@type': 'Country', name: 'United Kingdom' },
  ],
  knowsAbout: [
    'Data Analytics', 'Web Development', 'Mobile App Development',
    'Artificial Intelligence', 'Product Design', 'Digital Entrepreneurship',
    'AI Product Management', 'Cybersecurity', 'Data Engineering', 'Machine Learning',
    'Digital Skills Training', 'Tech Education',
  ],
  sameAs: [
    'https://www.linkedin.com/company/e-technix',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'admissions',
    availableLanguage: 'English',
    contactOption: 'TollFree',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'E-Technix',
  url: SITE_URL,
  description: 'Digital skills training programme — Nigeria × UK',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?s={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <meta name="theme-color" content="#070D1A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="e-technix" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([orgSchema, websiteSchema]) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

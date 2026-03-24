import type { Metadata } from 'next';
import './globals.css';

// Centralise your site URL — change it in one place, not scattered everywhere
const SITE_URL = 'https://e-technix.com';

export const metadata: Metadata = {
  title: {
    // `template` lets child pages write just their own title,
    // and Next.js automatically appends " | E-Technix" for you
    default: 'E-Technix — Build Your Digital Career',
    template: '%s | E-Technix',
  },
  description:
    'A structured 6–9 month training programme covering Digital Foundations, Data Analytics, Web Development, Mobile Apps, AI Systems, Product Design, and Business Growth. Nigeria × UK.',
  keywords: [
    'digital skills training',
    'tech training Nigeria',
    'data analytics course',
    'web development training',
    'AI training',
    'e-technix',
  ],
  // metadataBase prevents Next.js from warning about relative OG URLs
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'E-Technix — Build Your Digital Career',
    description:
      'From foundations to future-ready. A structured digital skills training programme.',
    url: SITE_URL,
    siteName: 'E-Technix',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
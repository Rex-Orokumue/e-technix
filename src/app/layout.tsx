import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-Technix — Build Your Digital Career',
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
  openGraph: {
    title: 'E-Technix — Build Your Digital Career',
    description:
      'From foundations to future-ready. A structured digital skills training programme.',
    url: 'https://e-technix.com',
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
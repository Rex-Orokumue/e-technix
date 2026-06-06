import type { Metadata } from 'next';
import FAQPageClient from './_client';

export const metadata: Metadata = {
  title: 'FAQs — Common Questions Answered',
  description:
    'Answers to every question about E-Technix — prior experience needed, online vs in-person, payment plans, track selection, certificates, job placement, and more.',
  alternates: { canonical: 'https://e-technix.com/faq' },
  openGraph: {
    title: 'FAQs | E-Technix',
    description: 'Everything you need to know before you enrol in E-Technix.',
    url: 'https://e-technix.com/faq',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need any prior experience to join E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The programme starts with a 2-month Foundation phase that everyone takes — regardless of their background. It is designed to take complete beginners to a level where they can confidently enter a specialisation track. If you have prior experience, the foundation phase will sharpen your professional and business thinking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the E-Technix programme online or in-person?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The programme is fully online, so you can join from anywhere in Nigeria, the UK, or anywhere else in the world. Sessions are live with recordings available so you never miss anything.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many hours per week does E-Technix require?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Plan for approximately 10–15 hours per week — a mix of live sessions, self-paced learning, and project work. This is a serious programme, not a passive course. The more you put in, the more you get out.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long is the full E-Technix programme?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The full programme runs 6–9 months. Month 1–2 is the Foundation phase (mandatory for all students), Month 3–5 is your Specialisation Track, Month 6–8 is the Real Project Labs, and Month 9 is Career Launch preparation.',
      },
    },
    {
      '@type': 'Question',
      name: 'When does the next E-Technix cohort start?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We run cohorts periodically throughout the year. The best way to secure your spot is to register now — we will confirm your start date via WhatsApp after payment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch tracks after I start at E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can switch tracks before the Specialisation phase begins (i.e. during Month 1–2). Once you begin Month 3, we ask that you commit to your chosen track to get the full depth of the programme.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I take more than one track at E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not simultaneously. Each track is designed to take you deep rather than wide. However, graduates who want to learn a second track after completing the programme can re-enrol at a discounted rate.',
      },
    },
    {
      '@type': 'Question',
      name: 'What tools and software will I need for E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You will need a laptop (Windows, Mac, or Linux) with a reliable internet connection. All the software and tools used in the programme are either free or have free tiers — you will not need to purchase any paid tools during your training.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the projects at E-Technix real or just exercises?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Real. In the Project Labs phase, teams build actual products — fintech apps, SaaS dashboards, AI tools, data pipelines, and more. These are products you can put in your portfolio and show to employers or clients.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods does E-Technix accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept card payments (debit/credit), bank transfers, and USSD via Paystack. For students in the UK, you can also reach out via WhatsApp to arrange a manual bank transfer in GBP.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the instalment payment work at E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You pay the first instalment upfront when you register. The second instalment is due at the beginning of Month 3 when you enter your Specialisation Track. If the second payment is not made on time, access to the track may be paused until it is settled.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a money-back guarantee for E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. If you enrol and decide within 7 days that the programme is not right for you, we will issue a full refund — no questions asked. After 7 days, payments are non-refundable, but you can defer your enrolment to the next cohort.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are there any hidden fees or additional costs at E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The programme fee covers everything — curriculum, live sessions, recordings, mentor access, project labs, career preparation, and your certificate. There are no surprise charges.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does E-Technix offer scholarships or discounts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We occasionally offer early-bird discounts for the first few spots in each cohort. We also have a referral programme — refer a friend who enrols and get a discount on your own fee. Message us on WhatsApp for the latest offers.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certificate will I receive from E-Technix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every graduate receives a track-specific certificate — for example, "Certified Data Analyst" or "Certified Web Developer". Certificates are issued on completion of your Capstone project, which proves you have the skills, not just the attendance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will the E-Technix certificate be recognised by employers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our certificate is backed by a UK-Nigeria programme, which gives it credibility in both markets. More importantly, your portfolio of real projects will be far more valuable to employers than any certificate — and that is exactly what we help you build.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens after the E-Technix programme ends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You leave with a certificate, a project portfolio, and a career plan tailored to one of three paths — employment, freelancing, or starting your own business. We give you the tools for all three and help you execute the one that fits your goal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does E-Technix help with job placement?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We do not guarantee job placement, but we actively prepare you for it — CV building, GitHub optimisation, LinkedIn setup, mock interviews, and connections to our employer and client network. Your outcome depends on the effort you put in.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://e-technix.com' },
    { '@type': 'ListItem', position: 2, name: 'FAQs', item: 'https://e-technix.com/faq' },
  ],
};

/**
 * AEO: Server-rendered Q&A text — always in the HTML, always crawlable by AI engines
 * even if they don't execute JavaScript. Visually understated so it doesn't clash
 * with the interactive accordion below it.
 */
function ServerFAQs() {
  const allQAs = faqSchema.mainEntity;
  return (
    <div
      aria-label="Frequently asked questions about E-Technix"
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '0 2.5rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {allQAs.map((item, i) => (
        <div
          key={i}
          itemScope
          itemType="https://schema.org/Question"
          style={{
            borderBottom: '1px solid var(--border)',
            padding: '1.5rem 0',
          }}
        >
          <h3
            itemProp="name"
            style={{
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text)',
              marginBottom: '0.6rem',
            }}
          >
            {item.name}
          </h3>
          <div
            itemScope
            itemType="https://schema.org/Answer"
            itemProp="acceptedAnswer"
          >
            <p
              itemProp="text"
              style={{
                fontSize: '0.9rem',
                color: 'var(--muted)',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {item.acceptedAnswer.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/*
        AEO: The server-rendered Q&As below are ALWAYS in the HTML.
        The interactive accordion in FAQPageClient is JS-rendered on top of this.
        Both coexist — crawlers get the text, users get the interactive version.
      */}
      <FAQPageClient />
      <ServerFAQs />
    </>
  );
}

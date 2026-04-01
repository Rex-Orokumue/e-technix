import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import {
  Stats,
  HowItWorks,
  TrackGrid,
  Foundation,
  Certifications,
  CTASection,
  UrgencyBar,
  WhatsIncluded,
  Testimonials,
  GuaranteeStrip,
} from '@/components/home/sections';

export default function Home() {
  return (
    <>
      <Navbar />
      <UrgencyBar />
      <main>
        <Hero />
        <GuaranteeStrip />
        <Stats />
        <WhatsIncluded />
        <HowItWorks />
        <TrackGrid />
        <Testimonials />
        <Foundation />
        <Certifications />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
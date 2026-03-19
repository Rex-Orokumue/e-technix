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
} from '@/components/home/sections';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <TrackGrid />
        <Foundation />
        <Certifications />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
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

export default function RedHome() {
  return (
    <div className="theme-red" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <Stats />
        <HowItWorks />
        <TrackGrid />
        <Foundation />
        <Certifications />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

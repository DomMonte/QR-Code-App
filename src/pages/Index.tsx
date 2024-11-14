import { CTA } from '@/templates/CTA';
import { FAQ } from '@/templates/FAQ';
import { Features } from '@/templates/Features';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';

const IndexPage = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <Navbar />
      </div>
      <div className="pt-20">
        <Hero />
        <div id="features"><Features /></div>
        <div id="pricing"><Pricing /></div>
        <div id="faq"><FAQ /></div>
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default IndexPage;
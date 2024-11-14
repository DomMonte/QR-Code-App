import React from 'react';
import { InstagramLogoIcon } from '@radix-ui/react-icons';
import { badgeVariants } from '@/components/ui/badgeVariants';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';

export const Hero = () => {
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        // style={{
        //   backgroundImage: `url('https://images.unsplash.com/photo-1481653125770-b78c206c59d4?auto=format&fit=crop&q=80')`,
        //   opacity: 0.7
        // }}
      />
      <Section className="relative z-10 py-36">
        <CenteredHero
          banner={(
            <a
              className={badgeVariants()}
              href="https://instagram.com/capturethemoment_adl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramLogoIcon className="mr-1 size-5" />
              {' '}
              Follow @capturethemoment_adl on Instagram
            </a>
          )}
          title={
            <>
              Share Your Event Photos{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Instantly
              </span>
            </>
          }
          description="Create beautiful photo albums for your events and share them instantly with guests using QR codes. Perfect for weddings, parties, and corporate events."
          buttons={(
            <>
              <a
                className={buttonVariants({ size: 'lg' })}
                href="#pricing"
                onClick={scrollToPricing}
              >
                Get Started
              </a>
            </>
          )}
        />
      </Section>
    </div>
  );
};

export default Hero;
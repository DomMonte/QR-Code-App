import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Features = () => {
  const features = [
    {
      title: "Instant Sharing",
      description: "Share your moments in real-time with instant photo uploads and QR code generation for easy access."
    },
    {
      title: "Cloud Storage",
      description: "Never lose a moment with secure cloud backup and unlimited photo storage for all your memories."
    },
    {
      title: "Collaborative Capture",
      description: "Enable guests to upload their photos, creating a shared collection of memories from every perspective."
    },
    {
      title: "High Resolution",
      description: "Download your photos in full high-resolution quality, preserving every detail of your special moments."
    },
    {
      title: "Mobile Experience",
      description: "Access and manage your photos anywhere with our intuitive mobile-friendly interface."
    },
    {
      title: "Extended Access",
      description: "Enjoy 6 months of unlimited access to your photos, with flexible options to extend your storage."
    }
  ];

  return (
    <Background>
      <Section
        subtitle="Everything you need"
        title="Capture Every Moment"
        description="Professional-grade photo management with features designed for seamless sharing and storage."
      >
        <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 8.5c0-.828-.672-1.5-1.5-1.5h-2.5L16.5 4H7.5L6 7H3.5C2.672 7 2 7.672 2 8.5v11c0 .828.672 1.5 1.5 1.5h17c.828 0 1.5-.672 1.5-1.5v-11Z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
              title={feature.title}
            >
              {feature.description}
            </FeatureCard>
          ))}
        </div>
      </Section>
    </Background>
  );
};
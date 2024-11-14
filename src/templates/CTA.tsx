import { buttonVariants } from '@/components/ui/buttonVariants';
import { CTABanner } from '@/features/landing/CTABanner';
import { Section } from '@/features/landing/Section';
import { CameraIcon } from '@radix-ui/react-icons';

export const CTA = () => {

  return (
    <Section>
      <CTABanner
        title="Are you ready?"
        description="It's time to take your event to the next level."
        buttons={(
          <a
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
            href="https://capturethemoment.au"
          >
            <CameraIcon className="mr-2 size-5" />
            {"Capture YOUR Moment"}
          </a>
        )}
      />
    </Section>
  );
};

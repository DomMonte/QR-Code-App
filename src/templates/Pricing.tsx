import { buttonVariants } from '@/components/ui/buttonVariants';
import { Link } from 'react-router-dom';
import { PricingInformation } from '@/features/billing/PricingInformation';
import { Section } from '@/features/landing/Section';
import { PLAN_ID } from '@/utils/AppConfig';

export const Pricing = () => {
  const sharedButtonProps = {
    className: buttonVariants({
      size: 'sm',
      className: 'mt-5 w-full',
    })
  };

  return (
    <Section
      id="pricingsection"
      subtitle="Simple, transparent pricing"
      title="Choose Your Plan"
      description="Get started with our flexible pricing options. No hidden fees, No subscriptions. Just pay for what you want."
    >
      <PricingInformation
        buttonList={{
          [PLAN_ID.BASIC]: (
            <Link
              {...sharedButtonProps}
              to="/sign-up"
            >
              Get Started
            </Link>
          ),
          [PLAN_ID.PARTY]: (
            <Link
              {...sharedButtonProps}
              to="/sign-up"
            >
              Get Started
            </Link>
          ),
          [PLAN_ID.PROJECTX]: (
            <Link
              {...sharedButtonProps}
              to="/sign-up"
            >
              Get Started
            </Link>
          ),
        }}
      />
    </Section>
  );
};
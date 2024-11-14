import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';
import { PricingPlanList } from '@/utils/AppConfig';

export const PricingInformation = (props: {
  buttonList: Record<string, React.ReactNode>;
}) => {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3">
      {Object.values(PricingPlanList).map(plan => (
        <PricingCard
          key={plan.id}
          planId={plan.id}
          price={plan.price}
          interval={plan.interval}
          button={props.buttonList[plan.id]}
        >
          <PricingFeature>
            {`${plan.features.photo} photo limit`}
          </PricingFeature>

          <PricingFeature>
            {`Up to ${plan.features.admin} event admin/s`}
          </PricingFeature>

          <PricingFeature>
            {`${plan.features.storage}GB of storage`}
          </PricingFeature>

          <PricingFeature>
            {`Media held for ${plan.features.month} months`}
          </PricingFeature>

          <PricingFeature>
          {`${plan.features.desc}`}
          </PricingFeature>
        </PricingCard>
      ))}
    </div>
  );
};
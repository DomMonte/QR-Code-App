import React from 'react';
import type { BillingInterval } from '@/types/Subscription';

const getPlanName = (planId: string) => {
  const names = {
    basic: 'Basic',
    party: 'Party',
    projectx: 'Project X'
  };
  return names[planId as keyof typeof names] || planId;
};

const getPlanDescription = (planId: string) => {
  const descriptions = {
    Basic: 'Perfect for small events and personal use',
    Party: 'Ideal for large events and weddings',
    'Project X': 'We don\'t know what you\'re doing.'
  };
  return descriptions[planId as keyof typeof descriptions] || '';
};

const getIntervalText = (interval: BillingInterval) => {
  const intervals: Record<BillingInterval, string> = {
    "Once Off": "Once Off"
  };
  return intervals[interval];
};

export const PricingCard = (props: {
  planId: string;
  price: number;
  interval: BillingInterval;
  button: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-xl border border-border px-6 py-8 text-center">
      <div className="text-lg font-semibold">
        {getPlanName(props.planId)}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="text-5xl font-bold">
          ${props.price}
        </div>

        <div className="ml-1 text-muted-foreground">
          / {getIntervalText(props.interval)}
        </div>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {getPlanDescription(props.planId)}
      </div>

      {props.button}

      <ul className="mt-8 space-y-3">{props.children}</ul>
    </div>
  );
};
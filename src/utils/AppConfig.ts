import { BILLING_INTERVAL, type PricingPlan } from '@/types/Subscription';


// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'SnapShare QR'
};


export const PLAN_ID = {
  BASIC: 'Basic',
  PARTY: 'Party',
  PROJECTX: 'Project X',
} as const;

export const PricingPlanList: Record<string, PricingPlan> = {
  [PLAN_ID.BASIC]: {
    id: PLAN_ID.BASIC,
    price: 109,
    interval: BILLING_INTERVAL.ONCEOFF,
    testPriceId: '',
    devPriceId: '',
    prodPriceId: '',
    features: {
      photo: "150",
      admin: 1,
      storage: 5,
      month: 3,
      desc: "SD Photo Storage",
    },
  },
  [PLAN_ID.PARTY]: {
    id: PLAN_ID.PARTY,
    price: 149,
    interval: BILLING_INTERVAL.ONCEOFF,
    testPriceId: 'price_premium_test', // Use for testing
    // FIXME: Update the price ID, you can create it after running `npm run stripe:setup-price`
    devPriceId: 'price_1PNksvKOp3DEwzQlGOXO7YBK',
    prodPriceId: '',
    features: {
      photo: "500",
      admin: 5,
      storage: 10,
      month: 6,
      desc: "HD Photo Storage",
    },
  },
  [PLAN_ID.PROJECTX]: {
    id: PLAN_ID.PROJECTX,
    price: 249,
    interval: BILLING_INTERVAL.ONCEOFF,
    testPriceId: 'price_enterprise_test', // Use for testing
    // FIXME: Update the price ID, you can create it after running `npm run stripe:setup-price`
    devPriceId: 'price_1PNksvKOp3DEwzQli9IvXzgb',
    prodPriceId: 'price_123',
    features: {
      photo: "Unlimited",
      admin: 100,
      storage: 100,
      month: 12,
      desc: "HD Photo + Video Storage",
    },
  },
};

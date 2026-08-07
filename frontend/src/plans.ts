import { PlanDetails, TierType } from './types';

export const PLANS: Record<TierType, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceMonthly: 0,
    includedLookups: 500,
    includedLookupsLabel: '500 lookups, forever',
    overageRate: 'Included',
    overageRateNum: 0,
    buttonText: 'Start free',
    features: ['500 lifetime lookups', 'CASS deliverability score', 'Tax jurisdiction rates', 'Timezone metadata', 'Community support']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: '$29/mo',
    priceMonthly: 29,
    includedLookups: 10000,
    includedLookupsLabel: '10,000/mo',
    overageRate: '$0.0008/lookup',
    overageRateNum: 0.0008,
    buttonText: 'Choose Starter',
    features: ['10,000 lookups per month', '$0.0008 overage rate', 'CASS deliverability score', 'Tax jurisdiction rates', 'Email support']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '$99/mo',
    priceMonthly: 99,
    includedLookups: 50000,
    includedLookupsLabel: '50,000/mo',
    overageRate: '$0.0007/lookup',
    overageRateNum: 0.0007,
    buttonText: 'Choose Pro',
    badge: 'MOST POPULAR',
    features: ['50,000 lookups per month', '$0.0007 overage rate', 'High priority CDN caching', 'Multiple key rotation', 'Priority support']
  },
  business: {
    id: 'business',
    name: 'Business',
    price: '$299/mo',
    priceMonthly: 299,
    includedLookups: 250000,
    includedLookupsLabel: '250,000/mo',
    overageRate: '$0.0006/lookup',
    overageRateNum: 0.0006,
    buttonText: 'Choose Business',
    features: ['250,000 lookups per month', '$0.0006 overage rate', '99.9% uptime SLA', 'Dedicated account manager', '24/7 incident team']
  },
  enterprise_lite: {
    id: 'enterprise_lite',
    name: 'Enterprise Lite',
    price: '$999/mo',
    priceMonthly: 999,
    includedLookups: 1000000,
    includedLookupsLabel: '1,000,000/mo',
    overageRate: '$0.0005/lookup',
    overageRateNum: 0.0005,
    buttonText: 'Choose Enterprise Lite',
    features: ['1,000,000 lookups per month', '$0.0005 overage rate', '99.99% uptime SLA', 'Custom rate limits', 'Dedicated Slack channel']
  }
};

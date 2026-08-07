export interface User {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  currentPlan: TierType;
  billingCycleEnd: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string; // e.g. ak_live_7x9f2a89c...
  createdAt: string;
  lastUsedAt: string | null;
  requestCount: number;
  status: 'active' | 'revoked';
}

export type TierType = 'free' | 'starter' | 'pro' | 'business' | 'enterprise_lite';

export interface PlanDetails {
  id: TierType;
  name: string;
  price: string;
  priceMonthly: number;
  includedLookups: number;
  includedLookupsLabel: string;
  overageRate: string;
  overageRateNum: number;
  buttonText: string;
  badge?: string;
  features: string[];
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: string;
  planName: string;
  status: 'Paid' | 'Failed' | 'Pending';
  invoiceUrl: string;
}

export interface AddressCoordinates {
  lat: number;
  lng: number;
}

export interface AddressEnrichment {
  formatted_address: string;
  street_number: string;
  street_name: string;
  unit?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  coordinates: AddressCoordinates;
  deliverability: {
    score: number; // e.g. 98.4
    status: 'CASS_CERTIFIED_DELIVERABLE' | 'DELIVERABLE' | 'UNDELIVERABLE_BUILDING' | 'VACANT';
    dpv_match_code: string; // e.g. "Y"
    rdi: 'Residential' | 'Commercial';
  };
  tax_jurisdiction: {
    total_tax_rate: number; // e.g. 0.0825
    state_rate: number;
    county_rate: number;
    city_rate: number;
    special_district_rate: number;
    jurisdiction_name: string;
  };
  timezone: {
    name: string; // e.g. "America/Los_Angeles"
    utc_offset: string; // e.g. "-07:00"
    is_dst: boolean;
  };
}

export interface ApiUsageStats {
  used: number;
  quota: number; // 500 for free, 10000 for starter, etc.
  overageCount: number;
  overageEstimatedCost: number;
  usageHistory: { date: string; count: number }[];
}

export interface ApiErrorResponse {
  error: {
    code: number;
    message: string;
    type: string;
    upgrade_url?: string;
  };
}

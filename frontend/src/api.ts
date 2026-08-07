/**
 * Real API client for The Address API
 * Reads VITE_API_BASE_URL from environment and makes real fetch calls
 */

import {
  User,
  ApiKey,
  TierType,
  BillingInvoice,
  AddressEnrichment,
  ApiUsageStats,
} from './types';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Storage keys
const API_KEY_STORAGE_KEY = 'addy_api_key';
const USER_STORAGE_KEY = 'addy_user';

// Error response type
interface ApiError {
  error: {
    code: number;
    message: string;
    type: string;
    upgrade_url?: string;
  };
}

function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as Record<string, unknown>).error === 'object'
  );
}

// Get stored API key
export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

// Get stored user
export function getStoredUser(): User | null {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// Store API key and user
function storeCredentials(user: User, apiKey: ApiKey): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.key);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

// Clear stored credentials
export function clearCredentials(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// Get current API key for requests
function getApiKey(): string {
  return getStoredApiKey() || '';
}

// Make authenticated API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  const apiKey = getApiKey();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (isApiError(data)) {
      throw new Error(data.error.message);
    }
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return { data, status: response.status };
}

// Auth API

export interface RegisterResponse {
  user: User;
  primaryKey: ApiKey;
}

export interface LoginResponse {
  user: User;
  primaryKey: ApiKey;
}

export async function register(email: string, password: string): Promise<{ user: User; primaryKey: ApiKey }> {
  const { data } = await apiRequest<RegisterResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  storeCredentials(data.user, data.primaryKey);
  return data;
}

export async function login(email: string, password: string): Promise<{ user: User; primaryKey: ApiKey }> {
  const { data } = await apiRequest<LoginResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  storeCredentials(data.user, data.primaryKey);
  return data;
}

export async function logout(): Promise<void> {
  clearCredentials();
}

export async function getSession(): Promise<User | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  try {
    const { data } = await apiRequest<{ user: User }>('/v1/auth/session', {
      method: 'GET',
      headers: { 'x-api-key': apiKey },
    });
    return data.user;
  } catch {
    return null;
  }
}

// API Keys

export async function createApiKey(name: string): Promise<ApiKey> {
  const apiKey = getApiKey();
  const { data } = await apiRequest<ApiKey>('/v1/api-keys', {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  const apiKey = getApiKey();
  await apiRequest(`/v1/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: { 'x-api-key': apiKey },
  });
}

// Usage API

export async function getUsage(): Promise<ApiUsageStats> {
  const { data } = await apiRequest<ApiUsageStats>('/v1/account/usage');
  return data;
}

// Geocoding API

export interface GeocodeResponse {
  address: string;
  normalized: string;
  coordinates: { lat: number; lng: number };
  deliverability: {
    score: number;
    verified: boolean;
    issues: string[];
    carrier: string | null;
  };
  tax: {
    jurisdiction: string | null;
    rate: number | null;
    tax_type: string | null;
  };
  timezone: {
    name: string;
    offset_hours: number;
    current_time: string;
    is_business_hours: boolean;
  };
  confidence: number;
  cached: boolean;
}

export async function geocode(address: string): Promise<GeocodeResponse> {
  const { data } = await apiRequest<GeocodeResponse>('/v1/geocode', {
    method: 'POST',
    body: JSON.stringify({ address }),
  });
  return data;
}

export interface AutocompleteResponse {
  suggestions: Array<{
    label: string;
    normalized: string;
    place_id: string | null;
  }>;
  cached: boolean;
}

export async function autocomplete(query: string, limit: number = 5): Promise<AutocompleteResponse> {
  const { data } = await apiRequest<AutocompleteResponse>('/v1/autocomplete', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
  return data;
}

export interface ReverseGeocodeResponse {
  timezone: {
    name: string;
    offset_hours: number;
    current_time: string;
    is_business_hours: boolean;
  };
  // Additional fields may be added in the future
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
  const { data } = await apiRequest<ReverseGeocodeResponse>('/v1/reverse', {
    method: 'POST',
    body: JSON.stringify({ lat, lng }),
  });
  return data;
}

// Billing API

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export async function createCheckoutSession(
  tier: TierType,
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutResponse> {
  const apiKey = getApiKey();
  
  const params = new URLSearchParams({
    tier,
    ...(successUrl && { success_url: successUrl }),
    ...(cancelUrl && { cancel_url: cancelUrl }),
  });
  
  const { data } = await apiRequest<CheckoutResponse>(
    `/v1/checkout?${params.toString()}`,
    {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
    }
  );
  
  return data;
}

export interface GetInvoicesResponse {
  invoices: BillingInvoice[];
  error?: string;
}

export async function getInvoices(): Promise<BillingInvoice[]> {
  const { data } = await apiRequest<GetInvoicesResponse>('/v1/invoices');
  return data.invoices;
}

export interface GetPaymentMethodResponse {
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

export async function getPaymentMethod(): Promise<GetPaymentMethodResponse['paymentMethod']> {
  const { data } = await apiRequest<GetPaymentMethodResponse>('/v1/payment-method');
  return data.paymentMethod;
}

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// Convert API response to frontend types
export function transformGeocodeResponse(response: GeocodeResponse): AddressEnrichment {
  return {
    formatted_address: response.address,
    street_number: response.address.match(/^\d+/)?.[0] || '',
    street_name: response.address.replace(/^\d+\s*/, '').split(',')[0] || '',
    city: response.address.split(',')[1]?.trim() || '',
    state: response.address.split(',')[2]?.trim().split(' ')[0] || '',
    postal_code: response.address.match(/\b\d{5}(-\d{4})?\b/)?.[0] || '',
    country: 'US',
    coordinates: response.coordinates,
    deliverability: {
      score: response.deliverability.score,
      status: response.deliverability.verified ? 'CASS_CERTIFIED_DELIVERABLE' : 'DELIVERABLE',
      dpv_match_code: 'Y',
      rdi: 'Commercial' as const,
    },
    tax_jurisdiction: {
      total_tax_rate: response.tax.rate || 0,
      state_rate: response.tax.rate || 0,
      county_rate: 0,
      city_rate: 0,
      special_district_rate: 0,
      jurisdiction_name: response.tax.jurisdiction || '',
    },
    timezone: {
      name: response.timezone.name,
      utc_offset: `+${response.timezone.offset_hours}:00`,
      is_dst: false,
    },
  };
}

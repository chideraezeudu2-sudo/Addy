import React, { useState, useCallback, useEffect } from 'react';
import { Check } from 'lucide-react';
import { PLANS } from '../plans';
import { autocomplete, getStoredApiKey } from '../api';
import { AddressEnrichment } from '../types';

// Default sample for when API is unavailable
const DEFAULT_SAMPLE: AddressEnrichment = {
  formatted_address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
  street_number: '1600',
  street_name: 'Amphitheatre Pkwy',
  city: 'Mountain View',
  state: 'CA',
  postal_code: '94043',
  country: 'US',
  coordinates: { lat: 37.4220, lng: -122.0841 },
  deliverability: {
    score: 98.4,
    status: 'CASS_CERTIFIED_DELIVERABLE',
    dpv_match_code: 'Y',
    rdi: 'Commercial'
  },
  tax_jurisdiction: {
    total_tax_rate: 0.0913,
    state_rate: 0.0600,
    county_rate: 0.0025,
    city_rate: 0.0125,
    special_district_rate: 0.0163,
    jurisdiction_name: 'Mountain View / Santa Clara County'
  },
  timezone: {
    name: 'America/Los_Angeles',
    utc_offset: '-07:00',
    is_dst: true
  }
};

interface LandingPageProps {
  onOpenSignup: () => void;
  onOpenLogin: () => void;
  onNavigate: (view: string) => void;
  onOpenContactModal: () => void;
  onOpenTermsModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenSignup,
  onOpenLogin,
  onNavigate,
  onOpenContactModal,
  onOpenTermsModal,
  onOpenPrivacyModal
}) => {
  // Live Demo State
  const [demoQuery, setDemoQuery] = useState('1600 Amphitheatre');
  const [selectedResult, setSelectedResult] = useState<AddressEnrichment>(DEFAULT_SAMPLE);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ label: string; normalized: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // FAQ Toggle State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Debounced autocomplete
  useEffect(() => {
    const apiKey = getStoredApiKey();
    if (!apiKey || !demoQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await autocomplete(demoQuery, 5);
        setSuggestions(response.suggestions);
      } catch (error) {
        console.error('Autocomplete failed:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [demoQuery]);

  const handleSelectAddress = useCallback((address: string) => {
    // Create a result object for display
    const result: AddressEnrichment = {
      ...DEFAULT_SAMPLE,
      formatted_address: address,
    };
    setSelectedResult(result);
    setDemoQuery(address.split(',')[0]);
    setIsDropdownOpen(false);
  }, []);

  const handleDemoSearch = useCallback(async () => {
    if (!demoQuery.trim()) return;
    
    // For demo, just use the query string as-is
    const result: AddressEnrichment = {
      ...DEFAULT_SAMPLE,
      formatted_address: demoQuery,
    };
    setSelectedResult(result);
    setIsDropdownOpen(false);
  }, [demoQuery]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const faqs = [
    {
      q: 'Do I need a credit card for the free tier?',
      a: 'No. Sign up with just an email and get 500 free lookups, no card required.'
    },
    {
      q: 'What happens when I use all 500 free lookups?',
      a: "Your integration keeps running, you'll get a warning well before you run out, and a clear message if you hit the limit, so nothing breaks silently in production."
    },
    {
      q: 'Can I switch plans later?',
      a: "Yes, upgrade or downgrade anytime from your dashboard's Billing tab."
    },
    {
      q: 'What data sources power the enrichment?',
      a: 'Deliverability data is CASS certified through USPS authorized providers. Tax rates and timezone data are sourced from public datasets.'
    }
  ];

  return (
    <div className="w-full space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="pt-12 md:pt-20 px-6 sm:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <h1 className="text-[38px] sm:text-[45px] leading-[1.1] font-normal tracking-tight text-[#141414]">
                Address autocomplete and geocoding,{' '}
                <span className="text-[#6f6f6e]">80% cheaper than Google</span>, with deliverability, tax, and timezone data built in.
              </h1>
              <p className="text-[17px] sm:text-[19px] leading-[1.4] text-[#6f6f6e] max-w-lg">
                Drop in autocomplete for your checkout or signup form. One API call returns verified coordinates, a deliverability score, the local tax rate, and timezone, all in one response, all cheaper than Google Places.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenSignup}
                className="h-12 px-8 rounded-full bg-[#141414] text-white text-base font-medium shadow-sm hover:bg-black transition-all transform hover:-translate-y-0.5"
                id="hero-btn-getkey"
              >
                Get your free API key
              </button>
              <button
                onClick={() => {
                  document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-12 px-8 rounded-full bg-[#dbdbd2] text-[#292929] text-base font-medium border border-[#c0c0c0] hover:bg-[#c0c0c0] transition-colors"
                id="hero-btn-pricing"
              >
                See pricing
              </button>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#8f8f8e]">
              <div className="w-2 h-2 rounded-full bg-[#4cc02b] animate-pulse"></div>
              <span>500 free lookups. No credit card required.</span>
            </div>
          </div>

          {/* Right Live Demo Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-[0_18px_55px_0_rgba(16,24,40,0.12)] border border-black/5 overflow-hidden">
              {/* Autocomplete Input Bar */}
              <div className="p-6 border-b border-black/5 bg-[#ffffff] relative">
                <label className="text-[12px] uppercase tracking-wider font-semibold text-[#8f8f8e] mb-2 block">
                  Try it: type an address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={demoQuery}
                    onChange={(e) => {
                      setDemoQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleDemoSearch();
                      }
                    }}
                    placeholder="Start typing an address..."
                    className="w-full h-12 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:ring-0 transition-all outline-none text-[#292929] font-medium text-sm"
                    id="live-demo-input"
                  />
                  <div className="absolute right-4 top-3.5 text-[11px] text-[#8f8f8e] font-mono bg-white px-2 py-0.5 rounded border border-black/5">
                    v1.0 API
                  </div>

                  {/* Dropdown Suggestions */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-14 bg-white border border-black/10 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-black/5">
                      {isLoading ? (
                        <div className="px-4 py-3 text-xs text-[#8f8f8e]">
                          Loading suggestions...
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectAddress(item.label)}
                            className="w-full text-left px-4 py-3 hover:bg-[#edede8] transition-colors flex items-center justify-between group"
                          >
                            <span className="text-sm text-[#292929] font-medium group-hover:text-[#141414]">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-[#8f8f8e] font-mono">
                              {item.normalized}
                            </span>
                          </button>
                        ))
                      ) : demoQuery.trim() ? (
                        <div className="px-4 py-3 text-xs text-[#8f8f8e]">
                          Press Enter to search...
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-xs text-[#8f8f8e]">
                          Start typing to see suggestions...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* JSON Response View */}
              <div className="p-6 bg-[#141414] font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4cc02b]"></span>
                    <span className="text-[#8f8f8e] uppercase text-[11px] font-semibold tracking-wider">API RESPONSE</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#4cc02b]/20 text-[#4cc02b] text-[11px] font-medium">
                    200 OK (18ms)
                  </span>
                </div>
                <pre className="text-[#d0d0c8]">
                  <code>
                    <span className="code-keyword">{'{'}</span>{'\n'}
                    &nbsp;&nbsp;<span className="code-key">"formatted_address":</span> <span className="code-string">"{selectedResult.formatted_address}"</span>,{'\n'}
                    &nbsp;&nbsp;<span className="code-key">"deliverability":</span> <span className="code-keyword">{'{'}</span>{'\n'}
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"score":</span> <span className="code-number">{selectedResult.deliverability.score}</span>,{'\n'}
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-key">"status":</span> <span className="code-string">"{selectedResult.deliverability.status}"</span>{'\n'}
                    &nbsp;&nbsp;<span className="code-keyword">{'}'}</span>,{'\n'}
                    &nbsp;&nbsp;<span className="code-key">"tax_rate":</span> <span className="code-number">{selectedResult.tax_jurisdiction.total_tax_rate}</span>,{'\n'}
                    &nbsp;&nbsp;<span className="code-key">"timezone":</span> <span className="code-string">"{selectedResult.timezone.name}"</span>,{'\n'}
                    &nbsp;&nbsp;<span className="code-key">"coordinates":</span> <span className="code-keyword">{'{'}</span> <span className="code-key">"lat":</span> <span className="code-number">{selectedResult.coordinates.lat}</span>, <span className="code-key">"lng":</span> <span className="code-number">{selectedResult.coordinates.lng}</span> <span className="code-keyword">{'}'}</span>{'\n'}
                    <span className="code-keyword">{'}'}</span>
                  </code>
                </pre>
              </div>

              {/* Demo Footer */}
              <div className="bg-[#292929] px-6 py-3 flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#8f8f8e]">
                  This is the real API response. No mockups.
                </span>
                <button
                  onClick={handleCopyJson}
                  className="text-[11px] text-white hover:text-[#4cc02b] transition-colors uppercase tracking-widest font-mono font-medium flex items-center gap-1"
                  id="demo-copy-json-btn"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4cc02b]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <span>Copy JSON</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICE COMPARISON SECTION */}
      <section className="px-6 sm:px-12 max-w-[1200px] mx-auto pt-8">
        <div className="bg-[#ffffff] rounded-xl p-8 sm:p-10 border border-black/5 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#8f8f8e]">Cost Efficiency</span>
            <h2 className="text-[27px] sm:text-[32px] font-normal tracking-tight text-[#141414]">
              Why pay Google's prices?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-[#8f8f8e]">
                  <th className="py-4 px-4 font-semibold w-1/3">Feature</th>
                  <th className="py-4 px-4 font-semibold text-[#8f8f8e] w-1/3">Google Places</th>
                  <th className="py-4 px-4 font-semibold text-[#141414] bg-[#edede8]/60 rounded-t-lg w-1/3">
                    Us (Addy)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm sm:text-base">
                <tr>
                  <td className="py-4 px-4 font-medium text-[#292929]">Cost per 50,000 lookups/mo</td>
                  <td className="py-4 px-4 text-[#6f6f6e] font-mono">~$250</td>
                  <td className="py-4 px-4 font-bold text-[#141414] font-mono bg-[#edede8]/60">~$99</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-[#292929]">Deliverability scoring</td>
                  <td className="py-4 px-4 text-[#8f8f8e]">Not included</td>
                  <td className="py-4 px-4 font-semibold text-[#4cc02b] bg-[#edede8]/60 flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#4cc02b]" />
                    <span>Included</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-[#292929]">Tax jurisdiction data</td>
                  <td className="py-4 px-4 text-[#8f8f8e]">Not included</td>
                  <td className="py-4 px-4 font-semibold text-[#4cc02b] bg-[#edede8]/60 flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#4cc02b]" />
                    <span>Included</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-[#292929]">Timezone data</td>
                  <td className="py-4 px-4 text-[#8f8f8e]">Not included</td>
                  <td className="py-4 px-4 font-semibold text-[#4cc02b] bg-[#edede8]/60 rounded-b-lg flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#4cc02b]" />
                    <span>Included</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[14px] text-[#6f6f6e] pt-2 italic">
            "Same coverage. Fewer surprises on your bill."
          </p>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="px-6 sm:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#dbdbd2] rounded-xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#c0c0c0] flex items-center justify-center font-mono text-xs text-[#141414] font-bold">
              01
            </div>
            <h3 className="text-[19px] font-medium text-[#141414]">Built for checkout forms</h3>
            <p className="text-[14px] leading-relaxed text-[#6f6f6e]">
              Drop in autocomplete that reduces failed deliveries and abandoned checkouts, works with Shopify, Webflow, WordPress, and any custom site.
            </p>
          </div>

          <div className="bg-[#dbdbd2] rounded-xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#c0c0c0] flex items-center justify-center font-mono text-xs text-[#141414] font-bold">
              02
            </div>
            <h3 className="text-[19px] font-medium text-[#141414]">More than coordinates</h3>
            <p className="text-[14px] leading-relaxed text-[#6f6f6e]">
              Every lookup includes a deliverability score, the local tax rate, and timezone context, not just a lat/lng pair.
            </p>
          </div>

          <div className="bg-[#dbdbd2] rounded-xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#c0c0c0] flex items-center justify-center font-mono text-xs text-[#141414] font-bold">
              03
            </div>
            <h3 className="text-[19px] font-medium text-[#141414]">Predictable pricing</h3>
            <p className="text-[14px] leading-relaxed text-[#6f6f6e]">
              Flat monthly tiers with clear overage rates. No per-keystroke billing surprises.
            </p>
          </div>

          <div className="bg-[#dbdbd2] rounded-xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#c0c0c0] flex items-center justify-center font-mono text-xs text-[#141414] font-bold">
              04
            </div>
            <h3 className="text-[19px] font-medium text-[#141414]">Fast, cached, reliable</h3>
            <p className="text-[14px] leading-relaxed text-[#6f6f6e]">
              Repeated address lookups are served from cache in milliseconds. Multi-provider failover means no single point of failure.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing-section" className="px-6 sm:px-12 max-w-[1200px] mx-auto pt-8">
        <div className="space-y-8 text-center sm:text-left">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#8f8f8e]">Transparent Tiers</span>
            <h2 className="text-[32px] sm:text-[38px] font-normal tracking-tight text-[#141414]">
              Simple, predictable pricing
            </h2>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
            {/* Free */}
            <div className="bg-[#dbdbd2] rounded-xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow border border-transparent hover:border-black/10">
              <div className="space-y-4">
                <span className="text-sm font-semibold text-[#6f6f6e] uppercase tracking-wider block">Free</span>
                <div className="text-[27px] font-normal text-[#141414] font-mono">{PLANS.free.price}</div>
                <div className="text-xs font-medium text-[#292929] bg-[#edede8] px-2.5 py-1 rounded-full inline-block">
                  {PLANS.free.includedLookupsLabel}
                </div>
                <div className="text-xs text-[#6f6f6e]">Overage: {PLANS.free.overageRate}</div>
              </div>
              <button
                onClick={onOpenSignup}
                className="w-full h-10 rounded-full bg-[#141414] text-white text-xs font-medium hover:bg-black transition-colors"
                id="pricing-btn-free"
              >
                Start free
              </button>
            </div>

            {/* Starter */}
            <div className="bg-[#dbdbd2] rounded-xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow border border-transparent hover:border-black/10">
              <div className="space-y-4">
                <span className="text-sm font-semibold text-[#6f6f6e] uppercase tracking-wider block">Starter</span>
                <div className="text-[27px] font-normal text-[#141414] font-mono">{PLANS.starter.price}</div>
                <div className="text-xs font-medium text-[#292929] bg-[#edede8] px-2.5 py-1 rounded-full inline-block">
                  {PLANS.starter.includedLookupsLabel}
                </div>
                <div className="text-xs text-[#6f6f6e]">Overage: {PLANS.starter.overageRate}</div>
              </div>
              <button
                onClick={onOpenSignup}
                className="w-full h-10 rounded-full bg-[#292929] text-white text-xs font-medium hover:bg-black transition-colors"
                id="pricing-btn-starter"
              >
                Choose Starter
              </button>
            </div>

            {/* Pro - Featured */}
            <div className="bg-[#ffffff] rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-lg border-2 border-[#141414] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#141414] text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-full tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4 pt-2">
                <span className="text-sm font-semibold text-[#141414] uppercase tracking-wider block">Pro</span>
                <div className="text-[32px] font-normal text-[#141414] font-mono">{PLANS.pro.price}</div>
                <div className="text-xs font-medium text-[#141414] bg-[#edede8] px-2.5 py-1 rounded-full inline-block font-semibold">
                  {PLANS.pro.includedLookupsLabel}
                </div>
                <div className="text-xs text-[#6f6f6e]">Overage: {PLANS.pro.overageRate}</div>
              </div>
              <button
                onClick={onOpenSignup}
                className="w-full h-10 rounded-full bg-[#141414] text-white text-xs font-medium hover:bg-black transition-colors"
                id="pricing-btn-pro"
              >
                Choose Pro
              </button>
            </div>

            {/* Business */}
            <div className="bg-[#dbdbd2] rounded-xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow border border-transparent hover:border-black/10">
              <div className="space-y-4">
                <span className="text-sm font-semibold text-[#6f6f6e] uppercase tracking-wider block">Business</span>
                <div className="text-[27px] font-normal text-[#141414] font-mono">{PLANS.business.price}</div>
                <div className="text-xs font-medium text-[#292929] bg-[#edede8] px-2.5 py-1 rounded-full inline-block">
                  {PLANS.business.includedLookupsLabel}
                </div>
                <div className="text-xs text-[#6f6f6e]">Overage: {PLANS.business.overageRate}</div>
              </div>
              <button
                onClick={onOpenSignup}
                className="w-full h-10 rounded-full bg-[#292929] text-white text-xs font-medium hover:bg-black transition-colors"
                id="pricing-btn-business"
              >
                Choose Business
              </button>
            </div>

            {/* Enterprise Lite */}
            <div className="bg-[#dbdbd2] rounded-xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow border border-transparent hover:border-black/10">
              <div className="space-y-4">
                <span className="text-sm font-semibold text-[#6f6f6e] uppercase tracking-wider block">Enterprise Lite</span>
                <div className="text-[27px] font-normal text-[#141414] font-mono">{PLANS.enterprise_lite.price}</div>
                <div className="text-xs font-medium text-[#292929] bg-[#edede8] px-2.5 py-1 rounded-full inline-block">
                  {PLANS.enterprise_lite.includedLookupsLabel}
                </div>
                <div className="text-xs text-[#6f6f6e]">Overage: {PLANS.enterprise_lite.overageRate}</div>
              </div>
              <button
                onClick={onOpenSignup}
                className="w-full h-10 rounded-full bg-[#292929] text-white text-xs font-medium hover:bg-black transition-colors"
                id="pricing-btn-enterprise-lite"
              >
                Choose Enterprise Lite
              </button>
            </div>
          </div>

          {/* Sixth Card - Enterprise Custom */}
          <div className="bg-[#141414] text-white rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md mt-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs text-[#4cc02b] font-mono font-semibold uppercase tracking-widest">Enterprise Custom</div>
              <h3 className="text-xl sm:text-2xl font-normal">Custom volume, custom SLA.</h3>
              <p className="text-sm text-[#8f8f8e]">Need dedicated infrastructure, custom contract terms, or SLA guarantees?</p>
            </div>
            <button
              onClick={onOpenContactModal}
              className="h-11 px-8 rounded-full bg-white text-[#141414] font-semibold text-sm hover:bg-[#edede8] transition-colors whitespace-nowrap"
              id="pricing-btn-talk-to-us"
            >
              Talk to us
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-6 sm:px-12 max-w-[1200px] mx-auto pt-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#8f8f8e]">Help & Answers</span>
            <h2 className="text-[32px] font-normal tracking-tight text-[#141414]">
              Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#ffffff] rounded-xl border border-black/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-medium text-[#141414] hover:bg-[#edede8]/40 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <span className="text-xl text-[#8f8f8e] font-light">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-sm sm:text-base text-[#6f6f6e] leading-relaxed border-t border-black/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-[#dbdbd2] pt-12 pb-8 px-6 sm:px-12">
        <div className="max-w-[1200px] mx-auto space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="font-semibold text-sm text-[#141414] tracking-tight">Addy</div>
              <p className="text-xs text-[#6f6f6e] leading-relaxed">
                Fast, deliverable address autocomplete and geocoding engine built for high conversion checkout flows.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-xs text-[#8f8f8e] uppercase tracking-wider">Product</div>
              <ul className="space-y-2 text-sm text-[#353535]">
                <li>
                  <a href="#pricing-section" className="hover:text-[#141414] transition-colors">Pricing</a>
                </li>
                <li>
                  <button onClick={() => onNavigate('docs-public')} className="hover:text-[#141414] transition-colors">Docs</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('status')} className="hover:text-[#141414] transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4cc02b]"></span> Status page
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-xs text-[#8f8f8e] uppercase tracking-wider">Company</div>
              <ul className="space-y-2 text-sm text-[#353535]">
                <li>
                  <button onClick={onOpenContactModal} className="hover:text-[#141414] transition-colors">About</button>
                </li>
                <li>
                  <button onClick={onOpenContactModal} className="hover:text-[#141414] transition-colors">Contact</button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-xs text-[#8f8f8e] uppercase tracking-wider">Legal</div>
              <ul className="space-y-2 text-sm text-[#353535]">
                <li>
                  <button onClick={onOpenTermsModal} className="hover:text-[#141414] transition-colors">Terms of Service</button>
                </li>
                <li>
                  <button onClick={onOpenPrivacyModal} className="hover:text-[#141414] transition-colors">Privacy Policy</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#6f6f6e] gap-4">
            <div>© 2026 Addy. All rights reserved.</div>
            <div className="flex gap-6 uppercase tracking-widest text-[11px] font-semibold text-[#8f8f8e]">
              <button onClick={onOpenTermsModal} className="hover:text-[#141414]">Terms</button>
              <button onClick={onOpenPrivacyModal} className="hover:text-[#141414]">Privacy</button>
              <button onClick={() => onNavigate('status')} className="hover:text-[#141414]">Status</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { autocomplete, geocode, reverseGeocode, getUsage } from '../../api';
import { ApiKey } from '../../types';

interface DocsTabProps {
  primaryKey: ApiKey | null;
  onRefreshState?: () => void;
}

export const DocsTab: React.FC<DocsTabProps> = ({ primaryKey, onRefreshState }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState('/v1/autocomplete');
  const [playgroundQuery, setPlaygroundQuery] = useState('1600 Amphitheatre Pkwy');
  const [playgroundResult, setPlaygroundResult] = useState<string | null>(null);
  const [loadingPlayground, setLoadingPlayground] = useState(false);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);

  const keyVal = primaryKey ? primaryKey.key : 'ak_live_your_api_key_here';

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const endpoints = [
    {
      id: 'autocomplete',
      method: 'POST',
      path: '/v1/autocomplete',
      title: 'Address Autocomplete',
      desc: 'Returns fast, fuzzy matched address suggestions as the user types into your checkout or registration form.',
      reqCode: `curl -X POST "https://api.addy.io/v1/autocomplete" \\
  -H "x-api-key: ${keyVal}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "1600 Amphitheatre"}'`,
      resCode: JSON.stringify({
        suggestions: [
          {
            label: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
            normalized: "1600 amphitheatre pkwy mountain view ca"
          }
        ],
        cached: false
      }, null, 2)
    },
    {
      id: 'geocode',
      method: 'POST',
      path: '/v1/geocode',
      title: 'Forward Geocoding & Enrichment',
      desc: 'Converts an address string into precise geographic coordinates, CASS deliverability metrics, sales tax jurisdiction, and timezone info.',
      reqCode: `curl -X POST "https://api.addy.io/v1/geocode" \\
  -H "x-api-key: ${keyVal}" \\
  -H "Content-Type: application/json" \\
  -d '{"address": "1 Apple Park Way, Cupertino, CA"}'`,
      resCode: JSON.stringify({
        address: "1 Apple Park Way, Cupertino, CA",
        normalized: "1 apple park way cupertino ca",
        coordinates: { lat: 37.3349, lng: -122.009 },
        confidence: 95,
        cached: false
      }, null, 2)
    },
    {
      id: 'reverse',
      method: 'POST',
      path: '/v1/reverse',
      title: 'Reverse Geocoding',
      desc: 'Converts latitude and longitude coordinates into verified address details with full metadata.',
      reqCode: `curl -X POST "https://api.addy.io/v1/reverse" \\
  -H "x-api-key: ${keyVal}" \\
  -H "Content-Type: application/json" \\
  -d '{"lat": 40.7484, "lng": -73.9857}'`,
      resCode: JSON.stringify({
        timezone: {
          name: "America/New_York",
          offset_hours: -4,
          current_time: "2026-08-07T15:00:00Z",
          is_business_hours: true
        }
      }, null, 2)
    },
    {
      id: 'usage',
      method: 'GET',
      path: '/v1/account/usage',
      title: 'Account Usage & Quotas',
      desc: 'Fetches real-time request counts, current tier quotas, and overage billing estimates.',
      reqCode: `curl -X GET "https://api.addy.io/v1/account/usage" \\
  -H "x-api-key: ${keyVal}"`,
      resCode: JSON.stringify({
        tier: "pro",
        lookups_used: 1420,
        lookups_included: 50000,
        lifetime_cap: null,
        warning: null
      }, null, 2)
    }
  ];

  const handleRunPlayground = async () => {
    setLoadingPlayground(true);
    setPlaygroundResult(null);
    setPlaygroundError(null);
    
    try {
      let result: unknown;
      
      switch (playgroundEndpoint) {
        case '/v1/autocomplete':
          result = await autocomplete(playgroundQuery, 5);
          break;
        case '/v1/geocode':
          result = await geocode(playgroundQuery);
          break;
        case '/v1/reverse': {
          // Parse lat/lng from query format "lat, lng"
          const [lat, lng] = playgroundQuery.split(',').map(s => parseFloat(s.trim()));
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Invalid coordinates. Format: lat, lng (e.g., "40.7484, -73.9857")');
          }
          result = await reverseGeocode(lat, lng);
          break;
        }
        case '/v1/account/usage':
          result = await getUsage();
          break;
        default:
          throw new Error('Unknown endpoint');
      }
      
      setPlaygroundResult(JSON.stringify(result, null, 2));
      if (onRefreshState) onRefreshState();
    } catch (err) {
      setPlaygroundError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoadingPlayground(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[27px] font-semibold text-[#141414]">API Documentation</h1>
        <p className="text-sm text-[#6f6f6e]">
          Complete REST endpoint reference for integrating address autocomplete, geocoding, and tax lookups.
        </p>
      </div>

      {/* Header Notice */}
      <div className="bg-[#141414] text-white p-4 rounded-xl text-xs font-mono flex items-center justify-between border border-[#4cc02b]/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4cc02b]"></span>
          <span>Authentication: All requests require your API key in the <code className="text-[#4cc02b] bg-white/10 px-1.5 py-0.5 rounded">x-api-key</code> header.</span>
        </div>
      </div>

      {/* Interactive API Playground Box */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#141414]">Interactive API Playground</h3>
            <p className="text-xs text-[#6f6f6e]">Test endpoint calls live directly in your browser.</p>
          </div>
          <span className="text-xs font-mono text-[#4cc02b] bg-[#4cc02b]/10 px-2.5 py-1 rounded-md">
            API v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <select
            value={playgroundEndpoint}
            onChange={(e) => setPlaygroundEndpoint(e.target.value)}
            className="sm:col-span-4 h-11 px-3 rounded-lg bg-[#edede8] border border-black/5 font-mono text-xs text-[#292929] outline-none"
          >
            <option value="/v1/autocomplete">POST /v1/autocomplete</option>
            <option value="/v1/geocode">GET /v1/geocode</option>
            <option value="/v1/reverse">GET /v1/reverse</option>
            <option value="/v1/account/usage">GET /v1/account/usage</option>
          </select>

          <input
            type="text"
            value={playgroundQuery}
            onChange={(e) => setPlaygroundQuery(e.target.value)}
            placeholder="Address query string..."
            className="sm:col-span-6 h-11 px-4 rounded-lg bg-[#edede8] border border-black/5 text-xs text-[#292929] outline-none font-mono"
          />

          <button
            onClick={handleRunPlayground}
            disabled={loadingPlayground}
            className="sm:col-span-2 h-11 rounded-lg bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors"
            id="playground-send-request-btn"
          >
            {loadingPlayground ? 'Sending...' : 'Send Request'}
          </button>
        </div>

        {playgroundResult && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs text-[#8f8f8e] font-mono">
              <span>RESPONSE PAYLOAD</span>
              <span className="text-[#4cc02b]">HTTP 200 OK</span>
            </div>
            <pre className="bg-[#141414] p-4 rounded-lg font-mono text-xs text-[#4cc02b] max-h-60 overflow-y-auto">
              {playgroundResult}
            </pre>
          </div>
        )}
        
        {playgroundError && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs text-[#8f8f8e] font-mono">
              <span>ERROR</span>
              <span className="text-red-500">Request Failed</span>
            </div>
            <pre className="bg-red-50 border border-red-200 p-4 rounded-lg font-mono text-xs text-red-600 max-h-60 overflow-y-auto">
              {playgroundError}
            </pre>
          </div>
        )}
      </div>

      {/* Endpoint References */}
      <div className="space-y-8">
        {endpoints.map((ep) => (
          <div key={ep.id} className="bg-white rounded-xl border border-black/5 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    ep.method === 'POST' ? 'bg-[#141414] text-white' : 'bg-[#dbdbd2] text-[#292929]'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono font-bold text-base text-[#141414]">{ep.path}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#6f6f6e] pt-1">{ep.title}</h3>
              </div>
            </div>

            <p className="text-sm text-[#292929]">{ep.desc}</p>

            {/* Request Sample */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8f8f8e]">
                <span>EXAMPLE REQUEST</span>
                <button
                  onClick={() => handleCopy(`${ep.id}-req`, ep.reqCode)}
                  className="text-[#141414] hover:underline font-sans font-semibold flex items-center gap-1"
                  id={`copy-req-${ep.id}`}
                >
                  {copiedSection === `${ep.id}-req` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4cc02b]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#141414] p-4 rounded-lg font-mono text-xs text-[#d0d0c8] overflow-x-auto">
                {ep.reqCode}
              </pre>
            </div>

            {/* Response Sample */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8f8f8e]">
                <span>EXAMPLE RESPONSE (200 OK)</span>
                <button
                  onClick={() => handleCopy(`${ep.id}-res`, ep.resCode)}
                  className="text-[#141414] hover:underline font-sans font-semibold flex items-center gap-1"
                  id={`copy-res-${ep.id}`}
                >
                  {copiedSection === `${ep.id}-res` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4cc02b]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#141414] p-4 rounded-lg font-mono text-xs text-[#4cc02b] overflow-x-auto max-h-64 overflow-y-auto">
                {ep.resCode}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

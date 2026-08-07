import React, { useState, useEffect } from 'react';
import { Zap, Check, Copy } from 'lucide-react';
import { PLANS } from '../../plans';
import { geocode, getUsage, ApiUsageStats } from '../../api';
import { User, ApiKey } from '../../types';

interface OverviewTabProps {
  user: User;
  primaryKey: ApiKey | null;
  usageCount: number;
  onNavigateToBilling: () => void;
  onRefreshState: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  primaryKey,
  usageCount: propUsageCount,
  onNavigateToBilling,
  onRefreshState
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [codeLang, setCodeLang] = useState<'curl' | 'js' | 'node'>('curl');
  const [simulating, setSimulating] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const plan = PLANS[user.currentPlan];
  const maxQuota = plan.includedLookups;
  const isFree = user.currentPlan === 'free';
  const usageCount = usageStats?.used ?? propUsageCount;
  const percentage = Math.min(100, Math.round((usageCount / maxQuota) * 100));

  const showWarning = isFree && usageCount >= 480 && usageCount < 500;
  const showCapReached = isFree && usageCount >= 500;

  // Load usage stats on mount
  useEffect(() => {
    const loadUsageStats = async () => {
      try {
        const stats = await getUsage();
        setUsageStats({
          used: stats.lookups_used,
          quota: stats.lookups_included,
          overageCount: 0,
          overageEstimatedCost: 0,
          usageHistory: []
        });
        
        // Show warning if returned from API
        if (stats.warning) {
          console.log('Usage warning:', stats.warning);
        }
      } catch (error) {
        console.error('Failed to load usage stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsageStats();
  }, []);

  const keyValue = primaryKey ? primaryKey.key : 'ak_live_samplekey1234567890';
  const maskedKey = primaryKey
    ? `${keyValue.substring(0, 8)}••••••••••••${keyValue.substring(keyValue.length - 4)}`
    : 'ak_live_••••••••';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getSnippet = () => {
    if (codeLang === 'curl') {
      return `curl -X POST "https://api.addy.io/v1/autocomplete" \\
  -H "x-api-key: ${keyValue}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "1600 Amphitheatre Pkwy"}'`;
    } else if (codeLang === 'js') {
      return `const response = await fetch("https://api.addy.io/v1/autocomplete", {
  method: "POST",
  headers: {
    "x-api-key": "${keyValue}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: "1600 Amphitheatre Pkwy" })
});
const data = await response.json();
console.log(data);`;
    } else {
      return `import { Addy } from '@addy/sdk';

const client = new Addy({ apiKey: '${keyValue}' });

const result = await client.autocomplete({
  query: '1600 Amphitheatre Pkwy'
});
console.log(result.deliverability.score);`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulateApiCall = async () => {
    setSimulating(true);
    setLastResponse(null);
    
    try {
      const result = await geocode('1600 Amphitheatre Pkwy');
      setLastResponse(JSON.stringify(result, null, 2));
      onRefreshState();
    } catch (error) {
      setLastResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'API call failed' }, null, 2));
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="space-y-1">
        <h1 className="text-[27px] font-semibold text-[#141414]">
          {usageCount === 0 ? "Welcome, here's your API key" : "Welcome back"}
        </h1>
        <p className="text-sm text-[#6f6f6e]">
          Your account is active on the <span className="font-semibold text-[#141414]">{plan.name}</span> plan.
        </p>
      </div>

      {/* 480/500 WARNING BANNER */}
      {showWarning && (
        <div className="bg-[#141414] text-white p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-[#4cc02b]/30">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#4cc02b] animate-ping"></span>
            <div>
              <p className="text-sm font-medium">
                {usageStats?.warning || `You've used ${usageCount} of 500 free lookups. Upgrade to keep this running without interruption.`}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToBilling}
            className="h-9 px-5 rounded-full bg-[#4cc02b] text-[#141414] font-semibold text-xs hover:bg-[#4cc02b]/90 transition-colors whitespace-nowrap"
            id="overview-warning-view-plans"
          >
            View plans →
          </button>
        </div>
      )}

      {/* 500/500 BLOCKING NOTICE */}
      {showCapReached && (
        <div className="bg-red-50 border-2 border-red-500/30 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-red-700 font-semibold text-base">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span>You've reached your free tier limit. Choose a plan to continue.</span>
          </div>
          <p className="text-xs text-red-600">
            Further API requests currently return HTTP 402 Payment Required. Select a paid plan to instantly unlock un-capped throughput.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNavigateToBilling}
              className="h-10 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors"
              id="overview-cap-upgrade-btn"
            >
              Upgrade Plan Now
            </button>
          </div>
        </div>
      )}

      {/* API Key Box */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#8f8f8e] uppercase tracking-wider">
            Your Active API Key ({primaryKey?.name || 'Production'})
          </label>
          <span className="text-[11px] text-[#4cc02b] font-mono bg-[#4cc02b]/10 px-2 py-0.5 rounded">
            ● Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-[#edede8] h-12 px-4 rounded-lg flex items-center justify-between font-mono text-sm text-[#292929] border border-black/5">
            <span>{keyRevealed ? keyValue : maskedKey}</span>
            <button
              onClick={() => setKeyRevealed(!keyRevealed)}
              className="text-xs text-[#6f6f6e] hover:text-[#141414] ml-2 font-sans"
              id="overview-reveal-key-btn"
            >
              {keyRevealed ? 'Hide' : 'Reveal'}
            </button>
          </div>
          <button
            onClick={handleCopyKey}
            className="h-12 px-6 rounded-lg bg-[#141414] text-white text-xs font-medium hover:bg-black transition-colors whitespace-nowrap shadow-sm flex items-center justify-center gap-1.5"
            id="overview-copy-key-btn"
          >
            {copiedKey ? (
              <>
                <Check className="w-4 h-4 text-[#4cc02b]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Usage Meter Card */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#8f8f8e] uppercase tracking-wider block">
              Monthly Usage Meter
            </span>
            <div className="text-2xl font-semibold text-[#141414] font-mono pt-1">
              {usageCount.toLocaleString()} / {isFree ? '500' : maxQuota.toLocaleString()}{' '}
              <span className="text-xs font-sans text-[#6f6f6e]">
                {isFree ? 'free lookups used' : 'lookups used this month'}
              </span>
            </div>
          </div>
          <button
            onClick={onNavigateToBilling}
            className="text-xs text-[#141414] font-semibold underline hover:text-[#6f6f6e]"
            id="overview-usage-manage-plan"
          >
            Manage plan
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#edede8] h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentage >= 96 ? 'bg-red-600' : percentage >= 80 ? 'bg-amber-500' : 'bg-[#141414]'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-xs text-[#6f6f6e]">
          <span>Quota resets on {new Date(user.billingCycleEnd).toLocaleDateString()}</span>
          <span>{percentage}% utilized</span>
        </div>
      </div>

      {/* Quick Start Code Section */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-black/5">
          <div>
            <h3 className="text-lg font-medium text-[#141414]">Quick Start</h3>
            <p className="text-xs text-[#6f6f6e]">Copy and run this request in your application.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#edede8] p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setCodeLang('curl')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  codeLang === 'curl' ? 'bg-white text-[#141414] shadow-sm' : 'text-[#6f6f6e]'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setCodeLang('js')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  codeLang === 'js' ? 'bg-white text-[#141414] shadow-sm' : 'text-[#6f6f6e]'
                }`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setCodeLang('node')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  codeLang === 'node' ? 'bg-white text-[#141414] shadow-sm' : 'text-[#6f6f6e]'
                }`}
              >
                Node SDK
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="h-8 px-4 rounded-md bg-[#dbdbd2] text-[#292929] text-xs font-medium hover:bg-[#c0c0c0] transition-colors flex items-center gap-1.5"
              id="overview-copy-snippet-btn"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#4cc02b]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-lg font-mono text-xs text-[#d0d0c8] overflow-x-auto leading-relaxed">
          <pre>{getSnippet()}</pre>
        </div>

        {/* Live Test Trigger */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#edede8]/60 p-4 rounded-lg border border-black/5">
          <div>
            <div className="text-xs font-semibold text-[#141414]">Test your API key right now</div>
            <div className="text-xs text-[#6f6f6e]">Executes a real mock request and updates your live usage meter.</div>
          </div>
          <button
            onClick={handleSimulateApiCall}
            disabled={simulating}
            className="h-9 px-5 rounded-full bg-[#141414] text-white text-xs font-medium hover:bg-black transition-colors whitespace-nowrap shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            id="overview-test-api-call-btn"
          >
            {simulating ? (
              'Executing...'
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Test 1 API Lookup</span>
              </>
            )}
          </button>
        </div>

        {lastResponse && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-mono text-[#8f8f8e] uppercase">Last Response Payload</div>
            <pre className="bg-[#141414] p-4 rounded-lg text-xs font-mono text-[#4cc02b] max-h-48 overflow-y-auto">
              {lastResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

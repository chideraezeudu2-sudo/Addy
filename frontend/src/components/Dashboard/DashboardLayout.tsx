import React, { useState } from 'react';
import { LayoutDashboard, KeyRound, CreditCard, BookOpen, Settings } from 'lucide-react';
import { getStoredApiKey, getStoredUser } from '../../api';
import { User, ApiKey, BillingInvoice } from '../../types';
import { OverviewTab } from './OverviewTab';
import { ApiKeysTab } from './ApiKeysTab';
import { BillingTab } from './BillingTab';
import { DocsTab } from './DocsTab';
import { SettingsTab } from './SettingsTab';

interface DashboardLayoutProps {
  user: User;
  initialTab?: string;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  initialTab = 'overview',
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshState = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Get primary API key from storage
  const storedApiKey = getStoredApiKey();
  const primaryKey: ApiKey | null = storedApiKey ? {
    id: 'primary',
    name: 'Production',
    key: storedApiKey,
    createdAt: user.createdAt,
    lastUsedAt: null,
    requestCount: 0,
    status: 'active'
  } : null;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'apikeys', label: 'API Keys', icon: KeyRound },
    { id: 'billing', label: 'Usage & Billing', icon: CreditCard },
    { id: 'docs', label: 'Docs', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <nav className="lg:col-span-3 bg-white rounded-xl border border-black/5 p-3 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#8f8f8e] uppercase tracking-wider">
            Dashboard Navigation
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#141414] text-white shadow-sm'
                      : 'text-[#292929] hover:bg-[#edede8] hover:text-[#141414]'
                  }`}
                  id={`dash-nav-${item.id}`}
                >
                  <span className="flex items-center gap-2.5">
                    <IconComp className="w-4 h-4 opacity-90" />
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'billing' && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#edede8] text-[#6f6f6e]'
                    }`}>
                      {user.currentPlan.toUpperCase()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-black/5 mt-4">
            <div className="px-3 py-2 bg-[#edede8]/60 rounded-lg space-y-1">
              <div className="text-[11px] font-semibold text-[#141414] truncate">
                {user.email}
              </div>
              <div className="text-[10px] text-[#6f6f6e]">
                Plan: {user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1)}
              </div>
            </div>
          </div>
        </nav>

        {/* Right Main Content Panel */}
        <main className="lg:col-span-9" key={refreshKey}>
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              primaryKey={primaryKey}
              usageCount={0}
              onNavigateToBilling={() => setActiveTab('billing')}
              onRefreshState={handleRefreshState}
            />
          )}

          {activeTab === 'apikeys' && (
            <ApiKeysTab
              keys={primaryKey ? [primaryKey] : []}
              onRefreshState={handleRefreshState}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              user={user}
              usageCount={0}
              usageHistory={[]}
              invoices={[]}
              onRefreshState={handleRefreshState}
            />
          )}

          {activeTab === 'docs' && (
            <DocsTab
              primaryKey={primaryKey}
              onRefreshState={handleRefreshState}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              user={user}
              onLogout={onLogout}
              onRefreshState={handleRefreshState}
            />
          )}
        </main>
      </div>
    </div>
  );
};

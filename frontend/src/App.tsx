import { useState, useEffect } from 'react';
import { getStoredUser, logout as apiLogout } from './api';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { AuthModal } from './components/AuthModal';
import { TermsModal } from './components/TermsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ContactModal } from './components/ContactModal';
import { StatusPageModal } from './components/StatusPageModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('home');

  // Modal States
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' | 'reset' }>({
    isOpen: false,
    mode: 'signup'
  });

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // Sync initial user state from storage
  useEffect(() => {
    const existingUser = getStoredUser();
    if (existingUser) {
      setUser(existingUser);
    }
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'reset') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveView('dashboard-overview');
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setActiveView('home');
  };

  const handleNavigate = (view: string) => {
    if (view === 'status') {
      setShowStatus(true);
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#edede8] text-[#292929] flex flex-col font-sans">
      {/* Background Email Verification Alert Banner */}
      {user && !user.isVerified && (
        <div className="bg-[#141414] text-white px-6 py-2.5 text-xs text-center flex items-center justify-center gap-3 border-b border-[#4cc02b]/20">
          <span className="w-2 h-2 rounded-full bg-[#4cc02b]"></span>
          <span>
            A verification email was sent to <strong className="text-white">{user.email}</strong>. Unverified accounts have full API access, verification is only needed for password resets.
          </span>
          <button
            onClick={() => {
              setUser({ ...user, isVerified: true });
            }}
            className="underline text-[#4cc02b] hover:text-white ml-2 font-medium"
          >
            (Simulate Confirm)
          </button>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        user={user}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <LandingPage
            onOpenSignup={() => handleOpenAuth('signup')}
            onOpenLogin={() => handleOpenAuth('login')}
            onNavigate={handleNavigate}
            onOpenContactModal={() => setShowContact(true)}
            onOpenTermsModal={() => setShowTerms(true)}
            onOpenPrivacyModal={() => setShowPrivacy(true)}
          />
        )}

        {activeView === 'docs-public' && (
          <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-12 space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-black/10">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-[#141414]">Public API Documentation</h1>
                <p className="text-sm text-[#6f6f6e]">Explore REST specifications and live endpoint schemas.</p>
              </div>
              <button
                onClick={() => handleOpenAuth('signup')}
                className="h-10 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black"
              >
                Get your free API key
              </button>
            </div>

            <DashboardLayout
              user={user || {
                id: 'public_guest',
                email: 'guest@developer.com',
                isVerified: true,
                createdAt: new Date().toISOString(),
                currentPlan: 'free',
                billingCycleEnd: new Date().toISOString()
              }}
              initialTab="docs"
              onLogout={handleLogout}
            />
          </div>
        )}

        {activeView.startsWith('dashboard') && user && (
          <DashboardLayout
            user={user}
            initialTab={activeView.replace('dashboard-', '') || 'overview'}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        initialMode={authModalState.mode}
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onAuthSuccess={handleAuthSuccess}
        onOpenTerms={() => {
          setAuthModalState({ ...authModalState, isOpen: false });
          setShowTerms(true);
        }}
        onOpenPrivacy={() => {
          setAuthModalState({ ...authModalState, isOpen: false });
          setShowPrivacy(true);
        }}
      />

      {/* Terms of Service Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      {/* Contact Sales Modal */}
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />

      {/* Status Page Modal */}
      <StatusPageModal
        isOpen={showStatus}
        onClose={() => setShowStatus(false)}
      />
    </div>
  );
}

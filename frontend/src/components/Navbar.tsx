import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-[#edede8]/90 backdrop-blur-md transition-all">
      <div className="max-w-[1200px] mx-auto h-20 px-6 sm:px-12 flex items-center justify-between">
        {/* Brand Logotype */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('home')}
            className="group flex items-center gap-2 text-left focus:outline-none"
            id="brand-logo-btn"
          >
            <span className="text-2xl font-black tracking-tighter text-[#141414] group-hover:opacity-80 transition-opacity">
              Addy
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#353535]">
            <button
              onClick={() => {
                if (activeView !== 'home') onNavigate('home');
                setTimeout(() => {
                  document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-[#141414] transition-colors"
              id="nav-link-pricing"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                if (user) {
                  onNavigate('dashboard-docs');
                } else {
                  onNavigate('docs-public');
                }
              }}
              className="hover:text-[#141414] transition-colors"
              id="nav-link-docs"
            >
              Docs
            </button>
            <button
              onClick={() => onNavigate('status')}
              className="hover:text-[#141414] transition-colors flex items-center gap-1.5"
              id="nav-link-status"
            >
              <span className="w-2 h-2 rounded-full bg-[#4cc02b] inline-block"></span>
              Status
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 text-[14px]">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard-overview')}
                className={`h-10 px-5 rounded-full font-medium transition-colors ${
                  activeView.startsWith('dashboard')
                    ? 'bg-[#141414] text-white'
                    : 'bg-[#dbdbd2] text-[#292929] hover:bg-[#c0c0c0]'
                }`}
                id="nav-btn-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="text-[#6f6f6e] hover:text-[#141414] font-medium text-xs px-2 py-1"
                id="nav-btn-logout"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="font-medium text-[#353535] hover:text-[#141414] transition-colors px-2 py-1"
                id="nav-btn-signin"
              >
                Sign in
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="h-10 px-6 rounded-full bg-[#141414] text-white font-medium hover:bg-black transition-colors shadow-sm"
                id="nav-btn-getkey"
              >
                Get free API key
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

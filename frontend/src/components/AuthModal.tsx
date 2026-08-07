import React, { useState } from 'react';
import { register, login } from '../api';
import { User } from '../types';

interface AuthModalProps {
  initialMode: 'login' | 'signup' | 'reset';
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode,
  isOpen,
  onClose,
  onAuthSuccess,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Errors & Messaging
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setIsLoading(true);

    let valid = true;
    if (!email || !validateEmail(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }

    if (!agreed) {
      setGeneralError('You must agree to the Terms of Service and Privacy Policy.');
      valid = false;
    }

    if (!valid) {
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await register(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setIsLoading(true);

    if (!email || !validateEmail(email)) {
      setEmailError('Enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (!password) {
      setPasswordError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await login(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-md p-8 relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#edede8] text-[#6f6f6e] hover:text-[#141414] flex items-center justify-center font-bold text-lg"
          id="auth-modal-close-btn"
        >
          ×
        </button>

        {mode === 'signup' && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-[27px] font-semibold text-[#141414]">
                Get your free API key
              </h2>
              <p className="text-sm text-[#6f6f6e]">
                500 free lookups. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white outline-none text-sm transition-all text-[#292929]"
                  id="signup-email-input"
                />
                {emailError && (
                  <p className="text-xs text-red-600 pt-1">{emailError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white outline-none text-sm transition-all text-[#292929]"
                  id="signup-password-input"
                />
                {passwordError && (
                  <p className="text-xs text-red-600 pt-1">{passwordError}</p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="signup-terms-check"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 rounded accent-[#141414]"
                />
                <label htmlFor="signup-terms-check" className="text-xs text-[#6f6f6e] leading-tight">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-[#141414] font-medium underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-[#141414] font-medium underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              {generalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {generalError}{' '}
                  {generalError.includes('already exists') && (
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold underline ml-1"
                    >
                      Sign in instead?
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-full bg-[#141414] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm pt-0.5 disabled:opacity-50"
                id="signup-submit-btn"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="text-center text-xs text-[#6f6f6e]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#141414] font-bold underline"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-[27px] font-semibold text-[#141414]">
                Sign in
              </h2>
              <p className="text-sm text-[#6f6f6e]">
                Access your Addy API keys and dashboard
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white outline-none text-sm transition-all text-[#292929]"
                  id="login-email-input"
                />
                {emailError && (
                  <p className="text-xs text-red-600 pt-1">{emailError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white outline-none text-sm transition-all text-[#292929]"
                  id="login-password-input"
                />
                {passwordError && (
                  <p className="text-xs text-red-600 pt-1">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-full bg-[#141414] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm pt-0.5 disabled:opacity-50"
                id="login-submit-btn"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="space-y-2 text-center text-xs text-[#6f6f6e]">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode('reset');
                  }}
                  className="text-[#6f6f6e] hover:text-[#141414] underline"
                >
                  Forgot your password?
                </button>
              </div>
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#141414] font-bold underline"
                >
                  Get a free API key
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-[27px] font-semibold text-[#141414]">
                Reset password
              </h2>
              <p className="text-sm text-[#6f6f6e]">
                Enter your email address to receive a password reset link.
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 bg-[#edede8] border border-black/10 rounded-xl space-y-3 text-center">
                <div className="text-sm text-[#141414] font-medium">
                  If an account exists for that email, a reset link has been sent.
                </div>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-[#141414] underline"
                >
                  Return to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white outline-none text-sm transition-all text-[#292929]"
                    id="reset-email-input"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600 pt-1">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#141414] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm"
                  id="reset-submit-btn"
                >
                  Send reset link
                </button>
              </form>
            )}

            <div className="text-center text-xs text-[#6f6f6e]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#141414] font-bold underline"
              >
                Back to sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

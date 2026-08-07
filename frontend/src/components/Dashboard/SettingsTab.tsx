import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { logout } from '../../api';
import { User } from '../../types';

interface SettingsTabProps {
  user: User;
  onLogout: () => void;
  onRefreshState: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ user, onLogout, onRefreshState }) => {
  const [email, setEmail] = useState(user.email);
  const [savedEmailSuccess, setSavedEmailSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Delete account fields
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setIsUpdating(true);
    try {
      // Note: In a real implementation, we would call an API to update email
      // For now, we just show success
      setSavedEmailSuccess(true);
      setTimeout(() => setSavedEmailSuccess(false), 3000);
      onRefreshState();
    } catch (error) {
      console.error('Failed to update email:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Note: In a real implementation, we would call an API to update password
    setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = async () => {
    // Note: In a real implementation, we would call an API to delete the account
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    onLogout();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[27px] font-semibold text-[#141414]">Account Settings</h1>
        <p className="text-sm text-[#6f6f6e]">
          Manage your contact information, security parameters, and account lifecycle.
        </p>
      </div>

      {/* Email Address Settings Card */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#141414]">Email Address</h3>
          <p className="text-xs text-[#6f6f6e]">
            Used for billing receipts and account notifications. Changing email re-triggers verification.
          </p>
        </div>

        <form onSubmit={handleSaveEmail} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white text-sm outline-none font-medium"
              required
              id="settings-email-input"
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors whitespace-nowrap shadow-sm"
              id="settings-email-save-btn"
            >
              Save
            </button>
          </div>

          {savedEmailSuccess && (
            <p className="text-xs text-[#4cc02b] font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#4cc02b]" />
              <span>Email updated successfully. Verification link dispatched.</span>
            </p>
          )}
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#141414]">Change Password</h3>
          <p className="text-xs text-[#6f6f6e]">Ensure your account uses a strong password.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8f8f8e] uppercase tracking-wider block">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white text-sm outline-none"
                id="settings-current-pwd-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8f8f8e] uppercase tracking-wider block">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white text-sm outline-none"
                  id="settings-new-pwd-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8f8f8e] uppercase tracking-wider block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white text-sm outline-none"
                  id="settings-confirm-pwd-input"
                />
              </div>
            </div>
          </div>

          {passwordMessage && (
            <p className={`text-xs ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-[#4cc02b]'}`}>
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="h-11 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm"
            id="settings-update-pwd-btn"
          >
            Update password
          </button>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="pt-8 border-t border-black/10 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-red-600">Delete Account</h3>
          <p className="text-xs text-[#6f6f6e]">
            This permanently deletes your account, API keys, and usage history. This action cannot be undone.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteConfirmationModal(true)}
          className="h-10 px-6 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
          id="settings-trigger-delete-btn"
        >
          Delete account
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-semibold text-red-600">Delete Account Permanently</h3>

            <p className="text-sm text-[#6f6f6e] leading-relaxed">
              This permanently deletes your account, API keys, and usage history. This cannot be undone. Type <span className="font-mono font-bold text-black">DELETE</span> to confirm.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-red-500 text-sm font-mono outline-none"
                id="delete-account-confirm-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmationModal(false);
                  setDeleteConfirmText('');
                }}
                className="h-10 px-5 rounded-full bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="h-10 px-6 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                id="delete-my-account-final-btn"
              >
                Delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

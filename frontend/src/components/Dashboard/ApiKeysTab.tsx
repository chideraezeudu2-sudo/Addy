import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { createApiKey } from '../../api';
import { ApiKey } from '../../types';

interface ApiKeysTabProps {
  keys: ApiKey[];
  onRefreshState: () => void;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ keys, onRefreshState }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  // Revoke state
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);

  const handleCopy = (id: string, keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      await createApiKey(newKeyLabel.trim() || 'API Key');
      setNewKeyLabel('');
      setShowCreateModal(false);
      onRefreshState();
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmRevoke = () => {
    // Note: In a real implementation, we would call an API to revoke the key
    // For now, we just close the modal
    setKeyToRevoke(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-semibold text-[#141414]">API Keys</h1>
          <p className="text-sm text-[#6f6f6e]">
            Manage keys for rotation or staging and production environment separation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-11 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm"
          id="apikeys-generate-new-btn"
        >
          + Generate new key
        </button>
      </div>

      {/* Keys List Table */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden divide-y divide-black/5">
        {keys.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8f8f8e]">
            No API keys found. Click "Generate new key" to create one.
          </div>
        ) : (
          keys.map((k) => {
            const isRevealed = !!revealedKeys[k.id];
            const isRevoked = k.status === 'revoked';
            const masked = `${k.key.substring(0, 8)}••••••••••••${k.key.substring(k.key.length - 4)}`;

            return (
              <div key={k.id} className="p-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-[#141414]">{k.name}</span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        isRevoked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-[#4cc02b]/10 text-[#4cc02b]'
                      }`}
                    >
                      {isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-[#292929] bg-[#edede8] px-3 py-1.5 rounded-lg border border-black/5">
                    <span>{isRevealed ? k.key : masked}</span>
                  </div>

                  <div className="text-[11px] text-[#8f8f8e] flex gap-4 pt-1">
                    <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                    <span>Requests: {k.requestCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isRevoked && (
                    <>
                      <button
                        onClick={() => toggleReveal(k.id)}
                        className="h-9 px-4 rounded-lg bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2] transition-colors"
                        id={`apikey-reveal-${k.id}`}
                      >
                        {isRevealed ? 'Hide' : 'Reveal'}
                      </button>

                      <button
                        onClick={() => handleCopy(k.id, k.key)}
                        className="h-9 px-4 rounded-lg bg-[#dbdbd2] text-[#292929] text-xs font-medium hover:bg-[#c0c0c0] transition-colors flex items-center gap-1.5"
                        id={`apikey-copy-${k.id}`}
                      >
                        {copiedId === k.id ? (
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

                      <button
                        onClick={() => setKeyToRevoke(k)}
                        className="h-9 px-4 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
                        id={`apikey-revoke-${k.id}`}
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE KEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-semibold text-[#141414]">Generate new API key</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Key Label / Purpose
                </label>
                <input
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g. Staging Environment, Checkout Service"
                  className="w-full h-11 px-4 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] focus:bg-white outline-none text-sm transition-all text-[#292929]"
                  required
                  id="create-key-label-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-5 rounded-full bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#141414] text-white text-xs font-medium hover:bg-black"
                  id="create-key-submit-btn"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-semibold text-red-600">Revoke API Key</h3>

            <p className="text-sm text-[#6f6f6e] leading-relaxed">
              Revoking this key ({keyToRevoke.name}) will immediately stop any integration using it. Continue?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setKeyToRevoke(null)}
                className="h-10 px-5 rounded-full bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="h-10 px-6 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                id="confirm-revoke-key-btn"
              >
                Revoke key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

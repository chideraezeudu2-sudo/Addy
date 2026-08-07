import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-lg p-8 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#edede8] text-[#6f6f6e] hover:text-[#141414] font-bold text-lg"
        >
          ×
        </button>

        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold text-[#141414]">Talk to Sales</h2>
          <p className="text-xs text-[#6f6f6e]">
            Custom lookup volume, dedicated SLAs, and enterprise support solutions.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-[#edede8] rounded-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#4cc02b] text-white flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold text-[#141414]">Message Received</h3>
            <p className="text-xs text-[#6f6f6e]">
              Thank you, {name || 'there'}! Our enterprise solutions team will reach out to {email} within 2 business hours.
            </p>
            <button
              onClick={onClose}
              className="h-9 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] text-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] text-xs outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                Estimated Volume & Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell us about your expected monthly lookup volume..."
                className="w-full p-3 rounded-lg bg-[#edede8] border border-transparent focus:border-[#141414] text-xs outline-none resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm"
              id="contact-sales-submit-btn"
            >
              Submit inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

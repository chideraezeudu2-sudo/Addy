import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-2xl p-8 max-h-[85vh] overflow-y-auto relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#edede8] text-[#6f6f6e] hover:text-[#141414] font-bold text-lg"
        >
          ×
        </button>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-[#141414]">Terms of Service</h2>
          <p className="text-xs text-[#8f8f8e]">Effective Date: August 7, 2026</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#292929] leading-relaxed font-sans divide-y divide-black/5">
          <section className="pt-2">
            <h3 className="font-semibold text-[#141414] mb-1">1. Acceptance of Terms</h3>
            <p className="text-[#6f6f6e]">
              By creating an account or using Addy ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">2. Description of Service</h3>
            <p className="text-[#6f6f6e]">
              The Service provides address autocomplete, geocoding, reverse geocoding, deliverability scoring, tax jurisdiction lookup, and timezone data via a REST API, accessed using an API key issued to your account.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">3. Accounts</h3>
            <p className="text-[#6f6f6e]">
              You are responsible for maintaining the confidentiality of your API keys and for all activity that occurs under your account. You must notify us promptly of any unauthorized use of your account or keys.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">4. Acceptable Use</h3>
            <p className="text-[#6f6f6e]">
              You agree not to: (a) use the Service to violate any law; (b) attempt to reverse-engineer, scrape, or resell the Service's underlying data as a standalone product; (c) exceed reasonable request rates in a manner that degrades the Service for other users; (d) use the Service to process data you do not have the right to process.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">5. Fees and Billing</h3>
            <p className="text-[#6f6f6e]">
              Paid tiers are billed monthly in advance, with usage overage billed in arrears at the rates published on our pricing page. Failure to pay may result in suspension of your account until payment is resolved.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">6. Free Tier</h3>
            <p className="text-[#6f6f6e]">
              The free tier provides a lifetime total of 500 lookups per account and is offered at our discretion. We reserve the right to modify or discontinue the free tier with notice.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">7. Data Accuracy</h3>
            <p className="text-[#6f6f6e]">
              Address, deliverability, tax, and timezone data are provided "as is." While we strive for accuracy, the Service does not guarantee that any address is deliverable, that any tax rate is current or complete, or that any geocoding result is precise. You are responsible for independently verifying data where accuracy is critical (e.g., legal or tax compliance).
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">8. Limitation of Liability</h3>
            <p className="text-[#6f6f6e]">
              To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to lost revenue, failed deliveries, or incorrect tax calculations.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">9. Termination</h3>
            <p className="text-[#6f6f6e]">
              We may suspend or terminate your account for violation of these Terms. You may cancel your account at any time from your dashboard.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">10. Changes to These Terms</h3>
            <p className="text-[#6f6f6e]">
              We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">11. Contact</h3>
            <p className="text-[#6f6f6e]">
              Questions about these Terms can be sent to legal@theaddressapi.com.
            </p>
          </section>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-6 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

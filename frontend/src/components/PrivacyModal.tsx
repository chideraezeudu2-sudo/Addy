import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
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
          <h2 className="text-2xl font-semibold text-[#141414]">Privacy Policy</h2>
          <p className="text-xs text-[#8f8f8e]">Effective Date: August 7, 2026</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#292929] leading-relaxed font-sans divide-y divide-black/5">
          <section className="pt-2">
            <h3 className="font-semibold text-[#141414] mb-1">1. Information We Collect</h3>
            <ul className="list-disc pl-5 text-[#6f6f6e] space-y-1">
              <li><strong>Account information:</strong> email address, password (hashed), billing information (processed by Stripe; we do not store full card numbers).</li>
              <li><strong>API usage data:</strong> the addresses and coordinates you submit for lookups, timestamps, and request counts, used to provide the Service and calculate billing.</li>
              <li><strong>Technical data:</strong> IP address, browser/user-agent, for security and abuse prevention.</li>
            </ul>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">2. How We Use Information</h3>
            <p className="text-[#6f6f6e]">
              We use collected information to: provide and bill for the Service; monitor for abuse or unusual usage patterns; communicate with you about your account, billing, or Service updates; improve the accuracy and reliability of the Service.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">3. Address Data Handling</h3>
            <p className="text-[#6f6f6e]">
              Addresses submitted through the API are cached temporarily (up to 30 days) to improve performance and reduce cost, and may be used in aggregate, de-identified form to improve deliverability scoring over time. We do not sell submitted address data to third parties.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">4. Third-Party Providers</h3>
            <p className="text-[#6f6f6e]">
              We rely on third-party providers to deliver parts of the Service, including geocoding providers, a deliverability verification provider, and Stripe for payment processing. These providers receive only the data necessary to perform their function.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">5. Data Retention</h3>
            <p className="text-[#6f6f6e]">
              Account data is retained for as long as your account is active. Cached address lookup data expires automatically after 30 days. You may request deletion of your account and associated data at any time via your dashboard's Settings tab or by contacting us.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">6. Your Rights</h3>
            <p className="text-[#6f6f6e]">
              Depending on your location, you may have the right to access, correct, or delete your personal data, or to object to certain processing. Contact us at privacy@theaddressapi.com to exercise these rights.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">7. Security</h3>
            <p className="text-[#6f6f6e]">
              We use industry-standard measures, including encryption in transit, to protect your data. No system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">8. Children's Privacy</h3>
            <p className="text-[#6f6f6e]">
              The Service is not directed to individuals under 18, and we do not knowingly collect information from them.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">9. Changes to This Policy</h3>
            <p className="text-[#6f6f6e]">
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or a notice within the dashboard.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="font-semibold text-[#141414] mb-1">10. Contact</h3>
            <p className="text-[#6f6f6e]">
              Questions about this Privacy Policy can be sent to privacy@theaddressapi.com.
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

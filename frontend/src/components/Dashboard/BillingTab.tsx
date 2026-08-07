import React, { useState, useEffect } from 'react';
import { PLANS } from '../../plans';
import { createCheckoutSession, getInvoices, getPaymentMethod } from '../../api';
import { User, TierType, BillingInvoice } from '../../types';

interface BillingTabProps {
  user: User;
  usageCount: number;
  usageHistory: { date: string; count: number }[];
  invoices: BillingInvoice[];
  onRefreshState: () => void;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  user,
  usageCount,
  usageHistory,
  invoices: propInvoices,
  onRefreshState
}) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<TierType | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [downgradePlan, setDowngradePlan] = useState<TierType | null>(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [invoices, setInvoices] = useState<BillingInvoice[]>(propInvoices);
  const [paymentMethod, setPaymentMethod] = useState<{ brand: string; last4: string; expMonth: number; expYear: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stripe Form State
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [processingStripe, setProcessingStripe] = useState(false);

  const currentPlanDetails = PLANS[user.currentPlan];
  const isFree = user.currentPlan === 'free';

  // Load invoices and payment method on mount
  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const [loadedInvoices, loadedPaymentMethod] = await Promise.all([
          getInvoices(),
          getPaymentMethod()
        ]);
        setInvoices(loadedInvoices);
        setPaymentMethod(loadedPaymentMethod);
      } catch (error) {
        console.error('Failed to load billing data:', error);
      }
    };
    loadBillingData();
  }, []);

  const handleSelectPlan = (tier: TierType) => {
    if (tier === user.currentPlan) return;

    const currentMonthly = PLANS[user.currentPlan].priceMonthly;
    const targetMonthly = PLANS[tier].priceMonthly;

    if (targetMonthly > currentMonthly) {
      // Upgrade -> Redirect to Stripe Checkout
      setSelectedUpgradePlan(tier);
      setShowPlanModal(false);
      handleUpgradeToStripe(tier);
    } else {
      // Downgrade confirmation
      setDowngradePlan(tier);
      setShowPlanModal(false);
    }
  };

  const handleUpgradeToStripe = async (tier: TierType) => {
    setIsLoading(true);
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/dashboard/billing?success=true`;
      const cancelUrl = `${origin}/dashboard/billing?canceled=true`;
      
      const { checkout_url } = await createCheckoutSession(tier, successUrl, cancelUrl);
      
      // Redirect to Stripe Checkout
      if (checkout_url) {
        window.location.href = checkout_url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpgradePlan) return;

    setProcessingStripe(true);
    handleUpgradeToStripe(selectedUpgradePlan);
  };

  const handleConfirmDowngrade = () => {
    // Note: Actual downgrade should be handled via Stripe customer portal
    // or backend endpoint
    setDowngradePlan(null);
    onRefreshState();
  };

  const handleCancelSubscription = () => {
    // Note: Actual cancellation should be handled via Stripe customer portal
    setShowCancelModal(false);
    onRefreshState();
  };

  const handleDownloadInvoice = (inv: BillingInvoice) => {
    if (inv.invoiceUrl && inv.invoiceUrl !== '#') {
      window.open(inv.invoiceUrl, '_blank');
    } else {
      const text = `INVOICE #${inv.id}\nDate: ${inv.date}\nAmount: ${inv.amount}\nPlan: ${inv.planName}\nStatus: ${inv.status}\n\nThank you for choosing Addy!`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${inv.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const maxHistoryValue = Math.max(...usageHistory.map((h) => h.count), 10);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Active Plan Prominent Header */}
      <div className="bg-[#141414] text-white rounded-xl p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs text-[#4cc02b] font-mono font-semibold uppercase tracking-widest">
            CURRENT PLAN
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight">
              {currentPlanDetails.name} Plan
            </h1>
            <span className="text-xl font-mono text-[#d0d0c8]">{currentPlanDetails.price}</span>
          </div>
          <p className="text-sm text-[#8f8f8e]">
            {currentPlanDetails.includedLookupsLabel} • Overage rate: {currentPlanDetails.overageRate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPlanModal(true)}
            className="h-11 px-6 rounded-full bg-white text-[#141414] font-semibold text-xs hover:bg-[#edede8] transition-colors shadow-sm"
            id="billing-change-plan-btn"
          >
            Change plan
          </button>
        </div>
      </div>

      {/* Usage Statistics & Graph */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#141414]">Usage History (Last 14 Days)</h3>
            <p className="text-xs text-[#6f6f6e]">
              Total lookups this billing period: <span className="font-mono font-bold text-[#141414]">{usageCount.toLocaleString()}</span>
            </p>
          </div>

          <div className="text-xs text-[#8f8f8e] font-mono">
            Quota resets: {new Date(user.billingCycleEnd).toLocaleDateString()}
          </div>
        </div>

        {/* Bar Graph */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 border-b border-black/5 pb-2">
          {usageHistory.map((h, i) => {
            const barHeightPct = Math.max(8, Math.round((h.count / maxHistoryValue) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-[#141414] text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {h.count} lookups
                </div>

                <div
                  className="w-full bg-[#141414] group-hover:bg-[#4cc02b] transition-colors rounded-t-md"
                  style={{ height: `${barHeightPct}%` }}
                ></div>
                <span className="text-[10px] text-[#8f8f8e] font-mono truncate w-full text-center">
                  {h.date.split(' ')[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#141414]">Payment Method</h3>
          {paymentMethod ? (
            <p className="text-xs text-[#6f6f6e]">
              {paymentMethod.brand} ending in <span className="font-mono font-bold">{paymentMethod.last4}</span> (Expires {paymentMethod.expMonth}/{paymentMethod.expYear})
            </p>
          ) : (
            <p className="text-xs text-[#8f8f8e]">No payment method on file (Free tier)</p>
          )}
        </div>

        <button
          onClick={() => setShowPaymentMethodModal(true)}
          className="h-9 px-5 rounded-full bg-[#dbdbd2] text-[#292929] text-xs font-semibold hover:bg-[#c0c0c0] transition-colors"
          id="billing-update-pm-btn"
        >
          Update payment method
        </button>
      </div>

      {/* Billing History Table */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#141414]">Billing History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 text-[#8f8f8e] uppercase tracking-wider font-semibold">
                <th className="py-3 px-2">Invoice ID</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Plan</th>
                <th className="py-3 px-2">Amount</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-mono text-[#292929]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#8f8f8e] font-sans">
                    No billing history yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#edede8]/40">
                    <td className="py-3 px-2 font-bold">{inv.id}</td>
                    <td className="py-3 px-2">{inv.date}</td>
                    <td className="py-3 px-2 font-sans">{inv.planName}</td>
                    <td className="py-3 px-2">{inv.amount}</td>
                    <td className="py-3 px-2">
                      <span className="bg-[#4cc02b]/10 text-[#4cc02b] px-2 py-0.5 rounded text-[10px]">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="text-[#141414] font-sans font-semibold underline hover:text-[#6f6f6e]"
                      >
                        Download invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Subscription link */}
      {!isFree && (
        <div className="pt-4 border-t border-black/5 flex justify-end">
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-[#8f8f8e] hover:text-red-600 transition-colors underline"
            id="billing-cancel-sub-link"
          >
            Cancel subscription
          </button>
        </div>
      )}

      {/* CHANGE PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-4xl p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#edede8] text-[#6f6f6e] hover:text-[#141414] font-bold text-lg"
            >
              ×
            </button>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-[#141414]">Select a Plan</h2>
              <p className="text-sm text-[#6f6f6e]">
                Choose the quota tier that matches your expected address lookup volume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(Object.keys(PLANS) as TierType[]).map((tKey) => {
                const planItem = PLANS[tKey];
                const isCurrent = user.currentPlan === tKey;

                return (
                  <div
                    key={tKey}
                    className={`rounded-xl p-5 border flex flex-col justify-between space-y-4 ${
                      isCurrent
                        ? 'border-2 border-[#141414] bg-[#edede8]/50'
                        : 'border-black/10 bg-white hover:border-black/30'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="font-semibold text-sm text-[#141414] uppercase">{planItem.name}</div>
                      <div className="text-xl font-bold font-mono text-[#141414]">{planItem.price}</div>
                      <div className="text-[11px] text-[#6f6f6e]">{planItem.includedLookupsLabel}</div>
                      <div className="text-[10px] text-[#8f8f8e]">Overage: {planItem.overageRate}</div>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(tKey)}
                      disabled={isCurrent}
                      className={`w-full h-9 rounded-full text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-[#c0c0c0] text-[#6f6f6e] cursor-default'
                          : 'bg-[#141414] text-white hover:bg-black'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : `Select ${planItem.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STRIPE HOSTED CHECKOUT SIMULATOR */}
      {showStripeModal && selectedUpgradePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2 font-bold text-sm tracking-widest text-[#141414]">
                <span>◈ STRIPE CHECKOUT</span>
              </div>
              <button
                onClick={() => setShowStripeModal(false)}
                className="text-xs font-bold text-[#8f8f8e] hover:text-[#141414]"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-[#8f8f8e] uppercase tracking-wider font-semibold">
                Subscribe to
              </div>
              <div className="text-2xl font-normal text-[#141414]">
                {PLANS[selectedUpgradePlan].name}: {PLANS[selectedUpgradePlan].price}
              </div>
              <div className="text-xs text-[#6f6f6e]">
                Includes {PLANS[selectedUpgradePlan].includedLookupsLabel}
              </div>
            </div>

            <form onSubmit={handleStripePay} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent font-mono text-xs focus:border-[#141414] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                    Expires
                  </label>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent font-mono text-xs focus:border-[#141414] outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent font-mono text-xs focus:border-[#141414] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processingStripe}
                className="w-full h-11 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                id="stripe-pay-btn"
              >
                {processingStripe ? 'Processing payment...' : `Pay ${PLANS[selectedUpgradePlan].price}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOWNGRADE CONFIRMATION MODAL */}
      {downgradePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-semibold text-[#141414]">Confirm Plan Change</h3>

            <p className="text-sm text-[#6f6f6e] leading-relaxed">
              Your plan will change to <span className="font-semibold text-[#141414]">{PLANS[downgradePlan].name}</span> at the end of your current billing period.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDowngradePlan(null)}
                className="h-10 px-5 rounded-full bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDowngrade}
                className="h-10 px-6 rounded-full bg-[#141414] text-white text-xs font-medium hover:bg-black"
                id="confirm-downgrade-btn"
              >
                Confirm downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE PAYMENT METHOD MODAL */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-semibold text-[#141414]">Update Payment Method</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowPaymentMethodModal(false);
                if (user.paymentMethod) {
                  user.paymentMethod.last4 = cardNumber.slice(-4) || '4242';
                  onRefreshState();
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                  Card Number
                </label>
                <input
                  type="text"
                  defaultValue="4242 4242 4242 4242"
                  className="w-full h-10 px-3 rounded-lg bg-[#edede8] border border-transparent font-mono text-xs focus:border-[#141414] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentMethodModal(false)}
                  className="h-10 px-5 rounded-full bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#141414] text-white text-xs font-medium hover:bg-black"
                  id="save-pm-btn"
                >
                  Save card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL SUBSCRIPTION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-black/10 w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-semibold text-red-600">Cancel Subscription</h3>

            <p className="text-sm text-[#6f6f6e] leading-relaxed">
              Your account will move to the free tier at the end of the billing period. Cancel subscription?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="h-10 px-5 rounded-full bg-[#edede8] text-[#292929] text-xs font-medium hover:bg-[#dbdbd2]"
              >
                Never mind
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                className="h-10 px-6 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                id="confirm-cancel-sub-btn"
              >
                Confirm cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

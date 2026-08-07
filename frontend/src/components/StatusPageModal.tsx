import React from 'react';

interface StatusPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusPageModal: React.FC<StatusPageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const services = [
    { name: 'Autocomplete API Engine (/v1/autocomplete)', status: 'Operational', latency: '18ms', uptime: '99.99%' },
    { name: 'Forward Geocoding (/v1/geocode)', status: 'Operational', latency: '24ms', uptime: '100.0%' },
    { name: 'Reverse Geocoding (/v1/reverse)', status: 'Operational', latency: '21ms', uptime: '99.98%' },
    { name: 'USPS CASS Deliverability Pipeline', status: 'Operational', latency: '32ms', uptime: '99.99%' },
    { name: 'Tax Jurisdiction Data Cache', status: 'Operational', latency: '12ms', uptime: '100.0%' },
    { name: 'Timezone Resolver Subsystem', status: 'Operational', latency: '8ms', uptime: '100.0%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-black/10 w-full max-w-2xl p-8 max-h-[85vh] overflow-y-auto relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#edede8] text-[#6f6f6e] hover:text-[#141414] font-bold text-lg"
        >
          ×
        </button>

        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-[#141414]">API System Status</h2>
            <p className="text-xs text-[#8f8f8e]">Live infrastructure monitoring across global Edge nodes</p>
          </div>

          <div className="flex items-center gap-2 bg-[#4cc02b]/10 text-[#4cc02b] px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#4cc02b] animate-ping"></span>
            <span>All Systems Operational</span>
          </div>
        </div>

        <div className="space-y-3">
          {services.map((s, idx) => (
            <div key={idx} className="bg-[#edede8]/60 p-4 rounded-xl flex items-center justify-between text-xs border border-black/5">
              <div className="space-y-0.5">
                <div className="font-semibold text-[#141414]">{s.name}</div>
                <div className="text-[10px] text-[#8f8f8e] font-mono">Uptime (30d): {s.uptime}</div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <span className="text-[#6f6f6e]">{s.latency}</span>
                <span className="bg-[#4cc02b] text-white px-2 py-0.5 rounded font-bold text-[10px]">
                  {s.status}
                </span>
              </div>
            </div>
          ))}
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

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Luggage, 
  Search, 
  Plane, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PackageCheck,
  PlaneTakeoff
} from 'lucide-react';

const MILESTONES = [
  { key: 'Checked-In', label: 'Checked-In', desc: 'Received at Airport Bag Drop', icon: PackageCheck },
  { key: 'In-Transit', label: 'In-Transit', desc: 'Security Screened & Loaded to Tarmac Dolly', icon: Clock },
  { key: 'On-Plane', label: 'On-Plane', desc: 'Secured inside Aircraft Cargo Hold', icon: PlaneTakeoff },
  { key: 'Ready-for-Pickup', label: 'Ready for Pickup', desc: 'Discharged on Terminal Baggage Carousel', icon: CheckCircle2 }
];

const BaggageTracker = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTracking = searchParams.get('tracking') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [baggage, setBaggage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBaggage = async (trackId) => {
    if (!trackId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/baggage/tracking/${encodeURIComponent(trackId.trim())}`);
      if (res?.data) {
        setBaggage(res.data);
      } else {
        throw new Error('Baggage tag not found');
      }
    } catch (err) {
      setBaggage(null);
      setError(err.response?.data?.message || err.message || 'Tracking ID not found in airline records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTracking) {
      fetchBaggage(initialTracking);
    }
  }, [initialTracking]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setSearchParams({ tracking: trackingNumber.trim() });
    fetchBaggage(trackingNumber.trim());
  };

  const getStepProgressIndex = (status) => {
    if (!status) return 0;
    const idx = MILESTONES.findIndex((m) => m.key.toLowerCase() === status.toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  const currentStep = baggage ? getStepProgressIndex(baggage.STATUS) : 0;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="bg-[#DEEBFF] text-[#0052CC] p-3 rounded-2xl w-fit mx-auto border border-blue-200">
            <Luggage className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#091E42]">Live Baggage Tracking</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Scan checkpoints continuously stream baggage updates from origin check-in counter to destination carousel claim.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                placeholder="Enter Baggage Barcode / Tracking ID (e.g. TRK-1001-A)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3.5 font-mono font-bold uppercase text-sm text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold px-8 py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Scanning...' : 'Track Bag'}</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <LoadingSpinner text="Retrieving baggage tracking records..." />
          </div>
        )}

        {baggage && !loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in-up">
            
            {/* Bag Info Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Baggage Barcode
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0052CC]">
                  {baggage.TRACKINGNUMBER}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Weight: <span className="font-bold text-[#091E42]">{baggage.WEIGHTKG || 15} kg</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Current Status
                </span>
                <StatusBadge status={baggage.STATUS} />
              </div>
            </div>

            {/* Visual Milestones Stepper */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Handling Pipeline Checkpoints
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                  {MILESTONES.map((step, idx) => {
                    const isPassed = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const IconComp = step.icon;

                    return (
                      <div
                        key={step.key}
                        className={`bg-white rounded-2xl p-4 border transition-all ${
                          isCurrent
                            ? 'border-[#0052CC] ring-2 ring-[#0052CC]/20 shadow-md'
                            : isPassed
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex sm:flex-col items-center sm:text-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isPassed
                                ? 'bg-[#0052CC] text-white shadow-sm'
                                : 'bg-[#F4F5F7] text-slate-400'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>

                          <div>
                            <p className="font-bold text-xs text-[#091E42]">{step.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Associated Flight & Passenger Segment */}
            {baggage.FLIGHTNUMBER && (
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#DEEBFF] text-[#0052CC] p-2 rounded-xl">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#091E42] block">
                      Flight {baggage.FLIGHTNUMBER}
                    </span>
                    <span className="text-slate-500">
                      {baggage.DEPARTUREAIRPORT} ➔ {baggage.ARRIVALAIRPORT}
                    </span>
                  </div>
                </div>

                {baggage.CAROUSEL && (
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Carousel Claim</span>
                    <span className="font-bold text-base text-[#0052CC]">{baggage.CAROUSEL}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default BaggageTracker;

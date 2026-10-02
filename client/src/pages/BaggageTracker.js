import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
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
  { key: 'Checked-In', label: 'Checked-In', desc: 'Received at Departure Counter', icon: PackageCheck },
  { key: 'In-Transit', label: 'In-Transit', desc: 'Screened & Loaded to Cart', icon: Clock },
  { key: 'On-Plane', label: 'On-Plane', desc: 'Secured in Cargo Hold', icon: PlaneTakeoff },
  { key: 'Ready-for-Pickup', label: 'Ready for Pickup', desc: 'Arrived at Carousel Baggage Claim', icon: CheckCircle2 }
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
      setError(err.message || 'Tracking ID not found in airline records');
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

  const getActiveStepIndex = (status) => {
    if (!status) return 0;
    const idx = MILESTONES.findIndex(
      (m) => m.key.toLowerCase() === status.toLowerCase()
    );
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = baggage ? getActiveStepIndex(baggage.STATUS) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <Luggage className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Live Baggage Tracking</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Monitor real-time handling milestones and cargo status for your checked baggage.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter Tag / Tracking Number (e.g. TRK-AA101-001)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
            >
              Track Luggage
            </button>
          </form>
        </div>

        {/* Result Area */}
        {loading && <LoadingSpinner fullPage text="Locating baggage tag across flight hubs..." />}

        {error && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
            <h4 className="font-bold">Tracking Record Not Found</h4>
            <p className="text-xs text-rose-400">{error}</p>
          </div>
        )}

        {baggage && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
            {/* Bag Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Tracking Code</span>
                <p className="text-2xl font-mono font-extrabold text-white">
                  {baggage.TRACKINGNUMBER}
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">Weight</span>
                  <p className="text-lg font-bold text-white">{baggage.WEIGHTKG} kg</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400">Current Status</span>
                  <div className="mt-1">
                    <StatusBadge status={baggage.STATUS} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-4">
              <div className="relative">
                {/* Connecting Progress Line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${(currentStepIdx / (MILESTONES.length - 1)) * 100}%`
                    }}
                  ></div>
                </div>

                {/* Milestone Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
                  {MILESTONES.map((m, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const IconComp = m.icon;

                    return (
                      <div
                        key={m.key}
                        className="flex sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0 space-y-0 sm:space-y-3"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-bold ring-4 ring-amber-500/30 scale-110 shadow-lg'
                              : isCompleted
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>

                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-amber-400'
                                : isCompleted
                                ? 'text-white'
                                : 'text-slate-500'
                            }`}
                          >
                            {m.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Associated Flight & Ticket details if available */}
            {baggage.FLIGHTNUMBER && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Plane className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white">Flight {baggage.FLIGHTNUMBER}</span>
                </div>
                <div className="text-slate-400">
                  Passenger: <span className="text-slate-200 font-medium">{baggage.PASSENGERNAME || 'Verified'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaggageTracker;

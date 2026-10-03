import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Search, 
  User, 
  AlertCircle, 
  Printer, 
  ShieldCheck
} from 'lucide-react';

const ManageBooking = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('reference') || '';
  const { formatPrice } = useCurrency();

  const [reference, setReference] = useState(initialRef);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooking = async (refToFetch) => {
    if (!refToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/bookings/lookup/${encodeURIComponent(refToFetch.trim().toUpperCase())}`);
      if (res?.data?.data) {
        setBooking(res.data.data);
      } else {
        setError('Booking not found for this reference.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No booking found. Please check your reference.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchBooking(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reference.trim()) {
      fetchBooking(reference.trim());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (ts) => {
    if (!ts) return '--:--';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">Passenger Services</span>
          <h1 className="text-3xl font-extrabold text-[#091E42]">Manage Booking / PNR Lookup</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Retrieve flight details, check passenger manifest, and print your digital boarding pass using your 6-character PNR reference.
          </p>
        </div>

        {/* Lookup Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                maxLength={12}
                placeholder="Enter 6-char PNR (e.g. EA-9X2K4L or 6 alphanumeric)"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3.5 font-mono font-bold uppercase text-base text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold px-8 py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Retrieve Booking'}</span>
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <LoadingSpinner text="Retrieving booking details..." />
          </div>
        )}

        {/* Booking Details View */}
        {booking && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
            
            {/* Header Ribbon */}
            <div className="bg-[#091E42] text-white p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-300 tracking-widest block">
                  Confirmed Booking Reference
                </span>
                <span className="font-mono text-3xl font-extrabold tracking-wider text-white">
                  {booking.bookingReference || reference}
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Booked on {formatDate(booking.bookingDate)}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <StatusBadge status={booking.status || 'Confirmed'} />
                <button
                  onClick={handlePrint}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>

            {/* Flight & Passenger Info */}
            <div className="p-6 space-y-6">
              
              {/* Primary User / Booked By */}
              {booking.user && (
                <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Primary Contact / Booked By</span>
                    <span className="font-bold text-[#091E42] text-sm">
                      {booking.user.firstName} {booking.user.lastName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Contact Email</span>
                    <span className="font-medium text-slate-700">{booking.user.email}</span>
                  </div>
                </div>
              )}

              {/* Passenger & Ticket Cards */}
              <div>
                <h3 className="font-bold text-sm text-[#091E42] uppercase tracking-wider mb-3">
                  Reserved Tickets & Flight Segment
                </h3>

                {booking.tickets && booking.tickets.length > 0 ? (
                  <div className="space-y-4">
                    {booking.tickets.map((t, idx) => (
                      <div
                        key={t.ticketId || idx}
                        className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#0052CC] transition space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-[#0052CC]" />
                            <span className="font-bold text-sm text-[#091E42]">
                              {t.passengerFirstName || t.passengerLastName
                                ? `${t.passengerFirstName} ${t.passengerLastName}`
                                : `Passenger ${idx + 1}`}
                            </span>
                            <span className="text-xs bg-[#DEEBFF] text-[#0052CC] font-bold px-2 py-0.5 rounded-full">
                              {t.class || 'Economy'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-xs font-semibold">
                            <span>Seat: <span className="font-mono text-[#0052CC] font-bold text-sm">{t.seatNumber || 'Assigned'}</span></span>
                            <span>Ticket: <span className="font-mono text-slate-500">#{t.ticketId}</span></span>
                          </div>
                        </div>

                        {/* Flight Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                          <div>
                            <span className="text-slate-400 block">Flight</span>
                            <span className="font-mono font-bold text-sm text-[#091E42]">{t.flightNumber || 'Enum Airways Flight'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Departure</span>
                            <span className="font-bold text-slate-800">{formatTime(t.departureTime)}</span>
                            <span className="text-[11px] text-slate-500 block">{formatDate(t.departureTime)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Arrival</span>
                            <span className="font-bold text-slate-800">{formatTime(t.arrivalTime)}</span>
                            <span className="text-[11px] text-slate-500 block">{formatDate(t.arrivalTime)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No individual tickets attached to this reservation.</p>
                )}
              </div>

              {/* Price Summary */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-xs text-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Booking Verified • Payment Completed</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Amount Paid</span>
                  <span className="text-2xl font-extrabold text-[#091E42]">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageBooking;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Calendar, 
  Plane, 
  ExternalLink, 
  XCircle, 
  AlertCircle, 
  CheckCircle2,
  Ticket
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const { formatPrice } = useCurrency();

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings/user/my-bookings');
      if (res?.data) {
        setBookings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.delete(`/bookings/${bookingId}`);
      setSuccessMsg('Booking cancelled successfully and seats released.');
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">Passenger Itineraries</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091E42]">My Trips & Bookings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review upcoming flights, manage seat allocations, and download digital boarding passes.
            </p>
          </div>

          <Link
            to="/"
            className="self-start sm:self-auto bg-[#0052CC] hover:bg-[#003A8C] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
          >
            Book New Flight
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2 text-xs animate-fade-in-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-xs animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <LoadingSpinner text="Retrieving your bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-[#091E42]">No Flights Booked Yet</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              You don't have any flight reservations on your account. Search our domestic Indian network to book your next trip.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#0052CC] text-white font-bold px-6 py-2.5 rounded-xl text-xs"
            >
              Search Indian Flights
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isCancelled = b.status === 'Cancelled' || b.STATUS === 'Cancelled';
              const bId = b.bookingId || b.BOOKINGID;
              const ref = b.bookingReference || b.BOOKINGREFERENCE || `EA-${bId}`;
              const amount = b.totalAmount !== undefined ? b.totalAmount : b.TOTALAMOUNT;
              const dateVal = b.bookingDate || b.BOOKINGDATE;
              const tCount = b.ticketCount || b.TICKETCOUNT || 1;

              return (
                <div
                  key={bId}
                  className="bg-white border border-slate-200 hover:border-[#0052CC] rounded-2xl p-6 shadow-sm transition space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#DEEBFF] text-[#0052CC] p-2 rounded-xl">
                        <Plane className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-extrabold text-base text-[#091E42]">
                            {ref}
                          </span>
                          <StatusBadge status={b.status || b.STATUS || 'Confirmed'} />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Booked on {formatDate(dateVal)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fare</span>
                      <span className="text-lg font-extrabold text-[#091E42]">
                        {formatPrice(amount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Ticket info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Ticket className="w-4 h-4 text-[#0052CC]" />
                      <span className="font-semibold">{tCount} Ticket(s) Reserved</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/booking/confirmation/${bId}`}
                        className="bg-[#DEEBFF] hover:bg-[#B3D4FF] text-[#0052CC] px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Boarding Pass</span>
                      </Link>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(bId)}
                          disabled={cancellingId === bId}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{cancellingId === bId ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBookings;

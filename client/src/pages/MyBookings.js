import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Calendar, 
  Plane, 
  ExternalLink, 
  XCircle, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings/user/my-bookings');
      if (res?.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
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
      setSuccessMsg('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Flight Bookings</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your upcoming flights, view issued tickets, or cancel reservations.
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow shadow-blue-600/20"
          >
            <Plane className="w-4 h-4" />
            <span>Book New Flight</span>
          </Link>
        </div>

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-4 rounded-xl flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{successMsg}</p>
          </div>
        )}

        {loading ? (
          <LoadingSpinner fullPage text="Retrieving your bookings from Oracle..." />
        ) : bookings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              You haven't reserved any flights yet. Start your next adventure today!
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition"
            >
              Explore Flights
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((b) => (
              <div
                key={b.bookingId}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-lg transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-lg text-white">
                      {b.bookingReference || `BK-${b.bookingId}`}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    Booked on {new Date(b.bookingDate).toLocaleDateString()} at{' '}
                    {new Date(b.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {b.ticketCount > 0 && (
                    <p className="text-xs text-blue-400 font-medium">
                      {b.ticketCount} Passenger Ticket{b.ticketCount > 1 ? 's' : ''} Issued
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">Amount</span>
                    <p className="text-xl font-extrabold text-emerald-400 font-mono">
                      ${b.totalAmount}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/booking/confirmation/${b.bookingId}`}
                      className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </Link>

                    {b.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(b.bookingId)}
                        disabled={cancellingId === b.bookingId}
                        className="flex items-center space-x-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{cancellingId === b.bookingId ? 'Cancelling...' : 'Cancel'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

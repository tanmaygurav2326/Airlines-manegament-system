import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { 
  CheckCircle2, 
  Printer, 
  Plane, 
  User, 
  Armchair, 
  ArrowRight
} from 'lucide-react';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        if (res?.data) {
          setBooking(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Generating Official Boarding Pass..." />;
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300 text-center">
        <h3 className="font-bold text-lg">Booking Not Found</h3>
        <p className="text-sm mt-1">{error}</p>
        <Link
          to="/"
          className="inline-block mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const tickets = booking.tickets || [];
  const firstTicket = tickets[0];
  const flight = firstTicket?.flight;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Booking Confirmed!</h1>
          <p className="text-slate-400 text-sm">
            Your flight tickets have been issued and saved to your account.
          </p>
        </div>

        {/* Boarding Pass Card */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-blue-700 to-sky-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-white">
            <div className="flex items-center space-x-2">
              <Plane className="w-6 h-6" />
              <span className="font-bold text-lg tracking-wide">SkyWings Boarding Pass</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-sky-200">Booking Ref:</span>
              <span className="font-mono font-extrabold text-lg px-2.5 py-0.5 bg-black/30 rounded-lg">
                {booking.bookingReference || `BK-${booking.bookingId}`}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Flight Route Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Flight</p>
                <p className="text-2xl font-black text-white font-mono">
                  {flight?.flightNumber || 'FLIGHT'}
                </p>
              </div>

              <div className="text-center">
                <StatusBadge status={booking.status} />
                <p className="text-xs text-slate-400 mt-1">
                  Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-semibold">Total Paid</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  ${booking.totalAmount || '0.00'}
                </p>
              </div>
            </div>

            {/* Tickets per passenger */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Ticket Details ({tickets.length} Passenger{tickets.length > 1 ? 's' : ''})
              </h3>

              {tickets.map((t, idx) => (
                <div
                  key={t.ticketId || idx}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-xl">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {t.passenger?.firstName} {t.passenger?.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        Passport: {t.passenger?.passportNumber || 'N/A'} • {t.passenger?.nationality}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Class</span>
                      <p className="text-xs font-semibold text-sky-300">{t.cabinClass}</p>
                    </div>

                    <div className="text-center bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Armchair className="w-3 h-3 text-blue-400" />
                        Seat
                      </span>
                      <p className="text-base font-black text-white font-mono">{t.seatNumber}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Fare</span>
                      <p className="text-xs font-bold text-emerald-400">${t.ticketPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Barcode */}
            <div className="pt-4 border-t border-slate-800 flex flex-col items-center justify-center space-y-2">
              <div className="font-mono text-xl tracking-[0.35em] text-slate-400 font-bold select-none">
                ||| | |||| | || ||||| | ||| |||| | |||
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {booking.bookingReference || `BK-${booking.bookingId}`} • ELECTRONIC TICKET
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Boarding Pass</span>
          </button>

          <Link
            to="/my-bookings"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition"
          >
            <span>View in My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

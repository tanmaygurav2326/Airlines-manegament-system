import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  CheckCircle2, 
  Printer, 
  Plane
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const { formatPrice } = useCurrency();
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
        setError(err.response?.data?.message || err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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

  if (loading) {
    return <LoadingSpinner text="Generating Official Enum Airways Boarding Pass..." />;
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-sm">
        <h3 className="font-bold text-lg text-red-600">Booking Confirmation Failed</h3>
        <p className="text-xs text-slate-500">{error || 'Booking record could not be loaded.'}</p>
        <Link
          to="/"
          className="inline-block mt-2 bg-[#0052CC] text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const tickets = booking.tickets || [];
  const firstTicket = tickets[0] || {};
  const flight = firstTicket.flight || {};

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm animate-fade-in-up">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[#091E42] font-display">Booking Confirmed!</h1>
          <p className="text-xs text-slate-500">
            Your flight reservation is confirmed and guaranteed. An electronic ticket receipt has been recorded.
          </p>
        </div>

        {/* Digital Boarding Pass Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in-up">
          
          {/* Top Pass Header */}
          <div className="bg-[#0052CC] text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <img 
                src={logoImg} 
                alt="Enum Airways" 
                className="h-12 w-12 rounded-xl object-cover border border-white/20" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.jpg';
                }}
              />
              <div>
                <span className="font-extrabold text-xl tracking-tight block">Enum Airways</span>
                <span className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">
                  Official Boarding Pass
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-widest block">
                Booking Reference (PNR)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-white">
                {booking.bookingReference || `EA-${booking.bookingId}`}
              </span>
            </div>
          </div>

          {/* Flight Path Strip */}
          <div className="bg-[#F8F9FA] px-6 sm:px-8 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-2xl font-extrabold text-[#091E42]">
                  {flight.departureAirport || 'BOM'}
                </span>
                <span className="text-xs text-slate-500 block">Departure Hub</span>
              </div>

              <div className="flex flex-col items-center px-4">
                <Plane className="w-5 h-5 text-[#0052CC]" />
                <span className="text-[10px] text-emerald-700 font-bold uppercase mt-1">Non-stop</span>
              </div>

              <div>
                <span className="text-2xl font-extrabold text-[#091E42]">
                  {flight.arrivalAirport || 'DEL'}
                </span>
                <span className="text-xs text-slate-500 block">Arrival Hub</span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-slate-400 block">Flight Number</span>
              <span className="font-mono font-bold text-base text-[#0052CC]">
                {flight.flightNumber || 'EA 201'}
              </span>
            </div>
          </div>

          {/* Passenger & Ticket Breakdown */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Passenger</span>
                <span className="font-bold text-[#091E42] text-sm truncate block">
                  {booking.user?.firstName || 'Traveler'} {booking.user?.lastName || ''}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Seat(s)</span>
                <span className="font-mono font-bold text-[#0052CC] text-sm">
                  {tickets.map((t) => t.seatNumber).join(', ') || 'Assigned'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Cabin Class</span>
                <span className="font-bold text-[#091E42] text-sm">
                  {firstTicket.class || 'Economy'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Boarding Gate</span>
                <span className="font-bold text-[#091E42] text-sm">
                  Gate {flight.gate || 'T2-G14'}
                </span>
              </div>
            </div>

            {/* Timings Strip */}
            <div className="bg-[#F4F5F7] p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Departure Time</span>
                <span className="font-bold text-[#091E42] text-base">{formatTime(flight.departureTime)}</span>
                <span className="text-[11px] text-slate-500 block">{formatDate(flight.departureTime)}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Arrival Time</span>
                <span className="font-bold text-[#091E42] text-base">{formatTime(flight.arrivalTime)}</span>
                <span className="text-[11px] text-slate-500 block">{formatDate(flight.arrivalTime)}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Boarding Closes</span>
                <span className="font-bold text-amber-700 text-base">25 Mins Prior</span>
                <span className="text-[11px] text-slate-500 block">Terminal 2 / T3</span>
              </div>
            </div>

            {/* Mock Barcode for Digital Boarding */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Digital Boarding Barcode
                </span>
                <div className="h-10 w-64 bg-slate-800 rounded flex items-center justify-center space-x-1 px-3">
                  {[...Array(40)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white h-7"
                      style={{ width: `${(i % 3) + 1.5}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Total Amount Paid</span>
                <span className="text-2xl font-extrabold text-[#091E42]">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="bg-[#F8F9FA] px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handlePrint}
              className="bg-[#0052CC] hover:bg-[#003A8C] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Boarding Pass</span>
            </button>

            <div className="flex items-center space-x-3 text-xs font-bold">
              <Link
                to="/my-bookings"
                className="text-[#0052CC] hover:underline"
              >
                View in My Trips
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/"
                className="text-slate-600 hover:text-[#0052CC]"
              >
                Book Another Flight
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;

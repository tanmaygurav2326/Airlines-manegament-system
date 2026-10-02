import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  CreditCard, 
  ShieldCheck, 
  Luggage, 
  User, 
  AlertCircle, 
  Lock
} from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state;
  const flight = stateData?.flight;
  const selectedSeats = stateData?.selectedSeats || [];
  const cabinClass = stateData?.cabinClass || 'Economy';
  const baseFare = stateData?.totalPrice || 0;

  // Passenger state
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('+1-555-0199');
  const [frequentFlyer, setFrequentFlyer] = useState('');

  // Baggage state
  const [baggageCount, setBaggageCount] = useState(1);
  const [baggageWeight] = useState(20);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!flight || selectedSeats.length === 0) {
      navigate('/flights');
      return;
    }

    // Attempt to load existing passenger profile
    const loadProfile = async () => {
      try {
        const res = await api.get('/passengers/me');
        if (res?.data) {
          if (res.data.PASSPORTNUMBER) setPassportNumber(res.data.PASSPORTNUMBER);
          if (res.data.NATIONALITY) setNationality(res.data.NATIONALITY);
          if (res.data.PHONENUMBER) setPhoneNumber(res.data.PHONENUMBER);
          if (res.data.FREQUENTFLYERNUMBER) setFrequentFlyer(res.data.FREQUENTFLYERNUMBER);
        }
      } catch (err) {
        // No existing profile, defaults used
      }
    };

    loadProfile();
  }, [flight, selectedSeats, navigate]);

  const baggageFee = baggageCount * 35;
  const finalTotal = baseFare + baggageFee;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!passportNumber.trim()) {
        throw new Error('Passport number is required for international booking');
      }

      // Step 1: Ensure passenger profile exists or create it
      let passengerId;
      try {
        const passRes = await api.post('/passengers', {
          passportNumber: passportNumber.trim(),
          nationality: nationality.trim(),
          phoneNumber: phoneNumber.trim(),
          frequentFlyerNumber: frequentFlyer.trim() || undefined
        });
        passengerId = passRes.data?.passengerId || passRes.data?.PASSENGERID;
      } catch (passErr) {
        // If already exists, fetch profile
        const meRes = await api.get('/passengers/me');
        passengerId = meRes.data?.PASSENGERID || meRes.data?.passengerId;
      }

      if (!passengerId) {
        throw new Error('Unable to create or verify passenger record');
      }

      // Step 2: Create Booking record
      const bookingRes = await api.post('/bookings', {
        flightId: flight.FLIGHTID
      });
      const bookingId = bookingRes.data?.bookingId || bookingRes.data?.BOOKINGID;

      if (!bookingId) {
        throw new Error('Failed to generate booking reference');
      }

      // Step 3: Create Tickets for each selected seat
      let firstTicketId;
      for (const seat of selectedSeats) {
        const ticketRes = await api.post('/bookings/tickets', {
          bookingId,
          flightId: flight.FLIGHTID,
          passengerId,
          seatNumber: seat.SEATNUMBER,
          cabinClass: seat.CLASS || cabinClass
        });
        if (!firstTicketId) {
          firstTicketId = ticketRes.data?.ticketId || ticketRes.data?.TICKETID;
        }
      }

      // Step 4: Register Baggage if requested
      if (baggageCount > 0 && firstTicketId) {
        try {
          await api.post('/baggage', {
            ticketId: firstTicketId,
            weightKg: baggageWeight
          });
        } catch (bagErr) {
          console.warn('Baggage registration warning:', bagErr.message);
        }
      }

      // Step 5: Simulate payment execution
      await api.post('/payments/simulate', {
        bookingId,
        amount: finalTotal,
        paymentMethod
      });

      // Done! Navigate to Confirmation
      navigate(`/booking/confirmation/${bookingId}`, {
        state: { bookingReference: bookingRes.data?.bookingReference }
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment and booking finalization failed');
      setLoading(false);
    }
  };

  if (!flight) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Step 3 of 4: Checkout & Payment
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Review Booking & Confirm
          </h1>
        </div>

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Left Side */}
          <div className="lg:col-span-8 space-y-6">
            {/* Passenger Identification */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center space-x-2 text-white font-semibold border-b border-slate-800 pb-3">
                <User className="w-5 h-5 text-blue-400" />
                <span>Passenger Documentation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Passport / Travel ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. N88219034"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Frequent Flyer Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="FF-90218"
                    value={frequentFlyer}
                    onChange={(e) => setFrequentFlyer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Baggage Add-On */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center space-x-2 text-white font-semibold border-b border-slate-800 pb-3">
                <Luggage className="w-5 h-5 text-amber-400" />
                <span>Checked Baggage Options</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Checked Bag (up to 23kg)</p>
                  <p className="text-xs text-slate-400">Includes real-time barcode tracking milestone updates</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setBaggageCount(Math.max(0, baggageCount - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-white text-sm">{baggageCount}</span>
                  <button
                    type="button"
                    onClick={() => setBaggageCount(baggageCount + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Gateway Simulation */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Payment Method</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Credit Card', 'Debit Card', 'PayPal', 'Stripe'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      paymentMethod === method
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Security Code (CVC)
                    </label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl sticky top-24">
              <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
                Booking Invoice Breakdown
              </h3>

              {/* Flight snippet */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between font-semibold text-white">
                  <span>Flight {flight.FLIGHTNUMBER}</span>
                  <span className="text-blue-400">{cabinClass}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {flight.DEPARTUREAIRPORT} ➔ {flight.ARRIVALAIRPORT}
                </p>
              </div>

              {/* Seats list */}
              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between font-medium">
                  <span>Seats Assigned:</span>
                  <span className="text-white font-mono">
                    {selectedSeats.map((s) => s.SEATNUMBER).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Airfare ({selectedSeats.length} pax):</span>
                  <span>${baseFare}</span>
                </div>
                {baggageCount > 0 && (
                  <div className="flex justify-between">
                    <span>Baggage ({baggageCount} bag):</span>
                    <span>+${baggageFee}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-300">Total Amount:</span>
                <span className="text-3xl font-extrabold text-emerald-400">
                  ${finalTotal}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner text="Executing Transaction..." />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay ${finalTotal} & Confirm</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Simulated Oracle ACID Transaction • Immediate Ticket Issue
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

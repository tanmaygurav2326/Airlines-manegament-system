import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  CreditCard,
  ShieldCheck,
  Luggage,
  User,
  AlertCircle,
  Lock,
  Plane,
  Smartphone
} from 'lucide-react';

const CLASS_MULTIPLIERS = {
  'Economy': 1.0,
  'Premium Economy': 1.4,
  'Business': 2.2,
  'First': 3.5
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  // State from location or fallback to query params
  const stateData = location.state;
  const [flight, setFlight] = useState(stateData?.flight || null);
  const [selectedSeats, setSelectedSeats] = useState(stateData?.selectedSeats || []);
  const [cabinClass] = useState(stateData?.cabinClass || searchParams.get('class') || 'Economy');

  // Passenger state
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('India');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [frequentFlyer, setFrequentFlyer] = useState('');

  // Baggage state
  const [baggageCount, setBaggageCount] = useState(1);
  const [baggageWeight] = useState(15);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [upiId, setUpiId] = useState('passenger@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [loading, setLoading] = useState(false);
  const [fetchingFlight, setFetchingFlight] = useState(false);
  const [error, setError] = useState(null);

  // If flight not in state, load by flightId from query params
  useEffect(() => {
    const flightId = searchParams.get('flightId');
    const seatsStr = searchParams.get('seats');

    if (!flight && flightId) {
      setFetchingFlight(true);
      api.get(`/flights/${flightId}`)
        .then((res) => {
          if (res?.data) {
            setFlight(res.data);
            if (seatsStr && selectedSeats.length === 0) {
              const seatNums = seatsStr.split(',');
              setSelectedSeats(seatNums.map((num) => ({
                SEATNUMBER: num,
                CLASS: cabinClass
              })));
            }
          }
        })
        .catch((e) => console.error('Failed to load flight:', e))
        .finally(() => setFetchingFlight(false));
    }
  }, [flight, searchParams, cabinClass, selectedSeats.length]);

  // Attempt to load existing passenger profile
  useEffect(() => {
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
        // Defaults used
      }
    };
    loadProfile();
  }, []);

  const multiplier = CLASS_MULTIPLIERS[cabinClass] || 1.0;
  const baseFarePerSeat = flight ? Math.round(Number(flight.BASEPRICE || 3500) * multiplier) : 3500;
  const baseTotal = baseFarePerSeat * Math.max(selectedSeats.length, 1);
  const baggageFee = baggageCount > 1 ? (baggageCount - 1) * 800 : 0; // First bag is free on Enum Airways
  const taxesFee = Math.round(baseTotal * 0.12); // 12% GST & airport development fee
  const finalTotal = baseTotal + baggageFee + taxesFee;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!passportNumber.trim()) {
        throw new Error('Passport / Govt ID Number is required for ticket reservation.');
      }
      if (!flight) {
        throw new Error('Flight details are missing. Please return to flight search.');
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

      // Step 2: Create Booking record in Oracle
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
          console.warn('Baggage note:', bagErr.message);
        }
      }

      // Step 5: Simulate payment execution
      await api.post('/payments/simulate', {
        bookingId,
        amount: finalTotal,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'Credit Card',
        currency: 'INR'
      });

      // Navigate to Confirmation
      navigate(`/booking/confirmation/${bookingId}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || err.message || 'Payment processing failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingFlight) {
    return <LoadingSpinner text="Retrieving flight reservation details..." />;
  }

  if (!flight) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-sm">
        <Plane className="w-10 h-10 mx-auto text-[#0052CC]" />
        <h3 className="font-bold text-lg text-[#091E42]">No Flight Selected</h3>
        <p className="text-xs text-slate-500">Please choose a flight to proceed with seat booking.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#0052CC] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Return to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Step Indicator Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-[#0052CC] uppercase tracking-wider block">
              Step 3 of 4: Passenger Details & Secure Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091E42] mt-0.5">
              Confirm Your Reservation
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Booking</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center space-x-2 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Checkout Form Column */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmitBooking} className="space-y-6">

              {/* Card 1: Passenger Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-[#0052CC]" />
                  <h2 className="font-bold text-base text-[#091E42]">Passenger Identification</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${user?.firstName || 'Traveler'} ${user?.lastName || ''}`}
                      className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Passport / Govt ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Z1234567 or Aadhaar/PAN"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                      className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Contact Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Baggage Selection */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Luggage className="w-5 h-5 text-[#0052CC]" />
                  <h2 className="font-bold text-base text-[#091E42]">Baggage Registration</h2>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#091E42] block">Included Check-in Luggage</span>
                    <span className="text-slate-500">1 standard bag up to 15 kg is complimentary on Enum Airways.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {[1, 2].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setBaggageCount(count)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                          baggageCount === count
                            ? 'bg-[#0052CC] text-white'
                            : 'bg-[#F4F5F7] text-slate-700 hover:bg-[#DEEBFF]'
                        }`}
                      >
                        {count} Bag{count > 1 ? 's' : ''} {count > 1 ? `(+${formatPrice(800)})` : '(Free)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Payment Method */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-[#0052CC]" />
                    <h2 className="font-bold text-base text-[#091E42]">Payment Method</h2>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Instant Simulation
                  </span>
                </div>

                {/* Tabs: UPI vs Card */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'UPI'
                        ? 'bg-[#DEEBFF] text-[#0052CC] border-2 border-[#0052CC]'
                        : 'bg-[#F4F5F7] text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR Pay (India)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'Card'
                        ? 'bg-[#DEEBFF] text-[#0052CC] border-2 border-[#0052CC]'
                        : 'bg-[#F4F5F7] text-slate-600 border border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>
                </div>

                {/* Payment Fields */}
                {paymentMethod === 'UPI' ? (
                  <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM, and all Indian bank UPI apps.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#003A8C] text-white font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition duration-150 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <LoadingSpinner text="Processing Payment & Confirming Reservation..." />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay {formatPrice(finalTotal)} & Confirm Reservation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Sidebar: Itinerary & Fare Breakdown */}
          <div className="lg:col-span-4 space-y-6">

            {/* Itinerary Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <span className="text-[10px] uppercase font-bold text-[#0052CC] tracking-wider block">
                Itinerary Summary
              </span>

              <div>
                <div className="flex items-center justify-between text-lg font-bold text-[#091E42]">
                  <span>{flight.DEPARTUREAIRPORT}</span>
                  <Plane className="w-4 h-4 text-[#0052CC]" />
                  <span>{flight.ARRIVALAIRPORT}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Flight {flight.FLIGHTNUMBER || 'EA 201'} • {flight.AIRCRAFTMODEL || 'Airbus A320neo'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Cabin Tier:</span>
                  <span className="font-bold text-[#091E42]">{cabinClass}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserved Seats:</span>
                  <span className="font-mono font-bold text-[#0052CC]">
                    {selectedSeats.map((s) => s.SEATNUMBER).join(', ') || 'Auto-assign'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <span className="text-[10px] uppercase font-bold text-[#091E42] tracking-wider block">
                Price Breakdown
              </span>

              <div className="flex justify-between text-slate-600">
                <span>Airfare ({selectedSeats.length} Pax):</span>
                <span className="font-semibold text-slate-800">{formatPrice(baseTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Taxes & GST (12%):</span>
                <span className="font-semibold text-slate-800">{formatPrice(taxesFee)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Baggage ({baggageCount} Bag):</span>
                <span className="font-semibold text-slate-800">
                  {baggageFee > 0 ? formatPrice(baggageFee) : 'FREE'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-bold">
                <span className="text-sm text-[#091E42]">Total Amount:</span>
                <span className="text-2xl font-extrabold text-[#0052CC]">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <div className="bg-[#DEEBFF] p-4 rounded-xl border border-blue-200 text-xs text-slate-700 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0052CC] flex-shrink-0 mt-0.5" />
              <span>Full refund available up to 24 hours prior to domestic flight departure according to airline cancellation policy.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Armchair,
  ArrowRight,
  Plane,
  AlertCircle
} from 'lucide-react';

const CLASS_MULTIPLIERS = {
  'Economy': 1.0,
  'Premium Economy': 1.4,
  'Business': 2.2,
  'First': 3.5
};

const SeatSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  const flightId = searchParams.get('flightId');
  const targetClass = searchParams.get('class') || 'Economy';
  const passengerCount = parseInt(searchParams.get('passengers') || '1');

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!flightId) {
      navigate('/flights');
      return;
    }

    const loadFlightAndSeats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [flightRes, seatsRes] = await Promise.all([
          api.get(`/flights/${flightId}`),
          api.get(`/flights/${flightId}/seats`)
        ]);

        if (flightRes?.data) setFlight(flightRes.data);

        if (seatsRes?.data) {
          let allSeats = [];
          if (Array.isArray(seatsRes.data)) {
            allSeats = seatsRes.data;
          } else if (seatsRes.data.seatsByClass) {
            Object.values(seatsRes.data.seatsByClass).forEach(arr => {
              allSeats.push(...arr);
            });
          }
          setSeats(allSeats);
        }
      } catch (err) {
        setError(err.message || 'Failed to load seats');
      } finally {
        setLoading(false);
      }
    };

    loadFlightAndSeats();
  }, [flightId, navigate]);

  const calculateSeatPrice = (seatClass) => {
    if (!flight) return 0;
    const base = Number(flight.BASEPRICE || 3500);
    const multiplier = CLASS_MULTIPLIERS[seatClass] || 1.0;
    return Math.round(base * multiplier);
  };

  const handleSeatClick = (seat) => {
    if (!seat.ISAVAILABLE) return;

    const isSelected = selectedSeats.some((s) => s.SEATNUMBER === seat.SEATNUMBER);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.SEATNUMBER !== seat.SEATNUMBER));
    } else {
      if (selectedSeats.length >= passengerCount) {
        // Replace first selected seat if max reached
        setSelectedSeats([...selectedSeats.slice(1), seat]);
      } else {
        setSelectedSeats([...selectedSeats, seat]);
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(
        `/booking/checkout?flightId=${flightId}&seats=${selectedSeats.map((s) => s.SEATNUMBER).join(',')}&class=${encodeURIComponent(targetClass)}&passengers=${passengerCount}`
      );
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    const seatsParam = selectedSeats.map((s) => s.SEATNUMBER).join(',');
    navigate(`/booking/checkout?flightId=${flightId}&seats=${seatsParam}&class=${encodeURIComponent(targetClass)}&passengers=${passengerCount}`, {
      state: { flight, selectedSeats, cabinClass: targetClass, totalPrice }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + calculateSeatPrice(s.CLASS), 0);

  if (loading) {
    return <LoadingSpinner text="Rendering Enum Airways Aircraft Seat Map..." />;
  }

  if (error || !flight) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
        <h3 className="font-bold text-lg">Unable to Load Flight</h3>
        <p className="text-xs">{error || 'Flight not found in database.'}</p>
        <button
          onClick={() => navigate('/flights')}
          className="mt-2 bg-[#0052CC] hover:bg-[#003A8C] text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const classGroups = ['First', 'Business', 'Premium Economy', 'Economy'];

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Step Indicator & Flight Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#0052CC] uppercase tracking-wider block">
              Step 2 of 4: Interactive Cabin Seat Map
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <h1 className="text-2xl font-extrabold text-[#091E42]">
                Flight {flight.FLIGHTNUMBER || 'EA 201'}
              </h1>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-semibold text-slate-700">
                {flight.DEPARTUREAIRPORT} ➔ {flight.ARRIVALAIRPORT}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {flight.AIRCRAFTMODEL || 'Airbus A320neo'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 bg-[#F8F9FA] px-5 py-3 rounded-2xl border border-slate-200">
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Selected Seats</p>
              <p className="text-sm font-extrabold text-[#091E42]">
                {selectedSeats.length} of {passengerCount}
              </p>
            </div>
            <div className="text-right pl-6 border-l border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Total Fare</p>
              <p className="text-xl font-extrabold text-[#0052CC]">{formatPrice(totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-[#F4F5F7] border border-slate-300"></div>
            <span className="text-slate-700 font-semibold">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-[#0052CC] border border-[#003A8C] shadow-sm"></div>
            <span className="text-[#0052CC] font-bold">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg bg-slate-200 border border-slate-300 text-slate-400 flex items-center justify-center font-bold text-[10px]">
              ✕
            </div>
            <span className="text-slate-500">Occupied</span>
          </div>
        </div>

        {/* Aircraft Fuselage Layout */}
        <div className="max-w-xl mx-auto bg-white border-2 border-slate-200 rounded-t-[100px] rounded-b-3xl p-8 shadow-sm relative">

          {/* Plane Nose / Cockpit Indicator */}
          <div className="text-center pb-6 border-b border-slate-100">
            <Plane className="w-8 h-8 text-[#0052CC] mx-auto rotate-180 mb-1" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Cockpit / Front of Jetliner
            </span>
          </div>

          {/* Seat Grid by Class */}
          <div className="space-y-8 pt-6">
            {classGroups.map((cls) => {
              const classSeats = seats.filter((s) => s.CLASS === cls);
              if (classSeats.length === 0) return null;

              return (
                <div key={cls} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">
                      {cls} Cabin
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {formatPrice(calculateSeatPrice(cls))} / seat
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {classSeats.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.SEATNUMBER === seat.SEATNUMBER);
                      const isAvailable = seat.ISAVAILABLE;

                      return (
                        <button
                          key={seat.SEATNUMBER}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => handleSeatClick(seat)}
                          className={`h-11 rounded-xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all relative ${
                            isSelected
                              ? 'bg-[#0052CC] text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-offset-1 ring-[#0052CC]'
                              : isAvailable
                              ? 'bg-[#F4F5F7] hover:bg-[#DEEBFF] hover:text-[#0052CC] text-[#172B4D] border border-slate-200 cursor-pointer'
                              : 'bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed'
                          }`}
                          title={`${seat.SEATNUMBER} (${seat.CLASS}) - ${isAvailable ? 'Available' : 'Occupied'}`}
                        >
                          <Armchair className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                          <span>{seat.SEATNUMBER}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rear Galley */}
          <div className="text-center pt-8 border-t border-slate-100 mt-8">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Galley & Lavatories / Rear of Jetliner
            </span>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center font-bold">
              {selectedSeats.length}
            </div>
            <div>
              <p className="text-xs text-slate-500">
                {selectedSeats.length === passengerCount ? 'All seats selected' : `Please select ${passengerCount - selectedSeats.length} more seat(s)`}
              </p>
              <p className="text-sm font-bold text-[#091E42]">
                Seats: {selectedSeats.map((s) => s.SEATNUMBER).join(', ') || 'None'}
              </p>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={selectedSeats.length !== passengerCount}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm transition shadow-md flex items-center justify-center space-x-2 ${
              selectedSeats.length === passengerCount
                ? 'bg-[#0052CC] hover:bg-[#003A8C] text-white shadow-blue-500/20 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Passenger Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SeatSelection;

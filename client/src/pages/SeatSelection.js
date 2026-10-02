import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
          // seats could be in seatsRes.data or seatsRes.data.seatsByClass
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
        setError(err.message || 'Failed to fetch flight seat map');
      } finally {
        setLoading(false);
      }
    };

    loadFlightAndSeats();
  }, [flightId, navigate]);

  const handleSeatClick = (seat) => {
    if (seat.STATUS !== 'AVAILABLE') return;

    const isSelected = selectedSeats.some((s) => s.SEATNUMBER === seat.SEATNUMBER);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.SEATNUMBER !== seat.SEATNUMBER));
    } else {
      if (selectedSeats.length < passengerCount) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        // Replace last chosen if passenger count reached
        setSelectedSeats([...selectedSeats.slice(1), seat]);
      }
    }
  };

  const calculateSeatPrice = (sClass) => {
    const base = flight?.BASEPRICE || 300;
    const mult = CLASS_MULTIPLIERS[sClass] || 1.0;
    return Math.round(base * mult);
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + calculateSeatPrice(seat.CLASS || targetClass),
    0
  );

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    // Pass chosen seats and flight to checkout page via state
    navigate('/booking/checkout', {
      state: {
        flight,
        selectedSeats,
        cabinClass: targetClass,
        totalPrice
      }
    });
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Rendering Aircraft Seat Map..." />;
  }

  if (error || !flight) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <h3 className="font-bold text-lg">Unable to Load Flight</h3>
        <p className="text-sm mt-1">{error || 'Flight not found'}</p>
        <button
          onClick={() => navigate('/flights')}
          className="mt-4 bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Back to Search
        </button>
      </div>
    );
  }

  // Group seats by Class
  const classGroups = ['First', 'Business', 'Premium Economy', 'Economy'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Step 2 of 4: Seat Selection
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <h1 className="text-2xl font-bold text-white">
                Flight {flight.FLIGHTNUMBER}
              </h1>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 font-medium">
                {flight.DEPARTUREAIRPORT} ➔ {flight.ARRIVALAIRPORT}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
            <div className="text-right">
              <p className="text-xs text-slate-400">Selected</p>
              <p className="text-sm font-bold text-white">
                {selectedSeats.length} of {passengerCount} seat(s)
              </p>
            </div>
            <div className="text-right pl-4 border-l border-slate-700">
              <p className="text-xs text-slate-400">Total Fare</p>
              <p className="text-lg font-extrabold text-emerald-400">${totalPrice}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-slate-700 border border-slate-600"></div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 border border-blue-400 shadow-md"></div>
            <span className="text-blue-300 font-semibold">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-rose-950 border border-rose-800 text-rose-500 flex items-center justify-center font-bold text-[10px]">
              ✕
            </div>
            <span className="text-slate-400">Occupied</span>
          </div>
        </div>

        {/* Aircraft Cabin Fuselage Visualizer */}
        <div className="max-w-2xl mx-auto bg-slate-900 border-2 border-slate-700 rounded-t-[100px] rounded-b-3xl p-8 shadow-2xl relative">
          {/* Plane Cockpit Indicator */}
          <div className="text-center pb-8 border-b border-slate-800">
            <Plane className="w-8 h-8 text-slate-500 mx-auto rotate-180 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Cockpit / Front of Aircraft
            </span>
          </div>

          {/* Seat Grid by Classes */}
          <div className="space-y-8 pt-6">
            {classGroups.map((cls) => {
              const classSeats = seats.filter((s) => s.CLASS === cls);
              if (classSeats.length === 0) return null;

              return (
                <div key={cls} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {cls} Class
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ${calculateSeatPrice(cls)} / seat
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 justify-items-center">
                    {classSeats.map((seat) => {
                      const isSelected = selectedSeats.some(
                        (s) => s.SEATNUMBER === seat.SEATNUMBER
                      );
                      const isOccupied = seat.STATUS === 'OCCUPIED';
                      const isMaintenance = seat.STATUS === 'MAINTENANCE';

                      return (
                        <button
                          key={seat.SEATID || seat.SEATNUMBER}
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={isOccupied || isMaintenance}
                          className={`w-11 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition transform active:scale-95 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-400 scale-105'
                              : isOccupied
                              ? 'bg-rose-950/60 text-rose-500 border border-rose-900/50 cursor-not-allowed opacity-60'
                              : isMaintenance
                              ? 'bg-amber-950/60 text-amber-500 border border-amber-900/50 cursor-not-allowed opacity-60'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500'
                          }`}
                          title={`${seat.SEATNUMBER} - ${cls} (${seat.STATUS})`}
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
        </div>

        {/* Action Bar */}
        <div className="max-w-2xl mx-auto flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div>
            <p className="text-xs text-slate-400">Seats Chosen:</p>
            <p className="text-sm font-bold text-white">
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.SEATNUMBER).join(', ')
                : 'None'}
            </p>
          </div>

          <button
            onClick={handleProceed}
            disabled={selectedSeats.length === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${
              selectedSeats.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-lg shadow-blue-600/30'
            }`}
          >
            <span>Continue to Passenger Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

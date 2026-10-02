import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Plane, 
  Clock, 
  ArrowRight, 
  SlidersHorizontal, 
  Calendar,
  AlertCircle,
  Armchair
} from 'lucide-react';

const CLASS_MULTIPLIERS = {
  'Economy': 1.0,
  'Premium Economy': 1.4,
  'Business': 2.2,
  'First': 3.5
};

const FlightResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || 'JFK';
  const to = searchParams.get('to') || 'LAX';
  const date = searchParams.get('date') || '2024-12-20';
  const cabinClass = searchParams.get('class') || 'Economy';
  const passengers = parseInt(searchParams.get('passengers') || '1');

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(cabinClass);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        try {
          res = await api.get(`/flights/search?from=${from}&to=${to}&date=${date}`);
        } catch (searchErr) {
          console.warn('Exact route search returned no direct matches, fetching all available flights...');
          res = await api.get('/flights');
        }

        if (res?.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          setFlights(list);
        }
      } catch (err) {
        setError(err.message || 'Failed to search flights');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, date]);

  const calculateFare = (basePrice, cClass) => {
    const multiplier = CLASS_MULTIPLIERS[cClass] || 1.0;
    return Math.round(basePrice * multiplier);
  };

  const filteredFlights = flights.filter((f) => {
    const fare = calculateFare(f.BASEPRICE, selectedClass);
    const matchesPrice = fare <= maxPrice;
    const matchesStatus = statusFilter === 'ALL' || f.STATUS === statusFilter;
    return matchesPrice && matchesStatus;
  });

  const formatTime = (ts) => {
    if (!ts) return '--:--';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSelectFlight = (flightId) => {
    navigate(`/booking/seats?flightId=${flightId}&class=${encodeURIComponent(selectedClass)}&passengers=${passengers}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Route Summary Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600/20 text-blue-400 p-3 rounded-xl border border-blue-500/30">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xl font-bold text-white">
                <span>{from}</span>
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <span>{to}</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Date: {date}</span>
                <span>•</span>
                <span>{passengers} Passenger(s)</span>
              </p>
            </div>
          </div>

          {/* Cabin Class Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            {Object.keys(CLASS_MULTIPLIERS).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedClass === cls
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 font-semibold text-white text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span>Filter Results</span>
                </div>
                <button
                  onClick={() => {
                    setMaxPrice(2000);
                    setStatusFilter('ALL');
                  }}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-2">
                  <span>Max Fare</span>
                  <span className="font-bold text-blue-400">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Flight Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Flight Cards List */}
          <div className="lg:col-span-9 space-y-4">
            {loading ? (
              <LoadingSpinner fullPage text="Searching available flights in Oracle DB..." />
            ) : error ? (
              <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-6 rounded-2xl flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Flight Search Error</h4>
                  <p className="text-sm text-rose-400">{error}</p>
                </div>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <Plane className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No Flights Found</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  We couldn't find flights matching your specific filters. Try expanding your price range or adjusting route dates.
                </p>
              </div>
            ) : (
              filteredFlights.map((flight) => {
                const fare = calculateFare(flight.BASEPRICE, selectedClass);
                const isCancelled = flight.STATUS === 'Cancelled';

                return (
                  <div
                    key={flight.FLIGHTID}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-lg transition duration-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Flight Info & Aircraft */}
                      <div className="md:col-span-3 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-lg text-white">
                            {flight.FLIGHTNUMBER}
                          </span>
                          <StatusBadge status={flight.STATUS} />
                        </div>
                        <p className="text-xs text-slate-400">{flight.AIRCRAFTMODEL || 'Commercial Jet'}</p>
                      </div>

                      {/* Route & Timings */}
                      <div className="md:col-span-5 flex items-center justify-between space-x-4">
                        <div className="text-left">
                          <p className="text-xl font-bold text-white">{formatTime(flight.DEPARTURETIME)}</p>
                          <p className="text-xs font-semibold text-blue-400">{flight.DEPARTUREAIRPORT}</p>
                          <p className="text-[11px] text-slate-500">{formatDate(flight.DEPARTURETIME)}</p>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {flight.DURATIONMINUTES ? `${Math.floor(flight.DURATIONMINUTES / 60)}h ${flight.DURATIONMINUTES % 60}m` : 'Direct'}
                          </span>
                          <div className="w-full flex items-center">
                            <div className="h-0.5 w-full bg-slate-700 relative">
                              <Plane className="w-3.5 h-3.5 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 mt-1">Non-stop</span>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-white">{formatTime(flight.ARRIVALTIME)}</p>
                          <p className="text-xs font-semibold text-sky-400">{flight.ARRIVALAIRPORT}</p>
                          <p className="text-[11px] text-slate-500">{formatDate(flight.ARRIVALTIME)}</p>
                        </div>
                      </div>

                      {/* Fare & Booking Button */}
                      <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-end justify-center space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Total for {selectedClass}</span>
                          <div className="text-2xl font-extrabold text-white">
                            ${fare}
                            <span className="text-xs font-normal text-slate-400">/pax</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectFlight(flight.FLIGHTID)}
                          disabled={isCancelled}
                          className={`w-full sm:w-auto md:w-full flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow ${
                            isCancelled
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                          }`}
                        >
                          <Armchair className="w-4 h-4" />
                          <span>Select Seat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResults;

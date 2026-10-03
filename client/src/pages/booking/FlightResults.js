import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import FlightCard from '../../components/flights/FlightCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Plane,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  AlertCircle,
  ArrowUpDown,
  RotateCcw
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
  const { formatPrice } = useCurrency();

  const from = searchParams.get('from') || 'BOM';
  const to = searchParams.get('to') || 'DEL';
  const todayStr = new Date().toISOString().split('T')[0];
  const date = searchParams.get('date') || todayStr;
  const initialClass = searchParams.get('class') || 'Economy';
  const passengers = parseInt(searchParams.get('passengers') || searchParams.get('totalPax') || '1');

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState('ALL'); // 'ALL' | 'morning' | 'afternoon' | 'evening'
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc' | 'time_asc' | 'duration_asc'

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        try {
          // Attempt exact search
          res = await api.get(`/flights/search?from=${from}&to=${to}&date=${date}`);
        } catch (searchErr) {
          // If specific route date search fails or is empty, fetch all available flights
          res = await api.get('/flights');
        }

        if (res?.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          // If search returned empty list, also fall back to all flights matching route or general
          if (list.length === 0) {
            const allRes = await api.get('/flights');
            const allList = Array.isArray(allRes.data) ? allRes.data : [];
            // Filter by route if possible, else show all
            const routeMatches = allList.filter(f =>
              (f.DEPARTUREAIRPORT === from || f.DEPARTURECITY === from) &&
              (f.ARRIVALAIRPORT === to || f.ARRIVALCITY === to)
            );
            setFlights(routeMatches.length > 0 ? routeMatches : allList);
          } else {
            setFlights(list);
          }
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
    return Math.round(Number(basePrice || 3500) * multiplier);
  };

  // Filter logic
  const filteredFlights = flights.filter((f) => {
    const fare = calculateFare(f.BASEPRICE, selectedClass);
    const matchesPrice = fare <= maxPrice;
    const matchesStatus = statusFilter === 'ALL' || f.STATUS === statusFilter;

    // Time of day check
    let matchesTime = true;
    if (timeOfDayFilter !== 'ALL' && f.DEPARTURETIME) {
      const depHour = new Date(f.DEPARTURETIME).getHours();
      if (timeOfDayFilter === 'morning') matchesTime = depHour < 12;
      else if (timeOfDayFilter === 'afternoon') matchesTime = depHour >= 12 && depHour < 18;
      else if (timeOfDayFilter === 'evening') matchesTime = depHour >= 18;
    }

    return matchesPrice && matchesStatus && matchesTime;
  });

  // Sort logic
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    const fareA = calculateFare(a.BASEPRICE, selectedClass);
    const fareB = calculateFare(b.BASEPRICE, selectedClass);

    if (sortBy === 'price_asc') return fareA - fareB;
    if (sortBy === 'price_desc') return fareB - fareA;
    if (sortBy === 'time_asc') {
      return new Date(a.DEPARTURETIME || 0) - new Date(b.DEPARTURETIME || 0);
    }
    if (sortBy === 'duration_asc') {
      return (a.DURATIONMINUTES || 120) - (b.DURATIONMINUTES || 120);
    }
    return 0;
  });

  const handleSelectFlight = (flight) => {
    navigate(`/booking/seats?flightId=${flight.FLIGHTID}&class=${encodeURIComponent(selectedClass)}&passengers=${passengers}`);
  };

  const handleResetFilters = () => {
    setMaxPrice(50000);
    setStatusFilter('ALL');
    setTimeOfDayFilter('ALL');
    setSortBy('price_asc');
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Route Summary & Modification Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#DEEBFF] text-[#0052CC] p-3.5 rounded-2xl border border-blue-200">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-2xl font-extrabold text-[#091E42]">
                <span>{from}</span>
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <span>{to}</span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Departure: {date}</span>
                </span>
                <span>•</span>
                <span>{passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}</span>
                <span>•</span>
                <span className="text-[#0052CC] font-bold">{sortedFlights.length} Flights Available</span>
              </p>
            </div>
          </div>

          {/* Cabin Class Tabs */}
          <div className="flex items-center bg-[#F4F5F7] p-1.5 rounded-xl border border-slate-200">
            {Object.keys(CLASS_MULTIPLIERS).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedClass === cls
                    ? 'bg-[#0052CC] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0052CC]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Main Search Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar: Filters */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 font-bold text-[#091E42] text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#0052CC]" />
                  <span>Filter Flights</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#0052CC] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Max Fare</span>
                  <span className="text-[#0052CC] font-bold">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="60000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{formatPrice(2000)}</span>
                  <span>{formatPrice(60000)}</span>
                </div>
              </div>

              {/* Departure Time of Day Filter */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Departure Time
                </label>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {[
                    { id: 'ALL', label: 'Any Time' },
                    { id: 'morning', label: 'Morning (00:00 - 12:00)' },
                    { id: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
                    { id: 'evening', label: 'Evening (18:00 - 24:00)' },
                  ].map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition ${
                        timeOfDayFilter === t.id
                          ? 'bg-[#DEEBFF] text-[#0052CC] font-bold'
                          : 'hover:bg-[#F4F5F7] text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeOfDay"
                        value={t.id}
                        checked={timeOfDayFilter === t.id}
                        onChange={() => setTimeOfDayFilter(t.id)}
                        className="text-[#0052CC] focus:ring-[#0052CC] h-3.5 w-3.5"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Flight Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Operational Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                </select>
              </div>

              {/* Inclusions summary */}
              <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-[#091E42]">Enum Airways Guarantee:</p>
                <p>• Complimentary meal on all flights {'>'} 2 hrs</p>
                <p>• 15 kg checked baggage included</p>
                <p>• Free seat selection in standard rows</p>
              </div>
            </div>
          </div>

          {/* Right Main Column: Flight Cards List */}
          <div className="lg:col-span-9 space-y-4">

            {/* Sorting Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-500 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Sort results by:</span>
              </div>

              <div className="flex items-center space-x-2">
                {[
                  { id: 'price_asc', label: 'Lowest Price' },
                  { id: 'time_asc', label: 'Earliest Departure' },
                  { id: 'duration_asc', label: 'Fastest' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      sortBy === s.id
                        ? 'bg-[#0052CC] text-white shadow-xs'
                        : 'bg-[#F4F5F7] text-slate-700 hover:bg-[#DEEBFF] hover:text-[#0052CC]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flight Cards Stream */}
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <LoadingSpinner text="Searching available Enum Airways flights..." />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Flight Search Error</h4>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            ) : sortedFlights.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <Plane className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-[#091E42]">No Flights Matching Criteria</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  We couldn't find flights matching your selected filters. Try broadening your price threshold, clearing filters, or checking a different date.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFlights.map((flight) => (
                  <FlightCard
                    key={flight.FLIGHTID}
                    flight={flight}
                    selectedClass={selectedClass}
                    passengers={passengers}
                    onSelectFlight={handleSelectFlight}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResults;

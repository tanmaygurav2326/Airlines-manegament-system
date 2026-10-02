import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Search, 
  Luggage, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Plane,
  Award,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import DatePicker from '../components/common/DatePicker';
import PassengerSelector from '../components/common/PassengerSelector';

const POPULAR_ROUTES = [
  { from: 'BOM', to: 'DEL', fromCity: 'Mumbai', toCity: 'Delhi', price: 4200, time: '2h 10m', type: 'Domestic Express' },
  { from: 'DEL', to: 'BLR', fromCity: 'Delhi', toCity: 'Bengaluru', price: 4800, time: '2h 45m', type: 'Metro Hub' },
  { from: 'PNQ', to: 'DEL', fromCity: 'Pune', toCity: 'Delhi', price: 3900, time: '2h 05m', type: 'Business Route' },
  { from: 'BOM', to: 'BLR', fromCity: 'Mumbai', toCity: 'Bengaluru', price: 3400, time: '1h 45m', type: 'Domestic Express' },
  { from: 'HYD', to: 'MAA', fromCity: 'Hyderabad', toCity: 'Chennai', price: 3100, time: '1h 20m', type: 'Southern Corridor' },
  { from: 'BOM', to: 'DXB', fromCity: 'Mumbai', toCity: 'Dubai', price: 16800, time: '3h 30m', type: 'International' },
];

const Home = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'pnr' | 'baggage'
  const [tripType, setTripType] = useState('oneway'); // 'oneway' | 'roundtrip'
  const [airports, setAirports] = useState([]);
  
  // Search parameters
  const [fromAirport, setFromAirport] = useState('BOM');
  const [toAirport, setToAirport] = useState('DEL');
  
  // Current date (not hardcoded)
  const todayStr = new Date().toISOString().split('T')[0];
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState('');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [passengers, setPassengers] = useState({
    adt: 1,
    chd: 0,
    inf: 0,
    um: 0
  });
  const [searchError, setSearchError] = useState('');

  // Manage Booking PNR tab state
  const [pnrInput, setPnrInput] = useState('');
  const [pnrError, setPnrError] = useState('');

  // Baggage tracking state
  const [baggageTrackingNum, setBaggageTrackingNum] = useState('');

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await api.get('/airports');
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setAirports(res.data);
          // Set sensible defaults if available
          const hasBom = res.data.some(a => a.AIRPORTCODE === 'BOM');
          const hasDel = res.data.some(a => a.AIRPORTCODE === 'DEL');
          if (hasBom && hasDel) {
            setFromAirport('BOM');
            setToAirport('DEL');
          } else {
            setFromAirport(res.data[0].AIRPORTCODE);
            setToAirport(res.data[1]?.AIRPORTCODE || res.data[0].AIRPORTCODE);
          }
        }
      } catch (err) {
        console.error('Failed to load airports:', err);
      }
    };
    fetchAirports();
  }, []);

  const handleSwapAirports = () => {
    setFromAirport(toAirport);
    setToAirport(fromAirport);
  };

  const handleSearchFlights = (e) => {
    e.preventDefault();
    setSearchError('');
    if (!fromAirport || !toAirport) return;
    if (fromAirport === toAirport) {
      setSearchError('Origin and Destination airports cannot be the same.');
      return;
    }
    const totalSeated = (passengers.adt || 0) + (passengers.chd || 0) + (passengers.um || 0);
    const totalPax = totalSeated + (passengers.inf || 0);
    const roundtripParam = tripType === 'roundtrip' && returnDate ? `&returnDate=${returnDate}` : '';
    navigate(`/flights?from=${fromAirport}&to=${toAirport}&date=${departureDate}&class=${cabinClass}&passengers=${totalSeated || 1}&totalPax=${totalPax}&adt=${passengers.adt}&chd=${passengers.chd}&inf=${passengers.inf}&um=${passengers.um}&trip=${tripType}${roundtripParam}`);
  };

  const handlePnrLookup = (e) => {
    e.preventDefault();
    setPnrError('');
    const ref = pnrInput.trim().toUpperCase();
    if (!ref) {
      setPnrError('Please enter your 6-character Booking Reference / PNR.');
      return;
    }
    navigate(`/manage-booking?reference=${encodeURIComponent(ref)}`);
  };

  const handleTrackBaggage = (e) => {
    e.preventDefault();
    if (baggageTrackingNum.trim()) {
      navigate(`/baggage?tracking=${encodeURIComponent(baggageTrackingNum.trim())}`);
    }
  };

  const handleQuickRouteClick = (route) => {
    setSearchError('');
    setFromAirport(route.from);
    setToAirport(route.to);
    navigate(`/flights?from=${route.from}&to=${route.to}&date=${departureDate}&class=Economy&passengers=1&totalPax=1&adt=1&chd=0&inf=0&um=0&trip=oneway`);
  };

  // Group airports: Domestic Indian Hubs vs International
  const domesticAirports = airports.filter(a => a.COUNTRY === 'India' || !['DXB', 'SIN', 'LHR', 'BKK'].includes(a.AIRPORTCODE));
  const internationalAirports = airports.filter(a => ['DXB', 'SIN', 'LHR', 'BKK'].includes(a.AIRPORTCODE));

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#172B4D] flex flex-col font-sans">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#003A8C] via-[#0052CC] to-[#0747A6] pt-12 pb-28 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
        {/* Subtle background aviation pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-8 border-white/20"></div>
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full border-4 border-white/20"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-4 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome to Enum Airways — India's Premier Aviation Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white max-w-4xl mx-auto font-display">
            Connecting India's Hubs with <br className="hidden sm:inline" />
            <span className="text-[#DEEBFF]">
              Punctuality & Precision
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal">
            Direct flights connecting Mumbai, Delhi, Bengaluru, Pune, Hyderabad, and Chennai with reliable scheduling and dedicated service.
          </p>
        </div>

        {/* Tabbed Booking & Services Widget */}
        <div className="max-w-5xl mx-auto relative z-20">
          {/* Tab Headers */}
          <div className="flex items-center space-x-2 mb-0">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all ${
                activeTab === 'book'
                  ? 'bg-white text-[#0052CC] shadow-md border-t-2 border-[#0052CC]'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>Book Flights</span>
            </button>

            <button
              onClick={() => setActiveTab('pnr')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all ${
                activeTab === 'pnr'
                  ? 'bg-white text-[#0052CC] shadow-md border-t-2 border-[#0052CC]'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Manage Booking / PNR</span>
            </button>

            <button
              onClick={() => setActiveTab('baggage')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all ${
                activeTab === 'baggage'
                  ? 'bg-white text-[#0052CC] shadow-md border-t-2 border-[#0052CC]'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
            >
              <Luggage className="w-4 h-4" />
              <span>Track Baggage</span>
            </button>
          </div>

          {/* Tab 1: Book Flights */}
          {activeTab === 'book' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-[#172B4D] animate-fade-in-up">
              <form onSubmit={handleSearchFlights} className="space-y-6">
                
                {/* Trip Type & Cabin Class Selector */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 text-sm">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="tripType"
                        value="oneway"
                        checked={tripType === 'oneway'}
                        onChange={() => setTripType('oneway')}
                        className="text-[#0052CC] focus:ring-[#0052CC] h-4 w-4"
                      />
                      <span>One Way</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="tripType"
                        value="roundtrip"
                        checked={tripType === 'roundtrip'}
                        onChange={() => setTripType('roundtrip')}
                        className="text-[#0052CC] focus:ring-[#0052CC] h-4 w-4"
                      />
                      <span>Round Trip</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-semibold text-slate-500">Cabin Tier:</span>
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value)}
                      className="bg-[#F4F5F7] border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business Class</option>
                      <option value="First">First Class</option>
                    </select>
                  </div>
                </div>

                {/* Primary Route & Date Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  
                  {/* From Airport */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                      <PlaneTakeoff className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
                      From (Origin)
                    </label>
                    <select
                      value={fromAirport}
                      onChange={(e) => setFromAirport(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-3 text-[#091E42] font-bold text-sm focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                    >
                      <optgroup label="Primary Indian Hubs">
                        {domesticAirports.map((a) => (
                          <option key={a.AIRPORTCODE} value={a.AIRPORTCODE}>
                            {a.CITY} ({a.AIRPORTCODE})
                          </option>
                        ))}
                      </optgroup>
                      {internationalAirports.length > 0 && (
                        <optgroup label="International Hubs">
                          {internationalAirports.map((a) => (
                            <option key={a.AIRPORTCODE} value={a.AIRPORTCODE}>
                              {a.CITY} ({a.AIRPORTCODE})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {airports.length === 0 && (
                        <>
                          <option value="BOM">Mumbai (BOM)</option>
                          <option value="DEL">Delhi (DEL)</option>
                          <option value="BLR">Bengaluru (BLR)</option>
                          <option value="PNQ">Pune (PNQ)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Swap Button */}
                  <div className="md:col-span-1 flex justify-center pt-2 md:pt-5">
                    <button
                      type="button"
                      onClick={handleSwapAirports}
                      className="p-2.5 rounded-full bg-[#DEEBFF] hover:bg-[#B3D4FF] text-[#0052CC] transition active:scale-95 shadow-sm"
                      title="Swap Departure and Destination"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* To Airport */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                      <PlaneLanding className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
                      To (Destination)
                    </label>
                    <select
                      value={toAirport}
                      onChange={(e) => setToAirport(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-3 text-[#091E42] font-bold text-sm focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                    >
                      <optgroup label="Primary Indian Hubs">
                        {domesticAirports.map((a) => (
                          <option key={a.AIRPORTCODE} value={a.AIRPORTCODE}>
                            {a.CITY} ({a.AIRPORTCODE})
                          </option>
                        ))}
                      </optgroup>
                      {internationalAirports.length > 0 && (
                        <optgroup label="International Hubs">
                          {internationalAirports.map((a) => (
                            <option key={a.AIRPORTCODE} value={a.AIRPORTCODE}>
                              {a.CITY} ({a.AIRPORTCODE})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {airports.length === 0 && (
                        <>
                          <option value="DEL">Delhi (DEL)</option>
                          <option value="BOM">Mumbai (BOM)</option>
                          <option value="BLR">Bengaluru (BLR)</option>
                          <option value="PNQ">Pune (PNQ)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Departure Date */}
                  <div className={tripType === 'roundtrip' ? 'md:col-span-2' : 'md:col-span-2'}>
                    <DatePicker
                      label="Departure"
                      value={departureDate}
                      minDate={todayStr}
                      onChange={(val) => {
                        setDepartureDate(val);
                        if (returnDate && val > returnDate) {
                          setReturnDate(val);
                        }
                      }}
                      required
                    />
                  </div>

                  {/* Return Date (if roundtrip) */}
                  {tripType === 'roundtrip' && (
                    <div className="md:col-span-2">
                      <DatePicker
                        label="Return"
                        value={returnDate}
                        minDate={departureDate || todayStr}
                        onChange={(val) => setReturnDate(val)}
                      />
                    </div>
                  )}

                  {/* Passengers with 4 types and rules */}
                  <div className={tripType === 'roundtrip' ? 'md:col-span-2' : 'md:col-span-3'}>
                    <PassengerSelector
                      passengers={passengers}
                      onChange={(p) => setPassengers(p)}
                    />
                  </div>
                </div>

                {/* Inline Error Message (Replaced Alert) */}
                {searchError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in-up">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="font-medium">{searchError}</span>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Direct Domestic Routes
                    </span>
                    <span>•</span>
                    <span>Complimentary 15 kg Check-in Luggage</span>
                    <span>•</span>
                    <span>Instant Confirmation</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#003A8C] text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 transition duration-150 active:scale-95"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search Available Flights</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Manage Booking / PNR Lookup */}
          {activeTab === 'pnr' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-[#172B4D] animate-fade-in-up">
              <div className="max-w-xl mx-auto space-y-4 text-center">
                <h3 className="text-xl font-bold text-[#091E42]">Retrieve Your Booking</h3>
                <p className="text-xs text-slate-500">
                  Enter your 6-character PNR or Booking Reference to view flight details, change seats, or download your e-ticket.
                </p>

                {pnrError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{pnrError}</span>
                  </div>
                )}

                <form onSubmit={handlePnrLookup} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. EA-9X2K4L or 6-char PNR"
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                    className="flex-1 bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 font-mono font-bold uppercase text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                  <button
                    type="submit"
                    className="bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
                  >
                    Find Booking
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 3: Track Baggage */}
          {activeTab === 'baggage' && (
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-[#172B4D] animate-fade-in-up">
              <div className="max-w-xl mx-auto space-y-4 text-center">
                <h3 className="text-xl font-bold text-[#091E42]">Live Baggage Tracking</h3>
                <p className="text-xs text-slate-500">
                  Monitor the real-time scanning checkpoints of your checked bags from terminal bag drop to final carousel.
                </p>

                <form onSubmit={handleTrackBaggage} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRK-1001-A or barcode"
                    value={baggageTrackingNum}
                    onChange={(e) => setBaggageTrackingNum(e.target.value)}
                    className="flex-1 bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 font-mono font-bold uppercase text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                  <button
                    type="submit"
                    className="bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
                  >
                    Track Baggage
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Indian Routes Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">Direct Network</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091E42]">
              Popular Indian Hub Routes
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Fares shown are one-way in {formatPrice(0).replace(/\d/g, '').trim()} including all passenger taxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_ROUTES.map((route, i) => (
            <div
              key={i}
              onClick={() => handleQuickRouteClick(route)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#0052CC] hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="bg-[#DEEBFF] text-[#0052CC] font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    {route.type}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {route.time}
                  </span>
                </div>

                <div className="flex items-center justify-between my-2">
                  <div>
                    <span className="font-extrabold text-2xl text-[#091E42] group-hover:text-[#0052CC] transition">
                      {route.from}
                    </span>
                    <p className="text-xs text-slate-500 font-medium">{route.fromCity}</p>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <Plane className="w-4 h-4 text-[#0052CC] group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5">Non-stop</span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-2xl text-[#091E42] group-hover:text-[#0052CC] transition">
                      {route.to}
                    </span>
                    <p className="text-xs text-slate-500 font-medium">{route.toCity}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Fares starting from</span>
                  <span className="text-lg font-extrabold text-[#091E42]">
                    {formatPrice(route.price)}
                  </span>
                </div>

                <span className="text-xs font-bold text-[#0052CC] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Book Flight</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services & Trust Section */}
      <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">Travel Highlights</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#091E42] font-display">
              Why Fly Enum Airways?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Modern Indian aviation engineered for dependability, transparent pricing, and passenger comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="bg-[#DEEBFF] text-[#0052CC] p-3 rounded-xl w-fit">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#091E42] font-display">Direct Metro Connectivity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated non-stop routes connecting India's key industrial and cultural hubs: Mumbai, Delhi, Bengaluru, Pune, Hyderabad, and Chennai.
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#091E42] font-display">Guaranteed Seat Selection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive real-time seat mapping allows you to pick your exact window, aisle, or extra legroom seat during reservation.
              </p>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="bg-amber-50 text-amber-700 p-3 rounded-xl w-fit">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[#091E42] font-display">Transparent Travel Inclusions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy 15 kg complimentary checked luggage on all domestic flights, transparent fare breakdowns, and real-time bag tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

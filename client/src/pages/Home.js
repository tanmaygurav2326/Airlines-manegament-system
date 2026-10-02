import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Calendar, 
  Users, 
  Search, 
  Luggage, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  CreditCard
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);

  const [fromAirport, setFromAirport] = useState('JFK');
  const [toAirport, setToAirport] = useState('LAX');
  const [departureDate, setDepartureDate] = useState('2024-12-20');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [passengers] = useState(1);
  const [baggageTrackingNum, setBaggageTrackingNum] = useState('');

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await api.get('/airports');
        if (res?.data) {
          setAirports(res.data);
          if (res.data.length >= 2) {
            setFromAirport(res.data[0].AIRPORTCODE || 'JFK');
            setToAirport(res.data[1].AIRPORTCODE || 'LAX');
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
    if (!fromAirport || !toAirport || !departureDate) return;
    navigate(`/flights?from=${fromAirport}&to=${toAirport}&date=${departureDate}&class=${cabinClass}&passengers=${passengers}`);
  };

  const handleTrackBaggage = (e) => {
    e.preventDefault();
    if (baggageTrackingNum.trim()) {
      navigate(`/baggage?tracking=${encodeURIComponent(baggageTrackingNum.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 pt-12 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-4">
            ✈️ Powered by Oracle 21c Connection Pool
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
            Where Modern Aviation Meets <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
              Precision & Comfort
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Book commercial flights, customize seating tiers, and track luggage across international hubs with real-time accuracy.
          </p>
        </div>

        {/* Flight Search Card */}
        <div className="max-w-5xl mx-auto bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/80">
          <form onSubmit={handleSearchFlights} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Departure Airport */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                  <PlaneTakeoff className="w-3.5 h-3.5 mr-1 text-blue-400" />
                  From
                </label>
                <select
                  value={fromAirport}
                  onChange={(e) => setFromAirport(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {airports.map((a) => (
                    <option key={a.AIRPORTCODE} value={a.AIRPORTCODE}>
                      {a.CITY} ({a.AIRPORTCODE})
                    </option>
                  ))}
                  {airports.length === 0 && (
                    <>
                      <option value="JFK">New York (JFK)</option>
                      <option value="LHR">London (LHR)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Swap Origin & Destination"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Arrival Airport */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                  <PlaneLanding className="w-3.5 h-3.5 mr-1 text-sky-400" />
                  To
                </label>
                <select
                  value={toAirport}
                  onChange={(e) => setToAirport(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {airports.map((a) => (
                    <option key={a.AIRPORTCODE} value={a.AIRPORTCODE}>
                      {a.CITY} ({a.AIRPORTCODE})
                    </option>
                  ))}
                  {airports.length === 0 && (
                    <>
                      <option value="LAX">Los Angeles (LAX)</option>
                      <option value="CDG">Paris (CDG)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Departure Date */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Cabin Class */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Class
                </label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Eco</option>
                  <option value="Business">Business</option>
                  <option value="First">First Class</option>
                </select>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-800 gap-4">
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span>Direct Flights Available</span>
                <span>•</span>
                <span>Free Seat Selection Available</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition duration-200"
              >
                <Search className="w-5 h-5" />
                <span>Search Available Flights</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Baggage Lookup Banner */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 z-10">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-500/20 text-amber-400 p-3 rounded-lg border border-amber-500/30">
              <Luggage className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Track Luggage in Real Time</h3>
              <p className="text-xs text-slate-400">Enter your baggage barcode/tracking ID (e.g. TRK-1001-A)</p>
            </div>
          </div>

          <form onSubmit={handleTrackBaggage} className="flex w-full md:w-auto items-center gap-2">
            <input
              type="text"
              placeholder="e.g. TRK-1001-A"
              value={baggageTrackingNum}
              onChange={(e) => setBaggageTrackingNum(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition"
            >
              Track
            </button>
          </form>
        </div>
      </div>

      {/* Value Propositions Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Designed for High-Reliability Aviation</h2>
          <p className="text-slate-400 text-sm">Enterprise-grade transactional booking architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl w-fit">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-white">Live Flight Status</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant schedule tracking with gate dispatch, arrival estimations, and delayed status broadcasting.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-white">ACID Seat Locking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Oracle 21c transactional seat reservation ensures zero double-booking conflicts during peak checkout.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl w-fit">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-white">Multi-Tier Checkout</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant e-ticket generation with simulated Stripe, PayPal, and Card payments with digital pass generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

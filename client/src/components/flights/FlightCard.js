import React, { useState } from 'react';
import {
  Plane,
  Clock,
  Luggage,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const BAGGAGE_INFO = {
  'Economy': { cabin: '7 kg Hand Baggage', checkin: '15 kg Check-in Baggage' },
  'Premium Economy': { cabin: '10 kg Hand Baggage', checkin: '25 kg Check-in Baggage' },
  'Business': { cabin: '12 kg Hand Baggage', checkin: '35 kg Check-in Baggage' },
  'First': { cabin: '15 kg Hand Baggage', checkin: '45 kg Check-in Baggage' }
};

const CLASS_MULTIPLIERS = {
  'Economy': 1.0,
  'Premium Economy': 1.4,
  'Business': 2.2,
  'First': 3.5
};

const FlightCard = ({
  flight,
  selectedClass = 'Economy',
  passengers = 1,
  onSelectFlight
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { formatPrice } = useCurrency();

  if (!flight) return null;

  const multiplier = CLASS_MULTIPLIERS[selectedClass] || 1.0;
  const baseFarePerPax = Math.round(Number(flight.BASEPRICE || 3500) * multiplier);
  const totalFare = baseFarePerPax * passengers;

  // Format Departure and Arrival times
  const formatTime = (ts) => {
    if (!ts) return '--:--';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const calculateDuration = () => {
    if (flight.DURATIONMINUTES) {
      const h = Math.floor(flight.DURATIONMINUTES / 60);
      const m = flight.DURATIONMINUTES % 60;
      return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
    }
    if (flight.DEPARTURETIME && flight.ARRIVALTIME) {
      const diffMs = new Date(flight.ARRIVALTIME) - new Date(flight.DEPARTURETIME);
      if (diffMs > 0) {
        const totalMin = Math.round(diffMs / (1000 * 60));
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
      }
    }
    return '2h 15m';
  };

  const isCancelled = flight.STATUS === 'Cancelled';
  const baggage = BAGGAGE_INFO[selectedClass] || BAGGAGE_INFO['Economy'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top Banner: Flight Number & Status */}
      <div className="bg-[#F8F9FA] px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-[#0052CC] tracking-wide uppercase">
            <Plane className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Enum Airways</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
            {flight.FLIGHTNUMBER || 'EA 201'}
          </span>
          <span className="text-slate-500 hidden sm:inline">
            {flight.AIRCRAFTMODEL || 'Airbus A320neo'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {flight.AVAILABLESEATS !== undefined && (
            <span className={`px-2 py-0.5 rounded-full font-medium ${
              flight.AVAILABLESEATS > 10
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {flight.AVAILABLESEATS > 0 ? `${flight.AVAILABLESEATS} seats left` : 'Sold out'}
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
            isCancelled
              ? 'bg-red-100 text-red-700'
              : flight.STATUS === 'Delayed'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {flight.STATUS || 'Scheduled'}
          </span>
        </div>
      </div>

      {/* Main Flight Segment */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

          {/* Departure Column */}
          <div className="md:col-span-3 text-left">
            <div className="text-2xl sm:text-3xl font-bold text-[#091E42] tracking-tight">
              {formatTime(flight.DEPARTURETIME)}
            </div>
            <div className="text-sm font-semibold text-[#0052CC] mt-0.5">
              {flight.DEPARTUREAIRPORT || flight.DEPARTURECITY || 'BOM'}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {flight.DEPARTURECITY ? `${flight.DEPARTURECITY}` : 'Departure Hub'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {formatDate(flight.DEPARTURETIME)}
            </div>
          </div>

          {/* Flight Path / Duration */}
          <div className="md:col-span-4 flex flex-col items-center px-2">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {calculateDuration()}
            </span>

            <div className="w-full flex items-center relative py-2">
              <div className="w-2 h-2 rounded-full border-2 border-[#0052CC] bg-white"></div>
              <div className="flex-1 h-0.5 bg-slate-300 relative mx-1">
                <Plane className="w-4 h-4 text-[#0052CC] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0052CC]"></div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Non-stop
            </span>
          </div>

          {/* Arrival Column */}
          <div className="md:col-span-2 text-left md:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-[#091E42] tracking-tight">
              {formatTime(flight.ARRIVALTIME)}
            </div>
            <div className="text-sm font-semibold text-[#0052CC] mt-0.5">
              {flight.ARRIVALAIRPORT || flight.ARRIVALCITY || 'DEL'}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {flight.ARRIVALCITY ? `${flight.ARRIVALCITY}` : 'Arrival Hub'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {formatDate(flight.ARRIVALTIME)}
            </div>
          </div>

          {/* Fare & Action Column */}
          <div className="md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 space-y-0 md:space-y-3">
            <div className="text-left md:text-right">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {selectedClass}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#091E42]">
                {formatPrice(baseFarePerPax)}
              </div>
              <div className="text-[11px] text-slate-500">
                per passenger • taxes incl.
              </div>
              {passengers > 1 && (
                <div className="text-xs font-semibold text-[#0052CC] mt-0.5">
                  Total ({passengers} pax): {formatPrice(totalFare)}
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectFlight && onSelectFlight(flight)}
              disabled={isCancelled || flight.AVAILABLESEATS === 0}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
                isCancelled || flight.AVAILABLESEATS === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-[#0052CC] hover:bg-[#003A8C] text-white shadow-blue-600/20 hover:shadow active:scale-95'
              }`}
            >
              Select Flight
            </button>
          </div>
        </div>

        {/* Quick Highlights / Inclusions */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Luggage className="w-3.5 h-3.5 text-[#0052CC]" />
              {baggage.cabin}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {baggage.checkin}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Complimentary refreshment
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[#0052CC] font-semibold hover:underline cursor-pointer"
          >
            <span>{showDetails ? 'Hide details' : 'Flight details'}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Flight & Fare Details */}
      {showDetails && (
        <div className="bg-[#F4F5F7] px-6 py-5 border-t border-slate-200 text-xs text-slate-700 space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Aircraft specs */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-[#091E42] uppercase tracking-wider text-[10px] block">
                Aircraft Specifications
              </span>
              <p className="font-semibold text-slate-800">{flight.AIRCRAFTMODEL || 'Airbus A320neo'}</p>
              <p className="text-slate-500">Cabin Layout: Modern 3-3 configuration</p>
              <p className="text-slate-500">In-flight Amenities: USB power & refreshments</p>
            </div>

            {/* Baggage allowance */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-[#091E42] uppercase tracking-wider text-[10px] block">
                Baggage Allowance ({selectedClass})
              </span>
              <p className="text-slate-800 font-medium">Cabin: <span className="font-bold">{baggage.cabin}</span></p>
              <p className="text-slate-800 font-medium">Check-in: <span className="font-bold">{baggage.checkin}</span></p>
              <p className="text-slate-500">Extra baggage can be added during online check-in</p>
            </div>

            {/* Fare Breakdown */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-[#091E42] uppercase tracking-wider text-[10px] block">
                Fare Breakdown (per pax)
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Base Airfare:</span>
                <span className="font-semibold text-slate-800">{formatPrice(Math.round(baseFarePerPax * 0.85))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Aviation Fuel Surcharge (YQ):</span>
                <span className="font-semibold text-slate-800">{formatPrice(Math.round(baseFarePerPax * 0.10))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Airport Development Fee + Taxes:</span>
                <span className="font-semibold text-slate-800">{formatPrice(Math.round(baseFarePerPax * 0.05))}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-[#091E42]">
                <span>Total Per Passenger:</span>
                <span className="text-[#0052CC]">{formatPrice(baseFarePerPax)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#0052CC] flex-shrink-0" />
            <span>Fares and seat allocations are confirmed upon booking completion.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { formatPrice } = useCurrency();

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const fRes = await api.get('/flights');
      if (fRes?.data) setFlights(Array.isArray(fRes.data) ? fRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load flight schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleStatusChange = async (flightId, newStatus) => {
    setUpdatingId(flightId);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/flights/${flightId}/status`, { status: newStatus });
      setSuccess(`Flight ${flightId} status updated to ${newStatus}`);
      fetchFlights();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update flight status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-[#0052CC] tracking-wider">
              Operations Dispatch
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091E42] mt-1">
              Flight Schedule & Gate Management
            </h1>
          </div>

          <button
            onClick={fetchFlights}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold text-[#172B4D] transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Roster</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2 text-xs animate-fade-in-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-xs animate-fade-in-up">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <LoadingSpinner text="Retrieving live flight schedule from Oracle 21c..." />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-[11px] uppercase text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Flight</th>
                    <th className="py-3.5 px-4">Aircraft</th>
                    <th className="py-3.5 px-4">Route</th>
                    <th className="py-3.5 px-4">Departure Time</th>
                    <th className="py-3.5 px-4">Arrival Time</th>
                    <th className="py-3.5 px-4">Base Fare</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flights.map((flight) => (
                    <tr key={flight.FLIGHTID} className="hover:bg-[#F4F5F7] transition">
                      <td className="py-4 px-4 font-mono font-bold text-sm text-[#091E42]">
                        {flight.FLIGHTNUMBER}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {flight.AIRCRAFTMODEL || `ID: ${flight.AIRCRAFTID}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#091E42]">
                          {flight.DEPARTUREAIRPORT} ➔ {flight.ARRIVALAIRPORT}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {flight.DEPARTURECITY} to {flight.ARRIVALCITY}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        {new Date(flight.DEPARTURETIME).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        {new Date(flight.ARRIVALTIME).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0052CC] font-mono">
                        {formatPrice(flight.BASEPRICE)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={flight.STATUS} />
                      </td>
                      <td className="py-4 px-4">
                        <select
                          disabled={updatingId === flight.FLIGHTID}
                          value={flight.STATUS}
                          onChange={(e) => handleStatusChange(flight.FLIGHTID, e.target.value)}
                          className="bg-[#F4F5F7] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Departed">Departed</option>
                          <option value="Arrived">Arrived</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminFlights;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
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

  // Status update
  const [updatingId, setUpdatingId] = useState(null);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const fRes = await api.get('/flights');
      if (fRes?.data) setFlights(fRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load flight schedule');
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
      setError(err.message || 'Failed to update flight status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                Fleet Management
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">Flight Operations & Dispatch</h1>
          </div>

          <button
            onClick={fetchFlights}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Roster</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-4 rounded-xl flex items-center space-x-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner fullPage text="Retrieving live flight schedule from Oracle..." />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Flight</th>
                    <th className="py-3.5 px-4">Aircraft</th>
                    <th className="py-3.5 px-4">Route</th>
                    <th className="py-3.5 px-4">Departure Time</th>
                    <th className="py-3.5 px-4">Arrival Time</th>
                    <th className="py-3.5 px-4">Base Fare</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Quick Status Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {flights.map((flight) => (
                    <tr key={flight.FLIGHTID} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {flight.FLIGHTNUMBER}
                      </td>
                      <td className="py-4 px-4 text-slate-300 text-xs">
                        {flight.AIRCRAFTMODEL || `ID: ${flight.AIRCRAFTID}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">
                          {flight.DEPARTUREAIRPORT} ➔ {flight.ARRIVALAIRPORT}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {flight.DEPARTURECITY} to {flight.ARRIVALCITY}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-300">
                        {new Date(flight.DEPARTURETIME).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-300">
                        {new Date(flight.ARRIVALTIME).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-400 font-mono">
                        ${flight.BASEPRICE}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={flight.STATUS} />
                      </td>
                      <td className="py-4 px-4">
                        <select
                          disabled={updatingId === flight.FLIGHTID}
                          value={flight.STATUS}
                          onChange={(e) => handleStatusChange(flight.FLIGHTID, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
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

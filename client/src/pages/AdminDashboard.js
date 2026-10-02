import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { 
  DollarSign, 
  Plane, 
  Ticket, 
  Users, 
  TrendingUp, 
  BarChart3, 
  ShieldAlert, 
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/dashboard');
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage text="Aggregating live analytics from Oracle 21c Database..." />;
  }

  if (error || !stats) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300 text-center">
        <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-rose-400" />
        <h3 className="font-bold text-lg">Admin Access Error</h3>
        <p className="text-sm mt-1">{error || 'Could not load metrics'}</p>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { revenue, flights, bookings, users } = stats;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Control Center
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">Oracle Live Query Pool</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Airline Operations & Analytics
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardStats}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/flights"
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Manage Flights</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              ${revenue?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time payment settlements</span>
            </p>
          </div>

          {/* Bookings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
              <div className="bg-blue-500/20 text-blue-400 p-2 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {bookings?.totalBookings || '0'}
            </div>
            <p className="text-[11px] text-slate-400">
              Avg value: <span className="text-slate-200 font-semibold">${Math.round(bookings?.averageBookingValue || 0)}</span>
            </p>
          </div>

          {/* Fleet Occupancy */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Occupancy</span>
              <div className="bg-purple-500/20 text-purple-400 p-2 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {flights?.overallOccupancy?.occupancyRate || '0'}%
            </div>
            <p className="text-[11px] text-slate-400">
              {flights?.overallOccupancy?.occupiedSeats || 0} / {flights?.overallOccupancy?.totalSeats || 0} seats booked
            </p>
          </div>

          {/* Users */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Bookers</span>
              <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {users?.activeUsers || '0'}
            </div>
            <p className="text-[11px] text-slate-400">
              {users?.usersWithPassengerProfiles || 0} verified passenger profiles
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue by Cabin Class */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Revenue Breakdown by Class</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(revenue?.revenueByClass || []).map((item) => (
                <div
                  key={item.cabinClass}
                  className="bg-slate-800/60 p-3.5 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white text-sm">{item.cabinClass}</p>
                    <p className="text-xs text-slate-400">{item.ticketCount} tickets sold</p>
                  </div>
                  <p className="text-base font-bold text-emerald-400 font-mono">
                    ${item.revenue?.toLocaleString()}
                  </p>
                </div>
              ))}
              {(!revenue?.revenueByClass || revenue.revenueByClass.length === 0) && (
                <p className="text-xs text-slate-500 text-center py-4">No ticket revenues yet.</p>
              )}
            </div>
          </div>

          {/* Flight Status Distribution */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Plane className="w-4 h-4 text-sky-400" />
                <span>Active Flight Schedule Distribution</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(flights?.flightsByStatus || []).map((f) => (
                <div
                  key={f.status}
                  className="bg-slate-800/60 p-3.5 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={f.status} />
                  </div>
                  <span className="font-bold text-lg text-white font-mono">{f.count} flights</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flight Occupancy Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Fleet Load Factors & Seat Utilization</h3>
            <Link to="/admin/flights" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              <span>View All Flights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Total Capacity</th>
                  <th className="py-3 px-4">Booked Seats</th>
                  <th className="py-3 px-4">Load Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(flights?.flightOccupancy || []).map((row) => (
                  <tr key={row.flightId} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">{row.flightNumber}</td>
                    <td className="py-3 px-4 text-slate-300">{row.totalSeats}</td>
                    <td className="py-3 px-4 text-slate-300">{row.occupiedSeats}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, row.occupancyRate)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {row.occupancyRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

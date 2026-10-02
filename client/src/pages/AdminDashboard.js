import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { 
  DollarSign, 
  Plane, 
  Ticket, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Layers,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatPrice } = useCurrency();

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/dashboard');
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load operational analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating live operational metrics from Oracle 21c..." />;
  }

  if (error || !stats) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
        <h3 className="font-bold text-lg text-red-700">Analytics Error</h3>
        <p className="text-xs text-red-600">{error || 'Failed to load statistics'}</p>
        <button
          onClick={fetchDashboardStats}
          className="bg-[#0052CC] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { revenue, flights, bookings, users } = stats;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold text-[#0052CC] tracking-wider">
                Enum Airways Operations
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Oracle 21c Pool Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091E42] mt-1">
              Flight Operations & Analytics Portal
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardStats}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold text-[#172B4D] transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh Stats</span>
            </button>
            <Link
              to="/admin/flights"
              className="flex items-center space-x-1.5 bg-[#0052CC] hover:bg-[#003A8C] px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Manage Flights</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Revenue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Ticket Sales</span>
              <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#091E42] font-mono">
              {formatPrice(revenue?.totalRevenue || 0)}
            </div>
            <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>Live settlement via Oracle Transactions</span>
            </p>
          </div>

          {/* Bookings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmed Bookings</span>
              <div className="bg-[#DEEBFF] text-[#0052CC] p-2 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#091E42] font-mono">
              {bookings?.totalBookings || '0'}
            </div>
            <p className="text-[11px] text-slate-500">
              Avg value: <span className="font-bold text-[#091E42]">{formatPrice(Math.round(bookings?.averageBookingValue || 0))}</span>
            </p>
          </div>

          {/* Fleet Occupancy */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Network Occupancy</span>
              <div className="bg-purple-50 text-purple-700 p-2 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#091E42] font-mono">
              {flights?.overallOccupancy?.occupancyRate || '0'}%
            </div>
            <p className="text-[11px] text-slate-500">
              {flights?.overallOccupancy?.occupiedSeats || 0} / {flights?.overallOccupancy?.totalSeats || 0} seats reserved
            </p>
          </div>

          {/* Users */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Users</span>
              <div className="bg-amber-50 text-amber-700 p-2 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#091E42] font-mono">
              {users?.activeUsers || '0'}
            </div>
            <p className="text-[11px] text-slate-500">
              {users?.usersWithPassengerProfiles || 0} passenger profiles
            </p>
          </div>
        </div>

        {/* Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Revenue by Cabin Class */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#091E42] text-base flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#0052CC]" />
                <span>Revenue by Cabin Class</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(revenue?.revenueByClass || []).map((item) => (
                <div
                  key={item.cabinClass}
                  className="bg-[#F8F9FA] p-3.5 rounded-xl flex items-center justify-between border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-[#091E42] text-sm">{item.cabinClass}</p>
                    <p className="text-xs text-slate-500">{item.ticketCount} tickets reserved</p>
                  </div>
                  <p className="text-base font-extrabold text-[#0052CC] font-mono">
                    {formatPrice(item.revenue || 0)}
                  </p>
                </div>
              ))}
              {(!revenue?.revenueByClass || revenue.revenueByClass.length === 0) && (
                <p className="text-xs text-slate-500 text-center py-4">No ticket reservations recorded yet.</p>
              )}
            </div>
          </div>

          {/* Flight Status Distribution */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#091E42] text-base flex items-center space-x-2">
                <Plane className="w-4 h-4 text-[#0052CC]" />
                <span>Flight Operations Schedule</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(flights?.flightsByStatus || []).map((f) => (
                <div
                  key={f.status}
                  className="bg-[#F8F9FA] p-3.5 rounded-xl flex items-center justify-between border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={f.status} />
                  </div>
                  <span className="font-extrabold text-base text-[#091E42] font-mono">{f.count} flights</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  Plane, 
  Luggage, 
  Calendar, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Menu, 
  X,
  MessageSquare,
  HelpCircle,
  Search,
  Globe
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

const Navbar = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-[#091E42] text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-slate-200">India's Premier Commercial Aviation Network</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300">
              Helpline: <a href="tel:8999147294" className="text-white font-semibold hover:underline">8999147294</a>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <div className="flex items-center space-x-1 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline text-[11px] text-slate-400 mr-1">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#172B4D] text-white text-xs rounded px-2 py-0.5 border border-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer font-medium"
                aria-label="Select display currency"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Link to="/help" className="hover:text-white transition flex items-center space-x-1 text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <img 
              src={logoImg} 
              alt="Enum Airways Logo" 
              className="h-12 w-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200 border border-slate-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.jpg';
              }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-[#0052CC] leading-none">
                Enum Airways
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#6B778C] mt-1">
                Indian Aviation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/') 
                  ? 'text-[#0052CC] bg-[#DEEBFF]' 
                  : 'text-[#172B4D] hover:text-[#0052CC] hover:bg-[#F4F5F7]'
              }`}
            >
              Book Flights
            </Link>

            <Link
              to="/manage-booking"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/manage-booking') 
                  ? 'text-[#0052CC] bg-[#DEEBFF]' 
                  : 'text-[#172B4D] hover:text-[#0052CC] hover:bg-[#F4F5F7]'
              }`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Manage Booking</span>
            </Link>

            <Link
              to="/baggage"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/baggage') 
                  ? 'text-[#0052CC] bg-[#DEEBFF]' 
                  : 'text-[#172B4D] hover:text-[#0052CC] hover:bg-[#F4F5F7]'
              }`}
            >
              <Luggage className="w-4 h-4 text-slate-400" />
              <span>Baggage</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  isActive('/my-bookings') 
                    ? 'text-[#0052CC] bg-[#DEEBFF]' 
                    : 'text-[#172B4D] hover:text-[#0052CC] hover:bg-[#F4F5F7]'
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>My Trips</span>
              </Link>
            )}

            <Link
              to="/feedback"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/feedback') 
                  ? 'text-[#0052CC] bg-[#DEEBFF]' 
                  : 'text-[#172B4D] hover:text-[#0052CC] hover:bg-[#F4F5F7]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Feedback</span>
            </Link>

            {/* Admin / Staff Navigation */}
            {isStaff && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  isActive('/admin/dashboard') 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>Staff Portal</span>
              </Link>
            )}
          </nav>

          {/* Auth Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 bg-[#F4F5F7] hover:bg-[#EBECF0] px-3.5 py-2 rounded-full border border-slate-200 text-sm text-[#172B4D] transition"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs">
                    {(user?.firstName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="font-semibold max-w-[120px] truncate text-[#091E42]">
                    {user?.firstName || user?.email}
                  </span>
                  {user?.role && (
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#DEEBFF] text-[#0052CC]">
                      {user.role}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-[#172B4D] hover:bg-[#F4F5F7] transition"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 bg-[#0052CC] hover:bg-[#003A8C] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition duration-150 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Enum</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-slate-800" /> : <Menu className="h-6 w-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fade-in-up">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
          >
            <Plane className="w-5 h-5 text-[#0052CC]" />
            <span>Book Flights</span>
          </Link>

          <Link
            to="/manage-booking"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
          >
            <Search className="w-5 h-5 text-[#0052CC]" />
            <span>Manage Booking / PNR</span>
          </Link>

          <Link
            to="/baggage"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
          >
            <Luggage className="w-5 h-5 text-[#0052CC]" />
            <span>Track Baggage</span>
          </Link>

          <Link
            to="/feedback"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
          >
            <MessageSquare className="w-5 h-5 text-[#0052CC]" />
            <span>Feedback</span>
          </Link>

          <Link
            to="/help"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
          >
            <HelpCircle className="w-5 h-5 text-[#0052CC]" />
            <span>Help & Support</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
              >
                <Calendar className="w-5 h-5 text-[#0052CC]" />
                <span>My Bookings</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-[#172B4D] hover:bg-[#F4F5F7]"
              >
                <User className="w-5 h-5 text-[#0052CC]" />
                <span>My Profile</span>
              </Link>
            </>
          )}

          {isStaff && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-amber-900 bg-amber-50"
            >
              <LayoutDashboard className="w-5 h-5 text-amber-600" />
              <span>Staff / Admin Portal</span>
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl text-center bg-[#F4F5F7] text-[#172B4D] font-bold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl text-center bg-[#0052CC] text-white font-bold"
                >
                  Join Enum
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

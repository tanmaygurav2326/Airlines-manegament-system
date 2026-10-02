import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 text-white group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-sky-200 bg-clip-text text-transparent">
              SkyWings Airways
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/') ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Search Flights
            </Link>

            <Link
              to="/baggage"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/baggage') ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Luggage className="h-4 w-4" />
              <span>Track Baggage</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/my-bookings') ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>My Bookings</span>
              </Link>
            )}

            {/* Admin / Staff Navigation */}
            {isStaff && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/admin/dashboard') ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50' : 'text-amber-300 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          {/* Auth Actions Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 text-sm text-slate-200 transition"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  <span className="font-medium max-w-[120px] truncate">
                    {user?.firstName || user?.email}
                  </span>
                  {user?.role && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                      {user.role}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 p-2 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Search Flights
          </Link>
          <Link
            to="/baggage"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Track Baggage
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                My Bookings
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                My Profile
              </Link>
            </>
          )}

          {isStaff && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-300 hover:bg-slate-800"
            >
              Admin Portal
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-rose-600/20 text-rose-300 border border-rose-600/30 px-4 py-2 rounded-md font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-4 rounded-md text-center bg-slate-800 text-slate-200 font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-2 px-4 rounded-md text-center bg-blue-600 text-white font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

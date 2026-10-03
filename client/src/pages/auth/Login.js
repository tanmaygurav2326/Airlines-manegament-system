import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogIn, 
  AlertCircle, 
  KeyRound, 
  Mail,
  ShieldCheck 
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import logoImg from '../../assets/logo.jpg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img 
            src={logoImg} 
            alt="Enum Airways" 
            className="h-16 w-16 mx-auto rounded-2xl object-cover shadow-sm border border-slate-200" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.jpg';
            }}
          />
          <h2 className="text-3xl font-extrabold text-[#091E42] tracking-tight">
            Sign In to Enum Airways
          </h2>
          <p className="text-xs text-slate-500">
            Access your bookings, select seating, and manage your travel itinerary.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-xs animate-fade-in-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#003A8C] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <LoadingSpinner text="Signing in..." />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500 gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Secure Session</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          New to Enum Airways?{' '}
          <Link to="/register" className="text-[#0052CC] font-bold hover:underline">
            Register for Free
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;

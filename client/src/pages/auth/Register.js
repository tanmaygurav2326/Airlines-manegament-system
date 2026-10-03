import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plane, 
  UserPlus, 
  AlertCircle, 
  Mail, 
  KeyRound, 
  Briefcase 
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import logoImg from '../../assets/logo.jpg';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('Passenger'); // 'Passenger' | 'Staff'
  const [staffId, setStaffId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password
      };

      if (accountType === 'Staff') {
        if (!staffId.trim()) {
          throw new Error('Staff ID is required for Airline Staff registration.');
        }
        payload.staffId = staffId.trim().toUpperCase();
      }

      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please verify your details.');
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
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Join Enum Airways for instant flight bookings, seat reservations, and digital boarding passes.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-xs animate-fade-in-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('Passenger')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    accountType === 'Passenger'
                      ? 'bg-[#DEEBFF] text-[#0052CC] border-2 border-[#0052CC]'
                      : 'bg-[#F4F5F7] text-slate-600 border border-slate-200'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Passenger</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('Staff')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    accountType === 'Staff'
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-600'
                      : 'bg-[#F4F5F7] text-slate-600 border border-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Airline Staff</span>
                </button>
              </div>
            </div>

            {/* Staff ID Input (conditional) */}
            {accountType === 'Staff' && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1.5 animate-fade-in-up">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Official Staff ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EA-STF-101"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#091E42] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-amber-700">
                  Enter your pre-assigned Enum Airways staff identification code.
                </p>
              </div>
            )}

            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="rahul.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-[#091E42] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#003A8C] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-50 mt-2 active:scale-95"
            >
              {loading ? (
                <LoadingSpinner text="Creating account..." />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0052CC] font-bold hover:underline">
            Sign In here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;

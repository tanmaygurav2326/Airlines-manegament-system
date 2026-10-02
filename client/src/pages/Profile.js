import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  User, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Award,
  Phone,
  Globe
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('India');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [frequentFlyerNumber, setFrequentFlyerNumber] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/passengers/me');
        if (res?.data) {
          setPassportNumber(res.data.PASSPORTNUMBER || '');
          setNationality(res.data.NATIONALITY || 'India');
          setPhoneNumber(res.data.PHONENUMBER || '');
          setFrequentFlyerNumber(res.data.FREQUENTFLYERNUMBER || '');
        }
      } catch (err) {
        // Passenger record might not exist yet
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/passengers/me', {
        passportNumber: passportNumber.trim(),
        nationality: nationality.trim(),
        phoneNumber: phoneNumber.trim(),
        frequentFlyerNumber: frequentFlyerNumber.trim() || undefined
      });
      setSuccess('Passenger profile details updated successfully.');
    } catch (err) {
      try {
        await api.post('/passengers', {
          passportNumber: passportNumber.trim(),
          nationality: nationality.trim(),
          phoneNumber: phoneNumber.trim(),
          frequentFlyerNumber: frequentFlyerNumber.trim() || undefined
        });
        setSuccess('Passenger profile created successfully.');
      } catch (postErr) {
        setError(postErr.response?.data?.message || postErr.message || 'Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving passenger identity..." />;
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">Passenger Center</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091E42]">My Profile & Travel Credentials</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your travel identity documents and frequent flyer points for seamless check-in.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-[#0052CC]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role: {user?.role || 'Passenger'}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2 text-xs animate-fade-in-up">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-xs animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Account Overview */}
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-[#0052CC] text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-blue-500/20">
              {(user?.firstName || 'E')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#091E42]">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#0052CC]" />
                  Passport / Photo ID Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Z1234567 or Indian Govt ID"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#0052CC]" />
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#0052CC]" />
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#0052CC]" />
                  Frequent Flyer Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. EA-FLY-8821"
                  value={frequentFlyerNumber}
                  onChange={(e) => setFrequentFlyerNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold py-3 px-6 rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('');
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
          setNationality(res.data.NATIONALITY || '');
          setPhoneNumber(res.data.PHONENUMBER || '');
          setFrequentFlyerNumber(res.data.FREQUENTFLYERNUMBER || '');
        }
      } catch (err) {
        // May not have a passenger record yet
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
      // If doesn't exist, create it
      try {
        await api.post('/passengers', {
          passportNumber: passportNumber.trim(),
          nationality: nationality.trim(),
          phoneNumber: phoneNumber.trim(),
          frequentFlyerNumber: frequentFlyerNumber.trim() || undefined
        });
        setSuccess('Passenger profile created successfully.');
      } catch (createErr) {
        setError(createErr.message || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving profile..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-white">Passenger Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Keep your passport and travel credentials updated for faster check-in.
          </p>
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

        {/* Account Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-500/30">
              {user?.firstName ? user.firstName[0] : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.email}</span>
                <span>•</span>
                <span className="text-blue-400 font-semibold">{user?.role}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. P12345678"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  placeholder="e.g. United States"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1-555-0199"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Frequent Flyer ID
                </label>
                <input
                  type="text"
                  placeholder="FF-90218"
                  value={frequentFlyerNumber}
                  onChange={(e) => setFrequentFlyerNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

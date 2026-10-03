import React, { useState } from 'react';
import api from '../../services/api';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Flight Experience',
  'Booking & Ticketing',
  'In-Flight Service & Dining',
  'Baggage Handling',
  'Check-in & Ground Staff',
  'Website & Digital Experience',
  'Other / General Suggestion'
];

const Feedback = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/feedback', {
        name: name.trim() || 'Anonymous',
        email: email.trim() || null,
        category,
        rating,
        message: message.trim()
      });
      setSuccess(true);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="bg-[#DEEBFF] text-[#0052CC] p-3 rounded-2xl w-fit mx-auto border border-blue-200">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#091E42]">Passenger Feedback & Reviews</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your voice shapes Enum Airways. Share your travel impressions, compliments, or suggestions directly with our operational management team.
          </p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl space-y-2 text-center animate-fade-in-up">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg">Thank You for Your Feedback!</h3>
            <p className="text-xs text-emerald-700">
              Your message has been received. Our customer experience team reviews all submissions.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition"
            >
              Submit Another Response
            </button>
          </div>
        )}

        {/* Feedback Form */}
        {!success && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Overall Travel Experience Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-500 ml-3">
                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Feedback Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 font-semibold text-sm text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lokesh Sonawane"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. traveler@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Detailed Experience / Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your flight, staff assistance, food quality, or website navigation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl p-4 text-sm text-[#091E42] focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Support Link */}
        <div className="text-center text-xs text-slate-500">
          Need immediate booking support?{' '}
          <Link to="/help" className="text-[#0052CC] font-bold hover:underline">
            Visit our 24/7 Support Desk
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Feedback;

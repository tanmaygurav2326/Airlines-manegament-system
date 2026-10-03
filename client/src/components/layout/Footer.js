import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

const Footer = () => {
  return (
    <footer className="bg-[#091E42] text-slate-300 border-t border-slate-800 mt-auto">
      {/* Upper Footer: Top Destinations & Features */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 bg-[#071735]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center space-x-3">
            <img
              src={logoImg}
              alt="Enum Airways"
              className="h-9 w-9 rounded-lg object-cover border border-slate-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.jpg';
              }}
            />
            <div>
              <span className="font-extrabold text-white text-base">Enum Airways</span>
              <p className="text-xs text-slate-400">Connecting India's Key Hubs with Precision & Punctuality</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Direct Metro Hub Routes</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guaranteed Seat Selection</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>15 kg Complimentary Baggage</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">

          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold text-white tracking-tight">Enum Airways</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's premier commercial airline connecting primary metro hubs—Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, and Ahmedabad—with select international gateways.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#172B4D] border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Enum Airways Online Reservation Network</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Flight Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">Book Domestic Flights</Link>
              </li>
              <li>
                <Link to="/manage-booking" className="hover:text-white transition">Manage Booking / PNR</Link>
              </li>
              <li>
                <Link to="/baggage" className="hover:text-white transition">Track Baggage Real-Time</Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-white transition">Customer Feedback</Link>
              </li>
            </ul>
          </div>

          {/* Key Indian Hubs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Key Indian Hubs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Mumbai (BOM) — T2 Terminal</li>
              <li>Delhi (DEL) — IGI Terminal 3</li>
              <li>Bengaluru (BLR) — Kempegowda T2</li>
              <li>Pune (PNQ) — New Terminal Hub</li>
              <li>Hyderabad (HYD) & Chennai (MAA)</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Helpline & Office</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-300 font-medium">Helpline (Toll-Free):</span>
                  <a href="tel:8999147294" className="text-white font-bold hover:underline">
                    8999147294
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-300 font-medium">Support Desk:</span>
                  <a
                    href="mailto:tanmaygurav2326@gmail.com?subject=Enum%20Airways%20Customer%20Support"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                    title="Click to write to customer support"
                  >
                    <span>Contact via Mail</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <span className="block text-slate-400 text-[11px]">Registered Office:</span>
                  <p className="leading-snug">
                    B-hostel, Government Polytechnic<br />
                    Shivajinagar, Pune - 411016
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Enum Airways. All rights reserved.</p>
          <div className="flex space-x-6 text-xs text-slate-400">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Carriage</Link>
            <Link to="/baggage-rules" className="hover:text-white transition">Baggage Rules</Link>
            <Link to="/feedback" className="hover:text-white transition">Grievance Officer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

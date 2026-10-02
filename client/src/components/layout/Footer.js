import React from 'react';
import { Plane, ShieldCheck, Headphones, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">SkyWings Airways</span>
            </div>
            <p className="text-sm leading-relaxed">
              Experience seamless global travel with advanced booking, transparent baggage tracking, and world-class fleet reliability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Fly With Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-blue-400 transition">Flight Schedule</a></li>
              <li><a href="/baggage" className="hover:text-blue-400 transition">Live Baggage Tracking</a></li>
              <li><a href="/" className="hover:text-blue-400 transition">Destinations & Routes</a></li>
              <li><a href="/" className="hover:text-blue-400 transition">Fleet Information</a></li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Headphones className="h-4 w-4 text-blue-400" />
                <span>24/7 Priority Helpline</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Secure Payments & Refunds</span>
              </li>
              <li className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span>SkyWings Frequent Flyer</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Platform Stack</h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Powered by Node.js, Express REST API, React 19, and Oracle Database 21c Connection Pooling.
            </p>
            <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Oracle 21c Pool: Connected</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkyWings Airways Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

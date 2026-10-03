import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#172B4D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#DEEBFF] text-[#0052CC]">
            <Shield className="w-3.5 h-3.5" />
            <span>Enum Airways Policies</span>
          </div>
          <h1 className="text-3xl font-bold text-[#091E42] font-display">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: October 2026 • Demo Airline Reservation Management System
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <Eye className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">1. Information We Collect</h2>
            </div>
            <p>
              When you use Enum Airways for flight reservations, ticket booking, or baggage tracking, we collect only information necessary to fulfill your travel services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Personal Identification:</strong> Full name, date of birth, gender, nationality, and government ID / passport reference.</li>
              <li><strong>Contact Details:</strong> Email address, mobile telephone number, and emergency contact details.</li>
              <li><strong>Booking Details:</strong> Flight origin, destination, travel dates, seat selection, cabin class, and baggage allowances.</li>
              <li><strong>Account Credentials:</strong> Password hashes (securely salted using bcrypt) and role information.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <Lock className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">2. How Your Information Is Protected</h2>
            </div>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Transport Layer Security (TLS/HTTPS) for all client-server communications.</li>
              <li>Cryptographic hashing of sensitive authentication data.</li>
              <li>Token-based session management using JSON Web Tokens (JWT) with strict expiration limits.</li>
              <li>Role-based access control preventing unauthorized data access between passenger, staff, and admin tiers.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">3. Use of Information</h2>
            </div>
            <p>
              Information collected is strictly utilized for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Issuing confirmed flight electronic tickets and digital boarding passes.</li>
              <li>Providing real-time flight status and baggage scanning updates.</li>
              <li>Assisting passenger inquiries through our Customer Support Desk.</li>
              <li>Fulfilling seat assignment and unaccompanied minor coordination requests.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[#091E42] font-display">4. Contact Our Support Desk</h2>
            <p>
              For privacy requests, data correction, or assistance regarding your flight records, please reach out to our team:
            </p>
            <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#0052CC]" />
                <span>Customer Support: </span>
                <a href="mailto:tanmaygurav2326@gmail.com" className="text-[#0052CC] font-bold hover:underline">
                  Contact Support via Mail
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#0052CC]" />
                <span>Helpline: 8999147294</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#0052CC]" />
                <span>Registered Office: B-hostel, Government Polytechnic, Shivajinagar, Pune - 411016</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Privacy;

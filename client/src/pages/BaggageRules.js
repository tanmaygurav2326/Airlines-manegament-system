import React from 'react';
import { Luggage, CheckCircle2, ShieldAlert, Scale } from 'lucide-react';

const BaggageRules = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#172B4D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#DEEBFF] text-[#0052CC]">
            <Luggage className="w-3.5 h-3.5" />
            <span>Enum Airways Baggage Policy</span>
          </div>
          <h1 className="text-3xl font-bold text-[#091E42] font-display">
            Baggage Rules & Allowances
          </h1>
          <p className="text-sm text-slate-500">
            Complimentary allowances, weight limits, and prohibited items guidelines
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* Cabin Baggage Table */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <Scale className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">1. Cabin / Hand Baggage Allowances</h2>
            </div>
            <p>
              Each passenger occupying a seat is entitled to one piece of cabin luggage plus one small personal item (such as a laptop bag or handbag). All cabin baggage must fit inside the overhead locker or beneath the seat in front of you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Economy</span>
                <span className="text-2xl font-bold text-[#091E42] font-display block">7 kg</span>
                <span className="text-[11px] text-slate-500">1 piece • 55×35×25 cm</span>
              </div>
              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Prem. Economy</span>
                <span className="text-2xl font-bold text-[#091E42] font-display block">10 kg</span>
                <span className="text-[11px] text-slate-500">1 piece • 55×35×25 cm</span>
              </div>
              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Business</span>
                <span className="text-2xl font-bold text-[#091E42] font-display block">12 kg</span>
                <span className="text-[11px] text-slate-500">1 piece + briefcase</span>
              </div>
              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">First Class</span>
                <span className="text-2xl font-bold text-[#091E42] font-display block">15 kg</span>
                <span className="text-[11px] text-slate-500">2 pieces allowed</span>
              </div>
            </div>
          </div>

          {/* Check-In Baggage Table */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">2. Checked Luggage Allowances</h2>
            </div>
            <p>
              Complimentary checked baggage allowances on Enum Airways domestic and international flights vary by ticket class:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Economy</span>
                <span className="text-2xl font-bold text-emerald-900 font-display block">15 kg</span>
                <span className="text-[11px] text-emerald-700">Complimentary 1 bag</span>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Prem. Economy</span>
                <span className="text-2xl font-bold text-emerald-900 font-display block">25 kg</span>
                <span className="text-[11px] text-emerald-700">Up to 2 pieces</span>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Business</span>
                <span className="text-2xl font-bold text-emerald-900 font-display block">35 kg</span>
                <span className="text-[11px] text-emerald-700">Priority tagged</span>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">First Class</span>
                <span className="text-2xl font-bold text-emerald-900 font-display block">45 kg</span>
                <span className="text-[11px] text-emerald-700">Express baggage delivery</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-2">
              * Infant passengers traveling without an assigned seat are entitled to one collapsible stroller or pram free of charge.
            </p>
          </div>

          {/* Dangerous and Prohibited Goods */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">3. Prohibited & Restricted Items</h2>
            </div>
            <p>
              For the safety of flight operations, certain items are strictly forbidden from carriage in either checked or hand luggage:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-1">
                <span className="font-bold text-red-800 text-xs block">Prohibited in Checked Luggage:</span>
                <ul className="list-disc pl-4 text-xs text-red-700 space-y-1">
                  <li>Loose lithium batteries and power banks (must be carried in cabin baggage).</li>
                  <li>E-cigarettes and vaping devices.</li>
                  <li>High-value jewelry and original documents.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-1">
                <span className="font-bold text-red-800 text-xs block">Strictly Prohibited Anywhere:</span>
                <ul className="list-disc pl-4 text-xs text-red-700 space-y-1">
                  <li>Flammables, lighter fluids, and fireworks.</li>
                  <li>Toxic substances, corrosives, and radioactive materials.</li>
                  <li>Compressed gases and aerosol spray paints.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Baggage Tracking Info */}
          <div className="bg-[#DEEBFF] p-6 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-[#091E42] block">Need to track your checked bags?</span>
              <p className="text-xs text-slate-600">
                Use your bag tracking tag number on our real-time Baggage Tracker page.
              </p>
            </div>
            <a
              href="/baggage"
              className="bg-[#0052CC] hover:bg-[#003A8C] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              Track Baggage Now
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BaggageRules;

import React from 'react';
import { FileCheck, Plane, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#172B4D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#DEEBFF] text-[#0052CC]">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Enum Airways Conditions</span>
          </div>
          <h1 className="text-3xl font-bold text-[#091E42] font-display">
            Terms of Carriage
          </h1>
          <p className="text-sm text-slate-500">
            Conditions of Contract and Travel Policies for Enum Airways Passengers
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <Plane className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">1. Booking and Ticketing</h2>
            </div>
            <p>
              An electronic ticket is valid only for the passenger named on the reservation. All passenger details (first name, last name, and date of birth) must match valid government-issued photographic identification presented during airport check-in and security screening.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Bookings are non-transferable to other individuals.</li>
              <li>A confirmed Booking Reference (6-character PNR) is required to access reservation management services.</li>
              <li>Fares are guaranteed only upon successful payment confirmation.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">2. Airport Check-In & Boarding</h2>
            </div>
            <p>
              Passengers are requested to observe the following reporting schedules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Domestic Flights:</strong> Check-in counters open 2 hours prior to scheduled departure and close strictly 45 minutes prior to departure.</li>
              <li><strong>International Flights:</strong> Check-in counters open 3 hours prior to scheduled departure and close 60 minutes prior to departure.</li>
              <li><strong>Boarding Gates:</strong> Close 20 minutes before departure time. Passengers failing to present themselves at the boarding gate before closure may forfeit their reservation.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-[#0052CC]">
              <RefreshCw className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">3. Cancellations & Rescheduling</h2>
            </div>
            <p>
              Flight modifications and cancellations can be executed online via the "Manage Booking" portal using your booking reference and passenger details:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Cancellations requested more than 24 hours prior to scheduled departure are eligible for standard refund processing after applicable deduction fees.</li>
              <li>Date modifications are subject to fare difference and seat availability in the desired cabin tier.</li>
              <li>Refunds are credited back to the original method of payment within standard settlement windows.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-xl font-bold text-[#091E42] font-display">4. Passenger Conduct & Cabin Safety</h2>
            </div>
            <p>
              In the interest of flight safety and comfort for all travelers, passengers must comply with crew member instructions at all times:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Smoking, including electronic cigarettes, is strictly prohibited aboard all Enum Airways flights and in jet bridges.</li>
              <li>Seatbelts must remain securely fastened during taxi, takeoff, turbulence, and landing.</li>
              <li>Personal electronic devices must be switched to Airplane Mode upon door closure.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Terms;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Luggage, 
  Plane,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const FAQS = [
  {
    q: 'What is the checked and cabin baggage allowance on Enum Airways flights?',
    a: 'For Domestic Economy class, every passenger is entitled to 7 kg of cabin baggage (dimensions max 115 cm) and 15 kg of checked-in baggage free of charge. Premium Economy permits 10 kg cabin + 25 kg check-in, and Business Class includes 12 kg cabin + 35 kg check-in.'
  },
  {
    q: 'When does online web check-in open and close?',
    a: 'Web check-in opens 48 hours prior to scheduled departure and closes 60 minutes before departure for domestic flights (75 minutes for international flights). Boarding gates close strictly 25 minutes prior to takeoff.'
  },
  {
    q: 'How does Enum Airways guarantee seat reservation?',
    a: 'Our real-time reservation system immediately reserves your chosen seat upon selection. Once you select a seat on the aircraft map, it is held exclusively for you during checkout.'
  },
  {
    q: 'How do I cancel or reschedule my flight?',
    a: 'You can manage or cancel your reservation by visiting our "Manage Booking" page and entering your 6-character PNR reference. Cancellations made more than 24 hours prior to departure receive standard refunds according to our airline cancellation policy.'
  },
  {
    q: 'What should I do if my baggage is delayed or misplaced?',
    a: 'You can track the real-time scanning status of your baggage using our online "Track Baggage" tool with your barcode or tracking number (e.g. TRK-1001-A). For immediate escalation, contact ground duty staff or call our helpline.'
  }
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">24/7 Customer Care</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42]">Help & Support Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Need assistance with bookings, flight schedules, or baggage? We're available round the clock to ensure smooth journeys.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Helpline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="bg-[#DEEBFF] text-[#0052CC] p-3 rounded-xl w-fit">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#091E42]">Toll-Free Helpline</h3>
            <p className="text-xs text-slate-500">Available 24 hours daily for urgent flight inquiries.</p>
            <a 
              href="tel:8999147294" 
              className="text-lg font-extrabold text-[#0052CC] hover:underline block pt-2"
            >
              8999147294
            </a>
          </div>

          {/* Card 2: Email Desk */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl w-fit">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#091E42]">Email Customer Desk</h3>
            <p className="text-xs text-slate-500">Write to our ticketing and guest relations office.</p>
            <div className="pt-2">
              <a 
                href="mailto:tanmaygurav2326@gmail.com?subject=Enum%20Airways%20Customer%20Support" 
                className="inline-flex items-center gap-1.5 bg-[#0052CC] hover:bg-[#003A8C] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                title="Click to open your mail client"
              >
                <span>Write to Support Mail</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Registered Office */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl w-fit">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#091E42]">Registered Office</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              B-hostel, Government Polytechnic<br />
              Shivajinagar, Pune - 411016<br />
              Maharashtra, India
            </p>
          </div>

        </div>

        {/* Quick Self-Service Links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-sm text-[#091E42] uppercase tracking-wider mb-4">
            Instant Self-Service Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <Link
              to="/manage-booking"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#172B4D] hover:text-[#0052CC] transition"
            >
              <span>Manage Booking / PNR</span>
              <Plane className="w-4 h-4 text-[#0052CC]" />
            </Link>

            <Link
              to="/baggage"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#172B4D] hover:text-[#0052CC] transition"
            >
              <span>Track Luggage Real-Time</span>
              <Luggage className="w-4 h-4 text-[#0052CC]" />
            </Link>

            <Link
              to="/feedback"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#172B4D] hover:text-[#0052CC] transition"
            >
              <span>Submit Feedback / Review</span>
              <MessageSquare className="w-4 h-4 text-[#0052CC]" />
            </Link>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <HelpCircle className="w-5 h-5 text-[#0052CC]" />
            <h2 className="text-xl font-extrabold text-[#091E42]">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-[#091E42] hover:text-[#0052CC] transition"
                >
                  <span className="pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed animate-fade-in-up">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;

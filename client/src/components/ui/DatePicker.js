import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker = ({
  value,
  onChange,
  minDate,
  label = 'Date',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current selected date or fallback to today
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const effectiveMin = minDate || todayStr;

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const selectedDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(selectedDateStr);
    setIsOpen(false);
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isDateDisabled = (day) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr < effectiveMin;
  };

  const isDateSelected = (day) => {
    if (!value) return false;
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    return value === `${viewYear}-${formattedMonth}-${formattedDay}`;
  };

  const isToday = (day) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    return todayStr === `${viewYear}-${formattedMonth}-${formattedDay}`;
  };

  // Format value for display: e.g. "Wed, 15 Jan 2025"
  const formatDisplay = (val) => {
    if (!val) return 'Select date';
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
        <CalendarIcon className="w-3.5 h-3.5 mr-1 text-[#0052CC]" />
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#F4F5F7] border border-slate-300 rounded-xl px-3.5 py-3 text-[#091E42] font-bold text-sm focus:ring-2 focus:ring-[#0052CC] focus:outline-none focus:bg-white text-left flex items-center justify-between transition hover:border-[#0052CC]"
      >
        <span className={value ? 'text-[#091E42]' : 'text-slate-400 font-normal'}>
          {formatDisplay(value)}
        </span>
        <CalendarIcon className="w-4 h-4 text-[#0052CC]" />
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72 sm:w-80 animate-fade-in-up">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-[#DEEBFF] hover:text-[#0052CC] transition active:scale-95"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-sm text-[#091E42] font-display">
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-[#DEEBFF] hover:text-[#0052CC] transition active:scale-95"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    selected
                      ? 'bg-[#0052CC] text-white font-bold shadow-sm'
                      : disabled
                      ? 'text-slate-300 cursor-not-allowed opacity-40'
                      : isCurrentDay
                      ? 'border border-[#0052CC] text-[#0052CC] hover:bg-[#DEEBFF]'
                      : 'text-slate-700 hover:bg-[#DEEBFF] hover:text-[#0052CC]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[#0052CC] font-bold hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

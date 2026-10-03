import React from 'react';

const StatusBadge = ({ status, type = 'general' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      // Flight & Booking Statuses
      case 'SCHEDULED':
      case 'CONFIRMED':
      case 'AVAILABLE':
      case 'SUCCESS':
      case 'READY-FOR-PICKUP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';

      case 'PENDING':
      case 'CHECKED-IN':
      case 'IN-TRANSIT':
        return 'bg-amber-100 text-amber-800 border-amber-200';

      case 'DELAYED':
      case 'ON-PLANE':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      case 'DEPARTED':
      case 'ARRIVED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';

      case 'CANCELLED':
      case 'FAILED':
      case 'LOST':
      case 'OCCUPIED':
      case 'MAINTENANCE':
        return 'bg-rose-100 text-rose-800 border-rose-200';

      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800 border-purple-200';

      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

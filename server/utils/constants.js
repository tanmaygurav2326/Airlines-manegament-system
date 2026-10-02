// ============================================
// CONSTANTS - Application-wide constants
// ============================================

const ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
  PASSENGER: 'Passenger'
};

const FLIGHT_STATUSES = {
  SCHEDULED: 'Scheduled',
  DELAYED: 'Delayed',
  DEPARTED: 'Departed',
  ARRIVED: 'Arrived',
  CANCELLED: 'Cancelled'
};

const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE'
};

const SEAT_CLASSES = {
  ECONOMY: 'Economy',
  PREMIUM_ECONOMY: 'Premium Economy',
  BUSINESS: 'Business',
  FIRST: 'First'
};

const BOOKING_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled'
};

const BAGGAGE_STATUSES = {
  CHECKED_IN: 'Checked-In',
  IN_TRANSIT: 'In-Transit',
  ON_PLANE: 'On-Plane',
  READY_FOR_PICKUP: 'Ready-for-Pickup',
  LOST: 'Lost'
};

const CREW_ROLES = {
  PILOT: 'Pilot',
  CO_PILOT: 'Co-Pilot',
  CABIN_LEAD: 'Cabin Crew Lead',
  CABIN_CREW: 'Cabin Crew'
};

const PAYMENT_STATUSES = {
  SUCCESS: 'Success',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
};

const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  PAYPAL: 'PayPal',
  STRIPE: 'Stripe'
};

const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
};

const JWT_CONFIG = {
  EXPIRE: process.env.JWT_EXPIRE || '24h',
  ALGORITHM: 'HS256'
};

module.exports = {
  ROLES,
  USER_ROLES: ROLES,
  FLIGHT_STATUSES,
  SEAT_STATUS,
  SEAT_CLASSES,
  BOOKING_STATUSES,
  BAGGAGE_STATUSES,
  CREW_ROLES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  ERROR_CODES,
  JWT_CONFIG
};
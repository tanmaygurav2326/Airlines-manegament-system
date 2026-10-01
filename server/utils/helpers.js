// ============================================
// HELPERS - Utility functions
// ============================================

/**
 * Generate a unique 6-character booking reference (PNR code)
 * Format: Random alphanumeric string (e.g., 'X7R2Q9')
 * @returns {string}
 */
const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference = '';
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
};

/**
 * Generate a unique transaction reference for payments
 * Format: TXN_ + timestamp + random 5-digit number
 * @returns {string}
 */
const generateTransactionReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `TXN_${timestamp}_${random}`;
};

/**
 * Calculate price adjustment based on cabin class
 * Base price is from Flight.BasePrice
 * @param {string} cabinClass - Economy, Premium Economy, Business, First
 * @param {number} basePrice - Flight base price
 * @returns {number} - Adjusted price
 */
const calculateTicketPrice = (cabinClass, basePrice) => {
  const multipliers = {
    'Economy': 1.0,
    'Premium Economy': 1.5,
    'Business': 2.5,
    'First': 4.0
  };
  
  const multiplier = multipliers[cabinClass] || 1.0;
  return Math.round(basePrice * multiplier * 100) / 100;
};

/**
 * Format timestamp for Oracle
 * @param {Date|string} date
 * @returns {string} - ISO string format
 */
const formatTimestamp = (date) => {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
};

module.exports = {
  generateBookingReference,
  generateTransactionReference,
  calculateTicketPrice,
  formatTimestamp
};
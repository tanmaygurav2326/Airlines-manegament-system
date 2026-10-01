// ============================================
// VALIDATORS - Input validation utilities
// ============================================

const validators = {
  /**
   * Validates email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates password strength
   * @param {string} password
   * @returns {object} { valid: boolean, errors: string[] }
   */
  isValidPassword: (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates name (letters, spaces, hyphens only)
   * @param {string} name
   * @returns {boolean}
   */
  isValidName: (name) => {
    return /^[a-zA-Z\s'-]{2,50}$/.test(name);
  },

  /**
   * Validates phone number format
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone: (phone) => {
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,20}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validates passport number format
   * @param {string} passport
   * @returns {boolean}
   */
  isValidPassport: (passport) => {
    // Allow 6-20 alphanumeric characters
    return /^[A-Z0-9]{6,20}$/.test(passport);
  },

  /**
   * Validates date format (YYYY-MM-DD)
   * @param {string} date
   * @returns {boolean}
   */
  isValidDate: (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    return !isNaN(Date.parse(date));
  },

  /**
   * Checks if string is not empty and not just whitespace
   * @param {string} str
   * @returns {boolean}
   */
  isNotEmpty: (str) => {
    return typeof str === 'string' && str.trim().length > 0;
  }
};

module.exports = validators;
// ============================================
// API RESPONSE HELPER CLASS
// ============================================

class ApiResponse {
  /**
   * Success response
   * @param {number} statusCode
   * @param {object} data
   * @param {string} message
   */
  static success(statusCode, data, message = 'Success') {
    return {
      statusCode,
      body: {
        success: true,
        message,
        data
      }
    };
  }

  /**
   * Error response
   * @param {number} statusCode
   * @param {string} message
   * @param {string} code
   * @param {array} details
   */
  static error(statusCode, message, code, details = []) {
    return {
      statusCode,
      body: {
        success: false,
        message,
        error: code,
        details: details.length > 0 ? details : undefined
      }
    };
  }

  /**
   * Validation error response
   * @param {string} message
   * @param {array} details
   */
  static validationError(message = 'Validation failed', details = []) {
    return this.error(400, message, 'INVALID_INPUT', details);
  }

  /**
   * Not found response
   * @param {string} resource
   */
  static notFound(resource = 'Resource') {
    return this.error(404, `${resource} not found`, 'NOT_FOUND');
  }

  /**
   * Conflict response
   * @param {string} message
   */
  static conflict(message = 'Resource already exists') {
    return this.error(409, message, 'CONFLICT');
  }

  /**
   * Unauthorized response
   * @param {string} message
   */
  static unauthorized(message = 'Unauthorized access') {
    return this.error(401, message, 'UNAUTHORIZED');
  }

  /**
   * Forbidden response
   * @param {string} message
   */
  static forbidden(message = 'Access forbidden') {
    return this.error(403, message, 'FORBIDDEN');
  }
}

module.exports = ApiResponse;
// ============================================
// AUTHORIZE MIDDLEWARE - Role-based access control
// ============================================

const ApiResponse = require('../utils/response');

/**
 * Factory function to create authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed (e.g., 'Admin', 'Staff', 'Passenger')
 * @returns {function} - Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware should have already attached req.user
    if (!req.user) {
      const response = ApiResponse.unauthorized('User not authenticated');
      return res.status(response.statusCode).json(response.body);
    }

    // Check if user's role is in allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      const response = ApiResponse.forbidden(`Access denied. Required role(s): ${allowedRoles.join(', ')}`);
      return res.status(response.statusCode).json(response.body);
    }

    // User is authorized, proceed to next middleware/controller
    next();
  };
};

module.exports = authorize;
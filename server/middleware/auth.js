// ============================================
// AUTH MIDDLEWARE - JWT verification
// ============================================

const authService = require('../services/authService');
const ApiResponse = require('../utils/response');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = ApiResponse.unauthorized('Missing or invalid Authorization header');
      return res.status(response.statusCode).json(response.body);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    let response;
    if (error.message === 'TOKEN_EXPIRED') {
      response = ApiResponse.unauthorized('Token has expired');
    } else if (error.message === 'INVALID_TOKEN') {
      response = ApiResponse.unauthorized('Invalid token');
    } else {
      response = ApiResponse.unauthorized('Authentication failed');
    }

    res.status(response.statusCode).json(response.body);
  }
};

module.exports = authMiddleware;
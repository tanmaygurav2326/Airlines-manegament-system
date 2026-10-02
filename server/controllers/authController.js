// ============================================
// AUTH CONTROLLER - Authentication endpoints
// ============================================

const authService = require('../services/authService');
const ApiResponse = require('../utils/response');

const authController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  register: async (req, res, next) => {
    try {
      const firstName = req.body.firstName || req.body.FirstName;
      const lastName = req.body.lastName || req.body.LastName;
      const email = req.body.email || req.body.Email;
      const password = req.body.password || req.body.Password;
      const staffId = req.body.staffId || req.body.StaffID;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        const response = ApiResponse.validationError('First name, last name, email, and password are required');
        return res.status(response.statusCode).json(response.body);
      }

      // If confirmPassword is provided, verify match
      const confirmPassword = req.body.confirmPassword || req.body.ConfirmPassword;
      if (confirmPassword && password !== confirmPassword) {
        const response = ApiResponse.validationError('Passwords do not match');
        return res.status(response.statusCode).json(response.body);
      }

      // Register user
      const result = await authService.registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        staffId: staffId ? staffId.trim().toUpperCase() : undefined
      });

      const response = ApiResponse.success(
        201,
        result,
        'User registered successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Register error:', error);
        next({ status: 500, message: error.message || 'Registration failed', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   */
  login: async (req, res, next) => {
    try {
      const email = req.body.email || req.body.Email;
      const password = req.body.password || req.body.Password;

      // Validate required fields
      if (!email || !password) {
        const response = ApiResponse.validationError('Email and Password are required');
        return res.status(response.statusCode).json(response.body);
      }

      // Login user
      const result = await authService.loginUser(email.trim().toLowerCase(), password);

      const response = ApiResponse.success(
        200,
        result,
        'Login successful'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Login error:', error);
        next({ status: 500, message: error.message || 'Login failed', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/auth/profile
   * Get current user profile (requires authentication)
   */
  getProfile: async (req, res, next) => {
    try {
      // req.user is attached by authMiddleware
      const userId = req.user.userId;

      const user = await authService.getUserProfile(userId);

      const response = ApiResponse.success(
        200,
        user,
        'User profile retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get profile error:', error);
        next({ status: 500, message: 'Failed to retrieve profile', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = authController;
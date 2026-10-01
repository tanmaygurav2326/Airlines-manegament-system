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
      const { FirstName, LastName, Email, Password, ConfirmPassword } = req.body;

      // Validate required fields
      if (!FirstName || !LastName || !Email || !Password || !ConfirmPassword) {
        const response = ApiResponse.validationError('FirstName, LastName, Email, Password, and ConfirmPassword are required');
        return res.status(response.statusCode).json(response.body);
      }

      // Check password confirmation
      if (Password !== ConfirmPassword) {
        const response = ApiResponse.validationError('Passwords do not match');
        return res.status(response.statusCode).json(response.body);
      }

      // Register user
      const newUser = await authService.registerUser({
        FirstName,
        LastName,
        Email,
        Password
      });

      const response = ApiResponse.success(
        201,
        newUser,
        'User registered successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      // Check if error is a custom application error
      if (error.status) {
        next(error);
      } else {
        // Log unexpected errors
        console.error('Register error:', error);
        next({ status: 500, message: 'Registration failed', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   */
  login: async (req, res, next) => {
    try {
      const { Email, Password } = req.body;

      // Validate required fields
      if (!Email || !Password) {
        const response = ApiResponse.validationError('Email and Password are required');
        return res.status(response.statusCode).json(response.body);
      }

      // Login user
      const user = await authService.loginUser(Email, Password);

      const response = ApiResponse.success(
        200,
        {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          token: user.token
        },
        'Login successful'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Login error:', error);
        next({ status: 500, message: 'Login failed', code: 'SERVER_ERROR' });
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
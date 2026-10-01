// ============================================
// ADMIN CONTROLLER - Admin analytics endpoints
// ============================================

const adminService = require('../services/adminService');
const ApiResponse = require('../utils/response');

const adminController = {
  /**
   * GET /api/admin/dashboard
   * Get comprehensive dashboard statistics (admin only)
   */
  getDashboard: async (req, res, next) => {
    try {
      const stats = await adminService.getDashboardStats();

      const response = ApiResponse.success(
        200,
        stats,
        'Dashboard statistics retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get dashboard error:', error);
        next({ status: 500, message: 'Failed to retrieve dashboard', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/admin/revenue
   * Get revenue statistics (admin only)
   */
  getRevenueStats: async (req, res, next) => {
    try {
      const stats = await adminService.getRevenueStats();

      const response = ApiResponse.success(
        200,
        stats,
        'Revenue statistics retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get revenue stats error:', error);
        next({ status: 500, message: 'Failed to retrieve statistics', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/admin/flights
   * Get flight statistics (admin only)
   */
  getFlightStats: async (req, res, next) => {
    try {
      const stats = await adminService.getFlightStats();

      const response = ApiResponse.success(
        200,
        stats,
        'Flight statistics retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get flight stats error:', error);
        next({ status: 500, message: 'Failed to retrieve statistics', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/admin/bookings
   * Get booking statistics (admin only)
   */
  getBookingStats: async (req, res, next) => {
    try {
      const stats = await adminService.getBookingStats();

      const response = ApiResponse.success(
        200,
        stats,
        'Booking statistics retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get booking stats error:', error);
        next({ status: 500, message: 'Failed to retrieve statistics', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/admin/users
   * Get user statistics (admin only)
   */
  getUserStats: async (req, res, next) => {
    try {
      const stats = await adminService.getUserStats();

      const response = ApiResponse.success(
        200,
        stats,
        'User statistics retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get user stats error:', error);
        next({ status: 500, message: 'Failed to retrieve statistics', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = adminController;
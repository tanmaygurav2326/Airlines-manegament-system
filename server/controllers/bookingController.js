// ============================================
// BOOKING CONTROLLER - Booking endpoints
// ============================================

const bookingService = require('../services/bookingService');
const ApiResponse = require('../utils/response');

const bookingController = {
  /**
   * POST /api/bookings
   * Create a new booking
   */
  createBooking: async (req, res, next) => {
    try {
      const { flightId } = req.body;
      const userId = req.user.userId; // From auth middleware

      if (!flightId) {
        const response = ApiResponse.validationError('flightId is required');
        return res.status(response.statusCode).json(response.body);
      }

      const booking = await bookingService.createBooking({
        userId,
        flightId: parseInt(flightId)
      });

      const response = ApiResponse.success(
        201,
        booking,
        'Booking created successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Create booking error:', error);
        next({ status: 500, message: 'Failed to create booking', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/bookings/:bookingId
   * Get booking details
   */
  getBookingDetails: async (req, res, next) => {
    try {
      const { bookingId } = req.params;

      if (!bookingId || isNaN(bookingId)) {
        const response = ApiResponse.validationError('Invalid bookingId');
        return res.status(response.statusCode).json(response.body);
      }

      const booking = await bookingService.getBookingDetails(parseInt(bookingId));

      const response = ApiResponse.success(
        200,
        booking,
        'Booking details retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get booking details error:', error);
        next({ status: 500, message: 'Failed to retrieve booking', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/bookings/user/my-bookings
   * Get all bookings for current user (protected)
   */
  getUserBookings: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const bookings = await bookingService.getUserBookings(userId);

      const response = ApiResponse.success(
        200,
        bookings,
        `Retrieved ${bookings.length} bookings`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get user bookings error:', error);
        next({ status: 500, message: 'Failed to retrieve bookings', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * DELETE /api/bookings/:bookingId
   * Cancel a booking
   */
  cancelBooking: async (req, res, next) => {
    try {
      const { bookingId } = req.params;

      if (!bookingId || isNaN(bookingId)) {
        const response = ApiResponse.validationError('Invalid bookingId');
        return res.status(response.statusCode).json(response.body);
      }

      const result = await bookingService.cancelBooking(parseInt(bookingId));

      const response = ApiResponse.success(
        200,
        result,
        'Booking cancelled successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Cancel booking error:', error);
        next({ status: 500, message: 'Failed to cancel booking', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = bookingController;
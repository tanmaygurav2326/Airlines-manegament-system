// ============================================
// TICKET CONTROLLER - Ticket endpoints
// ============================================

const ticketService = require('../services/ticketService');
const ApiResponse = require('../utils/response');

const ticketController = {
  /**
   * POST /api/tickets
   * Create a ticket (add passenger with seat selection)
   */
  createTicket: async (req, res, next) => {
    try {
      const { bookingId, flightId, passengerId, seatNumber, cabinClass } = req.body;

      // Validate required fields
      if (!bookingId || !flightId || !passengerId || !seatNumber || !cabinClass) {
        const response = ApiResponse.validationError(
          'bookingId, flightId, passengerId, seatNumber, and cabinClass are required'
        );
        return res.status(response.statusCode).json(response.body);
      }

      const ticket = await ticketService.createTicket({
        bookingId: parseInt(bookingId),
        flightId: parseInt(flightId),
        passengerId: parseInt(passengerId),
        seatNumber,
        cabinClass
      });

      const response = ApiResponse.success(
        201,
        ticket,
        'Ticket created successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Create ticket error:', error);
        next({ status: 500, message: 'Failed to create ticket', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/tickets/:ticketId
   * Get ticket details
   */
  getTicketDetails: async (req, res, next) => {
    try {
      const { ticketId } = req.params;

      if (!ticketId || isNaN(ticketId)) {
        const response = ApiResponse.validationError('Invalid ticketId');
        return res.status(response.statusCode).json(response.body);
      }

      const ticket = await ticketService.getTicketDetails(parseInt(ticketId));

      const response = ApiResponse.success(
        200,
        ticket,
        'Ticket details retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get ticket details error:', error);
        next({ status: 500, message: 'Failed to retrieve ticket', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = ticketController;
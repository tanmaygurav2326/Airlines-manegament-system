// ============================================
// BOOKINGS ROUTES - Booking endpoints
// ============================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');
const ticketController = require('../controllers/ticketController');

/**
 * Protected routes (authentication required)
 */

/**
 * POST /api/bookings
 * Create a new booking
 * Body: { flightId }
 */
router.post('/', authMiddleware, bookingController.createBooking);

/**
 * GET /api/bookings/user/my-bookings
 * Get all bookings for current user
 */
router.get('/user/my-bookings', authMiddleware, bookingController.getUserBookings);

/**
 * GET /api/bookings/:bookingId
 * Get booking details
 */
router.get('/:bookingId', authMiddleware, bookingController.getBookingDetails);

/**
 * DELETE /api/bookings/:bookingId
 * Cancel a booking
 */
router.delete('/:bookingId', authMiddleware, bookingController.cancelBooking);

/**
 * POST /api/tickets
 * Create a ticket (add passenger with seat)
 * Body: { bookingId, flightId, passengerId, seatNumber, cabinClass }
 */
router.post('/tickets', authMiddleware, ticketController.createTicket);

/**
 * GET /api/tickets/:ticketId
 * Get ticket details
 */
router.get('/tickets/:ticketId', authMiddleware, ticketController.getTicketDetails);

module.exports = router;
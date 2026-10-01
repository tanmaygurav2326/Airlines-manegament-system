// ============================================
// FLIGHTS ROUTES - Flight search endpoints
// ============================================

const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

/**
 * GET /api/flights
 * Get all flights
 */
router.get('/', flightController.getAllFlights);

/**
 * GET /api/flights/search?from=JFK&to=LAX&date=2024-12-20&class=Economy
 * Search flights with filters
 */
router.get('/search', flightController.searchFlights);

/**
 * GET /api/flights/:flightId
 * Get flight details and seat availability
 */
router.get('/:flightId', flightController.getFlightDetails);

/**
 * GET /api/flights/:flightId/seats
 * Get available seats for a flight
 */
router.get('/:flightId/seats', flightController.getFlightSeats);

module.exports = router;
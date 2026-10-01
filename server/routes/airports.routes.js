// ============================================
// AIRPORTS ROUTES - Airport endpoints
// ============================================

const express = require('express');
const router = express.Router();
const airportController = require('../controllers/airportController');

/**
 * GET /api/airports
 * Get all airports
 */
router.get('/', airportController.getAllAirports);

/**
 * GET /api/airports/search?q=New
 * Search airports by city or name
 */
router.get('/search', airportController.searchAirports);

/**
 * GET /api/airports/:code
 * Get airport by 3-letter IATA code
 */
router.get('/:code', airportController.getAirportByCode);

module.exports = router;
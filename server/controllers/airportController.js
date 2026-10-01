// ============================================
// AIRPORT CONTROLLER - Airport endpoints
// ============================================

const airportService = require('../services/airportService');
const ApiResponse = require('../utils/response');

const airportController = {
  /**
   * GET /api/airports
   * Get all airports
   */
  getAllAirports: async (req, res, next) => {
    try {
      const airports = await airportService.getAllAirports();

      const response = ApiResponse.success(
        200,
        airports,
        `Retrieved ${airports.length} airports`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get all airports error:', error);
        next({ status: 500, message: 'Failed to retrieve airports', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/airports/:code
   * Get airport by 3-letter code
   */
  getAirportByCode: async (req, res, next) => {
    try {
      const { code } = req.params;

      const airport = await airportService.getAirportByCode(code);

      const response = ApiResponse.success(
        200,
        airport,
        'Airport retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get airport error:', error);
        next({ status: 500, message: 'Failed to retrieve airport', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/airports/search?q=New
   * Search airports by city or name
   */
  searchAirports: async (req, res, next) => {
    try {
      const { q } = req.query;

      if (!q) {
        const response = ApiResponse.validationError('Query parameter "q" is required');
        return res.status(response.statusCode).json(response.body);
      }

      const airports = await airportService.searchAirports(q);

      const response = ApiResponse.success(
        200,
        airports,
        `Found ${airports.length} matching airports`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Search airports error:', error);
        next({ status: 500, message: 'Airport search failed', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = airportController;
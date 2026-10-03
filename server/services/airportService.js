// ============================================
// AIRPORT SERVICE - Airport business logic
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES } = require('../utils/constants');

const airportService = {
  /**
   * Get all airports
   * @returns {Promise<array>} - Array of airports
   */
  getAllAirports: async () => {
    try {
      const airports = await executeQuery(
        `SELECT
          AirportCode,
          AirportName,
          City,
          Country
        FROM Airports
        ORDER BY City ASC`,
        {}
      );

      return airports;
    } catch (error) {
      console.error('Get all airports error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve airports',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get airport by code
   * @param {string} airportCode - 3-letter IATA code (e.g., 'JFK')
   * @returns {Promise<object>} - Airport details
   */
  getAirportByCode: async (airportCode) => {
    try {
      if (!airportCode || airportCode.length !== 3) {
        throw {
          status: 400,
          message: 'Invalid airport code format (must be 3 letters)',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      const airports = await executeQuery(
        `SELECT
          AirportCode,
          AirportName,
          City,
          Country
        FROM Airports
        WHERE AirportCode = :code`,
        { code: airportCode.toUpperCase() }
      );

      if (!airports || airports.length === 0) {
        throw {
          status: 404,
          message: `Airport with code ${airportCode} not found`,
          code: ERROR_CODES.NOT_FOUND
        };
      }

      return airports[0];
    } catch (error) {
      if (error.status) throw error;
      console.error('Get airport by code error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve airport',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Search airports by city or name
   * @param {string} query - Search term (city name or airport name)
   * @returns {Promise<array>} - Matching airports
   */
  searchAirports: async (query) => {
    try {
      if (!query || query.trim().length === 0) {
        throw {
          status: 400,
          message: 'Search query is required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      const searchTerm = `%${query.toUpperCase()}%`;

      const airports = await executeQuery(
        `SELECT
          AirportCode,
          AirportName,
          City,
          Country
        FROM Airports
        WHERE UPPER(AirportCode) LIKE :searchTerm
           OR UPPER(AirportName) LIKE :searchTerm
           OR UPPER(City) LIKE :searchTerm
        ORDER BY City ASC`,
        { searchTerm }
      );

      return airports;
    } catch (error) {
      if (error.status) throw error;
      console.error('Search airports error:', error.message);
      throw {
        status: 500,
        message: 'Airport search failed',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = airportService;
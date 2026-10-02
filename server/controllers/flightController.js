// ============================================
// FLIGHT CONTROLLER - Flight endpoints
// ============================================

const flightService = require('../services/flightService');
const ApiResponse = require('../utils/response');

const flightController = {
  /**
   * GET /api/flights
   * Get all flights with optional filters
   */
  getAllFlights: async (req, res, next) => {
    try {
      const flights = await flightService.getAllFlights();

      const response = ApiResponse.success(
        200,
        flights,
        `Retrieved ${flights.length} flights`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get all flights error:', error);
        next({ status: 500, message: 'Failed to retrieve flights', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/flights/search?from=JFK&to=LAX&date=2024-12-20&class=Economy
   * Search flights with filters
   */
  searchFlights: async (req, res, next) => {
    try {
      const { from, to, date, returnDate, passengers, adt, chd, inf, um, class: cabinClass } = req.query;

      // Validate required query params
      if (!from || !to || !date) {
        const response = ApiResponse.validationError('Query parameters required: from, to, date');
        return res.status(response.statusCode).json(response.body);
      }

      // Enforce passenger rules on backend
      if (adt !== undefined || chd !== undefined || inf !== undefined || um !== undefined) {
        const numAdt = parseInt(adt) || 0;
        const numChd = parseInt(chd) || 0;
        const numInf = parseInt(inf) || 0;
        const numUm = parseInt(um) || 0;

        if (numAdt + numChd + numInf + numUm < 1) {
          const response = ApiResponse.validationError('At least 1 passenger must be selected.');
          return res.status(response.statusCode).json(response.body);
        }

        if (numUm > 0 && (numAdt > 0 || numChd > 0 || numInf > 0)) {
          const response = ApiResponse.validationError('Unaccompanied Minor (UM/UNMR) cannot travel with Adults, Children, or Infants on the same reservation.');
          return res.status(response.statusCode).json(response.body);
        }

        if (numInf > numAdt) {
          const response = ApiResponse.validationError('The number of infants (INF) cannot exceed the number of accompanying adults (ADT). Every infant must be associated with an adult.');
          return res.status(response.statusCode).json(response.body);
        }
      }

      const filters = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        departureDate: date,
        returnDate: returnDate || null,
        passengers: passengers || 1,
        cabinClass: cabinClass || null
      };

      const flights = await flightService.searchFlights(filters);

      const response = ApiResponse.success(
        200,
        flights,
        `Found ${flights.length} matching flights`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Search flights error:', error);
        next({ status: 500, message: 'Flight search failed', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/flights/:flightId
   * Get flight details and seat availability
   */
  getFlightDetails: async (req, res, next) => {
    try {
      const { flightId } = req.params;

      // Validate flight ID
      if (!flightId || isNaN(flightId)) {
        const response = ApiResponse.validationError('Invalid flightId');
        return res.status(response.statusCode).json(response.body);
      }

      const flightDetails = await flightService.getFlightDetails(parseInt(flightId));

      const response = ApiResponse.success(
        200,
        flightDetails,
        'Flight details retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get flight details error:', error);
        next({ status: 500, message: 'Failed to retrieve flight details', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/flights/:flightId/seats
   * Get available seats for a flight
   */
  getFlightSeats: async (req, res, next) => {
    try {
      const { flightId } = req.params;

      // Validate flight ID
      if (!flightId || isNaN(flightId)) {
        const response = ApiResponse.validationError('Invalid flightId');
        return res.status(response.statusCode).json(response.body);
      }

      const seats = await flightService.getAvailableSeats(parseInt(flightId));

      // Group seats by class
      const seatsByClass = {};
      seats.forEach(seat => {
        if (!seatsByClass[seat.CLASS]) {
          seatsByClass[seat.CLASS] = [];
        }
        seatsByClass[seat.CLASS].push(seat);
      });

      const response = ApiResponse.success(
        200,
        {
          flightId: parseInt(flightId),
          seatsByClass,
          totalSeats: seats.length,
          availableSeats: seats.filter(s => s.STATUS === 'AVAILABLE').length
        },
        'Seats retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get flight seats error:', error);
        next({ status: 500, message: 'Failed to retrieve seats', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = flightController;
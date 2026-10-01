// ============================================
// CREW CONTROLLER - Crew management endpoints
// ============================================

const crewService = require('../services/crewService');
const ApiResponse = require('../utils/response');

const crewController = {
  /**
   * POST /api/crews/flights/:flightId
   * Assign crew to a flight (admin only)
   */
  assignCrew: async (req, res, next) => {
    try {
      const { flightId } = req.params;
      const { userId, crewRole } = req.body;

      if (!flightId || isNaN(flightId)) {
        const response = ApiResponse.validationError('Invalid flightId');
        return res.status(response.statusCode).json(response.body);
      }

      if (!userId || !crewRole) {
        const response = ApiResponse.validationError('userId and crewRole are required');
        return res.status(response.statusCode).json(response.body);
      }

      const assignment = await crewService.assignCrewToFlight({
        flightId: parseInt(flightId),
        userId: parseInt(userId),
        crewRole
      });

      const response = ApiResponse.success(
        201,
        assignment,
        'Crew assigned successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Assign crew error:', error);
        next({ status: 500, message: 'Failed to assign crew', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/flights/:flightId/crew
   * Get crew for a flight
   */
  getFlightCrew: async (req, res, next) => {
    try {
      const { flightId } = req.params;

      if (!flightId || isNaN(flightId)) {
        const response = ApiResponse.validationError('Invalid flightId');
        return res.status(response.statusCode).json(response.body);
      }

      const crew = await crewService.getFlightCrew(parseInt(flightId));

      const response = ApiResponse.success(
        200,
        crew,
        `Retrieved ${crew.length} crew members`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get flight crew error:', error);
        next({ status: 500, message: 'Failed to retrieve crew', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/crews/user/:userId/flights
   * Get flights for a crew member
   */
  getCrewFlights: async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(userId)) {
        const response = ApiResponse.validationError('Invalid userId');
        return res.status(response.statusCode).json(response.body);
      }

      const flights = await crewService.getCrewFlights(parseInt(userId));

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
        console.error('Get crew flights error:', error);
        next({ status: 500, message: 'Failed to retrieve flights', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * DELETE /api/crews/assignments/:assignmentId
   * Remove crew assignment (admin only)
   */
  removeAssignment: async (req, res, next) => {
    try {
      const { assignmentId } = req.params;

      if (!assignmentId || isNaN(assignmentId)) {
        const response = ApiResponse.validationError('Invalid assignmentId');
        return res.status(response.statusCode).json(response.body);
      }

      const result = await crewService.removeCrewAssignment(parseInt(assignmentId));

      const response = ApiResponse.success(
        200,
        result,
        'Crew assignment removed successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Remove assignment error:', error);
        next({ status: 500, message: 'Failed to remove assignment', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = crewController;
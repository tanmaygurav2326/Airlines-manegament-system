// ============================================
// PASSENGER CONTROLLER - Passenger endpoints
// ============================================

const passengerService = require('../services/passengerService');
const ApiResponse = require('../utils/response');

const passengerController = {
  /**
   * POST /api/passengers
   * Create a new passenger profile
   */
  createPassenger: async (req, res, next) => {
    try {
      const { passportNumber, nationality, phoneNumber, frequentFlyerNumber } = req.body;
      const userId = req.user.userId; // From auth middleware

      if (!passportNumber || !nationality) {
        const response = ApiResponse.validationError('passportNumber and nationality are required');
        return res.status(response.statusCode).json(response.body);
      }

      const passenger = await passengerService.createPassenger({
        userId,
        passportNumber,
        nationality,
        phoneNumber,
        frequentFlyerNumber
      });

      const response = ApiResponse.success(
        201,
        passenger,
        'Passenger profile created successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Create passenger error:', error);
        next({ status: 500, message: 'Failed to create passenger', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/passengers/me
   * Get current user's passenger profile
   */
  getMyPassenger: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const passenger = await passengerService.getPassengerByUserId(userId);

      const response = ApiResponse.success(
        200,
        passenger,
        'Passenger profile retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get passenger error:', error);
        next({ status: 500, message: 'Failed to retrieve passenger', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/passengers/:passengerId
   * Get passenger details (admin only)
   */
  getPassengerDetails: async (req, res, next) => {
    try {
      const { passengerId } = req.params;

      if (!passengerId || isNaN(passengerId)) {
        const response = ApiResponse.validationError('Invalid passengerId');
        return res.status(response.statusCode).json(response.body);
      }

      const passenger = await passengerService.getPassengerDetails(parseInt(passengerId));

      const response = ApiResponse.success(
        200,
        passenger,
        'Passenger details retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get passenger details error:', error);
        next({ status: 500, message: 'Failed to retrieve passenger', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * PUT /api/passengers/me
   * Update own passenger profile
   */
  updateMyPassenger: async (req, res, next) => {
    try {
      const { phoneNumber, frequentFlyerNumber } = req.body;
      const userId = req.user.userId;

      // Get passenger ID from user ID
      const passenger = await passengerService.getPassengerByUserId(userId);

      const updated = await passengerService.updatePassenger(passenger.passengerId, {
        phoneNumber,
        frequentFlyerNumber
      });

      const response = ApiResponse.success(
        200,
        updated,
        'Passenger profile updated successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Update passenger error:', error);
        next({ status: 500, message: 'Failed to update passenger', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/passengers
   * List all passengers (admin only)
   */
  listPassengers: async (req, res, next) => {
    try {
      const passengers = await passengerService.listAllPassengers();

      const response = ApiResponse.success(
        200,
        passengers,
        `Retrieved ${passengers.length} passengers`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('List passengers error:', error);
        next({ status: 500, message: 'Failed to list passengers', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = passengerController;
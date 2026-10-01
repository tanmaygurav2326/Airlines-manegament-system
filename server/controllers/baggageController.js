// ============================================
// BAGGAGE CONTROLLER - Baggage endpoints
// ============================================

const baggageService = require('../services/baggageService');
const ApiResponse = require('../utils/response');

const baggageController = {
  /**
   * POST /api/baggage
   * Create baggage entry
   */
  createBaggage: async (req, res, next) => {
    try {
      const { ticketId, weightKg } = req.body;

      if (!ticketId || !weightKg) {
        const response = ApiResponse.validationError('ticketId and weightKg are required');
        return res.status(response.statusCode).json(response.body);
      }

      const baggage = await baggageService.createBaggage({
        ticketId: parseInt(ticketId),
        weightKg: parseFloat(weightKg)
      });

      const response = ApiResponse.success(
        201,
        baggage,
        'Baggage entry created successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Create baggage error:', error);
        next({ status: 500, message: 'Failed to create baggage', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/baggage/:baggageId
   * Get baggage details
   */
  getBaggageDetails: async (req, res, next) => {
    try {
      const { baggageId } = req.params;

      if (!baggageId || isNaN(baggageId)) {
        const response = ApiResponse.validationError('Invalid baggageId');
        return res.status(response.statusCode).json(response.body);
      }

      const baggage = await baggageService.getBaggageDetails(parseInt(baggageId));

      const response = ApiResponse.success(
        200,
        baggage,
        'Baggage details retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get baggage details error:', error);
        next({ status: 500, message: 'Failed to retrieve baggage', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/baggage/tracking/:trackingNumber
   * Get baggage by tracking number
   */
  getBaggageByTracking: async (req, res, next) => {
    try {
      const { trackingNumber } = req.params;

      if (!trackingNumber) {
        const response = ApiResponse.validationError('Tracking number is required');
        return res.status(response.statusCode).json(response.body);
      }

      const baggage = await baggageService.getBaggageByTrackingNumber(trackingNumber);

      const response = ApiResponse.success(
        200,
        baggage,
        'Baggage retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get baggage by tracking error:', error);
        next({ status: 500, message: 'Failed to retrieve baggage', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * PATCH /api/baggage/:baggageId/status
   * Update baggage status
   */
  updateBaggageStatus: async (req, res, next) => {
    try {
      const { baggageId } = req.params;
      const { status } = req.body;

      if (!baggageId || isNaN(baggageId)) {
        const response = ApiResponse.validationError('Invalid baggageId');
        return res.status(response.statusCode).json(response.body);
      }

      if (!status) {
        const response = ApiResponse.validationError('status is required');
        return res.status(response.statusCode).json(response.body);
      }

      const baggage = await baggageService.updateBaggageStatus(parseInt(baggageId), status);

      const response = ApiResponse.success(
        200,
        baggage,
        'Baggage status updated successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Update baggage status error:', error);
        next({ status: 500, message: 'Failed to update baggage', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/flights/:flightId/baggage
   * Get all baggage for a flight (staff/admin)
   */
  getFlightBaggage: async (req, res, next) => {
    try {
      const { flightId } = req.params;

      if (!flightId || isNaN(flightId)) {
        const response = ApiResponse.validationError('Invalid flightId');
        return res.status(response.statusCode).json(response.body);
      }

      const baggage = await baggageService.getBaggageByFlight(parseInt(flightId));

      const response = ApiResponse.success(
        200,
        baggage,
        `Retrieved ${baggage.length} baggage entries`
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get flight baggage error:', error);
        next({ status: 500, message: 'Failed to retrieve baggage', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = baggageController;
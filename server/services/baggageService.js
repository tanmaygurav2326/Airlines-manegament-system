// ============================================
// BAGGAGE SERVICE - Baggage tracking
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES, BAGGAGE_STATUSES } = require('../utils/constants');

const baggageService = {
  /**
   * Create baggage entry for a ticket
   * @param {object} baggageData - { ticketId, weightKg }
   * @returns {Promise<object>}
   */
  createBaggage: async (baggageData) => {
    try {
      const { ticketId, weightKg } = baggageData;

      // Validate input
      if (!ticketId || !weightKg) {
        throw { 
          status: 400, 
          message: 'ticketId and weightKg are required', 
          code: ERROR_CODES.INVALID_INPUT 
        };
      }

      if (weightKg <= 0 || weightKg > 100) {
        throw { 
          status: 400, 
          message: 'Weight must be between 0 and 100 kg', 
          code: ERROR_CODES.INVALID_INPUT 
        };
      }

      // Check if ticket exists
      const tickets = await executeQuery(
        `SELECT TicketID FROM Tickets WHERE TicketID = :ticketId`,
        { ticketId }
      );

      if (!tickets || tickets.length === 0) {
        throw { 
          status: 404, 
          message: 'Ticket not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      // Create baggage entry
      await executeQuery(
        `INSERT INTO Baggage (TicketID, WeightKG, Status)
         VALUES (:ticketId, :weightKg, :status)`,
        {
          ticketId,
          weightKg,
          status: BAGGAGE_STATUSES.CHECKED_IN
        }
      );

      // Retrieve created baggage
      const baggage = await executeQuery(
        `SELECT B.BaggageID, B.TicketID, B.WeightKG, B.Status, B.TrackingNumber
         FROM Baggage B
         WHERE B.TicketID = :ticketId`,
        { ticketId }
      );

      if (!baggage || baggage.length === 0) {
        throw { 
          status: 500, 
          message: 'Failed to retrieve created baggage', 
          code: ERROR_CODES.DATABASE_ERROR 
        };
      }

      const bag = baggage[0];

      return {
        baggageId: bag.BAGGAGEID,
        ticketId: bag.TICKETID,
        weightKg: bag.WEIGHTKG,
        status: bag.STATUS,
        trackingNumber: bag.TRACKINGNUMBER
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Create baggage error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to create baggage', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    }
  },

  /**
   * Get baggage details
   * @param {number} baggageId
   * @returns {Promise<object>}
   */
  getBaggageDetails: async (baggageId) => {
    try {
      const baggage = await executeQuery(
        `SELECT B.BaggageID, B.TicketID, B.WeightKG, B.Status, B.TrackingNumber,
                T.FlightID, T.SeatNumber,
                F.FlightNumber, F.DepartureTime, F.ArrivalTime
         FROM Baggage B
         JOIN Tickets T ON B.TicketID = T.TicketID
         JOIN Flights F ON T.FlightID = F.FlightID
         WHERE B.BaggageID = :baggageId`,
        { baggageId }
      );

      if (!baggage || baggage.length === 0) {
        throw { 
          status: 404, 
          message: 'Baggage not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      const b = baggage[0];

      return {
        baggageId: b.BAGGAGEID,
        ticketId: b.TICKETID,
        trackingNumber: b.TRACKINGNUMBER,
        weightKg: b.WEIGHTKG,
        status: b.STATUS,
        flightNumber: b.FLIGHTNUMBER,
        departureTime: b.DEPARTURETIME,
        arrivalTime: b.ARRIVALTIME
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Get baggage details error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to retrieve baggage', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    }
  },

  /**
   * Get baggage by tracking number
   * @param {string} trackingNumber
   * @returns {Promise<object>}
   */
  getBaggageByTrackingNumber: async (trackingNumber) => {
    try {
      const baggage = await executeQuery(
        `SELECT B.BaggageID, B.TicketID, B.WeightKG, B.Status, B.TrackingNumber
         FROM Baggage B
         WHERE B.TrackingNumber = :trackingNumber`,
        { trackingNumber }
      );

      if (!baggage || baggage.length === 0) {
        throw { 
          status: 404, 
          message: 'Baggage not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      return await baggageService.getBaggageDetails(baggage[0].BAGGAGEID);
    } catch (error) {
      if (error.status) throw error;
      console.error('Get baggage by tracking number error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to retrieve baggage', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    }
  },

  /**
   * Update baggage status
   * @param {number} baggageId
   * @param {string} status - One of BAGGAGE_STATUSES
   * @returns {Promise<object>}
   */
  updateBaggageStatus: async (baggageId, status) => {
    try {
      const validStatuses = ['Checked-In', 'In-Transit', 'On-Plane', 'Ready-for-Pickup', 'Lost'];

      if (!validStatuses.includes(status)) {
        throw { 
          status: 400, 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 
          code: ERROR_CODES.INVALID_INPUT 
        };
      }

      // Check baggage exists
      const baggage = await executeQuery(
        `SELECT BaggageID FROM Baggage WHERE BaggageID = :baggageId`,
        { baggageId }
      );

      if (!baggage || baggage.length === 0) {
        throw { 
          status: 404, 
          message: 'Baggage not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      // Update status
      await executeQuery(
        `UPDATE Baggage SET Status = :status WHERE BaggageID = :baggageId`,
        { baggageId, status }
      );

      return await baggageService.getBaggageDetails(baggageId);
    } catch (error) {
      if (error.status) throw error;
      console.error('Update baggage status error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to update baggage', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    }
  },

  /**
   * Get all baggage for a flight
   * @param {number} flightId
   * @returns {Promise<array>}
   */
  getBaggageByFlight: async (flightId) => {
    try {
      const baggage = await executeQuery(
        `SELECT B.BaggageID, B.TicketID, B.WeightKG, B.Status, B.TrackingNumber
         FROM Baggage B
         JOIN Tickets T ON B.TicketID = T.TicketID
         WHERE T.FlightID = :flightId
         ORDER BY B.BaggageID`,
        { flightId }
      );

      return (baggage || []).map(b => ({
        baggageId: b.BAGGAGEID,
        ticketId: b.TICKETID,
        trackingNumber: b.TRACKINGNUMBER,
        weightKg: b.WEIGHTKG,
        status: b.STATUS
      }));
    } catch (error) {
      console.error('Get baggage by flight error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to retrieve baggage', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    }
  }
};

module.exports = baggageService;
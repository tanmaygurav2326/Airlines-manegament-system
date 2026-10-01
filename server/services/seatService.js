// ============================================
// SEAT SERVICE - Seat Availability & Locking
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES, SEAT_STATUSES } = require('../utils/constants');

const seatService = {
  /**
   * Check if a specific seat is available on a flight
   */
  isSeatAvailable: async (flightId, seatNumber) => {
    const sql = `SELECT Status FROM AircraftSeats WHERE FlightID = :flightId AND SeatNumber = :seatNumber`;
    const seats = await executeQuery(sql, { flightId, seatNumber });
    if (!seats || seats.length === 0) return false;
    return seats[0].STATUS === SEAT_STATUSES.AVAILABLE;
  },

  /**
   * Lock a seat during booking/ticket creation to prevent double-booking
   */
  lockSeat: async (flightId, seatNumber, connection = null) => {
    const sql = `UPDATE AircraftSeats 
                 SET Status = :newStatus 
                 WHERE FlightID = :flightId 
                   AND SeatNumber = :seatNumber 
                   AND Status = :currentStatus`;
    const params = {
      newStatus: SEAT_STATUSES.LOCKED,
      flightId,
      seatNumber,
      currentStatus: SEAT_STATUSES.AVAILABLE
    };

    const result = connection 
      ? await connection.execute(sql, params) 
      : await executeQuery(sql, params);

    const rowsAffected = result.rowsAffected !== undefined ? result.rowsAffected : (result.affectedRows || 0);

    if (rowsAffected === 0) {
      throw { 
        status: 409, 
        message: `Seat ${seatNumber} is no longer available`, 
        code: ERROR_CODES.CONFLICT 
      };
    }

    return { success: true };
  },

  /**
   * Release or unlock a seat (e.g. on booking cancellation)
   */
  unlockSeat: async (flightId, seatNumber, connection = null) => {
    const sql = `UPDATE AircraftSeats 
                 SET Status = :newStatus 
                 WHERE FlightID = :flightId 
                   AND SeatNumber = :seatNumber`;
    const params = {
      newStatus: SEAT_STATUSES.AVAILABLE,
      flightId,
      seatNumber
    };

    if (connection) {
      await connection.execute(sql, params);
    } else {
      await executeQuery(sql, params);
    }

    return { success: true };
  }
};

module.exports = seatService;
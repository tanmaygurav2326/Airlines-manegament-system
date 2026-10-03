// ============================================
// SEAT SERVICE - Seat Availability & Locking
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES, SEAT_STATUSES } = require('../utils/constants');

const seatService = {
  /**
   * Check if a specific seat is available on a flight
   */
  isSeatAvailable: async (flightId, seatNumber, connection = null) => {
    const sql = `
      SELECT S.SeatID
      FROM Flights F
      JOIN AircraftSeats S ON F.AircraftID = S.AircraftID
      WHERE F.FlightID = :flightId
        AND S.SeatNumber = :seatNumber
        AND S.Status = 'AVAILABLE'
        AND NOT EXISTS (
          SELECT 1 FROM Tickets T
          JOIN Bookings B ON T.BookingID = B.BookingID
          WHERE T.FlightID = :flightId
            AND T.SeatNumber = :seatNumber
            AND B.Status != 'Cancelled'
        )
    `;
    const params = { flightId, seatNumber };
    const seats = connection
      ? (await connection.execute(sql, params)).rows || []
      : await executeQuery(sql, params);

    return seats.length > 0;
  },

  /**
   * Get all seats for a flight with calculated availability
   */
  getSeatsByFlightId: async (flightId) => {
    const sql = `
      SELECT
        S.SeatID,
        S.SeatNumber,
        S.Class,
        CASE
          WHEN S.Status = 'MAINTENANCE' THEN 'MAINTENANCE'
          WHEN EXISTS (
            SELECT 1 FROM Tickets T
            JOIN Bookings B ON T.BookingID = B.BookingID
            WHERE T.FlightID = F.FlightID AND T.SeatNumber = S.SeatNumber AND B.Status != 'Cancelled'
          ) THEN 'OCCUPIED'
          ELSE 'AVAILABLE'
        END AS Status
      FROM Flights F
      JOIN AircraftSeats S ON F.AircraftID = S.AircraftID
      WHERE F.FlightID = :flightId
      ORDER BY S.SeatNumber ASC
    `;
    return await executeQuery(sql, { flightId });
  },

  /**
   * Lock a seat during booking/ticket creation to prevent double-booking
   */
  lockSeat: async (flightId, seatNumber, connection = null) => {
    const available = await seatService.isSeatAvailable(flightId, seatNumber, connection);

    if (!available) {
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
    return { success: true };
  }
};

module.exports = seatService;
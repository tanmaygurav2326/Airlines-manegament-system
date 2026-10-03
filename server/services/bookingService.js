const crypto = require('crypto');
const { executeQuery, getConnection } = require('../db');
const { ERROR_CODES, BOOKING_STATUSES } = require('../utils/constants');
const seatService = require('./seatService');

/**
 * Generate unique 6-character alphanumeric booking reference (e.g. 'BK9X2A')
 */
function generateBookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (params) => {
    let connection;
    try {
      const userId = typeof params === 'object' ? params.userId : params;
      if (!userId) {
        throw {
          status: 400,
          message: 'userId is required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      connection = await getConnection();
      const bookingReference = generateBookingReference();

      await connection.execute(
        `INSERT INTO Bookings (BookingReference, UserID, BookingDate, Status)
         VALUES (:bookingReference, :userId, SYSTIMESTAMP, :status)`,
        {
          bookingReference,
          userId,
          status: BOOKING_STATUSES.PENDING
        }
      );

      const result = await connection.execute(
        `SELECT BookingID, BookingReference, UserID, BookingDate, Status
         FROM Bookings
         WHERE BookingReference = :bookingReference`,
        { bookingReference }
      );

      await connection.commit();

      const row = result.rows[0];
      const booking = Array.isArray(row) ? {
        BOOKINGID: row[0],
        BOOKINGREFERENCE: row[1],
        USERID: row[2],
        BOOKINGDATE: row[3],
        STATUS: row[4]
      } : row;

      return {
        bookingId: booking.BOOKINGID || booking.BookingID,
        bookingReference: booking.BOOKINGREFERENCE || booking.BookingReference,
        userId: booking.USERID || booking.UserID,
        bookingDate: booking.BOOKINGDATE || booking.BookingDate,
        status: booking.STATUS || booking.Status,
        totalAmount: 0
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      if (error.status) throw error;
      console.error('Create booking error:', error.message);
      throw {
        status: 500,
        message: 'Failed to create booking',
        code: ERROR_CODES.DATABASE_ERROR
      };
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  },

  /**
   * Cancel booking and release seats
   */
  cancelBooking: async (bookingId, userId) => {
    let connection;
    try {
      if (!bookingId) {
        throw {
          status: 400,
          message: 'bookingId is required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      connection = await getConnection();

      const bookingRes = await connection.execute(
        `SELECT BookingID, UserID, Status FROM Bookings WHERE BookingID = :bookingId`,
        { bookingId }
      );

      if (!bookingRes.rows || bookingRes.rows.length === 0) {
        throw {
          status: 404,
          message: 'Booking not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      const row = bookingRes.rows[0];
      const booking = Array.isArray(row) ? {
        BOOKINGID: row[0],
        USERID: row[1],
        STATUS: row[2]
      } : row;

      const ownerId = booking.USERID || booking.UserID;
      const currentStatus = booking.STATUS || booking.Status;

      if (userId && ownerId !== userId) {
        throw {
          status: 403,
          message: 'Access denied',
          code: ERROR_CODES.FORBIDDEN
        };
      }

      if (currentStatus === BOOKING_STATUSES.CANCELLED) {
        throw {
          status: 400,
          message: 'Booking is already cancelled',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      // Execute on active transaction handle
      const ticketsRes = await connection.execute(
        `SELECT FlightID, SeatNumber FROM Tickets WHERE BookingID = :bookingId`,
        { bookingId }
      );

      const ticketRows = ticketsRes.rows || [];
      for (const tRow of ticketRows) {
        const flightId = Array.isArray(tRow) ? tRow[0] : (tRow.FLIGHTID || tRow.FlightID);
        const seatNumber = Array.isArray(tRow) ? tRow[1] : (tRow.SEATNUMBER || tRow.SeatNumber);

        if (flightId && seatNumber) {
          await seatService.unlockSeat(flightId, seatNumber, connection);
        }
      }

      await connection.execute(
        `UPDATE Bookings SET Status = :status WHERE BookingID = :bookingId`,
        {
          status: BOOKING_STATUSES.CANCELLED,
          bookingId
        }
      );

      await connection.commit();

      return {
        message: 'Booking cancelled successfully',
        bookingId
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      if (error.status) throw error;
      console.error('Cancel booking error:', error.message);
      throw {
        status: 500,
        message: 'Failed to cancel booking',
        code: ERROR_CODES.DATABASE_ERROR
      };
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  },

  /**
   * Get booking details including tickets
   */
  getBookingDetails: async (bookingId, userId) => {
    try {
      const bookings = await executeQuery(
        `SELECT B.BookingID, B.BookingReference, B.UserID, B.BookingDate, B.Status,
                U.FirstName, U.LastName, U.Email,
                COALESCE((SELECT SUM(TicketPrice) FROM Tickets WHERE BookingID = B.BookingID), 0) AS TotalAmount
         FROM Bookings B
         JOIN Users U ON B.UserID = U.UserID
         WHERE B.BookingID = :bookingId`,
        { bookingId }
      );

      if (!bookings || bookings.length === 0) {
        throw {
          status: 404,
          message: 'Booking not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      const booking = bookings[0];

      if (userId && booking.USERID !== userId) {
        throw {
          status: 403,
          message: 'Access denied',
          code: ERROR_CODES.FORBIDDEN
        };
      }

      const tickets = await executeQuery(
        `SELECT T.TicketID, T.FlightID, T.PassengerID, T.SeatNumber, T.Class, T.TicketPrice,
                P.PassportNumber, P.Nationality,
                PU.FirstName AS PassengerFirstName, PU.LastName AS PassengerLastName,
                F.FlightNumber, F.DepartureTime, F.ArrivalTime
         FROM Tickets T
         JOIN Passengers P ON T.PassengerID = P.PassengerID
         JOIN Users PU ON P.UserID = PU.UserID
         JOIN Flights F ON T.FlightID = F.FlightID
         WHERE T.BookingID = :bookingId`,
        { bookingId }
      );

      return {
        bookingId: booking.BOOKINGID,
        bookingReference: booking.BOOKINGREFERENCE,
        userId: booking.USERID,
        bookingDate: booking.BOOKINGDATE,
        status: booking.STATUS,
        totalAmount: Number(booking.TOTALAMOUNT || 0),
        user: {
          firstName: booking.FIRSTNAME,
          lastName: booking.LASTNAME,
          email: booking.EMAIL
        },
        tickets: tickets.map(t => ({
          ticketId: t.TICKETID,
          flightId: t.FLIGHTID,
          passengerId: t.PASSENGERID,
          seatNumber: t.SEATNUMBER,
          cabinClass: t.CLASS,
          ticketPrice: t.TICKETPRICE,
          passenger: {
            firstName: t.PASSENGERFIRSTNAME,
            lastName: t.PASSENGERLASTNAME,
            passportNumber: t.PASSPORTNUMBER,
            nationality: t.NATIONALITY
          },
          flight: {
            flightNumber: t.FLIGHTNUMBER,
            departureTime: t.DEPARTURETIME,
            arrivalTime: t.ARRIVALTIME
          }
        }))
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Get booking details error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve booking details',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get all bookings for a user
   */
  getUserBookings: async (userId) => {
    try {
      const bookings = await executeQuery(
        `SELECT B.BookingID, B.BookingReference, B.UserID, B.BookingDate, B.Status,
                COALESCE((SELECT SUM(TicketPrice) FROM Tickets WHERE BookingID = B.BookingID), 0) AS TotalAmount,
                (SELECT COUNT(*) FROM Tickets WHERE BookingID = B.BookingID) AS TicketCount
         FROM Bookings B
         WHERE B.UserID = :userId
         ORDER BY B.BookingDate DESC`,
        { userId }
      );

      return bookings.map(b => ({
        bookingId: b.BOOKINGID,
        bookingReference: b.BOOKINGREFERENCE,
        userId: b.USERID,
        bookingDate: b.BOOKINGDATE,
        status: b.STATUS,
        totalAmount: Number(b.TOTALAMOUNT || 0),
        ticketCount: Number(b.TICKETCOUNT || 0)
      }));
    } catch (error) {
      console.error('Get user bookings error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve user bookings',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Look up booking by PNR / BookingReference (public)
   */
  getBookingByReference: async (reference) => {
    try {
      const ref = (reference || '').trim().toUpperCase();
      const bookings = await executeQuery(
        `SELECT BookingID FROM Bookings WHERE UPPER(BookingReference) = :ref`,
        { ref }
      );
      if (!bookings || bookings.length === 0) {
        throw {
          status: 404,
          message: `No booking found for reference '${ref}'`,
          code: ERROR_CODES.NOT_FOUND
        };
      }
      return await bookingService.getBookingDetails(bookings[0].BOOKINGID);
    } catch (err) {
      if (err.status) throw err;
      throw {
        status: 500,
        message: 'Failed to look up booking reference',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = bookingService;
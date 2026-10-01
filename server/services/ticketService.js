// ============================================
// TICKET SERVICE - Ticket & seat selection logic
// ============================================

const { executeQuery, getConnection } = require('../db');
const { ERROR_CODES } = require('../utils/constants');
const seatService = require('./seatService');
const { calculateTicketPrice } = require('../utils/helpers');

const ticketService = {
  /**
   * Create a ticket (add passenger to booking with seat selection)
   * @param {object} ticketData - { bookingId, flightId, passengerId, seatNumber, cabinClass }
   * @returns {Promise<object>}
   */
  createTicket: async (ticketData) => {
    let connection;
    try {
      const { bookingId, flightId, passengerId, seatNumber, cabinClass } = ticketData;

      // Validate input
      if (!bookingId || !flightId || !passengerId || !seatNumber || !cabinClass) {
        throw { 
          status: 400, 
          message: 'bookingId, flightId, passengerId, seatNumber, and cabinClass are required', 
          code: ERROR_CODES.INVALID_INPUT 
        };
      }

      // Verify booking exists
      const bookings = await executeQuery(
        `SELECT BookingID, Status FROM Bookings WHERE BookingID = :bookingId`,
        { bookingId }
      );

      if (!bookings || bookings.length === 0) {
        throw { 
          status: 404, 
          message: 'Booking not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      // Verify passenger exists
      const passengers = await executeQuery(
        `SELECT PassengerID FROM Passengers WHERE PassengerID = :passengerId`,
        { passengerId }
      );

      if (!passengers || passengers.length === 0) {
        throw { 
          status: 404, 
          message: 'Passenger not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      // Verify flight exists and get base price
      const flights = await executeQuery(
        `SELECT FlightID, BasePrice FROM Flights WHERE FlightID = :flightId`,
        { flightId }
      );

      if (!flights || flights.length === 0) {
        throw { 
          status: 404, 
          message: 'Flight not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      const basePrice = flights[0].BASEPRICE;

      // Acquire manual connection for transactional integrity
      connection = await getConnection();

      // Check seat availability inside active transaction
      const existingTickets = await connection.execute(
        `SELECT TicketID FROM Tickets WHERE FlightID = :flightId AND SeatNumber = :seatNumber`,
        { flightId, seatNumber }
      );

      if (existingTickets.rows && existingTickets.rows.length > 0) {
        throw { 
          status: 409, 
          message: `Seat ${seatNumber} is already booked`, 
          code: ERROR_CODES.CONFLICT 
        };
      }

      // Lock seat on the active transaction handle
      await seatService.lockSeat(flightId, seatNumber, connection);

      const ticketPrice = calculateTicketPrice(cabinClass, basePrice);

      // Create ticket
      await connection.execute(
        `INSERT INTO Tickets (BookingID, FlightID, PassengerID, SeatNumber, Class, TicketPrice)
         VALUES (:bookingId, :flightId, :passengerId, :seatNumber, :cabinClass, :ticketPrice)`,
        {
          bookingId,
          flightId,
          passengerId,
          seatNumber,
          cabinClass,
          ticketPrice
        }
      );

      // Query created ticket within active transaction before commit
      const tickets = await connection.execute(
        `SELECT TicketID, BookingID, FlightID, PassengerID, SeatNumber, Class, TicketPrice
         FROM Tickets
         WHERE BookingID = :bookingId AND SeatNumber = :seatNumber AND FlightID = :flightId`,
        { bookingId, seatNumber, flightId }
      );

      if (!tickets.rows || tickets.rows.length === 0) {
        throw { 
          status: 500, 
          message: 'Failed to retrieve created ticket', 
          code: ERROR_CODES.DATABASE_ERROR 
        };
      }

      await connection.commit();

      const row = tickets.rows[0];
      const ticket = Array.isArray(row) ? {
        TICKETID: row[0],
        BOOKINGID: row[1],
        FLIGHTID: row[2],
        PASSENGERID: row[3],
        SEATNUMBER: row[4],
        CLASS: row[5],
        TICKETPRICE: row[6]
      } : row;

      return {
        ticketId: ticket.TICKETID || ticket.TicketID,
        bookingId: ticket.BOOKINGID || ticket.BookingID,
        flightId: ticket.FLIGHTID || ticket.FlightID,
        passengerId: ticket.PASSENGERID || ticket.PassengerID,
        seatNumber: ticket.SEATNUMBER || ticket.SeatNumber,
        cabinClass: ticket.CLASS || ticket.Class,
        ticketPrice: ticket.TICKETPRICE || ticket.TicketPrice
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      if (error.status) throw error;
      console.error('Create ticket error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to create ticket', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  },

  /**
   * Get ticket details
   * @param {number} ticketId
   * @returns {Promise<object>}
   */
  getTicketDetails: async (ticketId) => {
    try {
      const tickets = await executeQuery(
        `SELECT T.TicketID, T.BookingID, T.FlightID, T.PassengerID, T.SeatNumber, T.Class, T.TicketPrice,
                P.PassportNumber, P.Nationality,
                U.FirstName, U.LastName, U.Email,
                F.FlightNumber, F.DepartureTime, F.ArrivalTime
         FROM Tickets T
         JOIN Passengers P ON T.PassengerID = P.PassengerID
         JOIN Users U ON P.UserID = U.UserID
         JOIN Flights F ON T.FlightID = F.FlightID
         WHERE T.TicketID = :ticketId`,
        { ticketId }
      );

      if (!tickets || tickets.length === 0) {
        throw { 
          status: 404, 
          message: 'Ticket not found', 
          code: ERROR_CODES.NOT_FOUND 
        };
      }

      const ticket = tickets[0];

      return {
        ticketId: ticket.TICKETID,
        bookingId: ticket.BOOKINGID,
        flightId: ticket.FLIGHTID,
        passengerDetails: {
          passengerId: ticket.PASSENGERID,
          firstName: ticket.FIRSTNAME,
          lastName: ticket.LASTNAME,
          email: ticket.EMAIL,
          passportNumber: ticket.PASSPORTNUMBER,
          nationality: ticket.NATIONALITY
        },
        flightDetails: {
          flightNumber: ticket.FLIGHTNUMBER,
          departureTime: ticket.DEPARTURETIME,
          arrivalTime: ticket.ARRIVALTIME
        },
        seatNumber: ticket.SEATNUMBER,
        cabinClass: ticket.CLASS,
        ticketPrice: ticket.TICKETPRICE
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Get ticket details error:', error.message);
      throw { 
        status: 500, 
        message: 'Failed to retrieve ticket', 
        code: ERROR_CODES.DATABASE_ERROR 
      };
    }
  }
};

module.exports = ticketService;
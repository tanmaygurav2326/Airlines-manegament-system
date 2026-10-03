// ============================================
// FLIGHT SERVICE - Flight business logic
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES, FLIGHT_STATUSES } = require('../utils/constants');

const flightService = {
  /**
   * Get all flights
   * @returns {Promise<array>} - Array of flights
   */
  getAllFlights: async () => {
    try {
      const flights = await executeQuery(
        `SELECT
          F.FlightID,
          F.FlightNumber,
          F.AircraftID,
          A.Model as AircraftModel,
          F.DepartureAirport,
          F.ArrivalAirport,
          F.DepartureTime,
          F.ArrivalTime,
          F.BasePrice,
          F.Status,
          AP1.AirportName as DepartureAirportName,
          AP2.AirportName as ArrivalAirportName,
          AP1.City as DepartureCity,
          AP2.City as ArrivalCity
        FROM Flights F
        JOIN Aircraft A ON F.AircraftID = A.AircraftID
        JOIN Airports AP1 ON F.DepartureAirport = AP1.AirportCode
        JOIN Airports AP2 ON F.ArrivalAirport = AP2.AirportCode
        ORDER BY F.DepartureTime ASC`,
        {}
      );

      return flights;
    } catch (error) {
      console.error('Get all flights error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve flights',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Search flights with filters
   * @param {object} filters - { from, to, departureDate, returnDate, passengers, cabinClass }
   * @returns {Promise<array>} - Filtered flights
   */
  searchFlights: async (filters) => {
    try {
      const { from, to, departureDate, returnDate, passengers, cabinClass } = filters;
  
      // Validate required filters
      if (!from || !to || !departureDate) {
        throw {
          status: 400,
          message: 'from, to, and departureDate are required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }
  
      // Parse and validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(departureDate)) {
        throw {
          status: 400,
          message: 'Invalid departureDate format (use YYYY-MM-DD)',
          code: ERROR_CODES.INVALID_INPUT
        };
      }
  
      // Build WHERE clause dynamically
      // NOTE: Using explicit bind variable names to avoid Oracle reserved word conflicts
      let whereConditions = [
        `F.DepartureAirport = :departureAirportCode`,
        `F.ArrivalAirport = :arrivalAirportCode`,
        `TRUNC(F.DepartureTime) = TO_DATE(:flightDepartureDate, 'YYYY-MM-DD')`,
        `F.Status != :flightCancelledStatus`
      ];
  
      let params = {
        departureAirportCode: from.toUpperCase(),
        arrivalAirportCode: to.toUpperCase(),
        flightDepartureDate: departureDate,
        flightCancelledStatus: FLIGHT_STATUSES.CANCELLED
      };
  
      // Add optional cabin class filter
      if (cabinClass) {
        whereConditions.push(`EXISTS (SELECT 1 FROM AircraftSeats WHERE AircraftID = F.AircraftID AND Class = :flightCabinClass)`);
        params.flightCabinClass = cabinClass;
      }
  
      const sql = `
        SELECT
          F.FlightID,
          F.FlightNumber,
          F.AircraftID,
          A.Model as AircraftModel,
          A.TotalSeats,
          F.DepartureAirport,
          F.ArrivalAirport,
          F.DepartureTime,
          F.ArrivalTime,
          F.BasePrice,
          F.Status,
          AP1.AirportName as DepartureAirportName,
          AP2.AirportName as ArrivalAirportName,
          AP1.City as DepartureCity,
          AP2.City as ArrivalCity,
          (SELECT COUNT(*) FROM AircraftSeats WHERE AircraftID = F.AircraftID AND Status = 'AVAILABLE') as AvailableSeats
        FROM Flights F
        JOIN Aircraft A ON F.AircraftID = A.AircraftID
        JOIN Airports AP1 ON F.DepartureAirport = AP1.AirportCode
        JOIN Airports AP2 ON F.ArrivalAirport = AP2.AirportCode
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY F.DepartureTime ASC
      `;
  
      console.log('Flight search SQL:', sql);
      console.log('Flight search params:', params);
  
      const flights = await executeQuery(sql, params);
  
      // Calculate duration for each flight
      const enrichedFlights = flights.map(flight => ({
        ...flight,
        DURATIONMINUTES: Math.round((new Date(flight.ARRIVALTIME) - new Date(flight.DEPARTURETIME)) / (1000 * 60))
      }));
  
      return enrichedFlights;
    } catch (error) {
      if (error.status) throw error;
      console.error('Search flights error:', error.message);
      throw {
        status: 500,
        message: 'Flight search failed',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get flight details by ID
   * @param {number} flightId
   * @returns {Promise<object>} - Flight details with seat availability
   */
  getFlightDetails: async (flightId) => {
    try {
      const flights = await executeQuery(
        `SELECT
          F.FlightID,
          F.FlightNumber,
          F.AircraftID,
          A.Model as AircraftModel,
          A.TotalSeats,
          A.ManufactureYear,
          F.DepartureAirport,
          F.ArrivalAirport,
          F.DepartureTime,
          F.ArrivalTime,
          F.BasePrice,
          F.Status,
          AP1.AirportName as DepartureAirportName,
          AP1.City as DepartureCity,
          AP2.AirportName as ArrivalAirportName,
          AP2.City as ArrivalCity
        FROM Flights F
        JOIN Aircraft A ON F.AircraftID = A.AircraftID
        JOIN Airports AP1 ON F.DepartureAirport = AP1.AirportCode
        JOIN Airports AP2 ON F.ArrivalAirport = AP2.AirportCode
        WHERE F.FlightID = :flightId`,
        { flightId }
      );

      if (!flights || flights.length === 0) {
        throw {
          status: 404,
          message: 'Flight not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      const flight = flights[0];

      // Get seat availability by class
      const seatAvailability = await executeQuery(
        `SELECT
          Class,
          COUNT(*) as TotalSeats,
          SUM(CASE WHEN Status = 'AVAILABLE' THEN 1 ELSE 0 END) as AvailableSeats,
          SUM(CASE WHEN Status = 'OCCUPIED' THEN 1 ELSE 0 END) as OccupiedSeats
        FROM AircraftSeats
        WHERE AircraftID = :aircraftId
        GROUP BY Class
        ORDER BY Class`,
        { aircraftId: flight.AIRCRAFTID }
      );

      return {
        ...flight,
        SEATAVAILABILITY: seatAvailability
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Get flight details error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve flight details',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get available seats for a flight
   * @param {number} flightId
   * @returns {Promise<array>} - Array of available seats
   */
  getAvailableSeats: async (flightId) => {
    try {
      // First verify flight exists
      const flights = await executeQuery(
        `SELECT FlightID FROM Flights WHERE FlightID = :flightId`,
        { flightId }
      );

      if (!flights || flights.length === 0) {
        throw {
          status: 404,
          message: 'Flight not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      // Get all seats with real-time flight ticket occupancy
      const seats = await executeQuery(
        `SELECT
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
        ORDER BY S.SeatNumber ASC`,
        { flightId }
      );

      return seats;
    } catch (error) {
      if (error.status) throw error;
      console.error('Get available seats error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve seats',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = flightService;
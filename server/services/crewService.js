// ============================================
// CREW SERVICE - Crew assignment management
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES, CREW_ROLES } = require('../utils/constants');

const crewService = {
  /**
   * Assign crew to a flight
   * @param {object} assignmentData - { flightId, userId, crewRole }
   * @returns {Promise<object>}
   */
  assignCrewToFlight: async (assignmentData) => {
    try {
      const { flightId, userId, crewRole } = assignmentData;

      // Validate input
      if (!flightId || !userId || !crewRole) {
        throw {
          status: 400,
          message: 'flightId, userId, and crewRole are required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      const validRoles = ['Pilot', 'Co-Pilot', 'Cabin Crew Lead', 'Cabin Crew'];
      if (!validRoles.includes(crewRole)) {
        throw {
          status: 400,
          message: `Invalid crewRole. Must be one of: ${validRoles.join(', ')}`,
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      // Check flight exists
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

      // Check user exists and is staff/admin
      const users = await executeQuery(
        `SELECT UserID, Role FROM Users WHERE UserID = :userId`,
        { userId }
      );

      if (!users || users.length === 0) {
        throw {
          status: 404,
          message: 'User not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      const user = users[0];
      if (user.ROLE === 'Passenger') {
        throw {
          status: 403,
          message: 'Only staff and admin can be assigned to flights',
          code: ERROR_CODES.FORBIDDEN
        };
      }

      // Check if already assigned with same role
      const existing = await executeQuery(
        `SELECT AssignmentID FROM CrewAssignment
         WHERE FlightID = :flightId AND UserID = :userId AND CrewRole = :crewRole`,
        { flightId, userId, crewRole }
      );

      if (existing && existing.length > 0) {
        throw {
          status: 409,
          message: 'User is already assigned to this flight with this role',
          code: ERROR_CODES.CONFLICT
        };
      }

      // Create assignment
      await executeQuery(
        `INSERT INTO CrewAssignment (FlightID, UserID, CrewRole)
         VALUES (:flightId, :userId, :crewRole)`,
        { flightId, userId, crewRole }
      );

      // Retrieve created assignment
      const assignments = await executeQuery(
        `SELECT C.AssignmentID, C.FlightID, C.UserID, C.CrewRole,
                U.FirstName, U.LastName, U.Email,
                F.FlightNumber
         FROM CrewAssignment C
         JOIN Users U ON C.UserID = U.UserID
         JOIN Flights F ON C.FlightID = F.FlightID
         WHERE C.FlightID = :flightId AND C.UserID = :userId AND C.CrewRole = :crewRole`,
        { flightId, userId, crewRole }
      );

      if (!assignments || assignments.length === 0) {
        throw {
          status: 500,
          message: 'Failed to retrieve created assignment',
          code: ERROR_CODES.DATABASE_ERROR
        };
      }

      const a = assignments[0];

      return {
        assignmentId: a.ASSIGNMENTID,
        flightId: a.FLIGHTID,
        flightNumber: a.FLIGHTNUMBER,
        userId: a.USERID,
        firstName: a.FIRSTNAME,
        lastName: a.LASTNAME,
        email: a.EMAIL,
        crewRole: a.CREWROLE
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Assign crew error:', error.message);
      throw {
        status: 500,
        message: 'Failed to assign crew',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get crew for a flight
   * @param {number} flightId
   * @returns {Promise<array>}
   */
  getFlightCrew: async (flightId) => {
    try {
      const crew = await executeQuery(
        `SELECT C.AssignmentID, C.FlightID, C.UserID, C.CrewRole,
                U.FirstName, U.LastName, U.Email
         FROM CrewAssignment C
         JOIN Users U ON C.UserID = U.UserID
         WHERE C.FlightID = :flightId
         ORDER BY C.CrewRole DESC, U.LastName ASC`,
        { flightId }
      );

      return (crew || []).map(c => ({
        assignmentId: c.ASSIGNMENTID,
        userId: c.USERID,
        firstName: c.FIRSTNAME,
        lastName: c.LASTNAME,
        email: c.EMAIL,
        crewRole: c.CREWROLE
      }));
    } catch (error) {
      console.error('Get flight crew error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve crew',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get flights for a crew member
   * @param {number} userId
   * @returns {Promise<array>}
   */
  getCrewFlights: async (userId) => {
    try {
      const flights = await executeQuery(
        `SELECT C.AssignmentID, C.FlightID, C.CrewRole,
                F.FlightNumber, F.DepartureTime, F.ArrivalTime, F.Status
         FROM CrewAssignment C
         JOIN Flights F ON C.FlightID = F.FlightID
         WHERE C.UserID = :userId
         ORDER BY F.DepartureTime DESC`,
        { userId }
      );

      return (flights || []).map(f => ({
        assignmentId: f.ASSIGNMENTID,
        flightId: f.FLIGHTID,
        flightNumber: f.FLIGHTNUMBER,
        departureTime: f.DEPARTURETIME,
        arrivalTime: f.ARRIVALTIME,
        status: f.STATUS,
        crewRole: f.CREWROLE
      }));
    } catch (error) {
      console.error('Get crew flights error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve flights',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Remove crew assignment
   * @param {number} assignmentId
   * @returns {Promise<object>}
   */
  removeCrewAssignment: async (assignmentId) => {
    try {
      // Check assignment exists
      const assignments = await executeQuery(
        `SELECT AssignmentID FROM CrewAssignment WHERE AssignmentID = :assignmentId`,
        { assignmentId }
      );

      if (!assignments || assignments.length === 0) {
        throw {
          status: 404,
          message: 'Assignment not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      // Delete assignment
      await executeQuery(
        `DELETE FROM CrewAssignment WHERE AssignmentID = :assignmentId`,
        { assignmentId }
      );

      return {
        assignmentId,
        message: 'Crew assignment removed successfully'
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Remove crew assignment error:', error.message);
      throw {
        status: 500,
        message: 'Failed to remove assignment',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = crewService;
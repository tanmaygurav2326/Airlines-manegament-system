// ============================================
// PASSENGER SERVICE - Passenger profiles
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES } = require('../utils/constants');

const passengerService = {
  /**
   * Create a passenger profile
   */
  createPassenger: async (passengerData) => {
    try {
      const { userId, passportNumber, nationality, phoneNumber, frequentFlyerNumber } = passengerData;

      if (!userId || !passportNumber || !nationality) {
        throw {
          status: 400,
          message: 'userId, passportNumber, and nationality are required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      const users = await executeQuery(
        `SELECT UserID FROM Users WHERE UserID = :userId`,
        { userId }
      );

      if (!users || users.length === 0) {
        throw {
          status: 404,
          message: 'User not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      await executeQuery(
        `INSERT INTO Passengers (UserID, PassportNumber, Nationality, PhoneNumber, FrequentFlyerNumber)
         VALUES (:userId, :passportNumber, :nationality, :phoneNumber, :frequentFlyerNumber)`,
        {
          userId,
          passportNumber,
          nationality,
          phoneNumber: phoneNumber ?? null,
          frequentFlyerNumber: frequentFlyerNumber ?? null
        }
      );

      const passengers = await executeQuery(
        `SELECT PassengerID, UserID, PassportNumber, Nationality, PhoneNumber, FrequentFlyerNumber
         FROM Passengers
         WHERE UserID = :userId AND PassportNumber = :passportNumber`,
        { userId, passportNumber }
      );

      if (!passengers || passengers.length === 0) {
        throw {
          status: 500,
          message: 'Failed to retrieve created passenger profile',
          code: ERROR_CODES.DATABASE_ERROR
        };
      }

      const p = passengers[0];

      return {
        passengerId: p.PASSENGERID,
        userId: p.USERID,
        passportNumber: p.PASSPORTNUMBER,
        nationality: p.NATIONALITY,
        phoneNumber: p.PHONENUMBER,
        frequentFlyerNumber: p.FREQUENTFLYERNUMBER
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Create passenger error:', error.message);
      throw {
        status: 500,
        message: 'Failed to create passenger profile',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get passenger by ID
   */
  getPassengerById: async (passengerId) => {
    try {
      const passengers = await executeQuery(
        `SELECT P.PassengerID, P.UserID, P.PassportNumber, P.Nationality, P.PhoneNumber, P.FrequentFlyerNumber,
                U.FirstName, U.LastName, U.Email
         FROM Passengers P
         JOIN Users U ON P.UserID = U.UserID
         WHERE P.PassengerID = :passengerId`,
        { passengerId }
      );

      if (!passengers || passengers.length === 0) {
        throw {
          status: 404,
          message: 'Passenger not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      const p = passengers[0];

      return {
        passengerId: p.PASSENGERID,
        userId: p.USERID,
        firstName: p.FIRSTNAME,
        lastName: p.LASTNAME,
        email: p.EMAIL,
        passportNumber: p.PASSPORTNUMBER,
        nationality: p.NATIONALITY,
        phoneNumber: p.PHONENUMBER,
        frequentFlyerNumber: p.FREQUENTFLYERNUMBER
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Get passenger error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve passenger profile',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Update passenger details
   */
  updatePassenger: async (passengerId, updateData = {}) => {
    try {
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

      const phoneNumber = updateData.phoneNumber ?? null;
      const frequentFlyerNumber = updateData.frequentFlyerNumber ?? null;

      await executeQuery(
        `UPDATE Passengers
         SET PhoneNumber = NVL(:phoneNumber, PhoneNumber),
             FrequentFlyerNumber = NVL(:frequentFlyerNumber, FrequentFlyerNumber)
         WHERE PassengerID = :passengerId`,
        { passengerId, phoneNumber, frequentFlyerNumber }
      );

      return await passengerService.getPassengerById(passengerId);
    } catch (error) {
      if (error.status) throw error;
      console.error('Update passenger error:', error.message);
      throw {
        status: 500,
        message: 'Failed to update passenger profile',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = passengerService;
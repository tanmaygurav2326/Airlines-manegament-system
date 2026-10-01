// ============================================
// AUTH SERVICE - User Authentication & Registration
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery, getConnection } = require('../db');
const { ERROR_CODES, USER_ROLES } = require('../utils/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authService = {
  /**
   * Register a new user
   */
  registerUser: async (userData) => {
    let connection;
    try {
      const { email, password, firstName, lastName, role = USER_ROLES.PASSENGER } = userData;

      if (!email || !password || !firstName || !lastName) {
        throw {
          status: 400,
          message: 'Email, password, first name, and last name are required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      const existingUsers = await executeQuery(
        `SELECT UserID FROM Users WHERE Email = :email`,
        { email }
      );

      if (existingUsers && existingUsers.length > 0) {
        throw {
          status: 409,
          message: 'User with this email already exists',
          code: ERROR_CODES.DUPLICATE_ENTRY
        };
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      connection = await getConnection();

      await connection.execute(
        `INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role)
         VALUES (:email, :passwordHash, :firstName, :lastName, :role)`,
        { email, passwordHash, firstName, lastName, role }
      );

      // Fetch user within active transaction prior to commit
      const result = await connection.execute(
        `SELECT UserID, Email, FirstName, LastName, Role, CreatedAt
         FROM Users
         WHERE Email = :email`,
        { email }
      );

      await connection.commit();

      if (!result.rows || result.rows.length === 0) {
        throw {
          status: 500,
          message: 'Failed to retrieve registered user',
          code: ERROR_CODES.DATABASE_ERROR
        };
      }

      const row = result.rows[0];
      const newUser = Array.isArray(row) ? {
        USERID: row[0],
        EMAIL: row[1],
        FIRSTNAME: row[2],
        LASTNAME: row[3],
        ROLE: row[4]
      } : row;

      const userId = newUser.USERID || newUser.UserId;
      const userEmail = newUser.EMAIL || newUser.Email;
      const userRole = newUser.ROLE || newUser.Role;

      const token = jwt.sign(
        { userId, email: userEmail, role: userRole },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        user: {
          userId,
          email: userEmail,
          firstName: newUser.FIRSTNAME || newUser.FirstName,
          lastName: newUser.LASTNAME || newUser.LastName,
          role: userRole
        },
        token
      };
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      if (error.status) throw error;
      console.error('Registration error:', error.message);
      throw {
        status: 500,
        message: 'Failed to register user',
        code: ERROR_CODES.DATABASE_ERROR
      };
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  },

  /**
   * Log in an existing user
   */
  loginUser: async (email, password) => {
    try {
      if (!email || !password) {
        throw {
          status: 400,
          message: 'Email and password are required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      const users = await executeQuery(
        `SELECT UserID, Email, PasswordHash, FirstName, LastName, Role
         FROM Users
         WHERE Email = :email`,
        { email }
      );

      if (!users || users.length === 0) {
        throw {
          status: 401,
          message: 'Invalid email or password',
          code: ERROR_CODES.UNAUTHORIZED
        };
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.PASSWORDHASH);

      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Invalid email or password',
          code: ERROR_CODES.UNAUTHORIZED
        };
      }

      const token = jwt.sign(
        { userId: user.USERID, email: user.EMAIL, role: user.ROLE },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        user: {
          userId: user.USERID,
          email: user.EMAIL,
          firstName: user.FIRSTNAME,
          lastName: user.LASTNAME,
          role: user.ROLE
        },
        token
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Login error:', error.message);
      throw {
        status: 500,
        message: 'Failed to log in',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = authService;
// ============================================
// ORACLE DATABASE CONNECTION & QUERY EXECUTOR
// ============================================

const oracledb = require('oracledb');
require('dotenv').config();

// Return SQL query results as JavaScript objects instead of raw arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// ============================================
// Initialize Connection Pool
// ============================================
async function initializeDatabase() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('✓ Successfully connected to Oracle 21c Database Pool!');
  } catch (err) {
    console.error('✗ Oracle DB Connection Error:', err.message);
    throw err;
  }
}

// ============================================
// Execute Query (Supports named bind variables & autocommit)
// ============================================
/**
 * Execute SQL query with support for named bind variables
 * @param {string} sql - SQL query with :paramName syntax
 * @param {object|array} params - Bind variables (named object preferred)
 * @param {object} options - { autoCommit: true/false }
 * @returns {array} - Query results (rows only)
 */
async function executeQuery(sql, params = {}, options = {}) {
  let connection;
  try {
    // Get connection from pool
    connection = await oracledb.getConnection();

    // Default to autocommit true (important for INSERT/UPDATE/DELETE)
    const autoCommit = options.autoCommit !== false;

    // Execute query with bind variables
    const result = await connection.execute(sql, params, {
      autoCommit: autoCommit
    });

    // Return only rows for SELECT queries
    // For INSERT/UPDATE/DELETE, return empty array (success = no error thrown)
    return result.rows || [];

  } catch (err) {
    console.error('Database Query Error:', {
      message: err.message,
      code: err.code,
      sql: sql.substring(0, 100) + '...'
    });
    throw err;
  } finally {
    // Always close connection and return to pool
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr.message);
      }
    }
  }
}

// ============================================
// Get Connection (For manual transaction control if needed in Phase 5)
// ============================================
/**
 * Get a dedicated connection for manual transaction handling
 * IMPORTANT: Must call connection.close() when done
 * @returns {object} - Oracle connection object
 */
async function getConnection() {
  try {
    return await oracledb.getConnection();
  } catch (err) {
    console.error('Failed to get connection:', err.message);
    throw err;
  }
}

module.exports = { 
  initializeDatabase, 
  executeQuery,
  getConnection  // For Phase 5 (booking transactions)
};
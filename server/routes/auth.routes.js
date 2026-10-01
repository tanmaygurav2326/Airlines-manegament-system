// ============================================
// AUTH ROUTES - Authentication endpoints
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * Public routes (no authentication required)
 */

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { FirstName, LastName, Email, Password, ConfirmPassword }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user
 * Body: { Email, Password }
 */
router.post('/login', authController.login);

/**
 * Protected routes (authentication required)
 */

/**
 * GET /api/auth/profile
 * Get current user profile
 * Headers: { Authorization: 'Bearer <token>' }
 */
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
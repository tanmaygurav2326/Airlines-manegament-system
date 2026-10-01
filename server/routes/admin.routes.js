const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const adminController = require('../controllers/adminController');

router.use(authMiddleware);
router.use(authorize('Admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/revenue', adminController.getRevenueStats);
router.get('/flights', adminController.getFlightStats);
router.get('/bookings', adminController.getBookingStats);
router.get('/users', adminController.getUserStats);

module.exports = router;
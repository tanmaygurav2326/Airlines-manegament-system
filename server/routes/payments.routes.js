// ============================================
// PAYMENTS ROUTES - Payment endpoints
// ============================================

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * POST /api/payments/simulate
 * Process simulated payment
 * Body: { bookingId, amount, paymentMethod }
 * paymentMethod: 'Credit Card', 'Debit Card', 'PayPal', or 'Stripe'
 */
router.post('/simulate', paymentController.processPayment);

/**
 * GET /api/payments/:paymentId
 * Get payment details
 */
router.get('/:paymentId', paymentController.getPaymentDetails);

module.exports = router;
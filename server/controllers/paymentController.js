// ============================================
// PAYMENT CONTROLLER - Payment endpoints
// ============================================

const paymentService = require('../services/paymentService');
const ApiResponse = require('../utils/response');

const paymentController = {
  /**
   * POST /api/payments/simulate
   * Process simulated payment
   */
  processPayment: async (req, res, next) => {
    try {
      const { bookingId, amount, paymentMethod } = req.body;

      // Validate required fields
      if (!bookingId || !amount || !paymentMethod) {
        const response = ApiResponse.validationError(
          'bookingId, amount, and paymentMethod are required'
        );
        return res.status(response.statusCode).json(response.body);
      }

      // Validate payment method
      const validMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Stripe'];
      if (!validMethods.includes(paymentMethod)) {
        const response = ApiResponse.validationError(
          `Invalid paymentMethod. Must be one of: ${validMethods.join(', ')}`
        );
        return res.status(response.statusCode).json(response.body);
      }

      const payment = await paymentService.processPayment({
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        paymentMethod
      });

      const response = ApiResponse.success(
        200,
        payment,
        'Payment processed successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Process payment error:', error);
        next({ status: 500, message: 'Payment processing failed', code: 'SERVER_ERROR' });
      }
    }
  },

  /**
   * GET /api/payments/:paymentId
   * Get payment details
   */
  getPaymentDetails: async (req, res, next) => {
    try {
      const { paymentId } = req.params;

      if (!paymentId || isNaN(paymentId)) {
        const response = ApiResponse.validationError('Invalid paymentId');
        return res.status(response.statusCode).json(response.body);
      }

      const payment = await paymentService.getPaymentDetails(parseInt(paymentId));

      const response = ApiResponse.success(
        200,
        payment,
        'Payment details retrieved successfully'
      );
      res.status(response.statusCode).json(response.body);
    } catch (error) {
      if (error.status) {
        next(error);
      } else {
        console.error('Get payment details error:', error);
        next({ status: 500, message: 'Failed to retrieve payment', code: 'SERVER_ERROR' });
      }
    }
  }
};

module.exports = paymentController;
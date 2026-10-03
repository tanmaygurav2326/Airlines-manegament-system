// ============================================
// PAYMENT SERVICE - Payment processing (simulated)
// ============================================

const { executeQuery } = require('../db');
const { ERROR_CODES, PAYMENT_STATUSES } = require('../utils/constants');
const { generateTransactionReference } = require('../utils/helpers');

const paymentService = {
  /**
   * Process simulated payment (auto-approve)
   * @param {object} paymentData - { bookingId, amount, paymentMethod }
   * @returns {Promise<object>}
   */
  processPayment: async (paymentData) => {
    try {
      const { bookingId, amount, paymentMethod } = paymentData;

      // Validate input
      if (!bookingId || !amount || !paymentMethod) {
        throw {
          status: 400,
          message: 'bookingId, amount, and paymentMethod are required',
          code: ERROR_CODES.INVALID_INPUT
        };
      }

      if (amount <= 0) {
        throw {
          status: 400,
          message: 'Amount must be greater than 0',
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

      // Generate transaction reference
      const transactionReference = generateTransactionReference();

      // Simulate successful payment (always succeeds)
      const transactionStatus = PAYMENT_STATUSES.SUCCESS;

      // Record payment in database
      await executeQuery(
        `INSERT INTO Payments (BookingID, Amount, PaymentMethod, TransactionStatus, TransactionReference)
         VALUES (:bookingId, :amount, :paymentMethod, :transactionStatus, :transactionReference)`,
        {
          bookingId,
          amount,
          paymentMethod,
          transactionStatus,
          transactionReference
        }
      );

      // Update booking status to CONFIRMED
      await executeQuery(
        `UPDATE Bookings SET Status = 'Confirmed' WHERE BookingID = :bookingId`,
        { bookingId }
      );

      // Retrieve created payment
      const payments = await executeQuery(
        `SELECT PaymentID, BookingID, Amount, PaymentDate, PaymentMethod, TransactionStatus, TransactionReference
         FROM Payments
         WHERE BookingID = :bookingId AND TransactionReference = :transactionReference`,
        { bookingId, transactionReference }
      );

      if (!payments || payments.length === 0) {
        throw {
          status: 500,
          message: 'Failed to record payment',
          code: ERROR_CODES.DATABASE_ERROR
        };
      }

      const payment = payments[0];

      return {
        paymentId: payment.PAYMENTID,
        bookingId: payment.BOOKINGID,
        amount: payment.AMOUNT,
        paymentDate: payment.PAYMENTDATE,
        paymentMethod: payment.PAYMENTMETHOD,
        transactionStatus: payment.TRANSACTIONSTATUS,
        transactionReference: payment.TRANSACTIONREFERENCE,
        message: 'Payment successful - Booking confirmed'
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Process payment error:', error.message);
      throw {
        status: 500,
        message: 'Payment processing failed',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  },

  /**
   * Get payment details
   * @param {number} paymentId
   * @returns {Promise<object>}
   */
  getPaymentDetails: async (paymentId) => {
    try {
      const payments = await executeQuery(
        `SELECT PaymentID, BookingID, Amount, PaymentDate, PaymentMethod, TransactionStatus, TransactionReference
         FROM Payments
         WHERE PaymentID = :paymentId`,
        { paymentId }
      );

      if (!payments || payments.length === 0) {
        throw {
          status: 404,
          message: 'Payment not found',
          code: ERROR_CODES.NOT_FOUND
        };
      }

      const payment = payments[0];

      return {
        paymentId: payment.PAYMENTID,
        bookingId: payment.BOOKINGID,
        amount: payment.AMOUNT,
        paymentDate: payment.PAYMENTDATE,
        paymentMethod: payment.PAYMENTMETHOD,
        transactionStatus: payment.TRANSACTIONSTATUS,
        transactionReference: payment.TRANSACTIONREFERENCE
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Get payment details error:', error.message);
      throw {
        status: 500,
        message: 'Failed to retrieve payment',
        code: ERROR_CODES.DATABASE_ERROR
      };
    }
  }
};

module.exports = paymentService;
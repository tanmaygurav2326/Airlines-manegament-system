// ============================================
// FEEDBACK SERVICE - Customer Feedback
// ============================================

const { executeQuery, getConnection } = require('../db');
const { ERROR_CODES } = require('../utils/constants');

const feedbackService = {
  /**
   * Submit customer feedback / complaint / review
   */
  submitFeedback: async ({ name, email, category, rating, message }) => {
    if (!category || !message) {
      throw {
        status: 400,
        message: 'Category and message are required',
        code: ERROR_CODES.INVALID_INPUT
      };
    }

    const numericRating = rating ? parseInt(rating, 10) : 5;
    if (numericRating < 1 || numericRating > 5) {
      throw {
        status: 400,
        message: 'Rating must be between 1 and 5',
        code: ERROR_CODES.INVALID_INPUT
      };
    }

    const connection = await getConnection();
    try {
      await connection.execute(
        `INSERT INTO Feedback (Name, Email, Category, Rating, Message)
         VALUES (:name, :email, :category, :rating, :message)`,
        {
          name: name ? name.trim() : 'Anonymous',
          email: email ? email.trim() : null,
          category: category.trim(),
          rating: numericRating,
          message: message.trim()
        }
      );
      await connection.commit();
      return { success: true, message: 'Thank you for your feedback. We value your thoughts!' };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      await connection.close();
    }
  },

  /**
   * Get all feedback (Staff/Admin only)
   */
  getAllFeedback: async () => {
    return await executeQuery(
      `SELECT FeedbackID, Name, Email, Category, Rating, Message, CreatedAt
       FROM Feedback
       ORDER BY CreatedAt DESC`
    );
  }
};

module.exports = feedbackService;

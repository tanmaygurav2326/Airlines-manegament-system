const express = require('express');
const router = express.Router();
const feedbackService = require('../services/feedbackService');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { USER_ROLES } = require('../utils/constants');

// POST /api/feedback - Public
router.post('/', async (req, res) => {
  try {
    const result = await feedbackService.submitFeedback(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to submit feedback'
    });
  }
});

// GET /api/feedback - Staff and Admin only
router.get('/', authMiddleware, authorize(USER_ROLES.ADMIN, USER_ROLES.STAFF), async (req, res) => {
  try {
    const list = await feedbackService.getAllFeedback();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to retrieve feedback'
    });
  }
});

module.exports = router;

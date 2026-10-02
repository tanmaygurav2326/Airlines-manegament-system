const express = require('express');
const router = express.Router();

// GET /api/currency/rates
// Base currency: INR (Indian Rupee)
router.get('/rates', (req, res) => {
  res.json({
    success: true,
    base: 'INR',
    rates: {
      INR: 1.0,
      USD: 0.012,
      EUR: 0.011,
      GBP: 0.0094,
      AED: 0.044,
      SGD: 0.016,
      JPY: 1.77
    },
    symbols: {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED ',
      SGD: 'S$',
      JPY: '¥'
    },
    updatedAt: new Date().toISOString()
  });
});

module.exports = router;

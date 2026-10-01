const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const baggageController = require('../controllers/baggageController');

router.post('/', authMiddleware, baggageController.createBaggage);
router.get('/:baggageId', authMiddleware, baggageController.getBaggageDetails);
router.get('/tracking/:trackingNumber', baggageController.getBaggageByTracking);
router.patch('/:baggageId/status', authMiddleware, authorize('Staff', 'Admin'), baggageController.updateBaggageStatus);
router.get('/flights/:flightId/baggage', authMiddleware, authorize('Staff', 'Admin'), baggageController.getFlightBaggage);

module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const passengerController = require('../controllers/passengerController');

router.post('/', authMiddleware, passengerController.createPassenger);
router.get('/me', authMiddleware, passengerController.getMyPassenger);
router.put('/me', authMiddleware, passengerController.updateMyPassenger);
router.get('/', authMiddleware, authorize('Admin'), passengerController.listPassengers);
router.get('/:passengerId', authMiddleware, authorize('Admin'), passengerController.getPassengerDetails);

module.exports = router;
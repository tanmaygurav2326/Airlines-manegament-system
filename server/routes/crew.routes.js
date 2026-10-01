const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const crewController = require('../controllers/crewController');

router.post('/flights/:flightId', authMiddleware, authorize('Admin'), crewController.assignCrew);
router.get('/flights/:flightId', crewController.getFlightCrew);
router.get('/user/:userId/flights', authMiddleware, crewController.getCrewFlights);
router.delete('/assignments/:assignmentId', authMiddleware, authorize('Admin'), crewController.removeAssignment);

module.exports = router;
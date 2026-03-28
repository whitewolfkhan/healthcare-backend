const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', appointmentController.getAppointments);
router.post('/', authorize('patient'), appointmentController.createAppointment);
router.get('/slots', appointmentController.getAvailableSlots);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;

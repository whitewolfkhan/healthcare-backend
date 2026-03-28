const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/me', authorize('patient'), patientController.getMyProfile);
router.put('/me', authorize('patient'), patientController.updateMyProfile);
router.get('/dashboard', authorize('patient'), patientController.getDashboardStats);
router.get('/', authorize('doctor', 'admin'), patientController.getAllPatients);
router.get('/:id', authorize('doctor', 'admin'), patientController.getPatientById);

module.exports = router;

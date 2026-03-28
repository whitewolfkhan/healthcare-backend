const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', doctorController.getAllDoctors);
router.get('/me', authorize('doctor'), doctorController.getMyProfile);
router.put('/me', authorize('doctor'), doctorController.updateMyProfile);
router.get('/dashboard', authorize('doctor'), doctorController.getDoctorDashboard);
router.get('/:id', doctorController.getDoctorById);

module.exports = router;

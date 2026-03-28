const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('patient'), medicationController.getMedications);
router.post('/', authorize('patient'), medicationController.createMedication);
router.get('/:id', authorize('patient'), medicationController.getMedicationById);
router.put('/:id', authorize('patient'), medicationController.updateMedication);
router.post('/:id/adherence', authorize('patient'), medicationController.logAdherence);
router.delete('/:id', authorize('patient', 'admin'), medicationController.deleteMedication);

module.exports = router;

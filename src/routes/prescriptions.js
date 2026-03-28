const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', prescriptionController.getPrescriptions);
router.post('/', authorize('doctor'), prescriptionController.createPrescription);
router.get('/:id', prescriptionController.getPrescriptionById);
router.put('/:id', authorize('doctor'), prescriptionController.updatePrescription);
router.delete('/:id', authorize('doctor', 'admin'), prescriptionController.deletePrescription);

module.exports = router;

const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');

router.use(authenticate);
router.get('/', medicalRecordController.getMedicalRecords);
router.post('/', uploadDocument.single('file'), medicalRecordController.createMedicalRecord);
router.get('/:id', medicalRecordController.getMedicalRecordById);
router.put('/:id', authorize('doctor', 'admin'), medicalRecordController.updateMedicalRecord);
router.delete('/:id', authorize('doctor', 'admin'), medicalRecordController.deleteMedicalRecord);

module.exports = router;

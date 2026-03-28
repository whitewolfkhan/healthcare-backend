const express = require('express');
const router = express.Router();
const medicalImageController = require('../controllers/medicalImageController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadMedicalImage } = require('../middleware/upload');

router.use(authenticate);
router.get('/', medicalImageController.getMedicalImages);
router.post('/', uploadMedicalImage.single('image'), medicalImageController.uploadMedicalImage);
router.get('/:id', medicalImageController.getMedicalImageById);
router.patch('/:id/annotations', authorize('doctor'), medicalImageController.updateAnnotations);
router.delete('/:id', authorize('admin'), medicalImageController.deleteMedicalImage);

module.exports = router;

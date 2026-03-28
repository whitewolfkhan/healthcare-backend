const express = require('express');
const router = express.Router();
const labResultController = require('../controllers/labResultController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');

router.use(authenticate);
router.get('/', labResultController.getLabResults);
router.post('/', authorize('doctor', 'admin'), uploadDocument.single('file'), labResultController.createLabResult);
router.get('/:id', labResultController.getLabResultById);
router.put('/:id', authorize('doctor', 'admin'), labResultController.updateLabResult);
router.delete('/:id', authorize('doctor', 'admin'), labResultController.deleteLabResult);

module.exports = router;

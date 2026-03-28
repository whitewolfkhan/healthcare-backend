const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', vitalController.getVitals);
router.post('/', vitalController.createVital);
router.get('/trends', vitalController.getVitalTrends);
router.delete('/:id', vitalController.deleteVital);

module.exports = router;

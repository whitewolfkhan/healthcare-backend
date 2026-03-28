const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getNotifications } = require('../controllers/notificationController');

router.use(authenticate);
router.get('/', getNotifications);

module.exports = router;

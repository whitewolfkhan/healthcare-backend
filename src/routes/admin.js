const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

module.exports = router;

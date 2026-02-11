import express from 'express';
import * as adminController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';
import { getAllMessages } from '../contact/contactController.js';

const router = express.Router();

// Admin protection
router.use(protect, restrictTo('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

router.get('/', protect, getAllMessages);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);

// ✅ Vendors
router.get('/vendors', adminController.getVendors);

router.put('/vendors/:id/approve', async (req, res, next) => {
  try {
    const vendorService = await import('../vendors/service.js');
    const user = await vendorService.approveVendor(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

router.put('/vendors/:id/reject', async (req, res, next) => {
  try {
    const vendorService = await import('../vendors/service.js');
    const user = await vendorService.rejectVendor(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// ✅ Suspend vendor - use the admin service function
router.put('/vendors/:id/suspend', adminController.suspendVendor);

// ✅ Payouts
router.get('/payouts', adminController.getPayouts);
router.put('/payouts/:id/process', adminController.processPayout);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
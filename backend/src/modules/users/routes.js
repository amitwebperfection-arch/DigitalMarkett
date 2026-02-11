import express from 'express';
import * as userController from './controller.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard', userController.getDashboard);
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.get('/orders', userController.getMyOrders);
router.get('/downloads', userController.getMyDownloads);
router.get('/downloads/:licenseId/file', userController.downloadFile);


export default router;
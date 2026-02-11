import express from 'express';
import * as licenseController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/verify', licenseController.verifyLicense);

router.use(protect);
router.get('/my', licenseController.getMyLicenses);

router.put('/revoke/:id', restrictTo('admin'), licenseController.revokeLicense);

export default router;
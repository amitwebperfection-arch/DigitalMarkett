import express from 'express';
import * as settingsController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

// Public GET (for frontend to read site config like name, logo, etc.)
router.get('/', settingsController.getSettings);

// Admin only PUT
router.put('/', protect, restrictTo('admin'), settingsController.updateSettings);

router.get('/robots.txt', settingsController.getRobotsTxt);

export default router;
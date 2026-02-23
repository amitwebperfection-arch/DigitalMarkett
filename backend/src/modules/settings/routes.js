import express from 'express';
import * as settingsController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();


router.get('/', settingsController.getSettings);
router.get('/admin', settingsController.getSettings);
router.put('/', protect, restrictTo('admin'), settingsController.updateSettings);
router.get('/robots.txt', settingsController.getRobotsTxt);



export default router;
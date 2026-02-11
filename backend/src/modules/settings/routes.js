import express from 'express';
import * as settingsController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', settingsController.getSettings);
router.put('/', protect, restrictTo('admin'), settingsController.updateSettings);

export default router;
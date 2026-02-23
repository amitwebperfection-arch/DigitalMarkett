import express from 'express';
import * as payoutController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my', restrictTo('vendor'), payoutController.getMyPayouts);
router.post('/request', restrictTo('vendor'), payoutController.requestPayout); 

router.get('/all', restrictTo('admin'), payoutController.getAllPayouts);
router.put('/:id/process', restrictTo('admin'), payoutController.processPayout);

export default router;
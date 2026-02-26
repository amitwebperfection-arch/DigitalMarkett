import express from 'express';
import { protect } from '../../middlewares/auth.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from './controller.js';

const router = express.Router();

router.use(protect);

router.get('/',              getMyNotifications);
router.get('/unread-count',  getUnreadCount);
router.put('/read-all',      markAllAsRead);
router.put('/:id/read',      markAsRead);

export default router;
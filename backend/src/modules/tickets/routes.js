import express from 'express';
import * as ticketController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', ticketController.createTicket);
router.get('/my', ticketController.getMyTickets);

// ✅ SPECIFIC routes pehle - /:id se UPAR
router.get('/new', (req, res) => res.json({ success: true })); // dummy ya hata do

// Admin routes
router.get('/', restrictTo('admin'), ticketController.getAllTickets);

// ✅ /:id LAST mein rakho
router.get('/:id', ticketController.getTicket);
router.post('/:id/reply', ticketController.replyToTicket);
router.put('/:id/status', restrictTo('admin'), ticketController.updateStatus);

export default router;
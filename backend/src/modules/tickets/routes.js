import express from 'express';
import * as ticketController from './controller.js';
import { protect, restrictTo } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', ticketController.createTicket);
router.get('/my', ticketController.getMyTickets);
router.get('/:id', ticketController.getTicket);
router.post('/:id/reply', ticketController.replyToTicket);

router.put('/:id/status', restrictTo('admin'), ticketController.updateStatus);
router.get('/', restrictTo('admin'), ticketController.getAllTickets);

export default router;
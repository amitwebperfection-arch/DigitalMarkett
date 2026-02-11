import express from 'express';
import { createMessage, getAllMessages } from './contactController.js';

const router = express.Router();

// Public route: submit contact form
router.post('/', createMessage);

// Admin route: get all messages
router.get('/admin/contact', getAllMessages); // protect with isAdmin
// If you don't have auth yet, just use: router.get('/admin/contact', getAllMessages);

export default router;

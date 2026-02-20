import express from 'express';
import { createMessage, getAllMessages } from './contactController.js';

const router = express.Router();

router.post('/', createMessage);

router.get('/admin/contact', getAllMessages); 

export default router;

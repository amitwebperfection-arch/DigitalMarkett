import express from 'express';
import * as walletController from './controller.js';
import { createWalletOrder } from './service.js';
import { protect } from '../../middlewares/auth.js';
import asyncHandler from '../../middlewares/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', walletController.getWallet);
router.post('/add', walletController.addFunds);
router.get('/transactions', walletController.getTransactions);
router.post('/topup/init', protect, walletController.initWalletTopup);


router.post(
  '/wallet/topup',
  asyncHandler(async (req, res) => {
    const { amount, currency } = req.body;
    const userId = req.user._id;

    const { topup, order } = await createWalletOrder(userId, amount, currency);
    res.json({ topup, order });
  })
);


export default router;
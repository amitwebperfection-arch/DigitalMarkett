import mongoose from 'mongoose';

const walletTopupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true }, 
  provider: { type: String, required: true }, 
  providerOrderId: { type: String },
  providerPaymentId: { type: String },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

export default mongoose.model('WalletTopup', walletTopupSchema);

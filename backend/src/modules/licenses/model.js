import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  activations: [{
    domain: String,
    ip: String,
    activatedAt: Date
  }],
  maxActivations: {
    type: Number,
    default: 1
  },
  expiresAt: Date,
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadAt: Date
}, {
  timestamps: true
});

export default mongoose.model('License', licenseSchema);
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Digital Marketplace'
  },
  siteDescription: String,
  siteLogo: String,
  contactEmail: String,
  supportEmail: String,
  commissionRate: {
    type: Number,
    default: 0.20,
    min: 0,
    max: 1
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethods: {
    stripe: {
      enabled: { type: Boolean, default: true }
    },
    razorpay: {
      enabled: { type: Boolean, default: false }
    },
    wallet: {
      enabled: { type: Boolean, default: true }
    }
  },
  emailSettings: {
    orderConfirmation: { type: Boolean, default: true },
    vendorNotification: { type: Boolean, default: true },
    newsletterEnabled: { type: Boolean, default: false }
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Settingsss', settingsSchema);
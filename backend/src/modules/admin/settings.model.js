import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      default: 'My Website'
    },
    siteEmail: {
      type: String,
      required: true
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    currency: {
      type: String,
      default: 'USD'
    },
    payoutThreshold: {
      type: Number,
      default: 50
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
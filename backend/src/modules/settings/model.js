import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Digital Marketplace' },
    siteTagline: { type: String, default: '' },
    siteDescription: { type: String, default: '' },
    siteEmail: { type: String, default: 'admin@example.com' },
    supportEmail: { type: String, default: '' },
    siteLogo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are under maintenance. Be back soon!' },

    commissionRate: { type: Number, default: 10, min: 0, max: 100 },
    currency: { type: String, default: 'USD' },
    currencySymbol: { type: String, default: '$' },
    currencyPosition: { type: String, enum: ['before', 'after'], default: 'before' },
    payoutThreshold: { type: Number, default: 50 },
    autoPayoutEnabled: { type: Boolean, default: false },
    taxEnabled: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    allowGuestCheckout: { type: Boolean, default: true },
    maxCartItems: { type: Number, default: 20 },
    paymentMethods: {
      stripe: {
        enabled: { type: Boolean, default: false },
        publicKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
      },
      razorpay: {
        enabled: { type: Boolean, default: false },
        keyId: { type: String, default: '' },
        keySecret: { type: String, default: '' },
      },
      wallet: {
        enabled: { type: Boolean, default: true },
      },
      cod: {
        enabled: { type: Boolean, default: false },
      },
    },

    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      user: { type: String, default: '' },
      pass: { type: String, default: '' },
      fromName: { type: String, default: 'Digital Marketplace' },
      fromEmail: { type: String, default: '' },
      emailFooterText: { type: String, default: '' },
    },
    emailNotifications: {
      orderConfirmation: { type: Boolean, default: true },
      vendorNotification: { type: Boolean, default: true },
      payoutNotification: { type: Boolean, default: true },
      welcomeEmail: { type: Boolean, default: true },
    },

    vendorSettings: {
      autoApproveVendors: { type: Boolean, default: false },
      autoApproveProducts: { type: Boolean, default: false },
      vendorCanSetDiscount: { type: Boolean, default: true },
      maxProductsPerVendor: { type: Number, default: 100 },
      allowedFileTypes: {
        type: [String],
        default: ['pdf', 'zip', 'rar', 'exe', 'dmg', 'mp4', 'mp3'],
      },
      maxFileSizeMB: { type: Number, default: 500 },
    },

    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      googleAnalyticsId: { type: String, default: '' },
      facebookPixelId: { type: String, default: '' },
      robotsTxt: { type: String, default: 'User-agent: *\nAllow: /' },
      canonicalUrl: { type: String, default: '' },
    },

    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      github: { type: String, default: '' },
    },

    security: {
      maxLoginAttempts: { type: Number, default: 5 },
      sessionTimeoutMinutes: { type: Number, default: 60 },
      twoFactorAuthEnabled: { type: Boolean, default: false },
      allowedAdminIPs: { type: [String], default: [] },
    },

    appearance: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#8B5CF6' },
      darkModeEnabled: { type: Boolean, default: false },
      customCSS: { type: String, default: '' },
      footerText: { type: String, default: '' },
      copyrightText: { type: String, default: '© 2025 Digital Marketplace. All rights reserved.' },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
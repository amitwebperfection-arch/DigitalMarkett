import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'vendor', 'user'],
      required: true,
    },

    // Content
    title: { type: String, required: true },
    message: { type: String, required: true },

    // Type — role ke hisaab se
    type: {
      type: String,
      enum: [
        // Admin notifications
        'new_order',          // naya order aaya
        'new_vendor_apply',   // vendor ne apply kiya
        'new_ticket',         // naya support ticket
        'new_contact',        // contact form submit

        // Vendor notifications
        'product_approved',   // product approve hua
        'product_rejected',   // product reject hua
        'payout_processed',   // payout complete hua
        'payout_rejected',    // payout reject hua
        'ticket_reply',       // ticket pe reply

        // User notifications
        'order_completed',    // order complete hua
        'order_status',       // order status update
        'ticket_reply_user',  // ticket pe reply (user)
      ],
      required: true,
    },

    // Optional link — click pe redirect
    link: { type: String, default: null },

    // Read status
    isRead: { type: Boolean, default: false, index: true },

    // Related document (optional)
    refModel: {
      type: String,
      enum: ['Order', 'Product', 'Ticket', 'Payout', null],
      default: null,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
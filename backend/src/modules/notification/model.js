import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
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

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: [
        'new_order',          
        'new_vendor_apply',   
        'new_ticket',         
        'new_contact',        
        'product_approved',   
        'product_rejected',   
        'payout_processed',   
        'payout_rejected',    
        'ticket_reply',       
        'order_completed',    
        'order_status',       
        'ticket_reply_user',  
      ],
      required: true,
    },

    link: { type: String, default: null },

    isRead: { type: Boolean, default: false, index: true },

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

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
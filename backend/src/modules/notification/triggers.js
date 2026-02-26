import {
  createNotification,
  notifyAllAdmins,
} from "./service.js";

export const onNewOrder = async (order, userName) => {
  await notifyAllAdmins({
    title: 'New Order Received',
    message: `${userName} placed a new order. Total: $${order.total?.toFixed(2)}`,
    type: 'new_order',
    link: '/admin/orders',
    refModel: 'Order',
    refId: order._id,
  });
};

export const onOrderCompleted = async (order) => {
  await createNotification({
    recipientId: order.user,
    recipientRole: 'user',
    title: 'Order Completed!',
    message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been successfully completed.`,
    type: 'order_completed',
    link: '/user/orders',
    refModel: 'Order',
    refId: order._id,
  });
};

export const onProductApproved = async (product) => {
  await createNotification({
    recipientId: product.vendor,
    recipientRole: 'vendor',
    title: 'Product Approved ✅',
    message: `Your product "${product.title}" has been approved and is now live.`,
    type: 'product_approved',
    link: '/vendor/products',
    refModel: 'Product',
    refId: product._id,
  });
};

export const onProductRejected = async (product) => {
  await createNotification({
    recipientId: product.vendor,
    recipientRole: 'vendor',
    title: 'Product Rejected ❌',
    message: `Your product "${product.title}" has been rejected. Please review and update it.`,
    type: 'product_rejected',
    link: '/vendor/products',
    refModel: 'Product',
    refId: product._id,
  });
};

export const onVendorApply = async (vendor) => {
  await notifyAllAdmins({
    title: 'New Vendor Application',
    message: `${vendor.name} has applied to become a vendor. Please review the application.`,
    type: 'new_vendor_apply',
    link: '/admin/vendors',
    refModel: null,
    refId: vendor._id,
  });
};

export const onPayoutProcessed = async (payout) => {
  await createNotification({
    recipientId: payout.vendor,
    recipientRole: 'vendor',
    title: 'Payout Processed ✅',
    message: `Your payout of $${payout.amount?.toFixed(2)} has been successfully processed.`,
    type: 'payout_processed',
    link: '/vendor/payouts',
    refModel: 'Payout',
    refId: payout._id,
  });
};

export const onPayoutRejected = async (payout) => {
  await createNotification({
    recipientId: payout.vendor,
    recipientRole: 'vendor',
    title: 'Payout Rejected',
    message: `Your payout of $${payout.amount?.toFixed(2)} has been rejected.`,
    type: 'payout_rejected',
    link: '/vendor/payouts',
    refModel: 'Payout',
    refId: payout._id,
  });
};

export const onNewTicket = async (ticket, userName) => {
  await notifyAllAdmins({
    title: 'New Support Ticket',
    message: `${userName} created a new support ticket: "${ticket.subject}"`,
    type: 'new_ticket',
    link: `/admin/tickets/${ticket._id}`,
    refModel: 'Ticket',
    refId: ticket._id,
  });
};

export const onTicketReply = async (ticket) => {
  const isVendor = ticket.user?.role === 'vendor';
  await createNotification({
    recipientId: ticket.user._id || ticket.user,
    recipientRole: isVendor ? 'vendor' : 'user',
    title: 'New Ticket Reply',
    message: `You have received a new reply on your ticket "${ticket.subject}".`,
    type: isVendor ? 'ticket_reply' : 'ticket_reply_user',
    link: isVendor
      ? `/vendor/tickets/${ticket._id}`
      : `/user/tickets/${ticket._id}`,
    refModel: 'Ticket',
    refId: ticket._id,
  });
};.
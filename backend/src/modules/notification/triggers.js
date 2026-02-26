import {
  createNotification,
  notifyAllAdmins,
} from "./service.js";

export const onNewOrder = async (order, userName) => {
  await notifyAllAdmins({
    title: 'New Order Received',
    message: `${userName} ne ek naya order place kiya. Total: $${order.total?.toFixed(2)}`,
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
    message: `Aapka order #${order._id.toString().slice(-8).toUpperCase()} successfully complete ho gaya.`,
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
    message: `Aapka product "${product.title}" approve ho gaya aur ab live hai.`,
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
    message: `Aapka product "${product.title}" reject ho gaya. Please review karo.`,
    type: 'product_rejected',
    link: '/vendor/products',
    refModel: 'Product',
    refId: product._id,
  });
};

export const onVendorApply = async (vendor) => {
  await notifyAllAdmins({
    title: 'New Vendor Application',
    message: `${vendor.name} ne vendor ke liye apply kiya hai. Review karo.`,
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
    message: `Aapka $${payout.amount?.toFixed(2)} ka payout successfully process ho gaya.`,
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
    message: `Aapka $${payout.amount?.toFixed(2)} ka payout reject ho gaya.`,
    type: 'payout_rejected',
    link: '/vendor/payouts',
    refModel: 'Payout',
    refId: payout._id,
  });
};

export const onNewTicket = async (ticket, userName) => {
  await notifyAllAdmins({
    title: 'New Support Ticket',
    message: `${userName} ne ek naya ticket create kiya: "${ticket.subject}"`,
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
    title: 'Ticket Reply Received',
    message: `Aapke ticket "${ticket.subject}" pe ek naya reply aaya hai.`,
    type: isVendor ? 'ticket_reply' : 'ticket_reply_user',
    link: isVendor
      ? `/vendor/tickets/${ticket._id}`
      : `/user/tickets/${ticket._id}`,
    refModel: 'Ticket',
    refId: ticket._id,
  });
};
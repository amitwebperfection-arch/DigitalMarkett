import mongoose from 'mongoose';
import Order from './model.js';
import Product from '../products/model.js';
import Wallet from '../wallet/model.js';
import { COMMISSION_RATE } from '../../config/env.js';
import { sendEmail } from '../../config/mail.js';
import Settings from '../settings/model.js';

// Generate a unique license key
const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  
  let key = '';
  for (let i = 0; i < segments; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return key;
};

// ─── Send Order Confirmation Email to User ────────────────────
const sendOrderConfirmationEmail = async (order, userEmail, userName) => {
  try {
    const settings = await Settings.findOne().lean();
    const currencySymbol = settings?.currencySymbol || '$';
    const siteName = settings?.siteName || 'Digital Marketplace';

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${currencySymbol}${item.price.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
              color: white; width: 60px; height: 60px; border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 15px;">
              ✓
            </div>
            <h2 style="color: #1f2937; margin: 0;">Order Confirmed!</h2>
          </div>

          <p style="color: #4b5563; font-size: 16px; margin-bottom: 10px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Thank you for your purchase! Your order has been confirmed and is being processed.
          </p>
          
          <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Order ID:</strong></p>
            <p style="margin: 5px 0 0 0; color: #3b82f6; font-size: 18px; font-weight: bold;">#${order._id.toString().slice(-8).toUpperCase()}</p>
          </div>

          <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; font-size: 14px;">Product</th>
                <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; font-size: 14px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 14px;">Subtotal:</span>
              <span style="color: #1f2937; font-weight: 500;">${currencySymbol}${order.subtotal.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #10b981; font-size: 14px;">Discount ${order.appliedCoupon?.code ? `(${order.appliedCoupon.code})` : ''}:</span>
                <span style="color: #10b981; font-weight: 500;">-${currencySymbol}${order.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #e5e7eb;">
              <span style="color: #1f2937; font-size: 18px; font-weight: bold;">Total:</span>
              <span style="color: #3b82f6; font-size: 20px; font-weight: bold;">${currencySymbol}${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <h4 style="color: #1f2937; margin-top: 0; margin-bottom: 10px; font-size: 16px;">Shipping Address</h4>
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              You will receive your license keys and download links once the payment is confirmed.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>This is an automated message from ${siteName}</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject: `Order Confirmation - #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
      type: 'orderConfirmation'
    });
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
  }
};

// ─── Send New Order Notification to Admin ─────────────────────
const sendAdminOrderNotification = async (order, userEmail, userName) => {
  try {
    const settings = await Settings.findOne().lean();
    const adminEmail = settings?.siteEmail;
    const currencySymbol = settings?.currencySymbol || '$';
    const siteName = settings?.siteName || 'Digital Marketplace';

    if (!adminEmail) {
      console.log('⚠️ Admin email not configured in settings');
      return;
    }

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937;">
          ${currencySymbol}${item.price.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">🎉 New Order Received!</h2>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 14px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Customer Details</h3>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #4b5563; font-size: 14px; margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
            <p style="color: #4b5563; font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="color: #4b5563; font-size: 14px; margin: 5px 0;"><strong>Phone:</strong> ${order.personalDetails.phone}</p>
          </div>

          <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; color: #6b7280; font-size: 14px; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 10px; text-align: right; color: #6b7280; font-size: 14px; border-bottom: 2px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 14px;">Subtotal:</span>
              <span style="color: #1f2937; font-weight: 500;">${currencySymbol}${order.subtotal.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #10b981; font-size: 14px;">Discount:</span>
                <span style="color: #10b981; font-weight: 500;">-${currencySymbol}${order.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e5e7eb;">
              <span style="color: #1f2937; font-size: 16px; font-weight: bold;">Total:</span>
              <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">${currencySymbol}${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Action Required:</strong> Please review and process this order in the admin panel.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>This is an automated notification from ${siteName}</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `🛒 New Order #${order._id.toString().slice(-8).toUpperCase()} - ${currencySymbol}${order.total.toFixed(2)}`,
      html,
      type: 'orderConfirmation' // Using same notification type
    });
  } catch (error) {
    console.error('❌ Error sending admin order notification:', error);
  }
};

export const createOrder = async (
  userId, 
  items, 
  paymentMethod, 
  couponId = null,
  couponCode = null,
  personalDetails,
  shippingAddress
) => {
  let subtotal = 0;
  const orderItems = [];

  // Validate required fields
  if (!personalDetails || !personalDetails.firstName || !personalDetails.email) {
    throw new Error('Personal details are required');
  }
  
  if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city) {
    throw new Error('Shipping address is required');
  }

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const price = product.salePrice || product.price;
    const platformFee = price * COMMISSION_RATE;
    const vendorEarning = price - platformFee;

    subtotal += price;

    orderItems.push({
      product: product._id,
      title: product.title,
      price,
      vendorEarning,
      platformFee
    });
  }

  let discount = 0;
  let appliedCouponData = null;

  if (couponId) {
    const Coupon = (await import('../coupons/model.js')).default;
    const coupon = await Coupon.findById(couponId);
    
    if (coupon && coupon.isActive && new Date() < coupon.expiresAt) {
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }

      appliedCouponData = {
        couponId: coupon._id,
        code: coupon.code,
        discountAmount: discount,
        type: coupon.type,
        value: coupon.value
      };
    }
  }

  const total = subtotal - discount;

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    personalDetails: {
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      email: personalDetails.email,
      phone: personalDetails.phone
    },
    shippingAddress: {
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country
    },
    subtotal,
    discount,
    total,
    paymentMethod,
    coupon: couponId,
    appliedCoupon: appliedCouponData,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // ✅ Increment salesCount for each product in the order
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.salesCount += 1; // for digital downloads, quantity is 1
      await product.save();
    }
  }

  // ✅ Send emails (async, don't block order creation)
  const userName = `${personalDetails.firstName} ${personalDetails.lastName}`;
  const userEmail = personalDetails.email;

  // Send order confirmation to user
  sendOrderConfirmationEmail(order, userEmail, userName).catch(err => {
    console.error('Failed to send order confirmation:', err);
  });

  // Send notification to admin
  sendAdminOrderNotification(order, userEmail, userName).catch(err => {
    console.error('Failed to send admin notification:', err);
  });

  return order;
};

export const completeOrder = async (orderId, paymentId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId)
      .populate('items.product')
      .session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'completed') {
      throw new Error('Order already completed');
    }

    order.status = 'completed'; // Set to processing instead of completed
    order.paymentStatus = 'completed';
    order.paymentId = paymentId;
    await order.save({ session });

    const License = (await import('../licenses/model.js')).default;
    const vendorTotals = {};

    for (const item of order.items) {
      const vendorId = item.product.vendor.toString();
      vendorTotals[vendorId] = (vendorTotals[vendorId] || 0) + item.vendorEarning;

      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { downloads: 1 } },
        { session }
      );

      await License.create([{
        user: order.user,
        product: item.product._id,
        order: order._id,
        licenseKey: generateLicenseKey(),
        status: 'active',
        maxActivations: 1,
        activations: [],
        downloadCount: 0,
        expiresAt: null
      }], { session });
    }

    for (const vendorId in vendorTotals) {
      await Wallet.findOneAndUpdate(
        { user: vendorId },
        {
          $inc: { balance: vendorTotals[vendorId] },
          $push: {
            transactions: {
              type: 'credit',
              amount: vendorTotals[vendorId],
              description: 'Order earning',
              reference: order._id.toString(),
              createdAt: new Date()
            }
          }
        },
        { upsert: true, session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return order;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Error completing order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId, page = 1, limit = 10) => {
  const orders = await Order.find({ user: userId })
    .populate('items.product', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments({ user: userId });

  return { orders, total, page, pages: Math.ceil(total / limit) };
};

export const getAdminOrders = async (page = 1, limit = 10, filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments(query);

  return { orders, total, page, pages: Math.ceil(total / limit) };
};

export const getVendorOrders = async (vendorId, page = 1, limit = 10) => {
  const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
  const productIds = vendorProducts.map(p => p._id);

  const orders = await Order.find({ 
    'items.product': { $in: productIds },
    status: { $in: ['processing', 'shipped', 'delivered', 'completed'] }
  })
    .populate('user', 'name email')
    .populate('items.product', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments({ 
    'items.product': { $in: productIds },
    status: { $in: ['processing', 'shipped', 'delivered', 'completed'] }
  });

  return { orders, total, page, pages: Math.ceil(total / limit) };
};
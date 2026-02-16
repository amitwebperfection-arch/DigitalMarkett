import mongoose from 'mongoose';
import Order from './model.js';
import Product from '../products/model.js';
import Wallet from '../wallet/model.js';
import { COMMISSION_RATE } from '../../config/env.js';

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

  // After order creation
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
import Coupon from './model.js';
import User from '../users/model.js';
import Order from '../orders/model.js';

export const applyCoupon = async (code, cartTotal, productIds, userId) => {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiresAt: { $gt: new Date() }
  });

  if (!coupon) throw new Error('Invalid or expired coupon');

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }

  const ordersCount = await Order.countDocuments({ user: userId });

  if (coupon.usedBy?.includes(userId)) {
    throw new Error('You have already used this coupon');
  }

  if (coupon.rules?.newUser && ordersCount > 0) {
    throw new Error('Coupon only for new users');
  }

  if (coupon.rules?.minOrders && ordersCount < coupon.rules.minOrders) {
    throw new Error(`Coupon valid after ${coupon.rules.minOrders} orders`);
  }

  if (coupon.rules?.minCartAmount && cartTotal < coupon.rules.minCartAmount) {
    throw new Error(`Minimum cart value $${coupon.rules.minCartAmount}`);
  }

  if (coupon.rules?.inactiveDays) {
    const lastOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });

    if (lastOrder) {
      const days =
        (Date.now() - new Date(lastOrder.createdAt)) / (1000 * 60 * 60 * 24);

      if (days < coupon.rules.inactiveDays) {
        throw new Error('Coupon only for inactive users');
      }
    }
  }

  if (coupon.applicableProducts.length > 0) {
    const hasApplicableProduct = productIds.some(id =>
      coupon.applicableProducts.map(p => p.toString()).includes(id)
    );
    if (!hasApplicableProduct) {
      throw new Error('Coupon not applicable to selected products');
    }
  }

  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  return {
    couponId: coupon._id,
    code: coupon.code,
    discount: Math.min(discount, cartTotal),
    finalTotal: Math.max(cartTotal - discount, 0)
  };
};

export const getActiveCoupons = async (userId) => {
  const now = new Date();
  
  const coupons = await Coupon.find({
    isActive: true,
    expiresAt: { $gt: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ]
  }).select('-createdBy -__v');

  const ordersCount = await Order.countDocuments({ user: userId });
  const lastOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });

  const eligibleCoupons = coupons.filter(coupon => {
    if (coupon.rules?.newUser && ordersCount > 0) return false;
    if (coupon.rules?.minOrders && ordersCount < coupon.rules.minOrders) return false;
    if (coupon.rules?.inactiveDays && lastOrder) {
      const daysSinceLastOrder = (Date.now() - new Date(lastOrder.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastOrder < coupon.rules.inactiveDays) return false;
    }

    return true;
  });

  return eligibleCoupons;
};


export const createCoupon = async (couponData, adminId) => {
  const coupon = await Coupon.create({
    ...couponData,
    code: couponData.code.toUpperCase(),
    createdBy: adminId
  });

  const User = (await import('../users/model.js')).default;
  const { sendEmail: mailSend } = await import('../../config/mail.js');

  const users = await User.find({ 
    isActive: true, 
    isVerified: true,
    role: 'user'
  }).select('email name _id');

  const discountText = coupon.type === 'percentage' 
    ? `${coupon.value}% OFF` 
    : `$${coupon.value} OFF`;
  const expiryDate = new Date(coupon.expiresAt).toLocaleDateString('en-IN');

  const eligibleUsers = [];

  for (const user of users) {
    const ordersCount = await Order.countDocuments({ user: user._id });

    if (coupon.rules?.newUser && ordersCount > 0) continue;

    if (coupon.rules?.minOrders && ordersCount < coupon.rules.minOrders) continue;

    if (coupon.rules?.inactiveDays) {
      const lastOrder = await Order.findOne({ user: user._id }).sort({ createdAt: -1 });
      if (lastOrder) {
        const days = (Date.now() - new Date(lastOrder.createdAt)) / (1000 * 60 * 60 * 24);
        if (days < coupon.rules.inactiveDays) continue;
      }
    }
    if (coupon.usedBy?.includes(user._id.toString())) continue;

    eligibleUsers.push(user);
  }
  const batchSize = 50;
  for (let i = 0; i < eligibleUsers.length; i += batchSize) {
    const batch = eligibleUsers.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(user =>
      mailSend({
        to: user.email,
        subject: `🎉 Special Coupon For You - ${coupon.code}`,
        html: `
          <h2>You have a special offer!</h2>
          <p>Hi <b>${user.name}</b>,</p>
          <div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
            <h1 style="color:#3b82f6;letter-spacing:6px;margin:0;">${coupon.code}</h1>
            <p style="margin:8px 0 0;font-size:18px;font-weight:bold;">${discountText}</p>
          </div>
          ${coupon.rules?.minCartAmount ? `<p>Minimum order: $${coupon.rules.minCartAmount}</p>` : ''}
          <p><b>Expires:</b> ${expiryDate}</p>
        `
      })
    ));
  }

  return coupon;
};

export const getCoupons = async (page = 1, limit = 10) => {
  const coupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Coupon.countDocuments();

  return { coupons, total, page, pages: Math.ceil(total / limit) };
};

export const incrementCouponUsage = async (couponId, userId) => {
  await Coupon.findByIdAndUpdate(couponId, { 
    $inc: { usedCount: 1 },
    $addToSet: { usedBy: userId } 
  });
};

export const deleteCoupon = async (couponId) => {
  return await Coupon.findByIdAndDelete(couponId);
};
import User from '../auth/model.js';
import Product from '../products/model.js';
import Order from '../orders/model.js';
import Review from '../reviews/model.js';
import Wallet from '../wallet/model.js';
import Payout from '../payouts/model.js';
import mongoose from 'mongoose';
import { sendEmail } from '../../config/mail.js';

export const applyForVendor = async (userId, businessName, description) => {
  const user = await User.findById(userId);

  if (user.role === 'vendor') {
    throw new Error('Already a vendor');
  }

  if (user.vendorInfo && user.vendorInfo.status === 'pending') {
    throw new Error('Application already pending');
  }

  user.vendorInfo = {
    businessName,
    description,
    status: 'pending',
    appliedAt: new Date()
  };

  await user.save();
  return user;
};

export const getVendorDashboard = async (vendorId) => {
  const user = await User.findById(vendorId)
    .select('bankDetails hasBankDetails');
  const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

  const totalProducts = await Product.countDocuments({ vendor: vendorId });
  const activeProducts = await Product.countDocuments({ vendor: vendorId, status: 'approved' });

  const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
  const productIds = vendorProducts.map(p => p._id);

  const earningsAgg = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    { 
      $match: { 
        'productInfo.vendor': vendorObjectId, 
        status: 'completed' 
      } 
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$items.vendorEarning' },
        count: { $sum: 1 }
      }
    }
  ]);

  const totalEarnings = earningsAgg[0]?.total || 0;
  const totalSales = earningsAgg[0]?.count || 0;

  const downloadStats = await Product.aggregate([
    { $match: { vendor: vendorObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: '$downloads' }
      }
    }
  ]);
  const totalDownloads = downloadStats[0]?.total || 0;

  const ratingStats = await Review.aggregate([
    { $match: { product: { $in: productIds } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);
  const averageRating = ratingStats[0]?.avgRating || 0;
  const totalReviews = ratingStats[0]?.count || 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const earningsChart = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'completed' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    { $match: { 'productInfo.vendor': vendorObjectId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        earnings: { $sum: '$items.vendorEarning' }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        earnings: 1,
        _id: 0
      }
    }
  ]);

  const recentOrders = await Order.find({
    'items.product': { $in: productIds },
    status: 'completed'
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentSales = recentOrders.map(order => {
    const vendorItems = order.items.filter(item => 
      productIds.some(id => id.equals(item.product))
    );
    const vendorEarning = vendorItems.reduce((sum, item) => sum + (item.vendorEarning || 0), 0);

    return {
      _id: order._id,
      customer: { name: order.user?.name || 'Unknown' },
      amount: vendorEarning,
      itemCount: vendorItems.length,
      date: order.createdAt,
      status: order.status
    };
  });

  const topProducts = await Product.find({ vendor: vendorId, status: 'approved' })
    .sort({ downloads: -1 })
    .limit(5)
    .select('title thumbnail price downloads rating')
    .lean();

  const topProductsWithEarnings = await Promise.all(
    topProducts.map(async (product) => {
      const earnings = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.product': product._id, status: 'completed' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$items.vendorEarning' }
          }
        }
      ]);

      return {
        ...product,
        totalEarnings: earnings[0]?.total || 0,
        rating: product.rating?.average || 0
      };
    })
  );

  const categoryDist = await Product.aggregate([
    { $match: { vendor: vendorObjectId } },
    {
      $group: {
        _id: '$category',
        value: { $sum: 1 }
      }
    },
    {
      $project: {
        name: '$_id',
        value: 1,
        _id: 0
      }
    }
  ]);

  const pendingPayoutsAgg = await Payout.aggregate([
    { $match: { vendor: vendorObjectId, status: 'pending' } },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  const pendingPayouts = pendingPayoutsAgg[0]?.total || 0;

  return {
    bankDetails: user.bankDetails,
    hasBankDetails: user.hasBankDetails,
    stats: {
      totalProducts,
      activeProducts,
      totalEarnings,
      totalSales,
      totalDownloads,
      averageRating,
      totalReviews,
      revenueChange: 12.5,
      salesChange: 8.3,
      downloadsChange: 15.2
    },
    earningsChart,
    recentSales,
    topProducts: topProductsWithEarnings,
    categoryDistribution: categoryDist,
    pendingPayouts
  };
};

export const getVendorEarnings = async (vendorId, page = 1, limit = 20) => {
  const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

  const earnings = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    { 
      $match: { 
        'productInfo.vendor': vendorObjectId, 
        status: 'completed' 
      } 
    },
    {
      $project: {
        orderId: '$_id',
        productName: '$productInfo.title',
        amount: '$items.vendorEarning',
        date: '$createdAt'
      }
    },
    { $sort: { date: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  ]);

  const totalCount = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    { 
      $match: { 
        'productInfo.vendor': vendorObjectId, 
        status: 'completed' 
      } 
    },
    { $count: 'total' }
  ]);

  const total = totalCount[0]?.total || 0;

  return {
    earnings,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

export const getVendorReviews = async (vendorId, page = 1, limit = 10) => {
  const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
  const productIds = vendorProducts.map(p => p._id);

  const reviews = await Review.find({ product: { $in: productIds } })
    .populate('user', 'name avatar')
    .populate('product', 'title thumbnail')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments({ product: { $in: productIds } });

  const stats = await Review.aggregate([
    { $match: { product: { $in: productIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        fiveStarCount: {
          $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
        }
      }
    }
  ]);

  return {
    reviews,
    averageRating: stats[0]?.averageRating || 0,
    totalReviews: stats[0]?.totalReviews || 0,
    fiveStarCount: stats[0]?.fiveStarCount || 0,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const getVendorPayouts = async (userId, page, limit) => {
  const user = await User.findById(userId).select('bankDetails hasBankDetails');
  const wallet = await Wallet.findOne({ user: userId });

  const payouts = await Payout.find({ vendor: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Payout.countDocuments({ vendor: userId });

  return {
    payouts,
    totalPages: Math.ceil(total / limit),
    availableBalance: wallet?.balance || 0,
    hasBankDetails: user?.hasBankDetails || false
  };
};

export const approveVendor = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.vendorInfo) {
    throw new Error('No vendor application found');
  }

  if (user.vendorInfo.status === 'approved' && user.role === 'vendor') {
    return user;
  }

  user.role = 'vendor';
  user.vendorInfo.status = 'approved';
  user.vendorInfo.approvedAt = new Date();
  
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: 'Vendor Application Approved! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #059669; margin: 0;">🎉 Congratulations!</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 15px;">Hi ${user.name},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Great news! Your vendor application for <strong>${user.vendorInfo.businessName}</strong> has been approved!
            </p>
            
            <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #065f46; margin: 0; font-weight: 500;">You can now:</p>
              <ul style="color: #065f46; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Upload and sell digital products</li>
                <li>Manage your inventory</li>
                <li>Track your earnings in real-time</li>
                <li>Request and receive payouts</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/vendor/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Go to Vendor Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
              Happy selling! 🚀
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      text: `Congratulations ${user.name}!\n\nYour vendor application for "${user.vendorInfo.businessName}" has been approved!\n\nYou can now:\n- Upload and sell digital products\n- Manage your inventory\n- Track your earnings\n- Receive payouts\n\nGet started: ${process.env.FRONTEND_URL}/vendor/dashboard`
    });
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }

  return user;
};

export const rejectVendor = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!user.vendorInfo) {
    throw new Error('No vendor application found');
  }

  user.vendorInfo.status = 'rejected';
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: 'Vendor Application Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Dear ${user.name},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in becoming a vendor on our platform.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              After careful review, we regret to inform you that your vendor application for <strong>${user.vendorInfo.businessName}</strong> has not been approved at this time.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0 0 10px 0; font-weight: 500;">This decision may be due to:</p>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Incomplete business information</li>
                <li>Products not meeting our quality guidelines</li>
                <li>Other verification requirements</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              You're welcome to reapply in the future with updated information that addresses these concerns.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you have questions about this decision or need clarification, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      text: `Dear ${user.name},\n\nThank you for your interest in becoming a vendor.\n\nYour vendor application for "${user.vendorInfo.businessName}" has not been approved at this time.\n\nYou're welcome to reapply in the future with updated information.\n\nIf you have questions, please contact our support team.`
    });
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
  }

  return user;
};

export const calculateVendorBalance = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId });
  return wallet?.balance || 0;
};
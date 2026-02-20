import User from '../auth/model.js';
import Product from '../products/model.js';
import Order from '../orders/model.js';
import Payout from '../payouts/model.js';
import Review from '../reviews/model.js';
import mongoose from 'mongoose';

const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const startOfDay = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const endOfDay = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalVendors = await User.countDocuments({ role: 'vendor' });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments({ status: 'completed' });

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' }
      }
    }
  ]);

  const totalRevenueAgg = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const completedToday = await Order.countDocuments({
    status: 'completed',
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  const pendingApprovals = await Product.countDocuments({ status: 'pending' });

  const pendingPayoutsAgg = await Payout.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const sevenDaysAgo = getDaysAgo(7);
  const revenueChart = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        name: { $substr: ['$_id', 5, -1] }, 
        revenue: 1,
        orders: 1,
        _id: 0
      }
    }
  ]);

  const categoryChart = await Product.aggregate([
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

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  const categoryChartWithColors = categoryChart.map((cat, idx) => ({
    ...cat,
    color: COLORS[idx % COLORS.length]
  }));

  const orderStatusChart = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  const daysMap = {};
  orderStatusChart.forEach(item => {
    const day = item._id.date.substr(5); 
    if (!daysMap[day]) {
      daysMap[day] = { name: day, pending: 0, processing: 0, completed: 0, cancelled: 0 };
    }
    daysMap[day][item._id.status] = item.count;
  });
  const orderStatusChartFormatted = Object.values(daysMap);

  const topProducts = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        sales: { $sum: 1 },
        revenue: { $sum: '$items.price' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        name: '$productInfo.title',
        sales: 1,
        revenue: 1,
        _id: 0
      }
    }
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(2)
    .select('_id createdAt')
    .lean();

  const recentUsers = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .limit(2)
    .select('name createdAt')
    .lean();

  const recentProducts = await Product.find({ status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(1)
    .select('title createdAt')
    .lean();

  const recentPayouts = await Payout.find({ status: 'completed' })
    .sort({ processedAt: -1 })
    .limit(1)
    .select('amount processedAt')
    .lean();

  const recentVendors = await User.find({ role: 'vendor' })
    .sort({ createdAt: -1 })
    .limit(1)
    .select('createdAt')
    .lean();

  const recentActivity = [];

  recentOrders.forEach(order => {
    recentActivity.push({
      type: 'order',
      message: `New order #${order._id.toString().slice(-6)} placed`,
      time: getTimeAgo(order.createdAt),
      icon: 'ShoppingCart'
    });
  });

  recentUsers.forEach(user => {
    recentActivity.push({
      type: 'user',
      message: `New user registered: ${user.name}`,
      time: getTimeAgo(user.createdAt),
      icon: 'Users'
    });
  });

  recentProducts.forEach(product => {
    recentActivity.push({
      type: 'product',
      message: `Product "${product.title}" approved`,
      time: getTimeAgo(product.createdAt),
      icon: 'Package'
    });
  });

  recentPayouts.forEach(payout => {
    recentActivity.push({
      type: 'payout',
      message: `Payout of $${payout.amount} processed`,
      time: getTimeAgo(payout.processedAt),
      icon: 'DollarSign'
    });
  });

  recentVendors.forEach(vendor => {
    recentActivity.push({
      type: 'vendor',
      message: 'New vendor application received',
      time: getTimeAgo(vendor.createdAt),
      icon: 'Users'
    });
  });

  recentActivity.sort((a, b) => {
    const timeA = parseTimeAgo(a.time);
    const timeB = parseTimeAgo(b.time);
    return timeA - timeB;
  });

  return {
    stats: {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingOrders,
      completedToday,
      pendingApprovals,
      pendingPayouts: pendingPayoutsAgg[0]?.total || 0,
      revenueTrend: '+12.5%',
      ordersTrend: '+8.3%',
      productsTrend: '+5.2%',
      usersTrend: '+15.7%'
    },
    revenueChart: revenueChart.length > 0 ? revenueChart : [],
    categoryChart: categoryChartWithColors,
    orderStatusChart: orderStatusChartFormatted.length > 0 ? orderStatusChartFormatted : [],
    topProducts: topProducts.length > 0 ? topProducts : [],
    recentActivity: recentActivity.slice(0, 5)
  };
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' min' + (interval > 1 ? 's' : '') + ' ago';
  
  return Math.floor(seconds) + ' sec' + (seconds > 1 ? 's' : '') + ' ago';
}

function parseTimeAgo(timeStr) {
  const match = timeStr.match(/(\d+)\s+(sec|min|hour|day|month|year)/);
  if (!match) return 999999;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    sec: 1,
    min: 60,
    hour: 3600,
    day: 86400,
    month: 2592000,
    year: 31536000
  };
  
  return value * multipliers[unit];
}

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  } : {};

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(query);

  return { users, total, page, pages: Math.ceil(total / limit) };
};

export const banUser = async (userId) => {
  return await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
};

export const unbanUser = async (userId) => {
  return await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
};

export const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

export const getAllVendors = async (page = 1, limit = 10, search = '') => {
  const query = { role: 'vendor' };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const vendors = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const vendorsWithStats = await Promise.all(
    vendors.map(async (vendor) => {
      const productsCount = await Product.countDocuments({ vendor: vendor._id });
      
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
            'productInfo.vendor': vendor._id,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$items.vendorEarning' }
          }
        }
      ]);

      return {
        ...vendor,
        productsCount,
        totalEarnings: earningsAgg[0]?.total || 0
      };
    })
  );

  const total = await User.countDocuments(query);

  return { 
    vendors: vendorsWithStats, 
    total, 
    page, 
    pages: Math.ceil(total / limit) 
  };
};

export const approveVendor = async (vendorId) => {
  return await User.findByIdAndUpdate(
    vendorId,
    { isActive: true },
    { new: true }
  );
};

export const suspendVendor = async (vendorId) => {
  return await User.findByIdAndUpdate(
    vendorId,
    { isActive: false },
    { new: true }
  );
};

export const getAllPayouts = async (page = 1, limit = 10, status = null) => {
  const query = status ? { status } : {};

  const payouts = await Payout.find(query)
    .populate('vendor', 'name email vendorInfo.businessName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Payout.countDocuments(query);

  const stats = await Payout.aggregate([
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' }
      }
    }
  ]);

  const statsMap = {
    pending: 0,
    completed: 0,
    total: 0
  };

  stats.forEach(stat => {
    statsMap[stat._id] = stat.total;
    statsMap.total += stat.total;
  });

  return {
    payouts,
    stats: statsMap,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const processPayout = async (payoutId) => {
  const payout = await Payout.findById(payoutId);

  if (!payout) {
    throw new Error('Payout not found');
  }

  if (payout.status !== 'pending') {
    throw new Error('Payout already processed');
  }

  const Wallet = (await import('../wallet/model.js')).default;
  
  const wallet = await Wallet.findOne({ user: payout.vendor });
  
  if (!wallet || wallet.balance < payout.amount) {
    throw new Error('Insufficient balance in vendor wallet');
  }

  await Wallet.findOneAndUpdate(
    { user: payout.vendor },
    {
      $inc: { balance: -payout.amount },
      $push: {
        transactions: {
          type: 'debit',
          amount: payout.amount,
          description: `Payout processed - ${payout.method}`,
          reference: payout._id.toString(),
          createdAt: new Date()
        }
      }
    }
  );

  payout.status = 'completed';
  payout.processedAt = new Date();
  await payout.save();

  return payout;
};
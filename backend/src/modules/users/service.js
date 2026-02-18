import User from './model.js';

export const getUserProfile = async (userId) => {
  return await User.findById(userId).select('-password -refreshToken');
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');
  
  return user;
};

export const getUserDashboard = async (userId) => {
  const Order = (await import('../orders/model.js')).default;
  const License = (await import('../licenses/model.js')).default;
  const Wishlist = (await import('../wishlist/model.js')).default;
  const Wallet = (await import('../wallet/model.js')).default;
  
  // Get wallet balance
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  const walletBalance = wallet.balance || 0;

  // Get all orders
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  
  // Get all downloads/licenses
  const downloads = await License.find({ user: userId })
    .populate('product', 'title thumbnail files')
    .sort({ createdAt: -1 });
  
  // Get wishlist count
  const wishlistCount = await Wishlist.countDocuments({ user: userId });

  // Calculate stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const activeOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length;
  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5).map(order => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt
  }));

  // Recent downloads (last 5)
  const recentDownloads = downloads.slice(0, 5).map(license => ({
    _id: license._id,
    product: license.product,
    createdAt: license.createdAt
  }));

  return {
    stats: {
      totalOrders,
      completedOrders,
      activeOrders,
      totalSpent,
      totalDownloads: downloads.length,
      wishlistCount,
      spentTrend: '+12%', // Can be calculated based on previous period
    },
    walletBalance,
    recentOrders,
    recentDownloads
  };
};

export const getUserOrders = async (userId, page = 1, limit = 10) => {
  const Order = (await import('../orders/model.js')).default;
  
  const orders = await Order.find({ user: userId })
    .populate('items.product', 'title price thumbnail')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments({ user: userId });

  return { orders, total, page, pages: Math.ceil(total / limit) };
};

export const getUserDownloads = async (userId) => {
  const License = (await import('../licenses/model.js')).default;
  
  // 👉 Populate product with all necessary fields including files and thumbnail
  const licenses = await License.find({ user: userId, status: 'active' })
    .populate({
      path: 'product',
      select: 'title thumbnail files version'
    })
    .sort({ createdAt: -1 });
  
  // Filter out licenses where product was deleted
  return licenses.filter(license => license.product !== null);
};
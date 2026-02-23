import Order from '../orders/model.js';
import Product from '../products/model.js';
import User from '../auth/model.js';

export const getAdminAnalytics = async (startDate, endDate) => {
  const dateFilter = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  const revenue = await Order.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
        count: { $sum: 1 }
      }
    }
  ]);

  const newUsers = await User.countDocuments(dateFilter);
  const newProducts = await Product.countDocuments(dateFilter);

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
    { $sort: { sales: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        title: '$product.title',
        thumbnail: '$product.thumbnail',
        sales: 1,
        revenue: 1
      }
    }
  ]);

  const dailyRevenue = await Order.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    totalRevenue: revenue[0]?.total || 0,
    totalOrders: revenue[0]?.count || 0,
    newUsers,
    newProducts,
    topProducts,
    dailyRevenue
  };
};

export const getVendorAnalytics = async (vendorId, startDate, endDate) => {
  const dateFilter = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  const earnings = await Order.aggregate([
    { $match: { status: 'completed' } },
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
    { $match: { 'productInfo.vendor': vendorId } },
    {
      $group: {
        _id: null,
        total: { $sum: '$items.vendorEarning' },
        sales: { $sum: 1 }
      }
    }
  ]);

  const products = await Product.countDocuments({ vendor: vendorId });

  const topProducts = await Order.aggregate([
    { $match: { status: 'completed' } },
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
    { $match: { 'productInfo.vendor': vendorId } },
    {
      $group: {
        _id: '$items.product',
        sales: { $sum: 1 },
        revenue: { $sum: '$items.vendorEarning' }
      }
    },
    { $sort: { sales: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        title: '$product.title',
        sales: 1,
        revenue: 1
      }
    }
  ]);

  return {
    totalEarnings: earnings[0]?.total || 0,
    totalSales: earnings[0]?.sales || 0,
    totalProducts: products,
    topProducts
  };
};
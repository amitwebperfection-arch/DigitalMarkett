import * as adminService from './service.js';
import Settings from '../settings/model.js';
import ContactMessage from '../contact/contactModel.js';
import Product from '../products/model.js';


export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await adminService.getAllUsers(Number(page), Number(limit), search);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const user = await adminService.banUser(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const user = await adminService.unbanUser(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// ✅ NEW: Get vendors
export const getVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await adminService.getAllVendors(Number(page), Number(limit), search);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const suspendVendor = async (req, res, next) => {
  try {
    const adminService = await import('./service.js');
    const user = await adminService.suspendVendor(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};


// ✅ NEW: Get payouts
export const getPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await adminService.getAllPayouts(Number(page), Number(limit), status);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// ✅ NEW: Process payout
export const processPayout = async (req, res, next) => {
  try {
    const payout = await adminService.processPayout(req.params.id);
    res.json({ success: true, payout });
  } catch (error) {
    next(error);
  }
};

// export const getSettings = async (req, res, next) => {
//   try {
//     let settings = await Settings.findOne();

//     if (!settings) {
//       settings = await Settings.create({
//         siteName: 'My Store',
//         siteEmail: 'admin@example.com',
//         commissionRate: 10,
//         currency: 'USD',
//         payoutThreshold: 50,
//         maintenanceMode: false
//       });
//     }

//     res.json({ success: true, ...settings.toObject() });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateSettings = async (req, res, next) => {
//   try {
//     const settings = await Settings.findOneAndUpdate(
//       {},
//       req.body,
//       { new: true, upsert: true }
//     );

//     res.json({ success: true, ...settings.toObject() });
//   } catch (error) {
//     next(error);
//   }
// };

export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get products with filter
    const products = await Product.find(filter)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    // Get counts for each status (for the stats cards)
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Product.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'approved' }),
      Product.countDocuments({ status: 'rejected' })
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      pendingCount,
      approvedCount,
      rejectedCount
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};
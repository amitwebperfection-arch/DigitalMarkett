import * as analyticsService from './service.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const analytics = await analyticsService.getAdminAnalytics(start, end);
    res.json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
};

export const getVendorAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const analytics = await analyticsService.getVendorAnalytics(req.user.id, start, end);
    res.json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
};
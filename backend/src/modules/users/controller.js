import * as userService from './service.js';
import axios from 'axios';

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await userService.updateUserProfile(req.user.id, { name, avatar });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await userService.getUserDashboard(req.user.id);
    res.json({ success: true, ...dashboardData });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await userService.getUserOrders(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getMyDownloads = async (req, res, next) => {
  try {
    const downloads = await userService.getUserDownloads(req.user.id);
    res.json({ success: true, downloads });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const License = (await import('../licenses/model.js')).default;

    const license = await License.findOne({
      _id: req.params.licenseId,
      user: req.user.id,
      status: 'active'
    }).populate('product');

    if (
      !license ||
      !license.product ||
      !Array.isArray(license.product.files) ||
      license.product.files.length === 0
    ) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = license.product.files[0]; 
    const response = await axios.get(file.url, {
      responseType: 'stream'
    });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.name}"`
    );
    res.setHeader(
      'Content-Type',
      file.type || 'application/octet-stream'
    );

    response.data.pipe(res); 
  } catch (err) {
    next(err);
  }
};

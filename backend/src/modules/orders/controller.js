import * as orderService from './service.js';

export const createOrder = async (req, res, next) => {
  try {
    const { 
      items, 
      paymentMethod, 
      couponId, 
      couponCode,
      personalDetails,
      shippingAddress
    } = req.body;

    const order = await orderService.createOrder(
      req.user.id, 
      items, 
      paymentMethod, 
      couponId,
      couponCode,
      personalDetails,
      shippingAddress
    );

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await orderService.getUserOrders(req.user.id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await orderService.getAdminOrders(Number(page), Number(limit), filters);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getVendorOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await orderService.getVendorOrders(
      req.user.id, 
      Number(page), 
      Number(limit)
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
import * as couponService from './service.js';

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body, req.user.id);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await couponService.getCoupons(Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal, productIds } = req.body;
    const userId = req.user.id;

    const result = await couponService.applyCoupon(
      code,
      cartTotal,
      productIds,
      userId
    );

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getActiveCoupons = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const coupons = await couponService.getActiveCoupons(userId);
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await couponService.deleteCoupon(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};
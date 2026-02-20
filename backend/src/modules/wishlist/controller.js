import * as wishlistService from './service.js';

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getUserWishlist(req.user._id);
    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const wishlist = await wishlistService.addProductToWishlist(req.user._id, productId);
    res.json({ success: true, wishlist });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await wishlistService.removeProductFromWishlist(req.user._id, productId);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

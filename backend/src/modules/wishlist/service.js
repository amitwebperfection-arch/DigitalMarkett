import Wishlist from './model.js';

export const getUserWishlist = async (userId) => {
  return Wishlist.find({ user: userId }).populate('product');
};

export const addProductToWishlist = async (userId, productId) => {
  const wishlistItem = new Wishlist({ user: userId, product: productId });
  return wishlistItem.save();
};

export const removeProductFromWishlist = async (userId, productId) => {
  return Wishlist.findOneAndDelete({ user: userId, product: productId });
};

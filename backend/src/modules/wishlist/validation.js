// src/modules/wishlist/validation.js
import Joi from 'joi';

export const addWishlistSchema = Joi.object({
  productId: Joi.string().required()
});

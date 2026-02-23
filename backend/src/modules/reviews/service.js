import Review from './model.js';
import Product from '../products/model.js';
import Order from '../orders/model.js';
import mongoose from 'mongoose';

export const createReview = async (userId, productId, rating, title, comment) => {
  const existingReview = await Review.findOne({ user: userId, product: productId });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }
  const hasPurchased = await Order.findOne({
    user: userId,
    'items.product': productId,
    status: 'completed'
  });

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased
  });
  await updateProductRating(productId);


  return review;
};

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const reviews = await Review.find({ product: productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Review.countDocuments({ product: productId });

  return { reviews, total, page, pages: Math.ceil(total / limit) };
};

export const deleteReview = async (reviewId) => {
  const review = await Review.findByIdAndDelete(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  await updateProductRating(review.product);


  return review;
};

const updateProductRating = async (productId) => {

  try {
    const reviews = await Review.find({ product: productId });
    

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      const roundedAvg = Math.round(avgRating * 10) / 10;


      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          'rating.average': roundedAvg,
          'rating.count': reviews.length
        },
        { new: true }
      );

    } else {
      
      await Product.findByIdAndUpdate(
        productId,
        {
          'rating.average': 0,
          'rating.count': 0
        },
        { new: true }
      );

    }
  } catch (error) {
    console.error(`   ❌ Error updating product rating:`, error);
    throw error;
  }
};

export const getProductWithRating = async (productId) => {
  return await Product.findById(productId).select('rating');
};

export const recalculateProductRating = async (productId) => {
  await updateProductRating(productId);
  return await Product.findById(productId).select('title rating');
};
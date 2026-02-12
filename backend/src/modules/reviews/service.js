import Review from './model.js';
import Product from '../products/model.js';
import Order from '../orders/model.js';
import mongoose from 'mongoose';

export const createReview = async (userId, productId, rating, title, comment) => {
  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ user: userId, product: productId });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user: userId,
    'items.product': productId,
    status: 'completed'
  });

  // Create review
  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased
  });

  // ✅ CRITICAL: Update product rating immediately after creating review
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

  // ✅ Update product rating after deleting review
  await updateProductRating(review.product);


  return review;
};

// ✅ FIXED: Properly update product rating
const updateProductRating = async (productId) => {

  try {
    // Get all reviews for this product
    const reviews = await Review.find({ product: productId });
    

    if (reviews.length > 0) {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      // Round to 1 decimal place
      const roundedAvg = Math.round(avgRating * 10) / 10;


      // ✅ Update product with new rating
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

// ✅ NEW: Function to manually recalculate rating for a product
export const recalculateProductRating = async (productId) => {
  await updateProductRating(productId);
  return await Product.findById(productId).select('title rating');
};
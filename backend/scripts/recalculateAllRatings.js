import mongoose from 'mongoose';
import Product from '../src/modules/products/model.js';
import Review from '../src/modules/reviews/model.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const recalculateAllRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Get all products
    const products = await Product.find({});

    let updatedCount = 0;
    let noReviewsCount = 0;

    for (const product of products) {

      // Get all reviews for this product
      const reviews = await Review.find({ product: product._id });

      if (reviews.length > 0) {
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;


        // Update product
        await Product.findByIdAndUpdate(
          product._id,
          {
            'rating.average': avgRating,
            'rating.count': reviews.length
          }
        );
        updatedCount++;
      } else {
        // No reviews, ensure rating is 0
        await Product.findByIdAndUpdate(
          product._id,
          {
            'rating.average': 0,
            'rating.count': 0
          }
        );
        noReviewsCount++;
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

recalculateAllRatings();
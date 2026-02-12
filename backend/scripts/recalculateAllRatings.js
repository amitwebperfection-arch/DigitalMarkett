import mongoose from 'mongoose';
import Product from '../src/modules/products/model.js';
import Review from '../src/modules/reviews/model.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const recalculateAllRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updatedCount = 0;
    let noReviewsCount = 0;

    for (const product of products) {
      console.log(`\n🔄 Processing: ${product.title}`);
      console.log(`   Product ID: ${product._id}`);

      // Get all reviews for this product
      const reviews = await Review.find({ product: product._id });
      
      console.log(`   Reviews found: ${reviews.length}`);

      if (reviews.length > 0) {
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;

        console.log(`   Calculated average: ${avgRating}`);

        // Update product
        await Product.findByIdAndUpdate(
          product._id,
          {
            'rating.average': avgRating,
            'rating.count': reviews.length
          }
        );

        console.log(`   ✅ Updated: ${avgRating} stars (${reviews.length} reviews)`);
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
        
        console.log(`   ⚪ No reviews, set to 0`);
        noReviewsCount++;
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`   ✅ Products with reviews updated: ${updatedCount}`);
    console.log(`   ⚪ Products without reviews: ${noReviewsCount}`);
    console.log(`   📦 Total products processed: ${products.length}`);
    console.log('\n✅ Done!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

recalculateAllRatings();
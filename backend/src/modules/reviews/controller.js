import * as reviewService from './service.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    console.log('📝 Creating review:', { productId, rating, title });

    // Create review
    const review = await reviewService.createReview(
      req.user.id,
      productId,
      rating,
      title,
      comment
    );

    console.log('✅ Review created:', review._id);

    // Fetch updated product to get new rating
    const updatedProduct = await reviewService.getProductWithRating(productId);

    console.log('📊 Updated product rating:', updatedProduct?.rating);

    res.status(201).json({
      success: true,
      review,
      product: updatedProduct
    });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await reviewService.getProductReviews(
      productId, 
      Number(page), 
      Number(limit)
    );
    
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// ✅ NEW: Manual rating recalculation
export const recalculateRating = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    console.log(`🔄 Manually recalculating rating for product: ${productId}`);
    
    const result = await reviewService.recalculateProductRating(productId);
    
    console.log('✅ Rating recalculated:', result);
    
    res.json({ 
      success: true, 
      message: 'Rating recalculated successfully',
      product: result
    });
  } catch (error) {
    console.error('❌ Error recalculating rating:', error);
    next(error);
  }
};
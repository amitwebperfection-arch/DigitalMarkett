import * as reviewService from './service.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;


    // Create review
    const review = await reviewService.createReview(
      req.user.id,
      productId,
      rating,
      title,
      comment
    );


    // Fetch updated product to get new rating
    const updatedProduct = await reviewService.getProductWithRating(productId);


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
    
    
    const result = await reviewService.recalculateProductRating(productId);
    
    
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
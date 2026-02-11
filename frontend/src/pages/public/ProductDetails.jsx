import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { productService } from '../../services/product.service';
import { userService } from '../../services/user.service';
import { addToCart, openDrawer } from '../../features/cart/cart.slice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ShoppingCart, Star, Download, ExternalLink, Check, Package, 
  Shield, Zap, Heart, Share2, ChevronLeft, ChevronRight, 
  Award, TrendingUp, Clock, Verified
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddReviewForm from '../../components/products/AddReviewForm';
import { useState, useEffect } from 'react';

function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isInWishlist, setIsInWishlist] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
  });

  const product = data?.product;

  // Get wishlist data
  const { data: wishlistData } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: userService.getWishlist,
    enabled: isAuthenticated,
    retry: false,
  });

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlistData?.wishlist && product) {
      const inWishlist = wishlistData.wishlist.some(
        (item) => item.product?._id === product._id
      );
      setIsInWishlist(inWishlist);
    }
  }, [wishlistData, product]);

  // Wishlist mutations
  const addToWishlistMutation = useMutation({
    mutationFn: userService.addToWishlist,
    onSuccess: () => {
      setIsInWishlist(true);
      toast.success('Added to wishlist!');
      queryClient.invalidateQueries(['user-wishlist']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: userService.removeFromWishlist,
    onSuccess: () => {
      setIsInWishlist(false);
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries(['user-wishlist']);
    },
    onError: () => {
      toast.error('Failed to remove from wishlist');
    },
  });

  // Fetch reviews
  const { data: reviewData } = useQuery({
    queryKey: ['product-reviews', product?._id],
    enabled: !!product?._id,
    queryFn: () => productService.getProductReviews(product._id),
  });

  const reviews = reviewData?.reviews || [];
  const reviewCount = reviews.length;

  const avgRating =
    reviewCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : 0;

  // Fetch related products
  const { data: relatedData } = useQuery({
    enabled: !!product?.category,
    queryKey: ['related-products', product?.category],
    queryFn: () => productService.getRelatedProducts(product.category),
  });

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        thumbnail: product.thumbnail,
      })
    );
    dispatch(openDrawer());
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(product._id);
    } else {
      addToWishlistMutation.mutate(product._id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-medium text-gray-400">Product not found</p>
        </div>
      </div>
    );
  }

  const allImages = [product.thumbnail, ...(product.images?.map(img => img.url) || [])];
  const currentImage = allImages[selectedImage];
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Rating stats
  const ratingStats = [5, 4, 3, 2, 1].map(rating => ({
    stars: rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviewCount > 0 ? (reviews.filter(r => r.rating === rating).length / reviewCount) * 100 : 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container-custom py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative group overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-[450px] object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.salePrice && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {selectedImage + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-3 transition-all ${
                      selectedImage === idx
                        ? 'border-primary-600 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category & Actions */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-full text-sm font-semibold">
                <Package className="w-4 h-4" />
                {product.category}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleWishlistToggle}
                  disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                  className={`p-2.5 rounded-full transition-all ${
                    isInWishlist
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-500 shadow'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-white' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition shadow"
                  title="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-5 h-5 ${
                        idx < Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{avgRating}</span>
                <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{product.downloads || 0} downloads</span>
              </div>

              {product.downloads > 100 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 leading-relaxed text-base">
              {product.shortDescription}
            </p>

            {/* Price */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 shadow-xl">
              {product.salePrice ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white">${product.salePrice}</span>
                    <span className="text-xl line-through text-gray-400">${product.price}</span>
                  </div>
                  <p className="text-sm text-green-400 font-semibold flex items-center gap-2">
                    <span className="bg-green-500/20 px-2 py-0.5 rounded">
                      Save ${(product.price - product.salePrice).toFixed(2)} ({discountPercent}% OFF)
                    </span>
                  </p>
                </div>
              ) : (
                <span className="text-4xl font-bold text-white">${product.price}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl font-semibold text-base group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Add to Cart
              </button>

              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all font-semibold shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Live Demo
                </a>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Instant Access</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Verified className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Verified Quality</span>
              </div>
            </div>

            {/* Product Meta */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Version
                  </p>
                  <p className="font-bold text-gray-900">{product.version}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated
                  </p>
                  <p className="font-bold text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {product.vendor && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vendor</p>
                    <p className="font-bold text-gray-900">{product.vendor.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'description'
                  ? 'text-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Description
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                activeTab === 'reviews'
                  ? 'text-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Reviews ({reviewCount})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating Overview */}
                {reviewCount > 0 && (
                  <div className="grid md:grid-cols-3 gap-6 pb-8 border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">{avgRating}</div>
                      <div className="flex justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-5 h-5 ${
                              idx < Math.round(avgRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">{reviewCount} reviews</p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      {ratingStats.map((stat) => (
                        <div key={stat.stars} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-16">{stat.stars} stars</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 transition-all"
                              style={{ width: `${stat.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-4 h-4 ${
                                    idx < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{review.title}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        {review.isVerifiedPurchase && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <Verified className="w-3 h-3" />
                            Verified Purchase
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Star className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No reviews yet</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
                  </div>
                )}

                {/* Add Review Form */}
                <div className="pt-8 border-t border-gray-200">
                  {isAuthenticated ? (
                    <AddReviewForm productId={product._id} />
                  ) : (
                    <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      <p className="text-gray-700 font-medium mb-4">Please login to add a review</p>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg"
                      >
                        Login to Review
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedData?.products?.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link
                to={`/products?category=${product.category}`}
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedData.products.map((item) => (
                <Link
                  key={item._id}
                  to={`/products/${item.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-gray-900">
                        ${item.salePrice || item.price}
                      </p>
                      {item.salePrice && (
                        <span className="text-xs line-through text-gray-400">
                          ${item.price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
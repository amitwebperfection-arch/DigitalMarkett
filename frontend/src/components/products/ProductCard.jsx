import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Download, TrendingUp, Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart, openDrawer } from '../../features/cart/cart.slice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

function ProductCard({ product }) {
  // Don't render unpublished or non-approved products
  if (!product.published || product.status !== 'approved') return null;

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Get wishlist data
  const { data: wishlistData } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: userService.getWishlist,
    retry: false,
    staleTime: 30000
  });

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlistData?.wishlist) {
      const inWishlist = wishlistData.wishlist.some(
        item => item.product?._id === product._id
      );
      setIsInWishlist(inWishlist);
    }
  }, [wishlistData, product._id]);

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: userService.addToWishlist,
    onSuccess: () => {
      setIsInWishlist(true);
      toast.success('Added to wishlist!');
      queryClient.invalidateQueries(['user-wishlist']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
    }
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: userService.removeFromWishlist,
    onSuccess: () => {
      setIsInWishlist(false);
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries(['user-wishlist']);
    },
    onError: (error) => {
      toast.error('Failed to remove from wishlist');
    }
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      salePrice: product.salePrice,
      thumbnail: product.thumbnail
    }));

    dispatch(openDrawer());
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(product._id);
    } else {
      addToWishlistMutation.mutate(product._id);
    }
  };

  // Calculate discount percentage
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Get rating data
  const avgRating = product.rating?.average || 0;
  const reviewCount = product.rating?.count || 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative w-full h-64 overflow-hidden bg-gray-100">
        <img
          src={product.thumbnail || '/placeholder.jpg'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.salePrice && (
            <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInWishlist
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white/90 text-gray-700 hover:bg-white hover:text-red-500'
          }`}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isInWishlist ? 'fill-white' : ''
            }`}
          />
        </button>

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            <Download className="w-3 h-3" />
            <span>{product.downloads || 0}</span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-bold text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                className={`w-4 h-4 ${
                  idx < Math.round(avgRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-xs text-gray-500">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.salePrice}
                  </span>
                  <span className="text-sm line-through text-gray-400">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-5 h-5 transition-transform" />
            <span>Add to Cart</span>
          </button>
        </div>

        {/* Vendor Info (Optional) */}
        {product.vendor && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">by</span>
              <span className="font-semibold text-gray-900">
                {product.vendor.vendorInfo?.businessName || product.vendor.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trending Indicator (if downloads > 100) */}
      {product.downloads > 100 && (
        <div className="absolute top-3 right-14">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full shadow-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      )}
    </Link>
  );
}

export default ProductCard;
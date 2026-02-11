import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addToCart, openDrawer } from '../../features/cart/cart.slice';

function UserWishlist() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: userService.getWishlist
  });

  const removeMutation = useMutation({
    mutationFn: userService.removeFromWishlist,
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries(['user-wishlist']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  });

  const handleAddToCart = (product) => {
    // Dispatch with proper structure that cart expects
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8 space-y-6">
      <h1 className="text-3xl font-bold">My Wishlist</h1>

      {data?.wishlist?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.wishlist.map((item) => {
            const product = item.product;
            
            // Skip if product is null or undefined
            if (!product) return null;
            
            const displayPrice = product.salePrice || product.price;

            return (
              <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <Link to={`/products/${product.slug}`}>
                  <img
                    src={product.thumbnail || '/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform"
                  />
                </Link>
                
                <div className="p-4 space-y-3">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-lg hover:text-primary-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary-600">
                      ${displayPrice?.toFixed(2)}
                    </span>
                    {product.salePrice && (
                      <span className="text-sm line-through text-gray-400">
                        ${product.price?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <button
                      onClick={() => removeMutation.mutate(product._id)}
                      disabled={removeMutation.isPending}
                      className="bg-red-50 text-red-600 hover:bg-red-100 p-2.5 rounded-lg transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h3>
            <p className="text-gray-500">Start adding products you love!</p>
            <Link 
              to="/products" 
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold"
            >
              Browse Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserWishlist;
import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, TrendingUp, Clock, Star, Zap, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';

function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch trending products (best sellers)
  const { data: trendingProducts } = useQuery({
    queryKey: ['trending-products-search'],
    queryFn: () => productService.getProducts({
      sort: '-downloads', // or '-salesCount' if you have that field
      limit: 6,
      featured: true
    }),
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch featured products
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products-search'],
    queryFn: () => productService.getProducts({
      featured: true,
      limit: 4
    }),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Search products with debounce
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      try {
        const result = await productService.getProducts({
          search: searchQuery,
          limit: 6
        });
        console.log('🔍 Search Results:', result);
        return result;
      } catch (error) {
        console.error('Search error:', error);
        return { products: [], total: 0 };
      }
    },
    enabled: searchQuery.length > 2,
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });

  const handleSearch = (query) => {
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Helper function to get product URL - handles both slug and _id
  const getProductUrl = (product) => {
    // If product has slug, use it; otherwise use _id
    const identifier = product.slug || product._id;
    return `/products/${identifier}`;
  };

  const handleProductClick = (product) => {
    navigate(getProductUrl(product));
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Search Button in Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        aria-label="Search products"
      >
        <SearchIcon className="w-4 h-4 text-gray-600" />
        <span className="hidden md:inline text-gray-600 text-sm">Search products...</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          {/* Modal Content */}
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-slide-down"
          >
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <SearchIcon className="w-6 h-6 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg outline-none text-gray-900 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </form>

            {/* Search Results / Suggestions */}
            <div className="overflow-y-auto max-h-[calc(85vh-100px)]">
              {searchQuery.length > 2 ? (
                // Show search results
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : searchResults?.products?.length > 0 ? (
                    <>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                        Search Results ({searchResults.total})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.products.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleProductClick(product)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                          >
                            {product.thumbnail && (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src = '/placeholder.jpg';
                                  }}
                                />
                                {product.featured && (
                                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-1 rounded-full">
                                    <Award className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition">
                                {product.title}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">
                                {product.category?.name || product.category}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary-600">
                                ${product.salePrice || product.price}
                              </p>
                              {product.salePrice && (
                                <p className="text-xs line-through text-gray-400">
                                  ${product.price}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {searchResults.total > 6 && (
                        <button
                          onClick={() => handleSearch(searchQuery)}
                          className="mt-4 w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                          View all {searchResults.total} results
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <SearchIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Try different keywords or browse our categories
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setIsOpen(false);
                          navigate('/products');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        Browse All Products
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Show suggestions when not searching
                <div className="p-6 space-y-8">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(search);
                              handleSearch(search);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Products */}
                  {trendingProducts?.products?.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Trending Now
                        </h3>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/products?sort=-downloads');
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          View All
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {trendingProducts.products.slice(0, 4).map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleProductClick(product)}
                            className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 hover:shadow-lg transition-all border border-orange-100"
                          >
                            <div className="relative mb-3 overflow-hidden rounded-lg">
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = '/placeholder.jpg';
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Hot
                              </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 text-left group-hover:text-orange-600 transition">
                              {product.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-orange-600">
                                ${product.salePrice || product.price}
                              </span>
                              {product.downloads > 0 && (
                                <span className="text-xs text-gray-500">
                                  {product.downloads}+ downloads
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Featured Products */}
                  {featuredProducts?.products?.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Featured Products
                        </h3>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/products?featured=true');
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          View All
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {featuredProducts.products.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleProductClick(product)}
                            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg hover:shadow-md transition-all group border border-primary-100"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = '/placeholder.jpg';
                                }}
                              />
                              <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full">
                                <Award className="w-3 h-3 text-yellow-900" />
                              </div>
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-primary-600 transition">
                                {product.title}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {product.category?.name || product.category}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {product.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium text-gray-700">
                                      {typeof product.rating === 'object' 
                                        ? product.rating.average?.toFixed(1) || product.rating.count || '0'
                                        : product.rating
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary-600">
                                ${product.salePrice || product.price}
                              </p>
                              {product.salePrice && (
                                <p className="text-xs line-through text-gray-400">
                                  ${product.price}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default Search;
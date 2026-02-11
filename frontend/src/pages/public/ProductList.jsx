import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import ProductCard from '../../components/products/ProductCard';
import ProductFilters from '../../components/products/ProductFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

function ProductList() {
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [filters, setFilters] = useState({});

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  useEffect(() => {
    if (categoryFromUrl) {
      setFilters((prev) => ({
        ...prev,
        category: categoryFromUrl,
      }));
      setPage(1);
    }
  }, [categoryFromUrl]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, filters],
    queryFn: () =>
      productService.getProducts({
        page,
        limit: 12,
        ...filters,
      }),
    keepPreviousData: true,
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleCategoryClick = (slug) => {
    setSearchParams({ category: slug });
    setFilters({ ...filters, category: slug });
    setPage(1);
  };

  const handleAllProducts = () => {
    setSearchParams({});
    setFilters({});
    setPage(1);
  };

  // Slider functionality
  const [scrollPosition, setScrollPosition] = useState(0);
  const categoriesRef = useState(null);

  const scroll = (direction) => {
    const container = document.getElementById('categories-scroll');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const categories = categoriesData?.categories?.filter(cat => cat.published) || [];
  const selectedCategory = categories.find(cat => cat.slug === categoryFromUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom py-8 md:py-12 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Explore Our Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {selectedCategory ? selectedCategory.name : 'All Products'}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {selectedCategory 
              ? selectedCategory.description || `Browse our ${selectedCategory.name.toLowerCase()} collection`
              : 'Discover thousands of premium digital products from trusted creators'
            }
          </p>
        </div>

        {/* Categories Slider */}
        {!categoriesLoading && categories.length > 0 && (
          <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Browse Categories</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Categories Container */}
            <div className="relative">
              <div
                id="categories-scroll"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 pl-5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* All Products Category */}
                <button
                  onClick={handleAllProducts}
                  className={`flex-shrink-0 group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 min-w-[120px] ${
                    !categoryFromUrl
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                    !categoryFromUrl
                      ? 'bg-primary-600'
                      : 'bg-gray-100 group-hover:bg-primary-100'
                  }`}>
                    <span className="text-3xl">🌟</span>
                  </div>
                  <span className={`font-semibold text-sm text-center ${
                    !categoryFromUrl ? 'text-primary-600' : 'text-gray-700 group-hover:text-primary-600'
                  }`}>
                    All Products
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {data?.total || 0} items
                  </span>
                </button>

                {/* Individual Categories */}
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className={`flex-shrink-0 group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 min-w-[120px] ${
                      categoryFromUrl === category.slug
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    <div
  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all overflow-hidden ${
    categoryFromUrl === category.slug
      ? 'bg-primary-600 scale-110'
      : 'bg-gray-100 group-hover:bg-primary-100 group-hover:scale-105'
  }`}
>
  {category.icon ? (
    <img
      src={category.icon}
      alt={category.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-3xl">{category.emoji || '📦'}</span>
  )}
</div>

                    <span className={`font-semibold text-sm text-center line-clamp-2 ${
                      categoryFromUrl === category.slug 
                        ? 'text-primary-600' 
                        : 'text-gray-700 group-hover:text-primary-600'
                    }`}>
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {category.count || 0} items
                    </span>
                  </button>
                ))}
              </div>

              {/* Gradient Overlays for scroll indication */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* Filters */}
        <ProductFilters onFilterChange={handleFilterChange} />

        {/* Results Count */}
        {data && (
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{data.products?.length || 0}</span> of{' '}
              <span className="font-semibold text-gray-900">{data.total || 0}</span> products
            </p>
            {categoryFromUrl && (
              <button
                onClick={handleAllProducts}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Clear filters
                <span>×</span>
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.products?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={data.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or browse all products</p>
            {categoryFromUrl && (
              <button
                onClick={handleAllProducts}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
              >
                View All Products
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default ProductList;
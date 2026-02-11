import { useEffect, useState } from 'react';
import { categoryService } from '../../services/category.service';
import { Search, Filter, X, DollarSign, Tag, RotateCcw } from 'lucide-react';

function ProductFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data.categories?.filter(cat => cat.published) || []);
      } catch (err) {
        console.error('Failed to load categories', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '').length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const reset = {
      category: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  const removeFilter = (key) => {
    handleChange(key, '');
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input - Takes most space */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Search products, themes, plugins..."
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-900 placeholder-gray-400"
              />
              {filters.search && (
                <button
                  onClick={() => removeFilter('search')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Category Dropdown */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="pl-11 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-700 font-medium bg-white appearance-none cursor-pointer min-w-[180px]"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-28 pl-9 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-700"
                    min="0"
                  />
                </div>

                <span className="text-gray-400 font-medium">-</span>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-28 pl-9 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-700"
                    min="0"
                  />
                </div>
              </div>

              {/* Reset Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden xl:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Expanded Filters */}
          {isExpanded && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-4 animate-fadeIn">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Tag className="w-4 h-4" />
                  </div>
                  <select
                    value={filters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-700 font-medium bg-white appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleChange('minPrice', e.target.value)}
                      placeholder="Min Price"
                      className="w-full pl-9 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-700"
                      min="0"
                    />
                  </div>

                  <span className="text-gray-400 font-medium">to</span>

                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleChange('maxPrice', e.target.value)}
                      placeholder="Max Price"
                      className="w-full pl-9 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-gray-700"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
          
          {filters.category && (
            <div className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              <Tag className="w-3.5 h-3.5" />
              <span>
                {categories.find(c => c.slug === filters.category)?.name || filters.category}
              </span>
              <button
                onClick={() => removeFilter('category')}
                className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {filters.minPrice && (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Min: ${filters.minPrice}</span>
              <button
                onClick={() => removeFilter('minPrice')}
                className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {filters.maxPrice && (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Max: ${filters.maxPrice}</span>
              <button
                onClick={() => removeFilter('maxPrice')}
                className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {filters.search && (
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              <Search className="w-3.5 h-3.5" />
              <span>"{filters.search}"</span>
              <button
                onClick={() => removeFilter('search')}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium underline transition-colors ml-auto"
          >
            Clear all
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ProductFilters;
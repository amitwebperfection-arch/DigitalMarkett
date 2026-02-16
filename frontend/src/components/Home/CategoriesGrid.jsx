import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/category.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const CategoriesGrid = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const publishedCategories = data?.categories?.filter(cat => cat.published) || [];

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      setScrollPosition(scrollLeft);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [publishedCategories]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <section className="container-custom py-12">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-12 md:py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Shop by Category</h2>
              <p className="text-sm text-slate-600">Browse our collection</p>
            </div>
          </div>

          {/* Navigation arrows for mobile */}
          <div className="flex md:hidden gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center transition-colors ${
                canScrollLeft 
                  ? 'hover:border-slate-400 text-slate-700' 
                  : 'opacity-40 cursor-not-allowed text-slate-400'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center transition-colors ${
                canScrollRight 
                  ? 'hover:border-slate-400 text-slate-700' 
                  : 'opacity-40 cursor-not-allowed text-slate-400'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {publishedCategories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={category.icon}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-sm text-slate-900 mb-1 truncate group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500">{category.count || 0} products</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Horizontal Slider */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="md:hidden flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {publishedCategories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 flex-shrink-0 w-[160px] snap-start"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={category.icon}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-sm text-slate-900 mb-1 truncate group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500">{category.count || 0} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CategoriesGrid;
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/category.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ChevronRight } from 'lucide-react';

const CategoriesGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  if (isLoading) {
    return (
      <section className="container-custom py-12">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </section>
    );
  }

  const publishedCategories = data?.categories?.filter(cat => cat.published) || [];

  return (
    <section className="bg-slate-50 py-12 md:py-16">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-600">Browse our collection</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
      </div>
    </section>
  );
};

export default CategoriesGrid;
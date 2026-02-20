import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductsCarousel = ({ 
  title, 
  subtitle, 
  queryKey, 
  queryParams, 
  viewAllLink,
  icon: Icon,
  gradientColors = 'from-blue-500 to-purple-500',
  bgColor = 'bg-white'
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => productService.getProducts(queryParams),
  });

  if (isLoading) {
    return (
      <section className={`${bgColor} py-12`}>
        <div className="container-custom">
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${bgColor} py-12 md:py-16`}>
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 bg-gradient-to-b ${gradientColors} rounded-full`}></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="w-5 h-5 text-slate-600" />}
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
              </div>
              <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
          <Link
            to={viewAllLink}
            className="hidden md:inline-flex items-center text-sm font-semibold text-slate-900 hover:text-orange-600 transition-colors group"
          >
            View All
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {data?.products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            to={viewAllLink}
            className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-orange-600 transition-colors"
          >
            View All {title}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsCarousel;
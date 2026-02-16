import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Star } from 'lucide-react';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FeaturedProducts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getProducts({ featured: true, limit: 8 }),
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

  return (
    <section className="container-custom py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-sm text-slate-600">Handpicked by our team</p>
          </div>
        </div>
        <Link
          to="/products?featured=true"
          className="hidden md:inline-flex items-center text-sm font-semibold text-slate-900 hover:text-orange-600 transition-colors group"
        >
          View All
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {data?.products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="mt-6 text-center md:hidden">
        <Link
          to="/products?featured=true"
          className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-orange-600 transition-colors"
        >
          View All Featured Products
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
import { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import HeroSection from '../../components/Home/HeroSection';
import FeaturesGrid from '../../components/Home/FeaturesGrid';
import CategoriesGrid from '../../components/Home/CategoriesGrid';
import FeaturedProducts from '../../components/Home/FeaturedProducts';
import ProductsCarousel from '../../components/Home/ProductsCarousel';
import StatsSection from '../../components/Home/StatsSection';
import VendorCTA from '../../components/Home/VendorCTA';
import Testimonials from '../../components/Home/Testimonials';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesGrid />
      <CategoriesGrid />
      <FeaturedProducts />
      <StatsSection />
      <ProductsCarousel
        title="Latest Arrivals"
        subtitle="Recently added products"
        queryKey="latest-products"
        queryParams={{ sort: '-createdAt', limit: 4 }}
        viewAllLink="/products?sort=-createdAt"
        icon={Clock}
        gradientColors="from-blue-500 to-cyan-500"
        bgColor="bg-white"
      />
      <ProductsCarousel
        title="Best Sellers"
        subtitle="Most popular this month"
        queryKey="bestseller-products"
        queryParams={{ sort: '-salesCount', limit: 4 }}
        viewAllLink="/products?sort=-salesCount"
        icon={TrendingUp}
        gradientColors="from-orange-500 to-red-500"
        bgColor="bg-slate-50"
      />
      <Testimonials />
      <VendorCTA />
    </div>
  );
}

export default Home;
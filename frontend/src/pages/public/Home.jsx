import { Clock, TrendingUp } from 'lucide-react';
import HeroSection from '../../components/Home/HeroSection';
import FeaturesGrid from '../../components/Home/FeaturesGrid';
import CategoriesGrid from '../../components/Home/CategoriesGrid';
import FeaturedProducts from '../../components/Home/FeaturedProducts';
import ProductsCarousel from '../../components/Home/ProductsCarousel';
import StatsSection from '../../components/Home/StatsSection';
import VendorCTA from '../../components/Home/VendorCTA';
import Testimonials from '../../components/Home/Testimonials';

function Home() {
  return (
    <div className="min-h-screen">
      
      {/* Hero Section - Amazon style with sidebar categories */}
      <HeroSection />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Categories Grid */}
      <CategoriesGrid />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Stats Section */}
      <StatsSection />

      {/* Latest Products */}
      <ProductsCarousel
        title="Latest Arrivals"
        subtitle="Recently added products"
        queryKey="latest-products"
        queryParams={{ sort: '-createdAt', limit: 8 }}
        viewAllLink="/products?sort=-createdAt"
        icon={Clock}
        gradientColors="from-blue-500 to-cyan-500"
        bgColor="bg-white"
      />

      {/* Best Sellers */}
      <ProductsCarousel
        title="Best Sellers"
        subtitle="Most popular this month"
        queryKey="bestseller-products"
        queryParams={{ sort: '-salesCount', limit: 8 }}
        viewAllLink="/products?sort=-salesCount"
        icon={TrendingUp}
        gradientColors="from-orange-500 to-red-500"
        bgColor="bg-slate-50"
      />

      {/* Testimonials */}
      <Testimonials />

      {/* Vendor CTA */}
      <VendorCTA />

    </div>
  );
}

export default Home;
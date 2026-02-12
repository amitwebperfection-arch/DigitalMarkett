import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/products/ProductCard';
import { categoryService } from '../../services/category.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Zap, 
  TrendingUp, 
  Clock, 
  Users, 
  Award,
  CheckCircle,
  Package,
  Sparkles,
  Tag,
  Download,
  Heart,
  MessageCircle,
  Search,
  Filter
} from 'lucide-react';
import { useState } from 'react';

function Home() {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [email, setEmail] = useState('');

  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getProducts({ featured: true, limit: 8 }),
  });

  // Fetch latest products
  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => productService.getProducts({ sort: '-createdAt', limit: 4 }),
  });

  // Fetch bestsellers
  const { data: bestsellerData, isLoading: bestsellerLoading } = useQuery({
    queryKey: ['bestseller-products'],
    queryFn: () => productService.getProducts({ sort: '-salesCount', limit: 4 }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setEmail('');
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Web Developer',
      image: '👩‍💻',
      text: 'Amazing marketplace! Found the perfect theme for my client project. Quick download and great support.',
      rating: 5,
      company: 'TechStart Inc.'
    },
    {
      name: 'Mike Chen',
      role: 'Designer',
      image: '👨‍🎨',
      text: 'Quality products at reasonable prices. The vendor community is very helpful and responsive.',
      rating: 5,
      company: 'Creative Studio'
    },
    {
      name: 'Emma Davis',
      role: 'Entrepreneur',
      image: '👩‍💼',
      text: 'Started selling my templates here and already made my first sales. Great platform for creators!',
      rating: 5,
      company: 'Digital Designs Co.'
    },
  ];

  const stats = [
    { label: 'Active Products', value: '10,000+', icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Happy Customers', value: '50,000+', icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Trusted Vendors', value: '2,500+', icon: Award, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Sales', value: '$2M+', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ];

  const features = [
    {
      icon: Star,
      title: 'Quality Products',
      description: 'Hand-picked premium digital products from verified creators with strict quality control',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing with multiple payment options for your peace of mind',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Zap,
      title: 'Instant Download',
      description: 'Download your purchased products immediately after successful payment, no waiting',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any questions or issues',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Heart,
      title: 'Money Back Guarantee',
      description: 'Not satisfied? Get your money back within 30 days, no questions asked',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Download,
      title: 'Free Updates',
      description: 'Lifetime updates for all purchased products at no additional cost',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Easy Setup',
      description: 'Create your vendor account and start listing products in minutes'
    },
    {
      icon: TrendingUp,
      title: 'Global Reach',
      description: 'Access to customers worldwide with our marketing tools'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Get paid on time with our automated payment system'
    },
    {
      icon: Award,
      title: 'Analytics Dashboard',
      description: 'Track your sales and earnings with detailed reports'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="text-center text-red-500">Failed to load categories</div>
      </div>
    );
  }

  return (
    <div className="space-y-20 overflow-hidden">

      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-28 px-4 rounded-b-[3rem] overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <Package className="w-8 h-8 text-white/20" />
          </div>
          <div className="absolute top-40 right-20 animate-float delay-300">
            <Star className="w-10 h-10 text-white/20" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-float delay-700">
            <Sparkles className="w-6 h-6 text-white/20" />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-8 hover:bg-white/30 transition-all cursor-pointer">
            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
            <span className="text-sm font-medium">Trusted by 50,000+ customers worldwide</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Your Premier Digital
            <br />
            <span className="text-primary-200 bg-clip-text text-transparent bg-gradient-to-r from-primary-200 to-white">
              Products Marketplace
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Discover premium themes, plugins, templates, and more from top creators around the world
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore Products 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Start Selling 
              <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-primary-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10">
                <stat.icon className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 transition-all duration-300 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent group-hover:scale-110`} />
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section - Enhanced with 6 items in 2 rows */}
      <section className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <span className="bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Platform Features</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We provide the best platform for buying and selling digital products with top-notch features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-white shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section - Enhanced */}
      <section className="container-custom">
  <div className="text-center mb-12">
    <div className="inline-block mb-4">
      <span className="bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold">
        Categories
      </span>
    </div>
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Browse by Category</h2>
    <p className="text-gray-600 text-lg">Explore our wide range of digital product categories</p>
  </div>

  <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
    {data?.categories?.filter(cat => cat.published)?.map((category) => (
      <Link
        key={category._id}
        to={`/products?category=${category.slug}`}
        onMouseEnter={() => setHoveredCategory(category._id)}
        onMouseLeave={() => setHoveredCategory(null)}
        className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2 border border-gray-100 ${
          hoveredCategory === category._id ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        {/* 🔥 Card Image */}
        <div className="relative w-full h-32 overflow-hidden">
          <img
            src={category.icon}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4 text-center">
          <h3 className="font-semibold text-sm mb-1 text-gray-900 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-gray-500">{category.count} items</p>
        </div>
      </Link>
    ))}
  </div>
</section>


      {/* Featured Products - Enhanced */}
      <section className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <div>
            <div className="inline-block mb-3">
              <span className="bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Star className="w-4 h-4" />
                Featured
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
            <p className="text-gray-600">Top picks from our marketplace</p>
          </div>
          <Link
            to="/products?featured=true"
            className="group text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 transition-colors"
          >
            View All 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredData?.products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Products - Enhanced */}
      <section className="container-custom">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Latest Arrivals</h2>
              </div>
              <p className="text-gray-600">Recently added products</p>
            </div>
            <Link
              to="/products?sort=-createdAt"
              className="group text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 transition-colors"
            >
              View All 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {latestLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestData?.products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers - Enhanced */}
      <section className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Best Sellers</h2>
            </div>
            <p className="text-gray-600">Most popular products this month</p>
          </div>
          <Link
            to="/products?sort=-salesCount"
            className="group text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 transition-colors"
          >
            View All 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {bestsellerLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellerData?.products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works - Enhanced */}
      <section className="container-custom">
        <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-3xl p-8 md:p-16 shadow-lg">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4">
              <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Simple Process
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get started with our marketplace in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 -z-10"></div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group transform hover:-translate-y-2">
              {/* <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                1
              </div> */}
              <div className="bg-blue-100 p-3 rounded-xl w-fit mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">Browse Products</h3>
              <p className="text-gray-600">
                Explore thousands of premium digital products across multiple categories
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group transform hover:-translate-y-2">
              {/* <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                2
              </div> */}
              <div className="bg-green-100 p-3 rounded-xl w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">Make Purchase</h3>
              <p className="text-gray-600">
                Add to cart, apply coupons, and complete secure payment with your preferred method
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group transform hover:-translate-y-2">
              {/* <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                3
              </div> */}
              <div className="bg-purple-100 p-3 rounded-xl w-fit mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">Download & Use</h3>
              <p className="text-gray-600">
                Get instant access to your products and start using them right away
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4">
            <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 text-lg">Don't just take our word for it</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="flex items-center mb-5 gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="text-5xl">{testimonial.image}</div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-xs text-gray-400">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vendor Benefits - Enhanced */}
      <section className="container-custom">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 md:p-16 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold">
                  For Vendors
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Become a Vendor</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Join thousands of successful vendors and start earning from your digital products today
              </p>
              
              <div className="space-y-5 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-gray-900">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="group inline-flex items-center bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Selling Today 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-green-100 font-medium">Monthly Earnings</span>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-5xl font-bold mb-2">$12,450</div>
                <div className="flex items-center gap-2 text-green-100">
                  <span className="text-2xl">↑</span>
                  <span className="text-sm font-medium">24% from last month</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-blue-100 font-medium">Total Products</span>
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-5xl font-bold mb-2">48</div>
                <div className="text-blue-100 text-sm font-medium">Active listings</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-purple-100 font-medium">Customer Rating</span>
                  <Star className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-5xl font-bold">4.9</span>
                  <span className="text-purple-100">/5.0</span>
                </div>
                <div className="text-purple-100 text-sm font-medium">Based on 1,250 reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Enhanced */}
      {/* <section className="container-custom">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
         
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-block mb-6">
              <Sparkles className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Stay Updated</h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest updates on new products, special offers, and exclusive deals
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-300 shadow-lg"
                />
                <button 
                  type="submit"
                  className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap"
                >
                  Subscribe Now
                </button>
              </div>
              <p className="text-primary-200 text-sm mt-4">
                🔒 We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section> */}

      {/* Call-to-Action Section - Enhanced */}
      <section className="container-custom">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-20 px-8 text-center rounded-3xl shadow-inner">
          <div className="bg-primary-100 p-4 rounded-2xl w-fit mx-auto mb-6">
            <Tag className="w-16 h-16 text-primary-600" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-gray-700 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Whether you're looking to buy quality digital products or sell your own creations, 
            we've got everything you need to succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Browse Products 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center justify-center bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-primary-600 transform hover:-translate-y-1"
            >
              Become a Vendor 
              <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
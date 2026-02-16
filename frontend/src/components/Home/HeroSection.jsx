import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  const categories = [
    { name: 'Web Templates', image: '/api/placeholder/150/150', link: '/products?category=web-templates' },
    { name: 'Mobile Apps', image: '/api/placeholder/150/150', link: '/products?category=mobile-apps' },
    { name: 'Graphics', image: '/api/placeholder/150/150', link: '/products?category=graphics' },
    { name: 'UI Kits', image: '/api/placeholder/150/150', link: '/products?category=ui-kits' },
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="container-custom relative z-10 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <h3 className="font-bold text-sm mb-3 text-white/90">Browse Categories</h3>
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={cat.link}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-xs">
                      {cat.name.charAt(0)}
                    </div>
                    <span className="text-sm flex-1">{cat.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Main Banner */}
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-8 md:p-12 overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                  ⚡ Limited Time Offer
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  Premium Digital<br />Products Marketplace
                </h1>
                <p className="text-lg text-white/90 mb-6 max-w-md">
                  Discover thousands of quality templates, themes & plugins from verified creators
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center bg-white text-slate-900 font-semibold px-6 py-3 rounded-lg hover:bg-slate-100 transition-all shadow-lg group"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Secondary Banners */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/products?featured=true"
                className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 overflow-hidden group hover:shadow-2xl transition-all"
              >
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2">Featured Products</h3>
                  <p className="text-sm text-blue-100 mb-3">Handpicked by experts</p>
                  <div className="inline-flex items-center text-sm font-semibold">
                    Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full"></div>
              </Link>

              <Link
                to="/register"
                className="relative bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 overflow-hidden group hover:shadow-2xl transition-all"
              >
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2">Become a Vendor</h3>
                  <p className="text-sm text-purple-100 mb-3">Start earning today</p>
                  <div className="inline-flex items-center text-sm font-semibold">
                    Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full"></div>
              </Link>
            </div>
          </div>

          {/* Right Sidebar - Promotions */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h4 className="font-bold text-lg mb-2">Flash Sale</h4>
              <p className="text-sm text-green-100 mb-3">Up to 70% off</p>
              <Link
                to="/products?sale=true"
                className="block bg-white text-green-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-green-50 transition-colors"
              >
                Shop Deals
              </Link>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">✨</div>
              <h4 className="font-bold text-lg mb-2">New Arrivals</h4>
              <p className="text-sm text-indigo-100 mb-3">Fresh this week</p>
              <Link
                to="/products?sort=-createdAt"
                className="block bg-white text-indigo-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
              >
                Discover
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HeroSection;
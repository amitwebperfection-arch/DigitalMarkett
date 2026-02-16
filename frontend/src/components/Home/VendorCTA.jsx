import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Shield, Award, Package, Star } from 'lucide-react';

const VendorCTA = () => {
  const benefits = [
    {
      icon: CheckCircle,
      title: 'Easy Setup',
      description: 'Start selling in minutes'
    },
    {
      icon: TrendingUp,
      title: 'Global Reach',
      description: 'Access worldwide customers'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Get paid on time'
    },
    {
      icon: Award,
      title: 'Analytics',
      description: 'Track your performance'
    }
  ];

  return (
    <section className="container-custom py-12 md:py-16">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Content */}
          <div className="p-8 md:p-12 lg:p-16">
            <div className="inline-block bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-xs font-semibold mb-4">
              💰 Start Earning
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Become a Vendor
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Join thousands of successful vendors and start earning from your digital products today
            </p>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-orange-500/20 transition-colors flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                    <p className="text-sm text-slate-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="group inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Start Selling Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Stats Cards */}
          <div className="p-8 md:p-12 lg:p-16 space-y-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-100 font-medium text-sm">Monthly Earnings</span>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">$12,450</div>
              <div className="flex items-center gap-2 text-green-100">
                <span className="text-xl">↑</span>
                <span className="text-sm font-medium">24% from last month</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100 font-medium text-sm">Total Products</span>
                <Package className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">48</div>
              <div className="text-blue-100 text-sm font-medium">Active listings</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-100 font-medium text-sm">Customer Rating</span>
                <Star className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-bold">4.9</span>
                <span className="text-purple-100">/5.0</span>
              </div>
              <div className="text-purple-100 text-sm font-medium">Based on 1,250 reviews</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VendorCTA;
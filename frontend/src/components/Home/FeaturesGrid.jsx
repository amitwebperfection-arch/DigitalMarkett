import { Star, Shield, Zap, MessageCircle, Heart, Download } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Star,
      title: 'Quality Products',
      description: 'Verified creators with strict quality control',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Encrypted payment processing',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Instant Download',
      description: 'Access immediately after purchase',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Round-the-clock assistance',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: Heart,
      title: 'Money Back',
      description: '30-day guarantee',
      gradient: 'from-red-400 to-rose-500'
    },
    {
      icon: Download,
      title: 'Free Updates',
      description: 'Lifetime updates included',
      gradient: 'from-indigo-400 to-blue-500'
    }
  ];

  return (
    <section className="container-custom py-12 md:py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Why Choose Us</h2>
        <p className="text-slate-600">Top-notch features for buyers and sellers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group bg-white p-6 rounded-xl hover:shadow-xl transition-all duration-300 border border-slate-200 text-center"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm mb-2 text-slate-900">{feature.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
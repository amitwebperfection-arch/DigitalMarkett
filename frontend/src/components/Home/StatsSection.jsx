import { Package, Users, Award, TrendingUp } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { 
      label: 'Active Products', 
      value: '10,000+', 
      icon: Package, 
      gradient: 'from-blue-500 to-blue-600' 
    },
    { 
      label: 'Happy Customers', 
      value: '50,000+', 
      icon: Users, 
      gradient: 'from-green-500 to-green-600' 
    },
    { 
      label: 'Trusted Vendors', 
      value: '2,500+', 
      icon: Award, 
      gradient: 'from-purple-500 to-purple-600' 
    },
    { 
      label: 'Total Sales', 
      value: '$2M+', 
      icon: TrendingUp, 
      gradient: 'from-orange-500 to-orange-600' 
    },
  ];

  return (
    <section className="bg-slate-900 py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-slate-800 p-6 md:p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-slate-700"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10 text-center">
                <stat.icon className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 transition-all duration-300 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent group-hover:scale-110`} />
                <div className="text-2xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-xs md:text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
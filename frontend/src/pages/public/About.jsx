import { 
  Users, 
  Target, 
  Heart, 
  TrendingUp, 
  Shield, 
  Zap,
  Award,
  CheckCircle,
  Globe,
  Sparkles,
  Code,
  Palette,
  HeadphonesIcon,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

function About() {
  const stats = [
    { label: 'Products Listed', value: '10,000+', icon: Code },
    { label: 'Happy Customers', value: '50,000+', icon: Users },
    { label: 'Active Vendors', value: '2,500+', icon: Award },
    { label: 'Countries Served', value: '120+', icon: Globe },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We prioritize our customers\' needs and satisfaction above everything else. Every decision we make is centered around providing the best experience.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your security is our priority. We use industry-leading encryption and security measures to protect your data and transactions.',
    },
    {
      icon: Sparkles,
      title: 'Quality Products',
      description: 'We maintain strict quality standards for all products on our marketplace. Every item is reviewed to ensure it meets our high standards.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We constantly evolve and improve our platform with the latest technologies to provide you with the best digital marketplace experience.',
    },
  ];

  const team = [
    {
      name: 'Alex Thompson',
      role: 'Founder & CEO',
      image: '👨‍💼',
      bio: '10+ years in digital products',
    },
    {
      name: 'Sarah Mitchell',
      role: 'Head of Product',
      image: '👩‍💻',
      bio: 'Expert in marketplace platforms',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '👨‍💻',
      bio: 'Tech innovator and architect',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      image: '👩‍🎨',
      bio: 'UI/UX design specialist',
    },
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to create the best digital products marketplace',
    },
    {
      year: '2021',
      title: 'Reached 1,000 Products',
      description: 'Hit our first major milestone with 1,000+ premium products',
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in over 100 countries worldwide',
    },
    {
      year: '2023',
      title: '10,000+ Products',
      description: 'Became one of the largest digital marketplaces with 10K+ products',
    },
    {
      year: '2024',
      title: '50,000+ Customers',
      description: 'Serving a thriving community of creators and customers',
    },
  ];

  const features = [
    {
      icon: Palette,
      title: 'Premium Quality',
      description: 'All products are hand-picked and verified for quality',
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Download your purchases immediately after payment',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Our team is always here to help you succeed',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Bank-level security for all transactions',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 px-4 rounded-b-3xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Trusted Digital Marketplace Since 2020</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            About Our
            <br />
            <span className="text-primary-200">Marketplace</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            We're building the world's most trusted marketplace for digital products, 
            connecting creators with customers globally
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition">
              <stat.icon className="w-12 h-12 mx-auto text-primary-600 mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-primary-100 px-4 py-2 rounded-full mb-4">
              <Rocket className="w-4 h-4 mr-2 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Our Story</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">Building the Future of Digital Commerce</h2>
            
            <div className="space-y-4 text-gray-700 text-lg">
              <p>
                Founded in 2020, our marketplace was born from a simple idea: make it easier 
                for creators to sell their digital products and for customers to find exactly 
                what they need.
              </p>
              
              <p>
                What started as a small platform with a handful of products has grown into a 
                thriving community of over 2,500 vendors and 50,000+ satisfied customers across 
                120 countries.
              </p>
              
              <p>
                Today, we're proud to be one of the leading digital marketplaces, offering 
                everything from WordPress themes and plugins to graphics, templates, and more. 
                Our commitment to quality, security, and customer satisfaction drives everything we do.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl p-8 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" 
                alt="Team collaboration" 
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl">4+ Years</div>
                  <div className="text-sm text-gray-600">Of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container-custom bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-700 text-lg">
              To empower creators worldwide by providing them with a secure, reliable platform 
              to showcase and sell their digital products, while helping customers discover 
              high-quality solutions that meet their needs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-700 text-lg">
              To become the world's most trusted and innovative digital marketplace, where 
              quality meets opportunity, and where creators and customers build lasting 
              relationships through exceptional products and experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            These principles guide every decision we make and shape how we serve our community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container-custom bg-white rounded-3xl shadow-xl p-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
          <p className="text-gray-600 text-lg">Key milestones that shaped our story</p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="bg-white md:bg-transparent p-6 rounded-xl md:shadow-none shadow-lg">
                    <div className="text-primary-600 font-bold text-xl mb-2">{milestone.year}</div>
                    <h3 className="font-bold text-2xl mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                <div className="hidden md:block w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg relative z-10"></div>

                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-gray-600 text-lg">
            The passionate people behind our marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition">{member.image}</div>
              <h3 className="font-bold text-xl mb-1">{member.name}</h3>
              <div className="text-primary-600 font-medium mb-2">{member.role}</div>
              <p className="text-sm text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container-custom bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-3xl p-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            We're committed to providing the best experience for both vendors and customers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition">
              <feature.icon className="w-12 h-12 mb-4" />
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-primary-100">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-custom bg-gray-50 rounded-3xl p-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Join Us?</h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Whether you're looking to buy quality digital products or start selling your own, 
          we'd love to have you as part of our community
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-primary-700 transition shadow-lg"
          >
            Browse Products
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-50 transition shadow-lg border-2 border-primary-600"
          >
            Become a Vendor
          </Link>
        </div>
      </section>

    </div>
  );
}

export default About;
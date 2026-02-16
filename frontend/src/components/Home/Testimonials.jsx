import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Freelance Developer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Mitchell&background=4F46E5&color=fff&size=80',
      text: 'Outstanding marketplace! I purchased a React template for my client\'s e-commerce site and it exceeded expectations. The code quality is professional, well-documented, and saved me weeks of development time. Customer support responded within 2 hours when I had questions.',
      rating: 5,
      company: 'WebCraft Solutions',
      website: 'webcraft.io',
      date: '2 days ago',
      verified: true
    },
    {
      name: 'James Rodriguez',
      role: 'Product Manager',
      avatar: 'https://ui-avatars.com/api/?name=James+Rodriguez&background=059669&color=fff&size=80',
      text: 'The UI kit I bought transformed our entire product. Clean, modern components that integrate seamlessly with our existing codebase. Our design team loved how customizable everything is. Already recommended this marketplace to 3 other companies.',
      rating: 5,
      company: 'TechFlow Inc',
      website: 'techflow.com',
      date: '5 days ago',
      verified: true
    },
    {
      name: 'Emily Chen',
      role: 'Startup Founder',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=DC2626&color=fff&size=80',
      text: 'As a non-technical founder, I was able to launch my SaaS product in just 3 weeks using templates from here. The vendors are incredibly helpful, offering customization services at reasonable rates. This platform literally made my business possible.',
      rating: 5,
      company: 'CloudSync',
      website: 'cloudsync.app',
      date: '1 week ago',
      verified: true
    },
    {
      name: 'Marcus Thompson',
      role: 'Design Agency Owner',
      avatar: 'https://ui-avatars.com/api/?name=Marcus+Thompson&background=7C3AED&color=fff&size=80',
      text: 'We\'ve purchased over 15 products from this marketplace for various client projects. Quality is consistently high, licensing is transparent, and updates are reliable. The vendor community really cares about their work. Best investment for our agency.',
      rating: 5,
      company: 'Pixel Perfect Studio',
      website: 'pixelperfect.design',
      date: '1 week ago',
      verified: true
    },
    {
      name: 'Lisa Anderson',
      role: 'E-commerce Manager',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=EA580C&color=fff&size=80',
      text: 'Bought a Shopify theme and it increased our conversion rate by 34% in the first month. The theme was optimized for speed, mobile-responsive, and came with excellent documentation. The vendor even offered a free customization call. Highly recommend!',
      rating: 5,
      company: 'StyleHub Retail',
      website: 'stylehub.store',
      date: '2 weeks ago',
      verified: true
    },
    {
      name: 'David Park',
      role: 'Full Stack Developer',
      avatar: 'https://ui-avatars.com/api/?name=David+Park&background=0891B2&color=fff&size=80',
      text: 'The code quality here is exceptional. I\'ve worked with templates from other marketplaces, but these are different - clean architecture, TypeScript support, comprehensive testing. Worth every penny. My clients always ask where I get these templates.',
      rating: 5,
      company: 'DevWorks',
      website: 'devworks.dev',
      date: '2 weeks ago',
      verified: true
    },
    {
      name: 'Amanda Foster',
      role: 'Marketing Director',
      avatar: 'https://ui-avatars.com/api/?name=Amanda+Foster&background=BE185D&color=fff&size=80',
      text: 'We needed a landing page template for a product launch with just 1 week notice. Found the perfect template here, customized it in 2 days, and our campaign was a massive success. The template was so well-built that our developer said it was "production-ready out of the box."',
      rating: 5,
      company: 'GrowthLabs',
      website: 'growthlabs.io',
      date: '3 weeks ago',
      verified: true
    },
    {
      name: 'Robert Kim',
      role: 'Software Architect',
      avatar: 'https://ui-avatars.com/api/?name=Robert+Kim&background=16A34A&color=fff&size=80',
      text: 'After evaluating multiple marketplaces, this one stands out for its curation quality. Every product I\'ve purchased has been thoroughly vetted. The vendors are professionals who actually care about their craft. This is now our company\'s go-to source for UI components.',
      rating: 5,
      company: 'Enterprise Solutions Ltd',
      website: 'esolutions.com',
      date: '3 weeks ago',
      verified: true
    }
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center">
      <img 
        src="https://cdn.trustpilot.net/brand-assets/4.1.0/stars/stars-5.svg" 
        alt={`${rating} stars`}
        className="h-4"
        loading="lazy"
      />
    </div>
  );

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-custom">
        {/* Header with Trustpilot branding */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Recent reviews</h2>
          </div>
          
          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex === totalPages - 1}
              className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* User info and rating */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {testimonial.name}
                    </h4>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
              </div>

              {/* Review text */}
              <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-4">
                {testimonial.text}
              </p>

              {/* Company info */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  {testimonial.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {testimonial.company}
                  </div>
                  <div className="text-slate-500 text-xs truncate">
                    {testimonial.website}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="text-xs text-slate-400 mt-3">
                {testimonial.date}
              </div>
            </div>
          ))}
        </div>

        {/* Trustpilot Badge */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 p-8 bg-[#00b67a] rounded-2xl">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
              <img 
                src="https://cdn.trustpilot.net/brand-assets/4.3.0/logo-white.svg" 
                alt="Trustpilot"
                className="h-8"
              />
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-4xl font-bold text-white">4.9</span>
              <div>
                <StarRating rating={5} />
                <p className="text-xs text-white/90 mt-1">Based on 1,847 reviews</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://www.trustpilot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#00b67a] rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              View on Trustpilot
            </a>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Verified Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>50,000+ Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
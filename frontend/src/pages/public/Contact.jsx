import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  HeadphonesIcon,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { submitContactForm } from '../../services/Contact.service';


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@marketplace.com',
      subtext: 'We respond within 24 hours',
      link: 'mailto:support@marketplace.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      subtext: 'Mon-Fri from 9am to 6pm',
      link: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Digital Street',
      subtext: 'San Francisco, CA 94102',
      link: 'https://maps.google.com'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: 'Monday - Friday',
      subtext: '9:00 AM - 6:00 PM PST',
      link: null
    }
  ];

  const departments = [
    {
      icon: HeadphonesIcon,
      title: 'Customer Support',
      email: 'support@marketplace.com',
      description: 'Get help with orders, downloads, and account issues'
    },
    {
      icon: MessageSquare,
      title: 'Sales & Partnership',
      email: 'sales@marketplace.com',
      description: 'Bulk purchases and business inquiries'
    },
    {
      icon: Globe,
      title: 'Vendor Support',
      email: 'vendors@marketplace.com',
      description: 'Support for sellers and product creators'
    }
  ];

  const socialLinks = [
    { icon: Twitter, link: '#', label: 'Twitter' },
    { icon: Facebook, link: '#', label: 'Facebook' },
    { icon: Instagram, link: '#', label: 'Instagram' },
    { icon: Linkedin, link: '#', label: 'LinkedIn' }
  ];

  const faqs = [
    {
      question: 'How long does it take to get a response?',
      answer: 'We typically respond to all inquiries within 24 hours during business days.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes, we offer refunds within 30 days of purchase for eligible products. Contact our support team for assistance.'
    },
    {
      question: 'How do I become a vendor?',
      answer: 'Simply register for a vendor account on our platform and submit your products for review. Our team will guide you through the process.'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const data = await submitContactForm(formData);

    toast.success(data.message);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Failed to send message'
    );
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 px-4 text-center rounded-b-3xl">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">We're Here to Help</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Have a question or need assistance? Our team is ready to help you. 
            Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container-custom">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <a
              key={index}
              href={info.link || '#'}
              target={info.link?.includes('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center group"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition">
                <info.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition" />
              </div>
              <h3 className="font-bold text-lg mb-2">{info.title}</h3>
              <p className="text-gray-900 font-medium mb-1">{info.details}</p>
              <p className="text-sm text-gray-600">{info.subtext}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Main Contact Form + Map */}
      <section className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-8">
              Fill out the form below and we'll get back to you within 24 hours
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white font-semibold px-6 py-4 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map & Additional Info */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-xl h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977839964895!2d-122.41941708468193!3d37.77492977975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>

            {/* Social Links */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Follow Us</h3>
              <p className="text-gray-600 mb-6">
                Stay connected with us on social media for updates and news
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Response Info */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Quick Response Guaranteed</h3>
                  <p className="text-gray-700">
                    Our support team typically responds within 2-4 hours during business hours. 
                    For urgent matters, please call our helpline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Contacts */}
      <section className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Contact by Department</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get in touch with the right team for faster assistance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <dept.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">{dept.title}</h3>
              <p className="text-gray-600 mb-4">{dept.description}</p>
              <a
                href={`mailto:${dept.email}`}
                className="text-primary-600 font-medium hover:underline flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {dept.email}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container-custom bg-gray-50 rounded-3xl p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Quick answers to common questions</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-2 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                {faq.question}
              </h3>
              <p className="text-gray-700 ml-8">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <a
            href="#contact-form"
            className="inline-flex items-center text-primary-600 font-semibold hover:underline"
          >
            Contact our support team
            <Send className="w-4 h-4 ml-2" />
          </a>
        </div>
      </section>

      {/* Office Hours */}
      <section className="container-custom">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-3xl p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Office Hours</h2>
          <div className="max-w-2xl mx-auto space-y-3 text-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Monday - Friday:</span>
              <span>9:00 AM - 6:00 PM PST</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Saturday:</span>
              <span>10:00 AM - 4:00 PM PST</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Sunday:</span>
              <span>Closed</span>
            </div>
          </div>
          <p className="mt-6 text-primary-100">
            For urgent matters outside business hours, please email us and we'll respond as soon as possible
          </p>
        </div>
      </section>

    </div>
  );
}

export default Contact;
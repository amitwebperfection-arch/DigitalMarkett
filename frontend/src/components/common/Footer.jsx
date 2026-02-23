import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';

function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminService.getSettings,
    staleTime: 60000,
  });

  const appearance = settings?.appearance || {};
  const social = settings?.socialLinks || {};
  const siteName = settings?.siteName || "Digital Marketplace";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-semibold text-white">
              {siteName}
            </h3>

            {appearance.footerText && (
              <p className="mt-3 text-sm text-gray-400">
                {appearance.footerText}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">
              Support
            </h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">
              Follow Us
            </h4>

            <div className="flex items-center gap-4">

              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
                  <Facebook className="w-5 h-5" />
                </a>
              )}

              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noreferrer" className="hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
              )}

              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
              )}

              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}

              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noreferrer" className="hover:text-white">
                  <Youtube className="w-5 h-5" />
                </a>
              )}

              {social.github && (
                <a href={social.github} target="_blank" rel="noreferrer" className="hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
              )}

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          {settings?.appearance?.copyrightText?.trim()
            ? settings.appearance.copyrightText
            : `© ${new Date().getFullYear()} ${settings?.siteName || "Digital Marketplace"}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}

export default Footer;

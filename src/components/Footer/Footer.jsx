'use client';
import React from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '../Logo/TifinLogo';

function Footer() {
  const { user, isAuthenticated } = useUser();
  const { theme } = useTheme();

  const linkClass = `text-xs sm:text-sm transition-colors ${
    theme === 'dark'
      ? 'text-gray-400 hover:text-white'
      : 'text-gray-600 hover:text-gray-800'
  }`;

  const socialIconClass = `p-2 rounded-lg transition-colors ${
    theme === 'dark'
      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
  }`;

  const CustomerLinks = () => (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">For Customers</h3>
      <ul className="space-y-1 sm:space-y-2">
        <li><Link href="/kitchens" className={linkClass}>Browse Kitchens</Link></li>
        <li><Link href="/orders" className={linkClass}>Order History</Link></li>
        <li><Link href="/favorites" className={linkClass}>Saved Favorites</Link></li>
        <li><Link href="/rewards" className={linkClass}>Rewards Program</Link></li>
        <li><Link href="/help" className={linkClass}>Customer Support</Link></li>
      </ul>
    </div>
  );

  const SellerLinks = () => (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">For Sellers</h3>
      <ul className="space-y-1 sm:space-y-2">
        <li><Link href="/seller/dashboard" className={linkClass}>Seller Dashboard</Link></li>
        <li><Link href="/seller/register" className={linkClass}>Become a Seller</Link></li>
        <li><Link href="/seller/resources" className={linkClass}>Seller Resources</Link></li>
        <li><Link href="/seller/support" className={linkClass}>Seller Support</Link></li>
        <li><Link href="/seller/guidelines" className={linkClass}>Guidelines</Link></li>
      </ul>
    </div>
  );

  return (
    <footer
      className={`transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
      } border-t`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo + About */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <TifinLogo size="medium" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                <span className="text-orange-600">Tifin</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Connecting food lovers with authentic homemade meals from local sellers. 
              Fresh ingredients, traditional recipes, delivered with love.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className={socialIconClass}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 ..."/>
                </svg>
              </a>
              <a href="#" className={socialIconClass}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69 ..."/>
                </svg>
              </a>
              <a href="#" className={socialIconClass}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367..."/>
                </svg>
              </a>
              <a href="#" className={socialIconClass}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012..."/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {isAuthenticated && user ? (
            user.role === 'customer' ? <CustomerLinks /> : <SellerLinks />
          ) : (
            <>
              <CustomerLinks />
              <SellerLinks />
            </>
          )}

          {/* Company */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link href="/about" className={linkClass}>About Us</Link></li>
              <li><Link href="/careers" className={linkClass}>Careers</Link></li>
              <li><Link href="/blog" className={linkClass}>Blog</Link></li>
              <li><Link href="/press" className={linkClass}>Press</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Support & Legal</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link href="/help" className={linkClass}>Help Center</Link></li>
              <li><Link href="/safety" className={linkClass}>Safety</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms of Service</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/cookies" className={linkClass}>Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`mt-6 sm:mt-8 pt-6 sm:pt-8 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <div
              className={`text-xs sm:text-sm text-center md:text-left ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              © 2025 TifinCart. All rights reserved. Made with ❤️ for food lovers.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

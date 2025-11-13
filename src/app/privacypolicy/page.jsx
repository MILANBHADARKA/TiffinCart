'use client';
import React from 'react';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '@/components/Logo/TifinLogo';

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TifinLogo size="large" />
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-orange-600">Tifin</span>Cart
            </div>
          </div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Privacy Policy
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: 2025-11-13
          </p>
        </div>

        <div className={`prose max-w-none p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 prose-invert' : 'bg-white'
        }`}>
          <h2 className='font-bold text-2xl mt-5 mb-3'>1. Information We Collect</h2>
          <p>We may collect the following information when you use TifinCart:</p>
          <ul>
            <li>Name, email, and phone number</li>
            <li>Location details (city, area)</li>
            <li>Seller business details (kitchen name, address, documents if required)</li>
            <li>Subscription payment metadata (via Razorpay): payment ID, status, method</li>
            {/* <li>Device information (browser, IP address)</li> */}
          </ul>

          <p>
            We <strong>do not</strong> collect or store any Customer order payment details, 
            since order payments are handled directly between Customers and Sellers.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>2. How We Use Your Information</h2>
          <ul>
            <li>To create and manage user accounts</li>
            <li>To activate and verify Seller subscriptions</li>
            <li>To provide platform features and improve functionality</li>
            <li>To offer customer support</li>
            <li>To detect fraud and maintain platform security</li>
          </ul>

          <h2 className='font-bold text-2xl mt-5 mb-3'>3. Payment Information</h2>
          <p>
            Subscription payments are processed through Razorpay.  
            We do not store card/UPI numbers, CVV, or sensitive payment data.
            Only Razorpay handles that information under its own compliance standards (PCI-DSS).
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>4. Sharing of Information</h2>
          <p>We do not sell or rent your personal information.</p>
          <p>
            Information may be shared only with:
          </p>
          <ul>
            <li>Razorpay (for subscription payments)</li>
            <li>Analytics and infrastructure providers</li>
            <li>Law enforcement if required by law</li>
          </ul>

          <h2 className='font-bold text-2xl mt-5 mb-3'>5. Data Security</h2>
          <p>We use encryption, access control, and secure storage practices.  
          However, no system is 100% secure, and we cannot guarantee absolute data protection.</p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>6. Order-Related Data</h2>
          <p>
            Order payments and conversations between Customers and Sellers occur outside TifinCart.
            We only store order metadata (items, delivery area, timestamps) for platform features.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>7. Your Rights</h2>
          <ul>
            <li>Request data deletion</li>
            <li>Request correction of account information</li>
            <li>Request a copy of your stored data</li>
          </ul>

          <h2 className='font-bold text-2xl mt-5 mb-3'>8. Children’s Privacy</h2>
          <p>Our service is not intended for children under 13.</p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>9. Updates</h2>
          <p>
            This policy may be updated periodically. Continued use of the platform means you accept the updated policy.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>10. Contact Us</h2>
          <p>
            Email:  
            <a href="mailto:bhadarkamilan3@gmail.com" className="text-orange-600">
              bhadarkamilan3@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

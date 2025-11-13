'use client';
import React from 'react';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '@/components/Logo/TifinLogo';

export default function TermsAndConditionsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: 2025-11-13
          </p>
        </div>

        <div className={`prose max-w-none p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 prose-invert' : 'bg-white'
        }`}>
          <h2 className='font-bold text-2xl mt-5 mb-3'>1. Overview</h2>
          <p>
            TifinCart is a marketplace platform connecting Customers with independent Sellers 
            (Kitchens) offering home-made tiffin services. We do not prepare, package, or deliver 
            food ourselves.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>2. Platform Role</h2>
          <p>
            TifinCart provides an online platform where Sellers list their tiffin menus and Customers
            place orders. All food preparation, delivery, pricing, and quality are the responsibility 
            of the respective Seller.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>3. Payments</h2>
          <p>
            TifinCart only processes online payments for <strong>Seller subscriptions</strong>.  
            Order payments between Customers and Sellers are handled directly between the two parties 
            and are <strong>not processed through TifinCart</strong>.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>4. Seller Subscription</h2>
          <ul>
            <li>Sellers may purchase a <strong>lifetime subscription</strong> to access premium features.</li>
            <li>Subscriptions are activated immediately after successful payment.</li>
            <li>Once purchased, subscriptions cannot be cancelled.</li>
          </ul>

          <h2 className='font-bold text-2xl mt-5 mb-3'>5. Refund Policy for Subscriptions</h2>
          <p>
            All subscription sales are <strong>final and non-refundable</strong>.
            Refunds are provided only in the following technical cases:
          </p>
          <ul>
            <li>Payment deducted but subscription not activated</li>
            <li>Duplicate payment</li>
            <li>Payment failure confirmed by the payment gateway</li>
          </ul>

          <h2 className='font-bold text-2xl mt-5 mb-3'>6. Order-Level Issues</h2>
          <p>
            TifinCart does not issue refunds, cancellations, or compensation for tiffin orders,
            as these transactions occur directly between Customers and Sellers.
            For any issues related to orders, please contact the Seller directly.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>7. Account Responsibilities</h2>
          <p>
            You must provide accurate account information and are responsible for all activities 
            under your account. Misuse, fraud, or violation of platform rules may result in account 
            suspension.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>8. Intellectual Property</h2>
          <p>
            All platform content, branding, and design belong to TifinCart. Reproduction or misuse 
            is strictly prohibited.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>9. Limitation of Liability</h2>
          <p>
            TifinCart is not liable for food quality, delivery delays, health issues, or any losses 
            caused by Sellers. We act only as a technology platform.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>10. Updates to Terms</h2>
          <p>
            These Terms may be updated at any time. Continued use of the platform indicates 
            acceptance of the updated Terms.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>11. Contact Us</h2>
          <p>
            For any support, contact:  
            <a href="mailto:bhadarkamilan3@gmail.com" className="text-orange-600">
              bhadarkamilan3@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

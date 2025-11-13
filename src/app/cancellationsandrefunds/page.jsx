'use client';
import React from 'react';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '@/components/Logo/TifinLogo';

export default function CancellationsAndRefundsPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TifinLogo size="large" />
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-orange-600">Tifin</span>Cart
            </div>
          </div>

          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Cancellations &amp; Refunds Policy
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: 2025-11-13
          </p>
        </div>

        {/* Content */}
        <div className={`prose max-w-none p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 prose-invert' : 'bg-white'
        }`}>

          <h2 className='font-bold text-2xl mt-5 mb-3'>Scope</h2>
          <p>
            TifinCart processes online payments <strong>only for Seller subscriptions</strong>.
            Customer food order payments are handled directly between Customers and Sellers and
            are <strong>not processed</strong> through TifinCart.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>Subscription Cancellation Policy</h2>
          <p>
            All subscription purchases made by Sellers on TifinCart are final.
            Since this is a <strong>lifetime access subscription</strong>, cancellations are 
            <strong>not permitted</strong> once payment is completed.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>Refund Policy</h2>
          <p>
            TifinCart follows a strict <strong>No Refund Policy</strong> for subscription payments.
            After successful payment, no refunds will be issued for:
          </p>

          <ul>
            <li>1. Change of mind or accidental purchase</li>
            <li>2. Non-usage of the platform</li>
            <li>3. Wrong plan selection</li>
            <li>4. Expectation mismatch</li>
          </ul>

          <h2 className='font-bold text-2xl mt-5 mb-3'>Exceptions (Refunds Allowed Only in These Cases)</h2>
          <p>Refunds are processed only in the following technical or payment-related scenarios:</p>
          <ul>
            <li><strong>1. Payment was charged but subscription was not activated</strong></li>
            <li><strong>2. Duplicate payment</strong> due to payment gateway or network error</li>
            <li><strong>3. Payment failure</strong> where the amount was deducted but Razorpay marks it as failed</li>
          </ul>

          <p>
            In these cases, refunds will be processed to the original payment method via Razorpay.
            Depending on the bank/UPI rules, it may take <strong>3–14 business days</strong> to reflect.
          </p>

          <h2 className='font-bold text-2xl mt-5 mb-3'>Order Cancellations (Customers)</h2>
          <p>
            TifinCart does <strong>not handle refunds or cancellations for tiffin orders</strong>.
            All order payments and settlement happen directly between Customers and Sellers.
            Any order-related refund request must be raised directly with the respective Seller.
          </p>

          <h2>How to Contact Support</h2>
          <p>
            For subscription payment issues, email:
            <br />
            <a href="mailto:bhadarkamilan3@gmail.com" className="text-orange-600">
              bhadarkamilan3@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

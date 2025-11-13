'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '@/components/Logo/TifinLogo';

function ContactUsPage() {
  const { user, isAuthenticated } = useUser();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      category: 'general',
      message: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        reset();
      } else {
        setMessage(result.message || 'Failed to send message. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Support',
      details: 'bhadarkamilan3@gmail.com',
      description: 'Get help with orders, payments, and general inquiries'
    },
    {
      icon: '📱',
      title: 'Phone Support',
      details: '+91 79848 58394',
      description: 'Mon-Sat, 9 AM - 8 PM IST'
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      details: '+91 79848 58394',
      description: 'Quick support via WhatsApp'
    },
  ];

  const faqItems = [
    {
      question: 'How do I place a tiffin order?',
      answer: 'Browse kitchens, select your meal category (Breakfast/Lunch/Dinner), add items to cart, and checkout before the order deadline.'
    },
    {
      question: 'What are the order deadlines?',
      answer: 'Breakfast: Order by 8 PM (previous day), Lunch: Order by 9 AM (same day), Dinner: Order by 4 PM (same day).'
    },
    {
      question: 'How can I become a seller?',
      answer: 'Sign up as a seller, register your kitchen, choose a subscription plan, and start listing your homemade tiffin items.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash on delivery and online payments through UPI, credit/debit cards, and net banking.'
    },
    {
      question: 'How do delivery charges work?',
      answer: 'Each kitchen sets their own delivery charges and minimum order amounts. Many offer free delivery above certain order values.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <TifinLogo size="large" />
            <div className="text-2xl sm:text-3xl font-bold">
              <span className="text-orange-600">Tifin</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
            </div>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            We&apos;re Here to Help! 🤝
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Have questions about orders, deliveries, or want to join as a seller? 
            Our support team is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className={`rounded-xl shadow-lg p-6 sm:p-8 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Send us a Message 📨
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.name 
                        ? 'border-red-500' 
                        : theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    } ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                    placeholder="Enter your name"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby="name-error"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600" id="name-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.email 
                        ? 'border-red-500' 
                        : theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    } ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                    placeholder="Enter your email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby="email-error"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" id="email-error">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    } ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                    aria-invalid={errors.category ? 'true' : 'false'}
                    aria-describedby="category-error"
                  >
                    <option value="general" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>General Inquiry</option>
                    <option value="order" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Order Support</option>
                    <option value="payment" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Payment Help</option>
                    <option value="seller" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Become a Seller</option>
                    <option value="technical" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Technical Support</option>
                    <option value="feedback" className={theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}>Feedback & Suggestions</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600" id="category-error">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    {...register('subject', { required: 'Subject is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.subject 
                        ? 'border-red-500' 
                        : theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    } ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                    placeholder="Brief subject line"
                    aria-invalid={errors.subject ? 'true' : 'false'}
                    aria-describedby="subject-error"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600" id="subject-error">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Message *
                </label>
                <textarea
                  rows={5}
                  {...register('message', { 
                    required: 'Message is required',
                    minLength: {
                      value: 10,
                      message: 'Message must be at least 10 characters'
                    }
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none ${
                    errors.message 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } ${theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                  placeholder="Please describe your inquiry in detail..."
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby="message-error"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600" id="message-error">{errors.message.message}</p>
                )}
              </div>

              {message && (
                <div className={`p-4 rounded-lg border ${
                  messageType === 'success'
                    ? theme === 'dark' 
                      ? 'bg-green-900/50 border-green-700 text-green-300'
                      : 'bg-green-50 border-green-200 text-green-800'
                    : theme === 'dark'
                      ? 'bg-red-900/50 border-red-700 text-red-300'
                      : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {messageType === 'success' ? (
                      <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    <span className="text-sm">{message}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                  theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Message...
                  </div>
                ) : (
                  'Send Message 🚀'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className={`rounded-xl shadow-lg p-6 sm:p-8 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Get in Touch 📞
              </h2>
              <div className="space-y-6">
                {contactInfo.map((contact, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="text-2xl flex-shrink-0">{contact.icon}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {contact.title}
                      </h3>
                      <p className="text-orange-600 font-medium break-all">{contact.details}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contact.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className={`rounded-xl shadow-lg p-6 sm:p-8 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions ❓
              </h2>
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div key={index} className={`border-b pb-4 last:border-b-0 ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {faq.question}
                    </h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-xl shadow-lg p-6 sm:p-8 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions 🚀
              </h2>
              <div className="space-y-3">
                {!isAuthenticated ? (
                  <>
                    <a
                      href="/sign-up"
                      className="block w-full bg-orange-500 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Join TifinCart Today 🍱
                    </a>
                    <a
                      href="/kitchens"
                      className={`block w-full text-center py-3 px-4 rounded-lg font-medium border transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-offset-gray-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white'
                      }`}
                    >
                      Browse Tiffin Kitchens 🏪
                    </a>
                  </>
                ) : user?.role === 'customer' ? (
                  <>
                    <a
                      href="/kitchens"
                      className="block w-full bg-orange-500 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Order Tiffin Now 🍱
                    </a>
                    <a
                      href="/customer/orders"
                      className={`block w-full text-center py-3 px-4 rounded-lg font-medium border transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-offset-gray-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white'
                      }`}
                    >
                      Track Your Orders 📦
                    </a>
                  </>
                ) : user?.role === 'seller' ? (
                  <>
                    <a
                      href="/seller/subscription"
                      className="block w-full bg-green-500 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Manage Subscription 💎
                    </a>
                    <a
                      href="/seller/kitchens"
                      className={`block w-full text-center py-3 px-4 rounded-lg font-medium border transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-offset-gray-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white'
                      }`}
                    >
                      Manage Your Kitchens 🏪
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`mt-12 text-center p-8 rounded-xl ${
          theme === 'dark' ? 'bg-gradient-to-r from-orange-900 to-red-900' : 'bg-gradient-to-r from-orange-50 to-red-50'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Still Have Questions? 🤔
          </h2>
          <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Our dedicated support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:bhadarkamilan3@gmail.com"
              className={`bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'focus:ring-offset-orange-900' : 'focus:ring-offset-orange-50'
              }`}
            >
              Email Us Directly 📧
            </a>
            <a
              href="tel:+917984858394"
              className={`px-6 py-3 rounded-lg font-medium border transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-offset-orange-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-orange-50'
              }`}
            >
              Call Us Now 📱
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;
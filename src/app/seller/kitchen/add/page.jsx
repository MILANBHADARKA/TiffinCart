'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

const cuisineOptions = [
  { value: 'indian', label: 'Indian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'italian', label: 'Italian' },
  { value: 'continental', label: 'Continental' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'thai', label: 'Thai' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'mediterranean', label: 'Mediterranean' }
];

function AddKitchenPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      cuisine: 'indian',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      contact: {
        phone: '',
        email: ''
      },
      license: {
        fssaiNumber: '',
        gstNumber: '',
        businessLicense: ''
      },
      deliveryInfo: {
        deliveryCharge: 30,
        minimumOrder: 100,
        freeDeliveryAbove: 500,
        maxDeliveryDistance: 10
      }
    }
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchSubscription();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/subscription/current', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setMessage('');
    setError('');
    
    try {
      // If user's email is not set as contact email, use it
      if (!data.contact.email) {
        data.contact.email = user.email;
      }
      
      const response = await fetch('/api/seller/kitchen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Kitchen created successfully and submitted for review!');
        setMessageType('success');
        setTimeout(() => {
          router.push('/seller/kitchens');
        }, 2000);
      } else {
        if (result.data?.upgradeRequired) {
          setError(
            <div>
              {result.error}
              <Link href="/seller/subscription" className="ml-2 text-orange-600 underline">
                Upgrade Now
              </Link>
            </div>
          );
        } else {
          setError(result.error || 'Failed to create kitchen');
        }
      }
    } catch (error) {
      console.error('Error creating kitchen:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subscription Warning */}
        {subscription && !subscription.hasSubscription && (
          <div className={`mb-6 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  Free Plan Limitations
                </h3>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  You're on the free plan (1 kitchen, 3 menu items per kitchen). 
                  <Link href="/seller/subscription" className="ml-1 underline">
                    Upgrade to unlock unlimited kitchens and menu items.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <Link href="/seller/kitchens" className="text-orange-600 hover:text-orange-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Kitchens
          </Link>
        </div>

        <div className={`rounded-lg shadow-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add New Kitchen
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Fill in the details to register your kitchen. Once submitted, it will be reviewed by our admin team.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Message */}
            {(message || error) && (
              <div className={`mb-6 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message || error}
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kitchen Name */}
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Kitchen Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register('name', { required: 'Kitchen name is required' })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Enter kitchen name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  {/* Cuisine */}
                  <div>
                    <label htmlFor="cuisine" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Cuisine Type *
                    </label>
                    <select
                      id="cuisine"
                      {...register('cuisine', { required: 'Cuisine is required' })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.cuisine 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                    >
                      {cuisineOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.cuisine && <p className="mt-1 text-sm text-red-500">{errors.cuisine.message}</p>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    {...register('description', { 
                      required: 'Description is required',
                      maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
                    })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                      errors.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="Describe your kitchen, specialties, etc."
                  ></textarea>
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                  <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Max 500 characters
                  </p>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Kitchen Address
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  {/* Street */}
                  <div>
                    <label htmlFor="street" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Street Address *
                    </label>
                    <input
                      id="street"
                      type="text"
                      {...register('address.street', { required: 'Street address is required' })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.address?.street 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Enter street address"
                    />
                    {errors.address?.street && <p className="mt-1 text-sm text-red-500">{errors.address.street.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* City */}
                    <div>
                      <label htmlFor="city" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register('address.city', { required: 'City is required' })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                          errors.address?.city 
                            ? 'border-red-500 focus:ring-red-500' 
                            : theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                        }`}
                        placeholder="City"
                      />
                      {errors.address?.city && <p className="mt-1 text-sm text-red-500">{errors.address.city.message}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label htmlFor="state" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        State *
                      </label>
                      <input
                        id="state"
                        type="text"
                        {...register('address.state', { required: 'State is required' })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                          errors.address?.state 
                            ? 'border-red-500 focus:ring-red-500' 
                            : theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                        }`}
                        placeholder="State"
                      />
                      {errors.address?.state && <p className="mt-1 text-sm text-red-500">{errors.address.state.message}</p>}
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label htmlFor="zipCode" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Zip Code *
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        {...register('address.zipCode', { required: 'Zip code is required' })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                          errors.address?.zipCode 
                            ? 'border-red-500 focus:ring-red-500' 
                            : theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                        }`}
                        placeholder="Zip code"
                      />
                      {errors.address?.zipCode && <p className="mt-1 text-sm text-red-500">{errors.address.zipCode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Contact Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('contact.phone', { required: 'Phone number is required' })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.contact?.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Contact phone number"
                    />
                    {errors.contact?.phone && <p className="mt-1 text-sm text-red-500">{errors.contact.phone.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Contact Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('contact.email')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.contact?.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder={`Default: ${user?.email || 'Your account email'}`}
                    />
                    <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Leave blank to use your account email
                    </p>
                  </div>
                </div>
              </div>

              {/* License Section */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  License & Legal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FSSAI License */}
                  <div>
                    <label htmlFor="fssaiNumber" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      FSSAI License Number *
                    </label>
                    <input
                      id="fssaiNumber"
                      type="text"
                      {...register('license.fssaiNumber', { required: 'FSSAI license number is required' })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.license?.fssaiNumber 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Enter FSSAI license number"
                    />
                    {errors.license?.fssaiNumber && <p className="mt-1 text-sm text-red-500">{errors.license.fssaiNumber.message}</p>}
                  </div>

                  {/* GST Number */}
                  <div>
                    <label htmlFor="gstNumber" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      GST Number (if applicable)
                    </label>
                    <input
                      id="gstNumber"
                      type="text"
                      {...register('license.gstNumber')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Enter GST number (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Charge */}
                  <div>
                    <label htmlFor="deliveryCharge" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Delivery Charge (₹)
                    </label>
                    <input
                      id="deliveryCharge"
                      type="number"
                      min="0"
                      {...register('deliveryInfo.deliveryCharge', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Delivery charge cannot be negative' }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.deliveryInfo?.deliveryCharge 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Delivery charge"
                    />
                    {errors.deliveryInfo?.deliveryCharge && <p className="mt-1 text-sm text-red-500">{errors.deliveryInfo.deliveryCharge.message}</p>}
                  </div>

                  {/* Minimum Order */}
                  <div>
                    <label htmlFor="minimumOrder" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      id="minimumOrder"
                      type="number"
                      min="0"
                      {...register('deliveryInfo.minimumOrder', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Minimum order amount cannot be negative' }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.deliveryInfo?.minimumOrder 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Minimum order amount"
                    />
                    {errors.deliveryInfo?.minimumOrder && <p className="mt-1 text-sm text-red-500">{errors.deliveryInfo.minimumOrder.message}</p>}
                  </div>

                  {/* Free Delivery Above */}
                  <div>
                    <label htmlFor="freeDeliveryAbove" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Free Delivery Above (₹)
                    </label>
                    <input
                      id="freeDeliveryAbove"
                      type="number"
                      min="0"
                      {...register('deliveryInfo.freeDeliveryAbove', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Free delivery threshold cannot be negative' }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Free delivery above amount"
                    />
                  </div>

                  {/* Max Delivery Distance */}
                  <div>
                    <label htmlFor="maxDeliveryDistance" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Max Delivery Distance (km)
                    </label>
                    <input
                      id="maxDeliveryDistance"
                      type="number"
                      min="1"
                      max="50"
                      {...register('deliveryInfo.maxDeliveryDistance', {
                        valueAsNumber: true,
                        min: { value: 1, message: 'Minimum distance is 1 km' },
                        max: { value: 50, message: 'Maximum distance is 50 km' }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Maximum delivery distance"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-6">
                <div className={`p-4 border rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className={`font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Terms and Conditions
                      </label>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        I agree that all information provided is accurate. I understand that my kitchen will be reviewed by admin before being listed on the platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-5">
                <div className="flex justify-end">
                  <Link
                    href="/seller/kitchens"
                    className={`mr-3 py-2 px-4 rounded-lg text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg shadow-sm hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Kitchen'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddKitchenPage;
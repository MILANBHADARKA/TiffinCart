'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
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

function NewKitchenPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const { register, handleSubmit, control, formState: { errors } } = useForm({
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
      operatingHours: {
        morning: { open: '07:00', close: '10:00' },
        afternoon: { open: '12:00', close: '15:00' },
        evening: { open: '18:00', close: '21:00' }
      },
      deliveryInfo: {
        deliveryRadius: 10,
        minimumOrder: 100,
        deliveryFee: 0,
        estimatedDeliveryTime: 30
      }
    }
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, user, isLoading, router]);

  const onSubmit = async (data) => {
    setFormSubmitting(true);
    setMessage('');
    
    try {
      // If user's email is not set as contact email, use it
      if (!data.contact.email) {
        data.contact.email = user.email;
      }
      
      const response = await fetch('/api/seller/kitchens', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Kitchen registered successfully! It will be reviewed by admin before getting listed.');
        setMessageType('success');
        setTimeout(() => {
          router.push('/seller/kitchens');
        }, 3000);
      } else {
        setMessage(result.error || 'Something went wrong');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error submitting kitchen:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Register New Kitchen
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Fill in the details to register your kitchen. Once submitted, it will be reviewed by our admin team.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
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
                  {/* Delivery Radius */}
                  <div>
                    <label htmlFor="deliveryRadius" className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Delivery Radius (km)
                    </label>
                    <input
                      id="deliveryRadius"
                      type="number"
                      min="1"
                      max="50"
                      {...register('deliveryInfo.deliveryRadius', {
                        valueAsNumber: true,
                        min: { value: 1, message: 'Minimum radius is 1 km' },
                        max: { value: 50, message: 'Maximum radius is 50 km' }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                        errors.deliveryInfo?.deliveryRadius 
                          ? 'border-red-500 focus:ring-red-500' 
                          : theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                            : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="Delivery radius in km"
                    />
                    {errors.deliveryInfo?.deliveryRadius && <p className="mt-1 text-sm text-red-500">{errors.deliveryInfo.deliveryRadius.message}</p>}
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
                </div>
              </div>

              {/* Operating Hours Section */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Operating Hours
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Morning Hours */}
                  <div className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Morning Hours
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Open
                        </label>
                        <input
                          type="time"
                          {...register('operatingHours.morning.open')}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Close
                        </label>
                        <input
                          type="time"
                          {...register('operatingHours.morning.close')}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Afternoon Hours */}
                  <div className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Afternoon Hours
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Open
                        </label>
                        <input
                          type="time"
                          {...register('operatingHours.afternoon.open')}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Close
                        </label>
                        <input
                          type="time"
                          {...register('operatingHours.afternoon.close')}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Evening Hours */}
                  <div className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Evening Hours
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Open
                        </label>
                        <input
                          type="time"
                          {...register('operatingHours.evening.open')}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Close
                        </label>
                        <input
                          type="time"
                          {...register('operatingHours.evening.close')}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                    </div>
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
                    disabled={formSubmitting}
                    className="py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg shadow-sm hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Submitting...' : 'Submit for Approval'}
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

export default NewKitchenPage;

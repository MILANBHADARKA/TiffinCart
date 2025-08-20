'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function DeliverySettingsPage() {
  const { id: kitchenId } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [kitchen, setKitchen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      deliveryCharge: 30,
      freeDeliveryAbove: 500,
      minimumOrder: 100
    }
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchenData();
    }
  }, [isAuthenticated, isLoading, router, kitchenId]);

  const fetchKitchenData = async () => {
    try {
      const response = await fetch(`/api/seller/kitchen/${kitchenId}`, {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        const kitchenData = result.data.kitchen;
        setKitchen(kitchenData);
        
        // Populate form with existing data
        if (kitchenData.deliveryInfo) {
          setValue('deliveryCharge', kitchenData.deliveryInfo.deliveryCharge || 30);
          setValue('freeDeliveryAbove', kitchenData.deliveryInfo.freeDeliveryAbove || 500);
          setValue('minimumOrder', kitchenData.deliveryInfo.minimumOrder || 100);
        }
      }
    } catch (error) {
      console.error('Error fetching kitchen data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/seller/kitchen/${kitchenId}/delivery-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Delivery settings updated successfully!');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Failed to update delivery settings');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDeliveryFee = (orderAmount) => {
    const freeDeliveryThreshold = watch('freeDeliveryAbove');
    if (freeDeliveryThreshold && orderAmount >= freeDeliveryThreshold) {
      return 0;
    }
    return watch('deliveryCharge') || 30;
  };

  if (loading) {
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Delivery Settings - {kitchen?.name}
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Configure your delivery charges and minimum order
            </p>
          </div>
          <Link
            href={`/seller/kitchen/${kitchenId}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Back
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        <div className={`rounded-lg shadow-md ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="deliveryCharge" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Delivery Charge (₹)*
                </label>
                <input
                  id="deliveryCharge"
                  type="number"
                  min="0"
                  step="1"
                  {...register('deliveryCharge', { 
                    required: 'Delivery charge is required',
                    min: { value: 0, message: 'Charge must be positive' }
                  })}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.deliveryCharge 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {errors.deliveryCharge && (
                  <p className="mt-1 text-sm text-red-500">{errors.deliveryCharge.message}</p>
                )}
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fixed delivery fee for all orders within your service area
                </p>
              </div>

              <div>
                <label htmlFor="freeDeliveryAbove" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Free Delivery Above (₹)
                </label>
                <input
                  id="freeDeliveryAbove"
                  type="number"
                  min="0"
                  step="1"
                  {...register('freeDeliveryAbove')}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Orders above this amount will have free delivery (leave empty to disable)
                </p>
              </div>

              <div>
                <label htmlFor="minimumOrder" className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Minimum Order Amount (₹)*
                </label>
                <input
                  id="minimumOrder"
                  type="number"
                  min="1"
                  step="1"
                  {...register('minimumOrder', { 
                    required: 'Minimum order is required',
                    min: { value: 1, message: 'Amount must be at least ₹1' }
                  })}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.minimumOrder 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {errors.minimumOrder && (
                  <p className="mt-1 text-sm text-red-500">{errors.minimumOrder.message}</p>
                )}
              </div>
            </div>

            {/* Fee Preview */}
            <div className={`mt-6 p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
            }`}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                💰 Delivery Fee Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Order ₹300:</strong><br/>
                  Delivery: ₹{calculateDeliveryFee(300)}
                </div>
                <div>
                  <strong>Order ₹{watch('freeDeliveryAbove') || 500}:</strong><br/>
                  Delivery: ₹{calculateDeliveryFee(watch('freeDeliveryAbove') || 500)}
                </div>
                <div>
                  <strong>Order ₹800:</strong><br/>
                  Delivery: ₹{calculateDeliveryFee(800)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DeliverySettingsPage;
                       
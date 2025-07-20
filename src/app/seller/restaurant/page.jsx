'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function KitchenManagement() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [kitchen, setKitchen] = useState({
    isOpen: false,
    openingTime: '09:00',
    closingTime: '22:00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchenStatus();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const fetchKitchenStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/seller/kitchen', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchen(result.data);
      } else {
        setError(result.error || 'Failed to fetch kitchen status');
      }
    } catch (error) {
      console.error('Error fetching kitchen status:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateKitchenStatus = async (updates) => {
    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/seller/kitchen', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchen(prev => ({ ...prev, ...updates }));
      } else {
        setError(result.error || 'Failed to update kitchen status');
      }
    } catch (error) {
      console.error('Error updating kitchen status:', error);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleKitchenStatus = () => {
    updateKitchenStatus({ isOpen: !kitchen.isOpen });
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading kitchen settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Kitchen Management 🏪
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your kitchen status and operating hours
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className={`p-6 rounded-lg border mb-8 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Kitchen Status
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Control whether customers can place orders
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                kitchen.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {kitchen.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${kitchen.isOpen ? '🟢' : '🔴'}`}>
                {kitchen.isOpen ? '🟢' : '🔴'}
              </div>
              <div>
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {kitchen.isOpen ? 'Kitchen is Open' : 'Kitchen is Closed'}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {kitchen.isOpen 
                    ? 'Customers can place orders' 
                    : 'Customers cannot place orders'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={toggleKitchenStatus}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                kitchen.isOpen
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50`}
            >
              {saving ? 'Updating...' : kitchen.isOpen ? 'Close Kitchen' : 'Open Kitchen'}
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Operating Hours
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Opening Time
              </label>
              <input
                type="time"
                value={kitchen.openingTime}
                onChange={(e) => setKitchen(prev => ({ ...prev, openingTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Closing Time
              </label>
              <input
                type="time"
                value={kitchen.closingTime}
                onChange={(e) => setKitchen(prev => ({ ...prev, closingTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => updateKitchenStatus({ 
                openingTime: kitchen.openingTime, 
                closingTime: kitchen.closingTime 
              })}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Hours'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className={`p-6 rounded-lg border text-center ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-3xl mb-2">📊</div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Today's Orders
            </h3>
            <p className="text-2xl font-bold text-orange-600">8</p>
          </div>
          
          <div className={`p-6 rounded-lg border text-center ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-3xl mb-2">💰</div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Today's Revenue
            </h3>
            <p className="text-2xl font-bold text-green-600">₹1,250</p>
          </div>
          
          <div className={`p-6 rounded-lg border text-center ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-3xl mb-2">⭐</div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Average Rating
            </h3>
            <p className="text-2xl font-bold text-yellow-600">4.6</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KitchenManagement;

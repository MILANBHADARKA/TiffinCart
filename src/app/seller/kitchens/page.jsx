'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SellerKitchens() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchens();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/seller/kitchens', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchens(result.data.kitchens);
      } else {
        setError(result.error || 'Failed to fetch kitchens');
      }
    } catch (error) {
      console.error('Error fetching kitchens:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading kitchens...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              My Kitchens 🏪
            </h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your kitchen listings and operations
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
          >
            + Add New Kitchen
          </button>
        </div>

        {/* Error Message */}
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

        {/* Kitchens Grid */}
        {kitchens.length === 0 ? (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-medium mb-2">No kitchens yet</h3>
            <p className="text-sm mb-6">Create your first kitchen to start selling delicious food!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Create First Kitchen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kitchens.map((kitchen) => (
              <div
                key={kitchen._id}
                className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                {/* Kitchen Image */}
                <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                  <span className="text-6xl">🏪</span>
                </div>

                {/* Kitchen Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {kitchen.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {kitchen.cuisine} • {kitchen.address.city}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        kitchen.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : kitchen.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {kitchen.status}
                      </span>
                      <button
                        className={`w-8 h-4 rounded-full transition-colors ${
                          kitchen.isCurrentlyOpen ? 'bg-green-500' : 'bg-gray-300'
                        } relative`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${
                            kitchen.isCurrentlyOpen ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {kitchen.description.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {kitchen.ratings.average.toFixed(1)} ({kitchen.ratings.totalReviews})
                      </span>
                    </div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Min: ₹{kitchen.deliveryInfo.minimumOrder}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href={`/seller/kitchen/${kitchen._id}/dashboard`}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all text-center block"
                    >
                      Manage Kitchen
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/seller/kitchen/${kitchen._id}/menu`}
                        className={`py-2 px-3 border rounded-lg text-center transition-colors text-sm font-medium ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Menu
                      </Link>
                      <Link
                        href={`/seller/kitchen/${kitchen._id}/orders`}
                        className={`py-2 px-3 border rounded-lg text-center transition-colors text-sm font-medium ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Orders
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Kitchen Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full rounded-lg shadow-lg max-h-screen overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Add New Kitchen
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`text-gray-400 hover:text-gray-600`}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🚧</div>
                    <h4 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Kitchen Registration Form
                    </h4>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Complete kitchen registration form will be implemented here with:
                    </p>
                    <ul className={`text-sm text-left space-y-2 mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <li>• Basic kitchen information (name, description, cuisine)</li>
                      <li>• Address and location details</li>
                      <li>• Contact information</li>
                      <li>• Operating hours</li>
                      <li>• Delivery settings</li>
                      <li>• License and banking details</li>
                      <li>• Kitchen images</li>
                    </ul>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Coming Soon - Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerKitchens;

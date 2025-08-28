'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SellerKitchenEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();

  const [kitchen, setKitchen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Simplified form states - removed operatingHours
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    isCurrentlyOpen: true,
    contact: {
      phone: '',
      email: ''
    },
    deliveryInfo: {
      minimumOrder: 0,
      deliveryCharge: 0,
      freeDeliveryAbove: 0
    }
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchen();
    }
  }, [isAuthenticated, isLoading, user, router, id]);

  const fetchKitchen = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/seller/kitchen/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch kitchen');
      }

      const result = await response.json();
      if (result.success) {
        const kitchenData = result.data.kitchen;
        setKitchen(kitchenData);
        setFormData({
          name: kitchenData.name || '',
          description: kitchenData.description || '',
          cuisine: kitchenData.cuisine || '',
          isCurrentlyOpen: kitchenData.isCurrentlyOpen ?? true,
          contact: {
            phone: kitchenData.contact?.phone || '',
            email: kitchenData.contact?.email || ''
          },
          deliveryInfo: {
            minimumOrder: kitchenData.deliveryInfo?.minimumOrder || 0,
            deliveryCharge: kitchenData.deliveryInfo?.deliveryCharge || 0,
            freeDeliveryAbove: kitchenData.deliveryInfo?.freeDeliveryAbove || 0
          }
        });
      } else {
        setError(result.error || 'Failed to fetch kitchen');
      }
    } catch (error) {
      console.error('Error fetching kitchen:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        [field]: value
      }));
  };

  const handleNestedChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const datatobesend = {
        ...formData,
        deliveryInfo: {
          minimumOrder: Number(formData.deliveryInfo.minimumOrder) || 0,
          deliveryCharge: Number(formData.deliveryInfo.deliveryCharge) || 0,
          freeDeliveryAbove: Number(formData.deliveryInfo.freeDeliveryAbove) || 0
        }
      }

      const response = await fetch(`/api/seller/kitchen/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datatobesend),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Kitchen updated successfully!');
        setMessageType('success');
        setKitchen(result.data.kitchen);
        setTimeout(() => {
          router.push(`/seller/kitchen/${id}/dashboard`);
        }, 2000);
      } else {
        setMessage(result.error || 'Failed to update kitchen');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating kitchen:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const cuisineOptions = [
    'North Indian', 'South Indian', 'Gujarati', 'Punjabi', 'Bengali',
    'Maharashtrian', 'Chinese', 'Italian', 'Continental', 'Multi-Cuisine'
  ];

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !kitchen) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Kitchen not found'}
          </h2>
          <Link
            href="/seller/kitchens"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Kitchens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Edit Kitchen - {kitchen?.name}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Update your kitchen information and settings
            </p>
          </div>
          <Link
            href={`/seller/kitchen/${id}`}
            className={`px-4 py-2 rounded-lg border ${theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            ← Cancel
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <p>{message}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-md`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Kitchen Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Cuisine Type
                </label>
                <select
                  value={formData.cuisine}
                  onChange={(e) => handleChange("cuisine",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                >
                  <option value="">Select Cuisine</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description",e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                  }`}
                placeholder="Describe your kitchen and specialties..."
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isCurrentlyOpen}
                  onChange={(e) => handleChange("isCurrentlyOpen",e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kitchen is currently accepting orders
                </span>
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-md`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleNestedChange("contact","phone",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  placeholder="Your contact number"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleNestedChange("contact","email",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  placeholder="Kitchen contact email"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Delivery Settings */}
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-md`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Delivery Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Minimum Order (₹)
                </label>
                <input
                  type="text"
                  // value={formData.deliveryInfo.minimumOrder}
                  onChange={(e) => handleNestedChange("deliveryInf","minimumOrder",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  placeholder={formData.deliveryInfo.minimumOrder}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Minimum order value required
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Delivery Charge (₹)
                </label>
                <input
                  type="text"
                  // value={formData.deliveryInfo.deliveryCharge}
                  onChange={(e) => handleNestedChange("deliveryInfo","deliveryCharge",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  placeholder={formData.deliveryInfo.deliveryCharge}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fixed delivery fee for all orders
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Free Delivery Above (₹)
                </label>
                <input
                  type="text"
                  // value={formData.deliveryInfo.freeDeliveryAbove}
                  onChange={(e) => handleNestedChange("deliveryInfo","freeDeliveryAbove",e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  placeholder={formData.deliveryInfo.freeDeliveryAbove}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Orders above this get free delivery
                </p>
              </div>
            </div>

            {/* Delivery Preview */}
            <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-600' : 'bg-blue-50 border border-blue-200'
              }`}>
              <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                💡 Delivery Fee Preview
              </h4>
              <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                <p>• Orders below ₹{formData.deliveryInfo.freeDeliveryAbove || 500}: ₹{formData.deliveryInfo.deliveryCharge || 30} delivery</p>
                <p>• Orders above ₹{formData.deliveryInfo.freeDeliveryAbove || 500}: Free delivery</p>
                <p>• Minimum order: ₹{formData.deliveryInfo.minimumOrder || 200}</p>
              </div>
            </div>
          </div>

          {/* Tiffin Service Information - Static display instead of editable hours */}
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-md`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tiffin Service Schedule
            </h2>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'
              }`}>
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Standard tiffin delivery times (fixed schedule):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="font-medium">🌅 Breakfast</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    7:00 AM - 10:00 AM
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Order by 8:00 PM (previous day)
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">🌞 Lunch</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    12:00 PM - 3:00 PM
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Order by 9:00 AM (same day)
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium">🌙 Dinner</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    7:00 PM - 10:00 PM
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Order by 4:00 PM (same day)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/seller/kitchen/${id}`}
              className={`px-6 py-3 rounded-lg border font-medium ${theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerKitchenEditPage;

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function MenuManagement() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [kitchen, setKitchen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch kitchen details
      const kitchenResponse = await fetch(`/api/seller/kitchen/${id}`, {
        credentials: 'include'
      });
      
      const kitchenResult = await kitchenResponse.json();
      
      if (!kitchenResult.success) {
        setError(kitchenResult.error || 'Failed to fetch kitchen details');
        setLoading(false);
        return;
      }
      
      setKitchen(kitchenResult.data.kitchen);
      
      // Fetch menu items
      const menuResponse = await fetch(`/api/seller/kitchen/${id}/menu`, {
        credentials: 'include'
      });
      
      const menuResult = await menuResponse.json();
      
      if (!menuResult.success) {
        setError(menuResult.error || 'Failed to fetch menu items');
        setLoading(false);
        return;
      }
      
      setMenuItems(menuResult.data.items);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(menuResult.data.items.map(item => item.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemAvailability = async (itemId, currentStatus) => {
    try {
      const response = await fetch(`/api/seller/kitchen/${id}/menu/${itemId}/toggle-availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMenuItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId 
              ? { ...item, isAvailable: !item.isAvailable } 
              : item
          )
        );
      } else {
        setError(result.error || 'Failed to update item availability');
      }
    } catch (error) {
      console.error('Error updating item availability:', error);
      setError('Network error. Please try again.');
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/seller/kitchen/${id}/menu/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMenuItems(prevItems => prevItems.filter(item => item._id !== itemId));
      } else {
        setError(result.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Network error. Please try again.');
    }
  };

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading menu data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !kitchen) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Kitchen not found'}
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            We couldn't load this kitchen's menu data.
          </p>
          <Link 
            href="/seller/kitchens" 
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to My Kitchens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Kitchen Details */}
        <div className={`mb-8 p-6 rounded-lg shadow-md ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {kitchen.name}
                </h1>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  kitchen.isCurrentlyOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {kitchen.isCurrentlyOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {kitchen.cuisine} Cuisine • Menu Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Link
              href={`/seller/kitchen/${id}/dashboard`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href={`/seller/kitchen/${id}/menu`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              Menu
            </Link>
            <Link
              href={`/seller/kitchen/${id}/orders`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Orders
            </Link>
            <Link
              href={`/seller/kitchen/${id}/reviews`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reviews
            </Link>
            <Link
              href={`/seller/kitchen/${id}/settings`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Menu Management */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Menu Items
            </h2>
            <Link
              href={`/seller/kitchen/${id}/menu/add`}
              className="mt-4 sm:mt-0 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Menu Item
            </Link>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div 
                  key={item._id} 
                  className={`rounded-lg border overflow-hidden transition-all hover:shadow-md ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="h-48 bg-gray-300 relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-400">
                        <span className="text-5xl">🍲</span>
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                      item.isVeg 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Currently Unavailable
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.category}
                      </span>
                      {item.spiciness && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.spiciness === 'mild' ? '🌶️' : item.spiciness === 'medium' ? '🌶️🌶️' : '🌶️🌶️🌶️'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={() => toggleItemAvailability(item._id, item.isAvailable)}
                        className={`px-3 py-1.5 rounded text-xs font-medium ${
                          item.isAvailable
                            ? theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <div className="flex space-x-2">
                        <Link
                          href={`/seller/kitchen/${id}/menu/${item._id}/edit`}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteMenuItem(item._id)}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="text-6xl mb-4">🍽️</div>
              <p className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No menu items yet
              </p>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Start by adding your first dish to the menu.
              </p>
              <Link 
                href={`/seller/kitchen/${id}/menu/add`}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add First Menu Item
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuManagement;

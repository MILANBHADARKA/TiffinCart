'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import SimpleReview from '@/components/SimpleReview/SimpleReview';

function KitchenDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();

  const [kitchen, setKitchen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showKitchenConfirm, setShowKitchenConfirm] = useState(null);

  useEffect(() => {
    fetchKitchenData();
  }, [id]);

  const fetchKitchenData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch kitchen details
      const kitchenResponse = await fetch(`/api/kitchen/${id}`, {
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

      const items = menuResult.data.items.filter(item => item.isAvailable);
      setMenuItems(items);

      // Extract unique categories
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching kitchen data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItemId, clearCart = false) => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    if (user.role !== 'customer') {
      setMessage('Only customers can add items to cart');
      setMessageType('error');
      return;
    }

    try {
      setIsAddingToCart(prev => ({ ...prev, [menuItemId]: true }));
      setMessage('');
      
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItemId, quantity: 1, clearCart }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Item added to cart!');
        setMessageType('success');
        setShowKitchenConfirm(null);
        setTimeout(() => setMessage(''), 3000);
      } else if (result.error === 'DIFFERENT_KITCHEN') {
        setShowKitchenConfirm({
          menuItemId,
          existingKitchenName: result.data.existingKitchenName,
          newKitchenName: result.data.newKitchenName
        });
      } else {
        setMessage(result.error || 'Failed to add item to cart');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [menuItemId]: false }));
    }
  };

  const handleKitchenConfirm = (confirmed) => {
    if (confirmed && showKitchenConfirm) {
      addToCart(showKitchenConfirm.menuItemId, true);
    } else {
      setShowKitchenConfirm(null);
    }
  };

  const getDeliveryWindow = (category) => {
    const windows = {
      'Breakfast': '7:00 AM - 10:00 AM',
      'Lunch': '12:00 PM - 3:00 PM', 
      'Dinner': '7:00 PM - 10:00 PM'
    };
    return windows[category] || 'Contact seller for timing';
  };

  // SIMPLIFIED: Only use fixed deadlines, ignore individual item advance hours
  const getCurrentMealAvailability = (category) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + (currentMinutes / 60);
    
    // Fixed deadlines only - no individual item advance hours
    const cutoffTimes = {
      'Breakfast': 20, // 8 PM previous day for next day delivery
      'Lunch': 9,     // 9 AM same day for same day delivery  
      'Dinner': 16    // 4 PM same day for same day delivery
    };
    
    const cutoffTime = cutoffTimes[category];
    if (cutoffTime === undefined) return false;
    
    return currentTime < cutoffTime;
  };

  const getOrderDeadlineText = (category) => {
    const deadlines = {
      'Breakfast': 'Order by 8:00 PM today for tomorrow\'s breakfast delivery',
      'Lunch': 'Order by 9:00 AM today for today\'s lunch delivery',
      'Dinner': 'Order by 4:00 PM today for today\'s dinner delivery'
    };
    
    const isAvailable = getCurrentMealAvailability(category);
    
    if (!isAvailable) {
      const nextAvailable = {
        'Breakfast': 'Next available: After 12:00 AM tonight',
        'Lunch': 'Next available: Tomorrow before 9:00 AM',
        'Dinner': 'Next available: Tomorrow before 4:00 PM'
      };
      return nextAvailable[category];
    }
    
    return deadlines[category];
  };

  const getTimeRemaining = (category) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const cutoffTimes = {
      'Breakfast': 20, // 8 PM
      'Lunch': 9,     // 9 AM
      'Dinner': 16    // 4 PM
    };
    
    const cutoffHour = cutoffTimes[category];
    if (cutoffHour === undefined) return null;
    
    let targetTime = new Date();
    targetTime.setHours(cutoffHour, 0, 0, 0);
    
    // If past deadline, no time remaining
    if (currentHour >= cutoffHour) {
      return null;
    }
    
    const timeDiff = targetTime.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursRemaining <= 0 && minutesRemaining <= 0) {
      return null;
    }
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m left to order`;
    } else {
      return `${minutesRemaining}m left to order`;
    }
  };

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading kitchen menu...
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
            We couldn't load this kitchen's data.
          </p>
          <Link
            href="/kitchens"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Other Kitchens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Kitchen Confirmation Modal */}
      {showKitchenConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Different Kitchen Detected
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Your cart contains items from <span className="font-medium">{showKitchenConfirm.existingKitchenName}</span>. 
                Adding items from <span className="font-medium">{showKitchenConfirm.newKitchenName}</span> will clear your current cart.
              </p>
              <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                🍱 You can only order from one kitchen at a time for better delivery coordination.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleKitchenConfirm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Keep Current Cart
                </button>
                <button
                  onClick={() => handleKitchenConfirm(true)}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Clear & Add New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kitchen Header */}
        <div className={`mb-8 p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex flex-col md:flex-row justify-between">
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
                  {kitchen.isCurrentlyOpen ? 'Accepting Orders' : 'Closed'}
                </span>
              </div>
              <p className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {kitchen.cuisine} Tiffin Service • {kitchen.address.city}, {kitchen.address.state}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500">⭐</span>
                <span className={`text-sm ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {kitchen.ratings.average.toFixed(1)} ({kitchen.ratings.totalReviews} reviews)
                </span>
                <button 
                  onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}
                  className="ml-2 text-orange-600 hover:text-orange-700 text-sm underline"
                >
                  Read reviews
                </button>
              </div>
              <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {kitchen.description}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Tiffin Delivery Times
                      </p>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Breakfast: 7-10 AM | Lunch: 12-3 PM | Dinner: 7-10 PM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Min. Order
                      </p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ₹{kitchen.deliveryInfo.minimumOrder}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Delivery Charge
                      </p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {kitchen.deliveryInfo.freeDeliveryAbove ? (
                          <>₹{kitchen.deliveryInfo.deliveryCharge} (Free above ₹{kitchen.deliveryInfo.freeDeliveryAbove})</>
                        ) : (
                          <>₹{kitchen.deliveryInfo.deliveryCharge}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded text-center ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-orange-100'
                  }`}>
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-orange-300' : 'text-orange-800'}`}>
                      📦 Eco-friendly packaging • 🏠 Homemade fresh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        {/* Category Tabs with Timing Info */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Tiffins
            </button>
            {categories.map((category) => {
              const isAvailable = getCurrentMealAvailability(category);
              const timeRemaining = getTimeRemaining(category);
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap flex flex-col min-w-[140px] ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span className="font-semibold">{category}</span>
                  <span className={`text-xs ${
                    selectedCategory === category 
                      ? 'text-orange-100' 
                      : isAvailable 
                        ? 'text-green-600' 
                        : 'text-red-600'
                  }`}>
                    {getDeliveryWindow(category)}
                  </span>
                  {isAvailable && timeRemaining ? (
                    <span className={`text-xs font-medium ${
                      selectedCategory === category 
                        ? 'text-yellow-200' 
                        : 'text-orange-600'
                    }`}>
                      ⏰ {timeRemaining}
                    </span>
                  ) : !isAvailable ? (
                    <span className="text-xs text-red-500 font-medium">
                      ❌ Deadline passed
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          
          {/* Order Deadline Info */}
          <div className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-200'
          }`}>
            <h4 className={`font-medium mb-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📅 Order Deadlines & Delivery Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                const isAvailable = getCurrentMealAvailability(meal);
                const deadlineText = getOrderDeadlineText(meal);
                const timeRemaining = getTimeRemaining(meal);
                
                return (
                  <div 
                    key={meal}
                    className={`p-3 rounded border text-center ${
                      isAvailable 
                        ? theme === 'dark' 
                          ? 'bg-green-900/30 border-green-600 text-green-300' 
                          : 'bg-green-50 border-green-200 text-green-800'
                        : theme === 'dark'
                          ? 'bg-red-900/30 border-red-600 text-red-300'
                          : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">
                      {meal} {isAvailable ? '✅' : '❌'}
                    </div>
                    <div className="text-xs">
                      {isAvailable && timeRemaining ? (
                        <div>
                          <div className="font-medium text-orange-600">{timeRemaining}</div>
                          <div>{deadlineText}</div>
                        </div>
                      ) : (
                        <div>{deadlineText}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => {
            const isMealAvailable = getCurrentMealAvailability(item.category);
            const canOrder = kitchen.isCurrentlyOpen && item.isAvailable && isMealAvailable;
            const timeRemaining = getTimeRemaining(item.category);
            
            return (
              <div
                key={item._id}
                className={`rounded-lg border overflow-hidden transition-all hover:shadow-md ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${!isMealAvailable ? 'opacity-75' : ''}`}
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
                      <span className="text-5xl">🍱</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.isVeg 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isVeg ? '🌿 Veg' : '🍖 Non-Veg'}
                    </span>
                    {item.spiciness && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                        {item.spiciness === 'mild' ? '🌶️' : item.spiciness === 'medium' ? '🌶️🌶️' : '🌶️🌶️🌶️'}
                      </span>
                    )}
                  </div>
                  
                  {/* Order Deadline Overlay */}
                  {!isMealAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <div className="text-2xl mb-2">⏰</div>
                        <p className="text-sm font-bold mb-1">Order deadline passed</p>
                        <p className="text-xs">
                          {getOrderDeadlineText(item.category).replace('Next available: ', '')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Time Remaining Badge */}
                  {isMealAvailable && timeRemaining && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ⏰ {timeRemaining.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </h3>
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ₹{item.price.toFixed(0)}
                    </span>
                  </div>
                  <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.servingSize || '1 person'}
                    </span>
                    {/* REMOVED: Individual advance hours badge since we use fixed deadlines */}
                  </div>

                  <div className={`text-xs mb-3 p-2 rounded ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-orange-50 text-gray-700'
                  }`}>
                    <p className="font-medium">🕐 Delivery: {getDeliveryWindow(item.category)}</p>
                    {item.ingredients && item.ingredients.length > 0 && (
                      <p className="mt-1">🥗 {item.ingredients.slice(0, 3).join(', ')}{item.ingredients.length > 3 ? '...' : ''}</p>
                    )}
                    {isMealAvailable && timeRemaining && (
                      <p className="mt-1 font-medium text-orange-600">
                        ⏰ Order within: {timeRemaining}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(item._id)}
                    disabled={isAddingToCart[item._id] || !canOrder}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      canOrder
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAddingToCart[item._id] ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : !kitchen.isCurrentlyOpen ? (
                      'Kitchen Closed'
                    ) : !item.isAvailable ? (
                      'Currently Unavailable'
                    ) : !isMealAvailable ? (
                      'Ordering Deadline Passed'
                    ) : (
                      'Add to Tiffin Cart 🍱'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenuItems.length === 0 && (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">🍱</div>
            <h3 className="text-lg font-medium mb-2">No tiffin items found</h3>
            <p className="text-sm">
              {selectedCategory !== 'all'
                ? `No ${selectedCategory.toLowerCase()} tiffins available`
                : 'This kitchen has no available tiffin items at the moment'
              }
            </p>
            <p className="text-xs mt-2">
              Tiffin items are prepared fresh with advance orders
            </p>
          </div>
        )}

        {/* Kitchen Reviews Section */}
        <div 
          id="reviews-section"
          className={`mt-12 ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } rounded-lg shadow-lg`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ⭐ Customer Reviews & Ratings
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                theme === 'dark' ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'
              }`}>
                {kitchen.ratings.average.toFixed(1)}/5 ★
              </div>
            </div>
            
            <SimpleReview kitchenId={id} theme={theme} />
          </div>
        </div>

        {/* Updated Tiffin Service Information */}
        <div className={`mt-12 p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-orange-50 border border-orange-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            🍱 About Our Tiffin Service
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                📅 Order Deadlines
              </h4>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Breakfast: Order by 8:00 PM (next day delivery)</li>
                <li>• Lunch: Order by 9:00 AM (same day delivery)</li>
                <li>• Dinner: Order by 4:00 PM (same day delivery)</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                🏠 Fresh & Homemade
              </h4>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Prepared fresh daily</li>
                <li>• Traditional home-style cooking</li>
                <li>• Quality ingredients</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                📦 Eco-Friendly
              </h4>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Sustainable packaging</li>
                <li>• Reusable containers available</li>
                <li>• Supporting local sellers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KitchenDetailsPage;

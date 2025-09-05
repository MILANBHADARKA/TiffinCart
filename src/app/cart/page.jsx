'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useCart } from '@/context/Cart.context';

function CartPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role !== 'customer') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleUpdateQuantity = async (itemId, change) => {
    //check if item exists in cart
    const currentItem = cart.items.find(item => 
      (item.menuItemId?._id || item.menuItemId) === itemId
    );
    
    if (!currentItem) return;

    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      setError('');

      const result = await updateQuantity(itemId, change);
      
      if (!result.success) {
        setError(result.error || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Network error. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      setError('');

      const result = await removeFromCart(itemId);
      
      if (!result.success) {
        setError(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Network error. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (loading || isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Your Cart
          </h1>
          <Link href="/kitchens" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue
          </Link>
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

        {cart && cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Group items by meal category for better organization */}
              {(() => {
                const itemsByCategory = cart.items.reduce((acc, item) => {
                  const category = item.menuItemId?.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(item);
                  return acc;
                }, {});

                const categories = Object.keys(itemsByCategory);
                
                return (
                  <>
                    {categories.length > 1 && (
                      <div className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                              Multiple Meal Times Detected
                            </h4>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                              Your cart contains {categories.join(', ')} items. These will be delivered at different times as separate orders.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                      <div key={category} className={`rounded-lg overflow-hidden border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <div className={`px-4 py-3 border-b ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {category} ({categoryItems.length} items)
                          </h3>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category === 'Breakfast' && 'Delivery: 7:00 AM - 10:00 AM'}
                            {category === 'Lunch' && 'Delivery: 12:00 PM - 3:00 PM'}
                            {category === 'Dinner' && 'Delivery: 7:00 PM - 10:00 PM'}
                          </p>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {categoryItems.map((item) => {
                            const menuItemId = item.menuItemId?._id || item.menuItemId;
                            const kitchenName = item.menuItemId?.kitchenId?.name || 'Unknown Kitchen';
                            
                            return (
                              <div key={menuItemId} className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center">
                                    <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                      {item.menuItemId?.image ? (
                                        <img 
                                          src={item.menuItemId.image} 
                                          alt={item.name} 
                                          className="h-full w-full object-cover" 
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-400">
                                          <span className="text-2xl">🍲</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {item.name}
                                      </h3>
                                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        From: {kitchenName}
                                      </p>
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        ₹{item.price.toFixed(2)} x {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                      </p>
                                      <div className="mt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          item.isVeg 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {item.isVeg ? '🌿 Veg' : '🍖 Non-Veg'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                    <div className="flex items-center border rounded-md">
                                      <button 
                                        onClick={() => handleUpdateQuantity(menuItemId, -1)}
                                        disabled={updating[menuItemId] || item.quantity <= 1}
                                        className={`px-3 py-1 ${
                                          theme === 'dark' 
                                            ? 'text-white hover:bg-gray-600' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        -
                                      </button>
                                      <span className={`px-3 py-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {item.quantity}
                                      </span>
                                      <button 
                                        onClick={() => handleUpdateQuantity(menuItemId, 1)}
                                        disabled={updating[menuItemId]}
                                        className={`px-3 py-1 ${
                                          theme === 'dark' 
                                            ? 'text-white hover:bg-gray-600' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItem(menuItemId)}
                                      disabled={updating[menuItemId]}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      {updating[menuItemId] ? (
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>

            {/* Order Summary */}
            <div className={`rounded-lg border p-6 h-fit ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                
                {cart.kitchenDeliveries && cart.kitchenDeliveries.length > 0 && (
                  <div className="space-y-2">
                    {cart.kitchenDeliveries.map((delivery, index) => (
                      <div key={index}>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            Delivery Fee
                          </span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {delivery.deliveryFee === 0 ? 'FREE' : `₹${delivery.deliveryFee.toFixed(2)}`}
                          </span>
                        </div>
                        {delivery.minimumOrder > 0 && (
                          <div className={`text-sm p-3 rounded-lg mt-2 ${
                            delivery.subtotal >= delivery.minimumOrder
                              ? theme === 'dark' 
                                ? 'bg-green-900/30 border border-green-600 text-green-300'
                                : 'bg-green-50 border border-green-200 text-green-800'
                              : theme === 'dark'
                                ? 'bg-red-900/30 border border-red-600 text-red-300'
                                : 'bg-red-50 border border-red-200 text-red-800'
                          }`}>
                            <div className="font-medium">
                              {delivery.subtotal >= delivery.minimumOrder ? '✅' : '❌'} Minimum Order: ₹{delivery.minimumOrder}
                            </div>
                            {delivery.subtotal < delivery.minimumOrder && (
                              <div className="text-xs mt-1">
                                Add ₹{(delivery.minimumOrder - delivery.subtotal).toFixed(2)} more to place order
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tax (5%)</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{((cart.subtotal || 0) * 0.05).toFixed(2)}</span>
                </div>
                
                <div className={`flex justify-between text-lg font-semibold pt-3 border-t ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total</span>
                  <span className="text-orange-500">₹{((cart.total || 0) + ((cart.subtotal || 0) * 0.05)).toFixed(2)}</span>
                </div>
              </div>

              {(() => {
                const canCheckout = cart.kitchenDeliveries && cart.kitchenDeliveries.length > 0 && 
                  cart.kitchenDeliveries.every(delivery => 
                    delivery.minimumOrder === 0 || delivery.subtotal >= delivery.minimumOrder
                  );

                return canCheckout ? (
                  <Link
                    href="/checkout"
                    className="w-full mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full mt-6 bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed text-center"
                  >
                    Minimum Order Required
                  </button>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className={`py-16 text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/kitchens"
              className="px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
            >
              Browse Kitchens
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
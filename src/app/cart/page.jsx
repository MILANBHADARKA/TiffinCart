'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function CartPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState({});
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'customer') {
      fetchCart();
    } else if (isAuthenticated && user?.role !== 'customer') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/customer/cart', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      } else {
        setError(result.error || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setIsUpdating(prev => ({ ...prev, [itemId]: true }));

      const response = await fetch('/api/customer/cart/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      } else {
        setError(result.error || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      setIsUpdating(prev => ({ ...prev, [itemId]: true }));

      const response = await fetch('/api/customer/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      } else {
        setError(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCheckout = async () => {
    if (!address) {
      setCheckoutMessage('Please provide a delivery address');
      return;
    }

    try {
      setIsCheckingOut(true);
      setCheckoutMessage('');

      const response = await fetch('/api/customer/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address, 
          paymentMethod 
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCheckoutMessage('Order placed successfully!');
        setTimeout(() => {
          router.push(`/orders/${result.data.orderId}`);
        }, 2000);
      } else {
        setCheckoutMessage(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      setCheckoutMessage('Network error. Please try again.');
    } finally {
      setIsCheckingOut(false);
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
            Continue Shopping
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

        {cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className={`rounded-lg overflow-hidden border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cart.items.map((item) => (
                    <div key={item.menuItemId} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
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
                              ₹{item.price.toFixed(2)} x {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.isVeg 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isVeg ? 'Veg' : 'Non-Veg'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                          <div className="flex items-center">
                            <button 
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              disabled={isUpdating[item.menuItemId] || item.quantity <= 1}
                              className={`px-2 py-1 rounded-l-md ${
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              -
                            </button>
                            <span className={`w-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              disabled={isUpdating[item.menuItemId]}
                              className={`px-2 py-1 rounded-r-md ${
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.menuItemId)}
                            disabled={isUpdating[item.menuItemId]}
                            className="text-red-500 hover:text-red-700"
                          >
                            {isUpdating[item.menuItemId] ? (
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
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className={`rounded-lg border p-6 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } sticky top-24`}>
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Subtotal ({cart.items.length} items)
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ₹{cart.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Delivery Fee
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ₹40.00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tax
                    </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ₹{(cart.total * 0.05).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg text-orange-500">
                        ₹{(cart.total + 40 + cart.total * 0.05).toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      * Prices include all applicable taxes
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="address" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Delivery Address*
                      </label>
                      <textarea
                        id="address"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter your full delivery address"
                      ></textarea>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center p-3 border rounded-md cursor-pointer ${
                          paymentMethod === 'cash'
                            ? theme === 'dark'
                              ? 'bg-gray-700 border-orange-500'
                              : 'bg-orange-50 border-orange-500'
                            : theme === 'dark'
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-white border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <span className="text-lg mr-2">💵</span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Cash
                            </span>
                          </div>
                        </label>
                        <label className={`flex items-center p-3 border rounded-md cursor-pointer ${
                          paymentMethod === 'online'
                            ? theme === 'dark'
                              ? 'bg-gray-700 border-orange-500'
                              : 'bg-orange-50 border-orange-500'
                            : theme === 'dark'
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-white border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={paymentMethod === 'online'}
                            onChange={() => setPaymentMethod('online')}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <span className="text-lg mr-2">💳</span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Online
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {checkoutMessage && (
                    <div className={`p-3 rounded-md ${
                      checkoutMessage.includes('successfully')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {checkoutMessage}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cart.items.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md font-medium hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
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

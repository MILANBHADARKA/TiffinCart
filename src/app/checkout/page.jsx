'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function CheckoutPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

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
        if (!result.data.cart.items || result.data.cart.items.length === 0) {
          router.push('/cart');
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    // Check minimum order requirements
    if (cart.kitchenDeliveries) {
      const unmetRequirements = cart.kitchenDeliveries.filter(
        delivery => delivery.minimumOrder > 0 && delivery.subtotal < delivery.minimumOrder
      );

      if (unmetRequirements.length > 0) {
        setError(`Minimum order value not met. Please add ₹${(unmetRequirements[0].minimumOrder - unmetRequirements[0].subtotal).toFixed(2)} more.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Order placed successfully!');
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      } else {
        setError(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Your cart is empty
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Add some items to your cart before checkout.
          </p>
          <Link
            href="/kitchens"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Browse Kitchens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            Checkout
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Review your order and complete your purchase
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

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  📍 Delivery Address
                </h3>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                    Complete Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address including house number, street, area, city, pincode..."
                    required
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                  />
                </div>
              </div>

              <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  💳 Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                    />
                    <span className={`ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      💵 Cash on Delivery
                    </span>
                  </label>
                  <div
                    className={`flex items-center p-2 rounded-md border ${theme === "dark"
                        ? "border-gray-600 bg-gray-700/40"
                        : "border-gray-300 bg-gray-100"
                      } opacity-70 cursor-not-allowed`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      disabled
                      className="h-4 w-4 text-orange-500 border-gray-300"
                    />
                    <span
                      className={`ml-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                        } flex items-center`}
                    >
                      🌐 Online Payment
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">
                        Coming Soon
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  `Place Order - ₹${((cart.total || 0) + ((cart.subtotal || 0) * 0.05)).toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🛒 Order Items ({cart.items.length})
              </h3>
              
              {/* Group items by meal category for display */}
              {(() => {
                const itemsByCategory = cart.items.reduce((acc, item) => {
                  const category = item.menuItemId?.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(item);
                  return acc;
                }, {});

                return Object.entries(itemsByCategory).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>
                      {category} ({items.length} items)
                    </h4>
                    <div className="space-y-2 ml-4">
                      {items.map((item) => {
                        const kitchenName = item.menuItemId?.kitchenId?.name || 'Unknown Kitchen';
                        return (
                          <div key={item.menuItemId?._id || item.menuItemId} className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {item.menuItemId?.image ? (
                                <img
                                  src={item.menuItemId.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-400">
                                  <span className="text-sm">🍲</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                              </h5>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
              
              {/* Separate Orders Notice */}
              {(() => {
                const categories = [...new Set(cart.items.map(item => item.menuItemId?.category))].filter(Boolean);
                if (categories.length > 1) {
                  return (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                            Separate Orders for Different Meals
                          </h4>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                            Your {categories.join(', ')} items will be created as {categories.length} separate orders with different delivery times.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Pricing Breakdown */}
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                💰 Price Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Items Subtotal</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{cart.subtotal?.toFixed(2) || '0.00'}</span>
                </div>

                {/* Single Kitchen delivery info */}
                {cart.kitchenDeliveries && cart.kitchenDeliveries.length > 0 && (
                  <div className="space-y-2">
                    {cart.kitchenDeliveries.map((delivery, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            Delivery Fee ({delivery.kitchenName})
                          </span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {delivery.deliveryFee === 0 ? 'FREE' : `₹${delivery.deliveryFee.toFixed(2)}`}
                          </span>
                        </div>
                        {delivery.minimumOrder > 0 && (
                          <div className={`text-xs p-2 rounded ${delivery.subtotal >= delivery.minimumOrder
                              ? 'text-green-600 bg-green-50'
                              : 'text-red-600 bg-red-50'
                            }`}>
                            Minimum order: ₹{delivery.minimumOrder}
                            {delivery.subtotal >= delivery.minimumOrder ? ' ✅ Met' : ` ❌ (₹${(delivery.minimumOrder - delivery.subtotal).toFixed(2)} more needed)`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>GST (5%)</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{((cart.subtotal || 0) * 0.05).toFixed(2)}</span>
                </div>

                <div className={`flex justify-between text-lg font-semibold pt-3 border-t ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-900'
                  }`}>
                  <span>Total Amount</span>
                  <span className="text-orange-500">₹{((cart.total || 0) + ((cart.subtotal || 0) * 0.05)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className={`rounded-lg border p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🚚 Delivery Schedule
              </h3>
              <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {(() => {
                  const categories = [...new Set(cart.items.map(item => item.menuItemId?.category))].filter(Boolean);
                  const deliveryWindows = {
                    'Breakfast': '7:00 AM - 10:00 AM',
                    'Lunch': '12:00 PM - 3:00 PM',
                    'Dinner': '7:00 PM - 10:00 PM'
                  };
                  
                  return categories.map(category => (
                    <div key={category} className={`p-3 rounded border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="font-medium">{category}: {deliveryWindows[category]}</div>
                      <div className="text-xs mt-1">
                        {category === 'Breakfast' && 'Delivered next day if ordered after 8 PM'}
                        {category === 'Lunch' && 'Same day delivery if ordered before 9 AM'}
                        {category === 'Dinner' && 'Same day delivery if ordered before 4 PM'}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
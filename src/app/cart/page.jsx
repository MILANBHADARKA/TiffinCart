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
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, isLoading, router]);

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

  const updateQuantity = async (menuItemId, newQuantity) => {
    try {
      setUpdating(true);

      const response = await fetch('/api/customer/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItemId, quantity: newQuantity }),
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
      setUpdating(false);
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      setUpdating(true);

      const response = await fetch(`/api/customer/cart?itemId=${menuItemId}`, {
        method: 'DELETE',
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
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setUpdating(true);

      const response = await fetch('/api/customer/cart', {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      } else {
        setError(result.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const proceedToCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    try {
      const sellerId = cart.items[0].sellerId._id;
      const orderData = {
        sellerId,
        items: cart.items.map(item => ({
          menuItemId: item.menuItemId._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions
        })),
        totalAmount: cart.totalAmount,
        deliveryAddress: user.address || 'Please provide delivery address'
      };

      const response = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart after successful order
        await clearCart();
        alert('Order placed successfully!');
        router.push('/orders');
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Network error. Please try again.');
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
            Loading cart...
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Your Cart 🛒
            </h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {cart?.items?.length || 0} items in your cart
            </p>
          </div>
          {cart?.items?.length > 0 && (
            <button
              onClick={clearCart}
              disabled={updating}
              className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
            >
              Clear Cart
            </button>
          )}
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

        {cart?.items?.length === 0 ? (
          /* Empty Cart */
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-sm mb-6">Add some delicious items to get started!</p>
            <Link
              href="/kitchens"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Kitchens
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items?.map((item) => (
                <div
                  key={item.menuItemId._id}
                  className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            From {item.sellerId?.name || 'Kitchen'}
                          </p>
                          {item.specialInstructions && (
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Note: {item.specialInstructions}
                            </p>
                          )}
                          <div className="flex items-center space-x-1 mt-1">
                            {item.menuItemId?.isVegetarian && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Veg
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() => updateQuantity(item.menuItemId._id, item.quantity - 1)}
                          disabled={updating}
                          className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className={`text-lg font-medium min-w-[2rem] text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId._id, item.quantity + 1)}
                          disabled={updating}
                          className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-green-600">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ₹{item.price} each
                        </p>
                        <button
                          onClick={() => removeItem(item.menuItemId._id)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`rounded-lg border p-6 sticky top-8 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Summary
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Subtotal ({cart?.items?.length} items)
                    </span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      ₹{cart?.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Delivery Fee
                    </span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Taxes & Fees
                    </span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      ₹{(cart?.totalAmount * 0.05)?.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className={`border-t pt-3 mb-6 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Total
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{(cart?.totalAmount * 1.05)?.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={proceedToCheckout}
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                
                <p className={`text-xs mt-3 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  By placing your order, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;

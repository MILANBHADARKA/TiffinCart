'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SellerOrderDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchOrderDetails();
    }
  }, [isAuthenticated, isLoading, router, user, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seller/orders/${id}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setOrder(result.data.order);
      } else {
        setError(result.error || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/seller/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          note: statusNote 
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Order status updated successfully!');
        setMessageType('success');
        setStatusNote('');
        fetchOrderDetails(); // Refresh order
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to update order status');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }
  };

  // ...existing helper functions...

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Order not found'}
          </h2>
          <Link
            href="/seller/orders"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Order #{order._id.slice(-8)}
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Link
            href="/seller/orders"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back to Orders
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className={`rounded-lg border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </p>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {order.customerId?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </p>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {order.customerId?.email || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Delivery Address
                  </p>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={`rounded-lg border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-4 rounded border ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quantity: {item.quantity} | Price: ₹{item.price}
                      </p>
                      {item.isVeg !== undefined && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          item.isVeg 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isVeg ? '🌿 Veg' : '🍖 Non-Veg'}
                        </span>
                      )}
                    </div>
                    <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            <div className={`rounded-lg border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Timeline
              </h2>
              <div className="space-y-3">
                {order.statusHistory?.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {history.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                      {history.note && (
                        <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Note: {history.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className={`rounded-lg border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal:</span>
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Delivery Fee:</span>
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tax:</span>
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{order.tax}</span>
                </div>
                <hr className={`${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />
                <div className="flex justify-between font-semibold">
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹{order.totalAmount}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method:</span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment Status:</span>
                    <span className={`text-sm font-medium ${
                      order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className={`rounded-lg border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Update Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Add Note (Optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    rows={3}
                    placeholder="Add a note about this status update..."
                  />
                </div>

                <div className="space-y-2">
                  {/* Status-specific action buttons */}
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus('confirmed')}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus('cancelled')}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus('preparing')}
                      className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
                    >
                      Start Preparing
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus('out_for_delivery')}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600"
                    >
                      Out for Delivery
                    </button>
                  )}
                  
                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus('delivered')}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerOrderDetailsPage;

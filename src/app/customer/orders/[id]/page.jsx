'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import SimpleReviewForm from '@/components/SimpleReviewForm/SimpleReviewForm';

function CustomerOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'customer') {
      fetchOrderDetails();
    }
  }, [isAuthenticated, isLoading, router, user, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details for ID:', id);
      const response = await fetch(`/api/customer/orders/${id}`, {
        credentials: 'include'
      });
      console.log('Response status:', response.status);

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

  const submitReview = async (reviewData) => {
    try {
      const response = await fetch(`/api/orders/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Review submitted successfully! Thank you for your feedback.');
        setMessageType('success');
        setShowReviewForm(false);
        fetchOrderDetails(); // Refresh order data
      } else {
        setMessage(result.error || 'Failed to submit review');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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
            href="/customer/orders"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const canReview = order?.status === 'delivered' && !order?.isReviewed;
  const hasReviewed = order?.isReviewed;

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            href="/customer/orders"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back to Orders
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Order Timeline */}
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

          {/* Sidebar */}
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
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment:</span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display submitted review */}
        {hasReviewed && order.review && (
          <div className="mt-8">
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Your Review
              </h3>
              
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= order.review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {order.review.rating}/5
                </span>
              </div>
              
              {order.review.comment && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{order.review.comment}"
                </p>
              )}

              <div className={`mt-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Reviewed on {new Date(order.review.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Review Section */}
        {canReview && (
          <div className="mt-8">
            {!showReviewForm ? (
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      📝 Rate Your Experience
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Help others by sharing your experience
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Write Review
                  </button>
                </div>
              </div>
            ) : (
              <SimpleReviewForm
                orderId={id}
                onSubmit={submitReview}
                onCancel={() => setShowReviewForm(false)}
                theme={theme}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerOrderDetailsPage;
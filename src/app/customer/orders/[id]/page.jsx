'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import ReviewForm from '@/components/ReviewForm/ReviewForm';

function CustomerOrderDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/customer/orders/${id}`, {
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

  const submitReview = async (reviewData) => {
    try {
      setIsSubmittingReview(true);
      const response = await fetch(`/api/customer/orders/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Review submitted successfully!');
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
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading order details...
          </p>
        </div>
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
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            We couldn't load the details for this order.
          </p>
          <Link
            href="/orders"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to My Orders
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
        {/* Order Details Card */}
        <div className={`mb-8 p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order #{order.orderNumber}
                </h1>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)} • {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Order Summary
            </h3>
            <div className="mt-2">
              {order.items.map(item => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-400">
                          <span className="text-4xl">🍱</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-md font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.quantity} x ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-md font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Delivery Details
            </h3>
            <div className="mt-2">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {order.deliveryAddress}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {order.customerName} • {order.customerPhone}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Payment Details
            </h3>
            <div className="mt-2">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Payment Method: {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Review Section */}
        {order && order.status === 'delivered' && (
          <div className="mt-8">
            {!order.reviewStatus?.kitchenReviewCompleted && !order.reviewStatus?.itemReviewsCompleted ? (
              !showReviewForm ? (
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        📝 Share Your Experience
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Help others by reviewing your order
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
                <ReviewForm
                  order={order}
                  onSubmit={submitReview}
                  onCancel={() => setShowReviewForm(false)}
                />
              )
            ) : (
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                    Thank you for your review!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/orders"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CustomerOrderDetailsPage;
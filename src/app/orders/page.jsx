'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function CustomerOrders() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewType, setReviewType] = useState('kitchen');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, router, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const statusParam = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const response = await fetch(`/api/customer/orders${statusParam}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openReviewModal = (order, type = 'kitchen', menuItem = null) => {
    setSelectedOrder(order);
    setReviewType(type);
    setSelectedMenuItem(menuItem);
    setShowReviewModal(true);
  };

  const ReviewModal = () => {
    const [reviewData, setReviewData] = useState({
      rating: 5,
      title: '',
      comment: '',
      tags: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);

    const availableTags = ['taste', 'quality', 'packaging', 'delivery', 'value', 'freshness', 'quantity', 'service'];

    const handleTagToggle = (tag) => {
      setReviewData(prev => ({
        ...prev,
        tags: prev.tags.includes(tag) 
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
      }));
    };

    const handleStarClick = (starValue) => {
      setReviewData(prev => ({
        ...prev,
        rating: starValue
      }));
    };

    const handleStarHover = (starValue) => {
      setHoveredStar(starValue);
    };

    const handleStarLeave = () => {
      setHoveredStar(0);
    };

    const submitReview = async () => {
      if (!reviewData.title.trim() || !reviewData.comment.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        setSubmitting(true);

        console.log('Selected Order for Review:', selectedOrder);
        console.log('Review Type:', reviewType);
        console.log('Selected Menu Item:', selectedMenuItem);

        let sellerId = selectedOrder.sellerId || selectedOrder.kitchenId;
        
        if (!sellerId) {
          console.error('No seller ID found in order:', selectedOrder);
          alert('Unable to identify kitchen. Order data: ' + JSON.stringify(selectedOrder, null, 2));
          return;
        }

        const payload = {
          orderId: selectedOrder.orderId,
          sellerId: sellerId,
          type: reviewType,
          rating: parseInt(reviewData.rating),
          title: reviewData.title.trim(),
          comment: reviewData.comment.trim(),
          tags: reviewData.tags || []
        };

        if (reviewType === 'item' && selectedMenuItem) {
          payload.menuItemId = selectedMenuItem.menuItemId || selectedMenuItem._id;
        }

        console.log('Submitting review payload:', payload);

        const response = await fetch('/api/customer/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        const result = await response.json();
        console.log('Review submission result:', result);

        if (result.success) {
          alert('Review submitted successfully!');
          setShowReviewModal(false);
          setReviewData({ rating: 5, title: '', comment: '', tags: [] });
        } else {
          alert(result.error || 'Failed to submit review');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    if (!showReviewModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`max-w-md w-full rounded-lg shadow-lg max-h-screen overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Rate {reviewType === 'kitchen' ? selectedOrder?.kitchenName : selectedMenuItem?.name}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className={`text-gray-400 hover:text-gray-600`}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Rating *
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className={`text-3xl transition-colors duration-150 focus:outline-none ${
                        star <= (hoveredStar || reviewData.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click to rate: {reviewData.rating} star{reviewData.rating !== 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Review Title *
                </label>
                <input
                  type="text"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {reviewData.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Detailed Review *
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Share details about your experience"
                  rows={3}
                  maxLength={500}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {reviewData.comment.length}/500 characters
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        reviewData.tags.includes(tag)
                          ? 'bg-orange-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submitting || !reviewData.title.trim() || !reviewData.comment.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading orders...
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
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            My Orders 📦
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your order history and current orders ({orders.length} orders)
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

        <div className={`mb-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="-mb-px flex space-x-8">
            {[{
              key: 'all', label: 'All Orders' },
              { key: 'active', label: 'Active' },
              { key: 'delivered', label: 'Delivered' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {orders.length === 0 && !loading ? (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm mb-4">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${activeTab} orders at the moment.`
              }
            </p>
            <button
              onClick={() => router.push('/kitchens')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {order.id}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Kitchen: <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.kitchenName}</span>
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Order Time: <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.orderTime}</span>
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Delivery Address:
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Items ({order.items.length}):
                      </h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {item.quantity}x {item.name}
                            </span>
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className={`border-t pt-1 mt-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex justify-between text-sm font-medium">
                            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total:</span>
                            <span className="text-green-600">₹{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 lg:ml-6">
                    {order.status === 'delivered' && (
                      <>
                        <button 
                          onClick={() => openReviewModal(order, 'kitchen')}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          Rate Kitchen
                        </button>
                        {order.items.length > 0 && (
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                const itemIndex = parseInt(e.target.value);
                                if (itemIndex >= 0) {
                                  openReviewModal(order, 'item', order.items[itemIndex]);
                                }
                              }}
                              className={`w-full px-4 py-2 border rounded-lg text-sm ${
                                theme === 'dark'
                                  ? 'border-gray-600 bg-gray-700 text-white'
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            >
                              <option value="">Rate Individual Items</option>
                              {order.items.map((item, index) => (
                                <option key={index} value={index}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    )}
                    <button className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}>
                      Track Order
                    </button>
                    <button className={`px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                      theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}>
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ReviewModal />
      </div>
    </div>
  );
}

export default CustomerOrders;
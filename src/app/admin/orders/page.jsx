'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useRouter } from 'next/navigation';

function AdminOrdersPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '30days',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1
  });
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'admin') {
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, user, router, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams({
        status: filters.status,
        dateRange: filters.dateRange,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/admin/orders?${queryParams}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
        setAnalytics(result.data.analytics);
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

  const updateOrderStatus = async (orderId, newStatus, adminNote = '') => {
    try {
      setUpdatingOrder(orderId);

      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus, adminNote }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Order status updated successfully');
        setMessageType('success');
        fetchOrders(); // Refresh orders
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to update order status');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setUpdatingOrder(null);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page when other filters change
    }));
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setSelectedOrder(result.data.order);
        setShowOrderModal(true);
      } else {
        setMessage('Failed to fetch order details');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }
  };

  if (loading && !orders.length) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Order Management 📦
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor and manage all orders across the platform
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Orders
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {summary.totalOrders.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Revenue
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Avg Order Value
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(summary.avgOrderValue)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Fees
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(summary.totalDeliveryFees + summary.totalTax)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">💳</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status Distribution */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Status
              </h3>
              <div className="space-y-3">
                {analytics.statusDistribution.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status._id).split(' ')[0]}`}></span>
                      <span className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {status._id.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {status.count}
                      </span>
                      <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({formatCurrency(status.totalAmount)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Categories */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Meal Categories
              </h3>
              <div className="space-y-3">
                {analytics.mealCategoryStats.map((category) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">
                        {category._id === 'Breakfast' ? '🌅' : 
                         category._id === 'Lunch' ? '🌞' : '🌙'}
                      </span>
                      <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category._id}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {category.count}
                      </span>
                      <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({formatCurrency(category.totalAmount)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Payment Methods
              </h3>
              <div className="space-y-3">
                {analytics.paymentMethodStats.map((method) => (
                  <div key={method._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">
                        {method._id === 'cash' ? '💵' : '💳'}
                      </span>
                      <span className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {method._id === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {method.count}
                      </span>
                      <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ({formatCurrency(method.totalAmount)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`p-6 rounded-lg border mb-6 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="createdAt">Order Date</option>
                <option value="totalAmount">Total Amount</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className={`rounded-lg border overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Order Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Customer & Kitchen
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Amount & Payment
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status & Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {orders.map((order) => (
                  <tr key={order._id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          #{order._id.slice(-8)}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.mealCategory} • {order.items.length} items
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Delivery: {order.deliveryTimeWindow}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.customerId?.name || 'Unknown Customer'}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.customerId?.email}
                        </p>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {order.kitchenId?.name || 'Unknown Kitchen'}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {order.kitchenId?.cuisine}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Payment: {order.paymentMethod}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchOrderDetails(order._id)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            View Details
                          </button>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateOrderStatus(order._id, e.target.value);
                                }
                              }}
                              disabled={updatingOrder === order._id}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="">Update Status</option>
                              {order.status === 'pending' && <option value="confirmed">Confirm</option>}
                              {['pending', 'confirmed'].includes(order.status) && <option value="preparing">Start Preparing</option>}
                              {['pending', 'confirmed', 'preparing'].includes(order.status) && <option value="out_for_delivery">Out for Delivery</option>}
                              {['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && <option value="delivered">Mark Delivered</option>}
                              <option value="cancelled">Cancel Order</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && !loading && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-sm">Try adjusting your filters to see more orders.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalOrders} total orders)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-2 rounded-lg text-sm ${
                  pagination.hasPrev
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-2 rounded-lg text-sm ${
                  pagination.hasNext
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-screen overflow-y-auto rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Details - #{selectedOrder._id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Order ID:</strong> {selectedOrder._id}</div>
                    <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    <div><strong>Meal Category:</strong> {selectedOrder.mealCategory}</div>
                    <div><strong>Delivery Window:</strong> {selectedOrder.deliveryTimeWindow}</div>
                    <div><strong>Delivery Date:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedOrder.customerId?.name}</div>
                    <div><strong>Email:</strong> {selectedOrder.customerId?.email}</div>
                    <div><strong>Phone:</strong> {selectedOrder.customerId?.phone || 'Not provided'}</div>
                    <div><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</div>
                  </div>
                </div>

                {/* Kitchen Info */}
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Kitchen Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Kitchen:</strong> {selectedOrder.kitchenId?.name}</div>
                    <div><strong>Cuisine:</strong> {selectedOrder.kitchenId?.cuisine}</div>
                    <div><strong>Seller:</strong> {selectedOrder.sellerId?.name}</div>
                    <div><strong>Contact:</strong> {selectedOrder.kitchenId?.contact?.phone}</div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Payment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</div>
                    <div><strong>Delivery Fee:</strong> {formatCurrency(selectedOrder.deliveryFee)}</div>
                    <div><strong>Tax:</strong> {formatCurrency(selectedOrder.tax)}</div>
                    <div><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</div>
                    <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
                    <div><strong>Payment Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className={`mt-6 p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isVeg ? '🌿 Veg' : '🍖 Non-Veg'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div>{formatCurrency(item.price)} × {item.quantity}</div>
                        <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Status History
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(history.status)}`}>
                            {history.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {history.note && <span className="ml-2 text-gray-600">{history.note}</span>}
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;

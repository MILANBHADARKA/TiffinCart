'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useRouter } from 'next/navigation';

function SellerOrdersPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, router, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/orders', {
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Order status updated successfully!');
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

  const getStatusActions = (order) => {
    const { status } = order;
    const actions = [];

    if (status === 'pending') {
      actions.push(
        <button
          key="confirm"
          onClick={() => updateOrderStatus(order._id, 'confirmed')}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Confirm
        </button>,
        <button
          key="cancel"
          onClick={() => updateOrderStatus(order._id, 'cancelled')}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Cancel
        </button>
      );
    } else if (status === 'confirmed') {
      actions.push(
        <button
          key="preparing"
          onClick={() => updateOrderStatus(order._id, 'preparing')}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
        >
          Start Preparing
        </button>
      );
    } else if (status === 'preparing') {
      actions.push(
        <button
          key="delivery"
          onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
        >
          Out for Delivery
        </button>
      );
    } else if (status === 'out_for_delivery') {
      actions.push(
        <button
          key="delivered"
          onClick={() => updateOrderStatus(order._id, 'delivered')}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Mark Delivered
        </button>
      );
    }

    return actions;
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Order Management
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your incoming orders and track their status
            </p>
          </div>
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

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-sm">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter.replace('_', ' ')} orders at the moment`
                  : 'You haven\'t received any orders yet'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`rounded-lg border overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        Customer Details
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Name:</strong> {order.customerId?.name || 'N/A'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Email:</strong> {order.customerId?.email || 'N/A'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Address:</strong> {order.deliveryAddress}
                      </p>
                    </div>

                    <div>
                      <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        Order Summary
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Subtotal:</strong> ₹{order.subtotal}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Delivery:</strong> ₹{order.deliveryFee}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Total:</strong> ₹{order.totalAmount}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Items Ordered
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className={`flex justify-between text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/seller/orders/${order._id}`}
                      className={`px-4 py-2 rounded text-sm font-medium border ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      View Details
                    </Link>
                    {getStatusActions(order)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerOrdersPage;
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered'
};

function KitchenOrdersPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [kitchen, setKitchen] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'all');
  const [processingOrder, setProcessingOrder] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router, id, selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch kitchen details
      const kitchenResponse = await fetch(`/api/seller/kitchen/${id}`, {
        credentials: 'include'
      });
      
      const kitchenResult = await kitchenResponse.json();
      
      if (!kitchenResult.success) {
        setError(kitchenResult.error || 'Failed to fetch kitchen details');
        setLoading(false);
        return;
      }
      
      setKitchen(kitchenResult.data.kitchen);
      
      // Fetch orders for this kitchen
      const ordersUrl = selectedStatus !== 'all'
        ? `/api/seller/kitchen/${id}/orders?status=${selectedStatus}`
        : `/api/seller/kitchen/${id}/orders`;
        
      const ordersResponse = await fetch(ordersUrl, {
        credentials: 'include'
      });
      
      const ordersResult = await ordersResponse.json();
      
      if (!ordersResult.success) {
        setError(ordersResult.error || 'Failed to fetch orders');
        setLoading(false);
        return;
      }
      
      setOrders(ordersResult.data.orders);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setProcessingOrder(orderId);

      const response = await fetch(`/api/seller/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        // Update the order in the UI
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus } 
              : order
          )
        );
      } else {
        setError(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Network error. Please try again.');
    } finally {
      setProcessingOrder(null);
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

  if (error) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error}
          </h2>
          <Link href="/seller/kitchens" className="text-orange-500 hover:text-orange-600">
            Back to My Kitchens
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {kitchen?.name} - Orders
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                kitchen?.isCurrentlyOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {kitchen?.isCurrentlyOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your customer orders
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={`/seller/kitchen/${id}/dashboard`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Link
              href={`/seller/kitchen/${id}/dashboard`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href={`/seller/kitchen/${id}/menu`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Menu
            </Link>
            <Link
              href={`/seller/kitchen/${id}/orders`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              Orders
            </Link>
            <Link
              href={`/seller/kitchen/${id}/reviews`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reviews
            </Link>
            {/* <Link
              href={`/seller/kitchen/${id}/settings`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Settings
            </Link> */}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                selectedStatus === 'all'
                  ? 'bg-orange-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Orders
            </button>
            {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedStatus === status
                    ? 'bg-orange-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {orders.length > 0 ? (
          <div className={`overflow-hidden rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {orders.map((order) => (
                    <tr key={order.id} className={`hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <Link 
                          href={`/seller/kitchen/${id}/orders/${order.id}`}
                          className="text-orange-500 hover:text-orange-600 font-medium"
                        >
                          #{order.orderId}
                        </Link>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {order.customer}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {order.items?.length || 0}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}>
                        ₹{order.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ORDER_STATUS_COLORS[order.status]
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {order.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/seller/kitchen/${id}/orders/${order.id}`}
                            className={`px-2 py-1 text-xs rounded ${
                              theme === 'dark' 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            View
                          </Link>
                          
                          {/* Only show update buttons for non-final statuses */}
                          {(order.status !== 'delivered' && order.status !== 'cancelled') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, NEXT_STATUS[order.status])}
                              disabled={processingOrder === order.id}
                              className={`px-2 py-1 text-xs rounded ${
                                processingOrder === order.id
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {processingOrder === order.id ? 'Updating...' : `Mark ${NEXT_STATUS[order.status].replace('_', ' ')}`}
                            </button>
                          )}
                          
                          {/* Cancel button for pending/confirmed orders */}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              disabled={processingOrder === order.id}
                              className={`px-2 py-1 text-xs rounded ${
                                processingOrder === order.id
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium mb-2">No orders found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedStatus === 'all' 
                ? "You haven't received any orders yet" 
                : `No ${selectedStatus} orders found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenOrdersPage;

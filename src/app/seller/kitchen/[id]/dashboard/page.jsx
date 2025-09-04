'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function KitchenDashboard() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [kitchen, setKitchen] = useState(null);
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchenData();
    }
  }, [isAuthenticated, isLoading, router, id]);

  const fetchKitchenData = async () => {
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
      
      // Fetch recent orders for this kitchen
      try {
        const ordersResponse = await fetch(`/api/seller/kitchen/${id}/orders?limit=5`, {
          credentials: 'include'
        });
        
        const ordersResult = await ordersResponse.json();
        
        if (ordersResult.success) {
          setOrders(ordersResult.data.orders || []);
        }
      } catch (orderError) {
        console.error('Error fetching orders:', orderError);
        // Continue execution even if orders fetch fails
      }
      
      // Fetch kitchen metrics
      try {
        const metricsResponse = await fetch(`/api/seller/kitchen/${id}/metrics`, {
          credentials: 'include'
        });
        
        const metricsResult = await metricsResponse.json();
        
        if (metricsResult.success) {
          setMetrics(metricsResult.data || {
            totalOrders: 0,
            completedOrders: 0,
            pendingOrders: 0,
            revenue: 0,
            averageRating: 0
          });
        }
      } catch (metricsError) {
        console.error('Error fetching metrics:', metricsError);
        // Continue execution even if metrics fetch fails
      }
      
    } catch (error) {
      console.error('Error fetching kitchen data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleKitchenStatus = async () => {
    if (!kitchen) return;
    
    try {
      const response = await fetch(`/api/seller/kitchen/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCurrentlyOpen: !kitchen.isCurrentlyOpen }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchen(prevKitchen => ({
          ...prevKitchen,
          isCurrentlyOpen: !prevKitchen.isCurrentlyOpen
        }));
      } else {
        setError(result.error || 'Failed to update kitchen status');
      }
    } catch (error) {
      console.error('Error updating kitchen status:', error);
      setError('Network error. Please try again.');
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
            Loading kitchen data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !kitchen) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Kitchen not found'}
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            We couldn't load this kitchen's data.
          </p>
          <Link 
            href="/seller/kitchens" 
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
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
        {/* Header with Kitchen Details */}
        <div className={`mb-8 p-6 rounded-lg shadow-md ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {kitchen.name}
                </h1>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  kitchen.isCurrentlyOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {kitchen.isCurrentlyOpen ? 'Open' : 'Closed'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  kitchen.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : kitchen.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {kitchen.status.charAt(0).toUpperCase() + kitchen.status.slice(1)}
                </span>
              </div>
              <p className={`text-sm capitalize mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {kitchen.cuisine} Cuisine • {kitchen.address.city}, {kitchen.address.state}
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className={`text-sm ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {kitchen.ratings.average.toFixed(1)} ({kitchen.ratings.totalReviews})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleKitchenStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  kitchen.isCurrentlyOpen
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                disabled={kitchen.status !== 'approved'}
              >
                {kitchen.isCurrentlyOpen ? 'Close Kitchen' : 'Open Kitchen'}
              </button>
              <Link
                href={`/seller/kitchen/${id}/edit`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Edit Kitchen
              </Link>
              {/* <Link
                href={`/seller/kitchen/${id}/preview`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                View Customer View
              </Link> */}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Link
              href={`/seller/kitchen/${id}/dashboard`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500 text-white'
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
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Orders
            </h3>
            <p className="text-2xl font-bold">{metrics.totalOrders}</p>
          </div>
          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Revenue
            </h3>
            <p className="text-2xl font-bold">₹{metrics.revenue.toFixed(2)}</p>
          </div>
          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Pending Orders
            </h3>
            <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
          </div>
          <div className={`p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Average Rating
            </h3>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              <span className="text-yellow-500 ml-2">⭐</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/seller/kitchen/${id}/menu/add`}
              className={`p-6 rounded-lg flex items-center ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } shadow-md transition-colors`}
            >
              <div className="text-3xl mr-4">🍲</div>
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add New Menu Item
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Create new dishes for your menu
                </p>
              </div>
            </Link>
            <Link
              href={`/seller/kitchen/${id}/orders?status=pending`}
              className={`p-6 rounded-lg flex items-center ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } shadow-md transition-colors`}
            >
              <div className="text-3xl mr-4">📋</div>
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Manage Orders
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  View and process customer orders
                </p>
              </div>
            </Link>
            {/* <Link
              href={`/seller/kitchen/${id}/settings`}
              className={`p-6 rounded-lg flex items-center ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } shadow-md transition-colors`}
            >
              <div className="text-3xl mr-4">⚙️</div>
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Kitchen Settings
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Update hours, delivery options, etc.
                </p>
              </div>
            </Link> */}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Orders
            </h2>
            <Link
              href={`/seller/kitchen/${id}/orders`}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {orders.length > 0 ? (
            <div className={`overflow-hidden rounded-lg shadow ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
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
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <Link 
                          href={`/seller/kitchen/${id}/orders/${order.id}`}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          {order.id}
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
                        ₹{order.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'delivered' || order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending' || order.status === 'confirmed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`text-center py-12 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No orders yet. Orders will appear here once customers place them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KitchenDashboard;

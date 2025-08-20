'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useRouter } from 'next/navigation';

function SellerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalKitchens: 0,
    activeKitchens: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    kitchenPerformance: [],
    popularItems: [],
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    urgentActions: [],
    todayStats: {
      orders: 0,
      revenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/seller/dashboard', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const getStatusButton = (order) => {
    const statusConfig = {
      pending: { text: 'Confirm', color: 'bg-yellow-500 hover:bg-yellow-600' },
      confirmed: { text: 'Start Preparing', color: 'bg-blue-500 hover:bg-blue-600' },
      preparing: { text: 'Mark Ready', color: 'bg-orange-500 hover:bg-orange-600' },
      ready: { text: 'Complete', color: 'bg-green-500 hover:bg-green-600' },
      completed: { text: 'Completed', color: 'bg-gray-400', disabled: true }
    };

    const config = statusConfig[order.status] || statusConfig.pending;

    return (
      <button
        disabled={config.disabled}
        className={`px-2 py-1 text-xs text-white rounded transition-colors ${config.color} ${
          config.disabled ? 'cursor-not-allowed' : ''
        }`}
      >
        {config.text}
      </button>
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
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'orange', link }) => (
    <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
          {link && (
            <Link href={link} className="text-orange-600 hover:text-orange-700 text-xs font-medium">
              View all →
            </Link>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user?.name}! 👨‍🍳
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Here's what's happening with your kitchens today
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Kitchens"
            value={dashboardData.totalKitchens}
            subtitle="Your kitchen count"
            icon="🏪"
            color="blue"
            link="/seller/kitchens"
          />
          <StatCard
            title="Active Kitchens"
            value={dashboardData.activeKitchens}
            subtitle="Currently open"
            icon="✅"
            color="green"
          />
          <StatCard
            title="Today's Orders"
            value={dashboardData.totalOrders}
            subtitle="Across all kitchens"
            icon="📦"
            color="orange"
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${dashboardData.monthlyRevenue.toLocaleString()}`}
            subtitle="This month"
            icon="💰"
            color="yellow"
          />
        </div>

        {dashboardData.totalKitchens === 0 ? (
          <div className={`p-8 rounded-lg border-2 border-dashed mb-8 text-center ${
            theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="text-6xl mb-4">🏪</div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Get Started with Your First Kitchen
            </h3>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your kitchen profile to start selling delicious food to customers
            </p>
            <Link
              href="/seller/kitchens"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
            >
              Create First Kitchen
            </Link>
          </div>
        ) : (
          <div className={`p-6 rounded-lg border mb-8 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/seller/kitchens"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏪</span>
                <span className={`text-sm font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Manage Kitchens
                </span>
              </Link>
              <Link
                href="/seller/kitchens"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</span>
                <span className={`text-sm font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  View Orders
                </span>
              </Link>
              <Link
                href="/seller/kitchens"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍽️</span>
                <span className={`text-sm font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Update Menu
                </span>
              </Link>
              <Link
                href="/seller/analytics"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</span>
                <span className={`text-sm font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Analytics
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Urgent Actions */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🚨 Urgent Actions Required
            </h3>
            <div className="space-y-3">
              {dashboardData.urgentActions.map((action, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  action.type === 'order' ? 'border-red-500 bg-red-50' :
                  action.type === 'stock' ? 'border-yellow-500 bg-yellow-50' :
                  action.type === 'quality' ? 'border-purple-500 bg-purple-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  {action.actionText && (
                    <button
                      onClick={() => {
                        if (action.actionText === 'View Orders') {
                          router.push('/seller/orders?status=pending');
                        } else if (action.actionText === 'Update Status') {
                          router.push('/seller/orders?status=preparing');
                        } else if (action.actionText === 'Improve Quality') {
                          router.push('/seller/analytics');
                        } else if (action.actionText === 'Manage Kitchens') {
                          router.push('/seller/kitchens');
                        } else if (action.actionText === 'Update Menu') {
                          router.push('/seller/kitchens');
                        }
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {action.actionText} →
                    </button>
                  )}
                </div>
              ))}
              {dashboardData.urgentActions.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm">Great! No urgent actions needed right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ⚡ Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/seller/kitchens/add"
                className={`p-4 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">🏪</div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add Kitchen
                </p>
              </Link>

              <Link
                href="/seller/orders"
                className={`p-4 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">📦</div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  View Orders
                </p>
              </Link>

              <Link
                href="/seller/analytics"
                className={`p-4 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">📊</div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Analytics
                </p>
              </Link>

              <Link
                href="/seller/profile"
                className={`p-4 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">⚙️</div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Settings
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className={`lg:col-span-2 p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Recent Orders
              </h3>
              <Link
                href="/seller/orders"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className={`flex items-center justify-between p-3 rounded border ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.items.length} items • ₹{order.totalAmount}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {order.customerId?.name} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="mt-1">
                      <Link
                        href={`/seller/orders/${order._id}`}
                        className="text-xs text-orange-600 hover:text-orange-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.recentOrders.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-sm">No orders yet. Start by adding menu items!</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="space-y-6">
            {/* Pending Orders Widget */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ⏰ Pending Orders
              </h3>
              <div className="space-y-3">
                {dashboardData.pendingOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className={`p-3 rounded ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          #{order._id.slice(-8)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ₹{order.totalAmount} • {order.items.length} items
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelled')}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                            className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                          >
                            Prepare
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                            className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                          >
                            Deliver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {dashboardData.pendingOrders.length === 0 && (
                  <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No pending orders
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📈 Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active Kitchens
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.activeKitchens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Today's Orders
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.todayStats.orders}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Today's Revenue
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ₹{dashboardData.todayStats.revenue.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending Actions
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.urgentActions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboardPage;
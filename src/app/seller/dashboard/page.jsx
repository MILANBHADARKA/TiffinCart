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
    pendingApprovalKitchens: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    pendingOrdersCount: 0,
    preparingOrdersCount: 0,
    readyOrdersCount: 0,
    completedOrdersCount: 0,
    recentOrders: [],
    pendingOrders: [],
    kitchenPerformance: [],
    popularItems: [],
    urgentActions: [],
    todayStats: {
      orders: 0,
      revenue: 0
    },
    businessInsights: {
      totalMenuItems: 0,
      averageOrderValue: 0,
      topPerformingKitchen: null,
      thisWeekGrowth: 0,
      customerRetentionRate: 0
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

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'border-red-500 bg-red-50',
      'medium': 'border-yellow-500 bg-yellow-50',
      'low': 'border-blue-500 bg-blue-50'
    };
    return colors[priority] || 'border-gray-500 bg-gray-50';
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

  const StatCard = ({ title, value, subtitle, icon, color = 'orange', link, trend }) => (
    <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>
            {trend !== undefined && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
          {link && (
            <Link href={link} className="text-orange-600 hover:text-orange-700 text-xs font-medium mt-2 inline-block">
              View all →
            </Link>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 ml-4`}>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user?.name}! 👨‍🍳
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your tiffin business with comprehensive insights and tools
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

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Kitchens"
            value={dashboardData.totalKitchens}
            subtitle={`${dashboardData.pendingApprovalKitchens} pending approval`}
            icon="🏪"
            color="blue"
            link="/seller/kitchens"
          />
          <StatCard
            title="Active Kitchens"
            value={dashboardData.activeKitchens}
            subtitle="Currently accepting orders"
            icon="✅"
            color="green"
          />
          <StatCard
            title="Today's Orders"
            value={dashboardData.todayStats.orders}
            subtitle={`₹${dashboardData.todayStats.revenue.toFixed(0)} revenue`}
            icon="📦"
            color="orange"
            trend={dashboardData.businessInsights.thisWeekGrowth}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${dashboardData.monthlyRevenue.toLocaleString()}`}
            subtitle={`Avg: ₹${dashboardData.businessInsights.averageOrderValue.toFixed(0)} per order`}
            icon="💰"
            color="yellow"
          />
        </div>

        {/* Business Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📊 Business Insights
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Menu Items
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.businessInsights.totalMenuItems}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer Retention
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.businessInsights.customerRetentionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Week Growth
                </span>
                <span className={`text-sm font-medium ${
                  dashboardData.businessInsights.thisWeekGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardData.businessInsights.thisWeekGrowth >= 0 ? '+' : ''}
                  {dashboardData.businessInsights.thisWeekGrowth.toFixed(1)}%
                </span>
              </div>
              {dashboardData.businessInsights.topPerformingKitchen && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Top Kitchen: {dashboardData.businessInsights.topPerformingKitchen.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Overview */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📋 Order Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </span>
                <div className="flex items-center">
                  <span className={`text-sm font-medium mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardData.pendingOrdersCount}
                  </span>
                  {dashboardData.pendingOrdersCount > 0 && (
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Preparing
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.preparingOrdersCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Out for Delivery
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.readyOrdersCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.completedOrdersCount}
                </span>
              </div>
            </div>
            <Link 
              href="/seller/orders" 
              className="mt-4 block text-center bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              Manage All Orders
            </Link>
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
                href="/seller/kitchen/add"
                className={`p-3 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-xl mb-1">🏪</div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Add Kitchen
                </p>
              </Link>

              <Link
                href="/seller/orders"
                className={`p-3 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-xl mb-1">📦</div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Orders
                </p>
              </Link>

              {/* <Link
                href="/seller/analytics"
                className={`p-3 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-xl mb-1">📊</div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Analytics
                </p>
              </Link> */}

              <Link
                href="/seller/subscription"
                className={`p-3 rounded-lg border text-center hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-xl mb-1">💎</div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Plans
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started for New Sellers */}
        {dashboardData.totalKitchens === 0 && (
          <div className={`p-8 rounded-lg border-2 border-dashed mb-8 text-center ${
            theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="text-6xl mb-4">🏪</div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Get Started with Your Tiffin Business
            </h3>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your first kitchen to start serving delicious homemade meals to customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/seller/kitchen/add"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                Create First Kitchen
              </Link>
              <Link
                href="/seller/subscription"
                className={`px-6 py-3 rounded-lg font-medium border transition-all ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                View Plans
              </Link>
            </div>
          </div>
        )}

        {/* Urgent Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🚨 Action Required
            </h3>
            <div className="space-y-3">
              {dashboardData.urgentActions.map((action, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${getPriorityColor(action.priority)}`}>
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
                          router.push('/seller/kitchens');
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
                  <p className="text-sm">All good! No urgent actions needed.</p>
                </div>
              )}
            </div>
          </div>

          {/* Kitchen Performance */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🏪 Kitchen Performance
            </h3>
            <div className="space-y-3">
              {dashboardData.kitchenPerformance.slice(0, 4).map((kitchen) => (
                <div key={kitchen.kitchenId} className={`p-3 rounded border ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {kitchen.name}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {kitchen.orders} orders • ₹{kitchen.revenue.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        kitchen.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {kitchen.isOpen ? 'Open' : 'Closed'}
                      </span>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ⭐ {kitchen.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.kitchenPerformance.length === 0 && (
                <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p className="text-sm">No kitchen data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders & Popular Items */}
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
                  <div className="flex-1">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.items.length} items • ₹{order.totalAmount} • {order.mealCategory}
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
                  <p className="text-sm">No orders yet. Start by promoting your kitchens!</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Items */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🔥 Popular Items
            </h3>
            <div className="space-y-3">
              {dashboardData.popularItems.slice(0, 5).map((item) => (
                <div key={item._id} className={`p-3 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.kitchenName} • ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>
                        {item.orderCount} orders
                      </span>
                      <p className={`text-xs ${
                        item.isAvailable 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.popularItems.length === 0 && (
                <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p className="text-sm">No item data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboardPage;
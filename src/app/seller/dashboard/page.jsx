'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SellerDashboard() {
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
    completedOrders: 0
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
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Recent Orders
              </h2>
              <Link
                href="/seller/orders"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Order #{order.id}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.customer} • {order.items} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ₹{order.amount}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'ready'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          {getStatusButton(order)}
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {order.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-4xl mb-2">📭</div>
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Kitchen Performance
              </h2>
              <Link
                href="/seller/analytics"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View details →
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.kitchenPerformance.length > 0 ? (
                dashboardData.kitchenPerformance.map((kitchen, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {kitchen.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ⭐ {kitchen.rating} • {kitchen.orders} orders
                        </p>
                      </div>
                      <Link
                        href={`/seller/kitchen/${kitchen.id}/dashboard`}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-4xl mb-2">🏪</div>
                  <p>No kitchens yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Order Status Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {dashboardData.pendingOrders}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {dashboardData.preparingOrders}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Preparing
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {dashboardData.readyOrders}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Ready
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dashboardData.completedOrders}
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
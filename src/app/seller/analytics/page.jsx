'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useRouter } from 'next/navigation';

function SellerAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7days');
  const [selectedKitchen, setSelectedKitchen] = useState('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchAnalytics();
    }
  }, [isAuthenticated, isLoading, router, user, dateRange, selectedKitchen]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seller/analytics?range=${dateRange}&kitchen=${selectedKitchen}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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

  if (error || !analytics) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Unable to load analytics'}
          </h2>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Business Analytics
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your performance and grow your business
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <select
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="all">All Kitchens</option>
              {analytics.kitchens?.map((kitchen) => (
                <option key={kitchen._id} value={kitchen._id}>
                  {kitchen.name}
                </option>
              ))}
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Revenue
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(analytics.metrics.totalRevenue)}
                </p>
                <p className={`text-sm ${
                  analytics.metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(analytics.metrics.revenueGrowth)} vs previous period
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
                  Total Orders
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.metrics.totalOrders}
                </p>
                <p className={`text-sm ${
                  analytics.metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(analytics.metrics.ordersGrowth)} vs previous period
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
                  Average Order Value
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(analytics.metrics.averageOrderValue)}
                </p>
                <p className={`text-sm ${
                  analytics.metrics.aovGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(analytics.metrics.aovGrowth)} vs previous period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="text-2xl">💳</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer Rating
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.metrics.averageRating.toFixed(1)}⭐
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  From {analytics.metrics.totalReviews} reviews
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Distribution */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Order Status Distribution
            </h3>
            <div className="space-y-3">
              {analytics.ordersByStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status._id === 'delivered' ? 'bg-green-500' :
                      status._id === 'pending' ? 'bg-yellow-500' :
                      status._id === 'cancelled' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className={`capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {status._id.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {status.count}
                    </span>
                    <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({((status.count / analytics.metrics.totalOrders) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Menu Items */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Top Selling Items
            </h3>
            <div className="space-y-3">
              {analytics.popularItems.slice(0, 5).map((item, index) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium w-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      #{index + 1}
                    </span>
                    <div className="ml-3">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.totalOrdered}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className={`p-6 rounded-lg border mb-8 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Revenue Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.revenueByCategory.map((category) => (
              <div key={category._id} className="text-center">
                <div className="text-3xl mb-2">
                  {category._id === 'Breakfast' ? '🌅' : 
                   category._id === 'Lunch' ? '🌞' : '🌙'}
                </div>
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {category._id}
                </h4>
                <p className={`text-2xl font-bold text-orange-600`}>
                  {formatCurrency(category.revenue)}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category.orders} orders
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hours */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Peak Order Hours
            </h3>
            <div className="space-y-2">
              {analytics.peakHours.map((hour) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {hour.hour}:00 - {hour.hour + 1}:00
                  </span>
                  <div className="flex items-center">
                    <div className={`w-32 h-2 bg-gray-200 rounded mr-3 overflow-hidden`}>
                      <div 
                        className="h-full bg-orange-500 rounded"
                        style={{ 
                          width: `${(hour.orders / Math.max(...analytics.peakHours.map(h => h.orders))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {hour.orders}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Retention */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Customer Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total Customers
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.customerMetrics.totalCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Repeat Customers
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.customerMetrics.repeatCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Retention Rate
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.customerMetrics.retentionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Avg. Orders per Customer
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.customerMetrics.avgOrdersPerCustomer.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerAnalyticsPage;

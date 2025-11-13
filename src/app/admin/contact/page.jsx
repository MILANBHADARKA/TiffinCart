'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useRouter } from 'next/navigation';

function AdminContactPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [issLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    category: 'all',
    priority: 'all'
  });
  
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    adminNotes: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
        console.warn('Unauthorized access to admin contact page. Redirecting to home.');
        console.log('User Info:', { isAuthenticated, user });
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/contact?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data);
        setStats(result.stats || {});
        setPagination(result.pagination || {});
        setError('');
      } else {
        setError(result.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAuthenticated, user]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  // Open update modal
  const openUpdateModal = (message) => {
    setSelectedMessage(message);
    setUpdateData({
      status: message.status || 'pending',
      priority: message.priority || 'low',
      adminNotes: message.adminNotes || ''
    });
    setIsUpdateModalOpen(true);
    setError('');
  };

  // Update message
  const handleUpdateMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      setIsUpdating(true);
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: selectedMessage._id,
          ...updateData
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsUpdateModalOpen(false);
        setSelectedMessage(null);
        // Refresh the listing with current filters
        await fetchMessages();
        setError('');
      } else {
        setError(result.message || 'Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      setError('Network error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // Category and status options
  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: '📋' },
    { value: 'general', label: 'General Inquiry', icon: '💬' },
    { value: 'order', label: 'Order Support', icon: '📦' },
    { value: 'payment', label: 'Payment Help', icon: '💳' },
    { value: 'seller', label: 'Become a Seller', icon: '🏪' },
    { value: 'technical', label: 'Technical Support', icon: '🔧' },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: '⭐' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return theme === 'dark' ? 'text-red-400 bg-red-900/50' : 'text-red-600 bg-red-100';
      case 'high': return theme === 'dark' ? 'text-orange-400 bg-orange-900/50' : 'text-orange-600 bg-orange-100';
      case 'medium': return theme === 'dark' ? 'text-yellow-400 bg-yellow-900/50' : 'text-yellow-600 bg-yellow-100';
      case 'low': return theme === 'dark' ? 'text-green-400 bg-green-900/50' : 'text-green-600 bg-green-100';
      default: return theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return theme === 'dark' ? 'text-green-400 bg-green-900/50' : 'text-green-600 bg-green-100';
      case 'in-progress': return theme === 'dark' ? 'text-blue-400 bg-blue-900/50' : 'text-blue-600 bg-blue-100';
      case 'pending': return theme === 'dark' ? 'text-yellow-400 bg-yellow-900/50' : 'text-yellow-600 bg-yellow-100';
      case 'closed': return theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
      default: return theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.icon || '💬';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Contact Messages 📧
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage and respond to customer inquiries
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                📊
              </div>
              <div className="ml-4">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total || 0}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Messages
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                ⏳
              </div>
              <div className="ml-4">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pending || 0}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                ✅
              </div>
              <div className="ml-4">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.resolved || 0}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Resolved
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                🚨
              </div>
              <div className="ml-4">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.highPriority || 0}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  High Priority
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-red-900/50 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Messages List */}
        <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {issLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>isLoading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No messages found with current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Contact Info
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Subject & Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status & Priority
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                  {messages.map((message) => (
                    <tr key={message._id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {message.name}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} break-all`}>
                            {message.email}
                          </div>
                          {message.userId && (
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                              theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800'
                            }`}>
                              Registered User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                          {message.subject}
                        </div>
                        <div className="mb-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            message.category === 'order' ? (theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800') :
                            message.category === 'payment' ? (theme === 'dark' ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-800') :
                            message.category === 'seller' ? (theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800') :
                            message.category === 'technical' ? (theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800') :
                            message.category === 'feedback' ? (theme === 'dark' ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-800') :
                            (theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800')
                          }`}>
                            {getCategoryIcon(message.category)} {categoryOptions.find(opt => opt.value === message.category)?.label}
                          </span>
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {message.message && message.message.length > 100 
                            ? `${message.message.substring(0, 100)}...` 
                            : message.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                            {statusOptions.find(opt => opt.value === message.status)?.label || (message.status || 'Pending')}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPriorityColor(message.priority)}`}>
                            {(message.priority || 'low').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '-'}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openUpdateModal(message)}
                            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                          >
                            Update
                          </button>
                          {/* <a
                            href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}&body=Hello ${encodeURIComponent(message.name)},%0A%0AThank you for contacting TifinCart.%0A%0A`}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Reply
                          </a> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  pagination.page === 1
                    ? theme === 'dark' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                const pageNum = Math.max(1, pagination.page - 2) + idx;
                if (pageNum > pagination.pages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handleFilterChange('page', pageNum)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      pageNum === pagination.page
                        ? 'bg-orange-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  pagination.page === pagination.pages
                    ? theme === 'dark' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Update Message Status
              </h3>
              <button
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedMessage(null);
                  setError('');
                }}
                className={`text-gray-400 hover:text-gray-600 transition-colors`}
                disabled={isUpdating}
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <span className="font-bold">From:</span> {selectedMessage.name} ({selectedMessage.email})
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  <span className="font-bold">Subject:</span> {selectedMessage.subject}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  <span className="font-bold">Category:</span> {getCategoryIcon(selectedMessage.category)} {categoryOptions.find(opt => opt.value === selectedMessage.category)?.label}
                </p>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2 p-3 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                  <span className="font-bold">Message:</span>
                  <p className="mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    {statusOptions.filter(o => o.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={updateData.priority}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, priority: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    {priorityOptions.filter(o => o.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Admin Notes (internal)
                </label>
                <textarea
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                    theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedMessage(null);
                    setError('');
                  }}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded ${isUpdating ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'} ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700 border'}`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateMessage}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded text-white ${isUpdating ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactPage;

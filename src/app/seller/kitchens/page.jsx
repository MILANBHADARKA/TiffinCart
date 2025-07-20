'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function KitchensPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchens();
    }
  }, [isAuthenticated, user, isLoading, router]);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/seller/kitchens', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchens(result.data.kitchens);
      } else {
        setError(result.error || 'Failed to fetch kitchens');
      }
    } catch (error) {
      console.error('Error fetching kitchens:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
      suspended: { text: 'Suspended', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const toggleKitchenStatus = async (kitchenId, currentStatus) => {
    try {
      const newStatus = !currentStatus;

      const response = await fetch(`/api/seller/kitchens/${kitchenId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCurrentlyOpen: newStatus }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchens(prevKitchens =>
          prevKitchens.map(kitchen =>
            kitchen._id === kitchenId
              ? { ...kitchen, isCurrentlyOpen: newStatus }
              : kitchen
          )
        );
      } else {
        alert(result.error || 'Failed to update kitchen status');
      }
    } catch (error) {
      console.error('Error updating kitchen status:', error);
      alert('Network error. Please try again.');
    }
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading kitchens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Kitchens</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Manage your kitchen listings and operations</p>
          </div>
          <Link
            href="/seller/kitchens/new"
            className="mt-4 sm:mt-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
          >
            + Add New Kitchen
          </Link>
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

        {kitchens.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-lg font-medium mb-2">No kitchens yet</h3>
            <p className="text-sm mb-6">Create your first kitchen to start selling delicious food!</p>
            <Link
              href="/seller/kitchens/new"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Create First Kitchen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kitchens.map((kitchen) => (
              <div
                key={kitchen._id}
                className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                  <span className="text-6xl">🍳</span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{kitchen.name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                        {kitchen.cuisine} Cuisine • {kitchen.address.city}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(kitchen.status)}
                      <div className={`w-12 h-5 mt-2 rounded-full transition-colors ${
                        kitchen.isCurrentlyOpen
                          ? 'bg-green-500'
                          : theme === 'dark'
                            ? 'bg-gray-600'
                            : 'bg-gray-300'
                      }`}>
                        {kitchen.status === 'approved' && (
                          <button
                            onClick={() => toggleKitchenStatus(kitchen._id, kitchen.isCurrentlyOpen)}
                            className="w-full h-full relative"
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0 ${
                              kitchen.isCurrentlyOpen ? 'translate-x-7' : 'translate-x-0'
                            }`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {kitchen.description.substring(0, 100)}...
                  </p>

                  {kitchen.status === 'pending' && (
                    <div className={`p-3 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'}`}>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-yellow-800'}`}>
                        Your kitchen is pending approval. You'll be notified once approved.
                      </p>
                    </div>
                  )}

                  {kitchen.status === 'rejected' && kitchen.adminRemarks && (
                    <div className={`p-3 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-200'}`}>
                      <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-red-800'}`}>
                        Rejection Reason:
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-red-700'}`}>
                        {kitchen.adminRemarks}
                      </p>
                    </div>
                  )}

                  {kitchen.status === 'suspended' && kitchen.adminRemarks && (
                    <div className={`p-3 mb-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                      <p className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        Suspension Notice:
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {kitchen.adminRemarks}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Link
                      href={`/seller/kitchen/${kitchen._id}/dashboard`}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-center block text-sm ${
                        kitchen.status === 'approved'
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        if (kitchen.status !== 'approved') {
                          e.preventDefault();
                        }
                      }}
                    >
                      {kitchen.status === 'approved' ? 'Manage Kitchen' : 'Awaiting Approval'}
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/seller/kitchen/${kitchen._id}/edit`}
                        className={`py-2 px-3 border rounded-lg text-center transition-colors text-sm font-medium ${
                          kitchen.status !== 'rejected'
                            ? theme === 'dark'
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            : theme === 'dark'
                              ? 'border-gray-600 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (kitchen.status === 'rejected') {
                            e.preventDefault();
                          }
                        }}
                      >
                        {kitchen.status === 'rejected' ? 'Reapply' : 'Edit'}
                      </Link>
                      <button
                        className={`py-2 px-3 border rounded-lg text-center transition-colors text-sm font-medium ${
                          theme === 'dark'
                            ? 'border-red-700 text-red-500 hover:bg-red-900 hover:text-red-400'
                            : 'border-red-300 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchensPage;

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function AdminKitchens() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    adminRemarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'admin') {
      fetchKitchens();
    }
  }, [isAuthenticated, user, isLoading, router, filter]);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/admin/kitchens?status=${filter}`, {
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

  const openReviewModal = (kitchen) => {
    setSelectedKitchen(kitchen);
    setReviewData({ status: 'approved', adminRemarks: '' });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/admin/kitchens/${selectedKitchen._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setReviewModalOpen(false);
        setSelectedKitchen(null);
        fetchKitchens();
        alert(`Kitchen ${reviewData.status} successfully`);
      } else {
        alert(result.error || 'Failed to update kitchen status');
      }
    } catch (error) {
      console.error('Error updating kitchen:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
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

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading kitchens...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Kitchen Management
            </h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Review and manage kitchen registration requests
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
              <option value="all">All Kitchens</option>
            </select>
          </div>
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
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-lg font-medium mb-2">No kitchens found</h3>
            <p className="text-sm">
              {filter === 'pending' 
                ? "No pending kitchen requests at the moment." 
                : `No ${filter === 'all' ? '' : filter} kitchens found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {kitchens.map((kitchen) => (
              <div
                key={kitchen._id}
                className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center mb-2">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {kitchen.name}
                        </h3>
                        <span className="ml-3">
                          {getStatusBadge(kitchen.status)}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} capitalize mb-2`}>
                        {kitchen.cuisine} Cuisine • {kitchen.address.city}, {kitchen.address.state}
                      </p>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Owner: {kitchen.ownerId?.name || 'Unknown'}</span>
                        <span className="mx-2">•</span>
                        <span>Submitted on: {new Date(kitchen.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openReviewModal(kitchen)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        Review Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewModalOpen && selectedKitchen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-3xl w-full rounded-lg shadow-lg max-h-screen overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Review Kitchen: {selectedKitchen.name}
                </h3>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className={`text-gray-400 hover:text-gray-600`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={`p-4 rounded-lg border mb-6 ${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Basic Information
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Kitchen Name:</strong> {selectedKitchen.name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Cuisine:</strong> {selectedKitchen.cuisine}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Description:</strong> {selectedKitchen.description}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Contact & Address
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Email:</strong> {selectedKitchen.contact.email}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Phone:</strong> {selectedKitchen.contact.phone}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Address:</strong> {selectedKitchen.address.street}, {selectedKitchen.address.city}, 
                      {selectedKitchen.address.state} - {selectedKitchen.address.zipCode}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Licenses & Legal
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>FSSAI License:</strong> {selectedKitchen.license.fssaiNumber || 'Not provided'}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>GST Number:</strong> {selectedKitchen.license.gstNumber || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Status Decision
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reviewData.status === 'approved' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reviewData.status === 'rejected' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, status: 'suspended' })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reviewData.status === 'suspended' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Suspend
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="adminRemarks" className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Admin Remarks {reviewData.status !== 'approved' && '(Required)'}
                  </label>
                  <textarea
                    id="adminRemarks"
                    value={reviewData.adminRemarks}
                    onChange={(e) => setReviewData({ ...reviewData, adminRemarks: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50 ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-orange-500' 
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder={reviewData.status === 'approved' 
                      ? "Optional remarks for kitchen owner" 
                      : "Please provide a reason for rejection or suspension"}
                    required={reviewData.status !== 'approved'}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={submitting || (reviewData.status !== 'approved' && !reviewData.adminRemarks.trim())}
                    className="py-2 px-6 bg-orange-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Decision'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminKitchens;

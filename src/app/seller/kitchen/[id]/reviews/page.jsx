'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SellerKitchenReviewsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();

  const [kitchen, setKitchen] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchKitchenAndReviews();
    }
  }, [isAuthenticated, isLoading, user, router, id, currentPage]);

  const fetchKitchenAndReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch kitchen details
      const kitchenResponse = await fetch(`/api/seller/kitchen/${id}`, {
        credentials: 'include'
      });

      if (!kitchenResponse.ok) {
        throw new Error('Failed to fetch kitchen');
      }

      const kitchenResult = await kitchenResponse.json();
      if (kitchenResult.success) {
        setKitchen(kitchenResult.data.kitchen);
      }

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/kitchen/${id}/reviews?page=${currentPage}&limit=10`, {
        credentials: 'include'
      });

      const reviewsResult = await reviewsResponse.json();
      if (reviewsResult.success) {
        setReviews(reviewsResult.data.reviews);
        setPagination(reviewsResult.data.pagination);
      } else {
        setError(reviewsResult.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StarDisplay = ({ rating }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ⭐
        </span>
      ))}
    </div>
  );

  const getReviewStats = () => {
    if (reviews.length === 0) return null;

    const stats = {
      total: reviews.length,
      average: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    reviews.forEach(review => {
      stats.breakdown[review.rating]++;
    });

    return stats;
  };

  const stats = getReviewStats();

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
          <Link
            href="/seller/kitchens"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Kitchens
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {kitchen.name} - Customer Reviews
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and respond to customer feedback
            </p>
          </div>
          <Link
            href={`/seller/kitchen/${id}/dashboard`}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Back to Kitchen
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className={`mb-8 p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Review Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{stats.average}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Average Rating
                </div>
                <StarDisplay rating={Math.round(stats.average)} />
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {pagination?.totalReviews || stats.total}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Reviews
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rating Breakdown
                </h4>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = stats.breakdown[rating];
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className={`text-xs w-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rating}★
                        </span>
                        <div className={`flex-1 h-2 rounded-full ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="h-2 bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs w-8 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className={`rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Customer Reviews ({pagination?.totalReviews || 0})
            </h2>

            {reviews.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-4xl mb-2">💬</div>
                <p className="text-lg font-medium mb-1">No reviews yet</p>
                <p className="text-sm">Reviews will appear here once customers start reviewing your kitchen</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className={`border-b pb-6 ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {review.customerName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {review.customerName}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <StarDisplay rating={review.rating} />
                        </div>

                        {review.comment && (
                          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            "{review.comment}"
                          </p>
                        )}

                        <div className="mt-3 flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            ✓ Verified Order
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Order from {new Date(review.orderDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className={`px-3 py-1 rounded text-sm ${
                    pagination.hasPrevPage
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ← Previous
                </button>
                
                <span className={`px-3 py-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-1 rounded text-sm ${
                    pagination.hasNextPage
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerKitchenReviewsPage;

'use client';
import React, { useState, useEffect } from 'react';

function SimpleReview({ kitchenId, theme }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [kitchenId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/kitchen/${kitchenId}/reviews?page=${currentPage}&limit=5`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data.reviews);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading reviews...
        </p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="text-4xl mb-2">💬</div>
        <p className="text-lg font-medium mb-1">No reviews yet</p>
        <p className="text-sm">Be the first to review this kitchen!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Customer Reviews ({pagination?.totalReviews || 0})
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Based on delivered orders
            </p>
          </div>
          {reviews.length > 0 && (
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <StarDisplay rating={Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)} />
                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Individual Reviews */}
      {reviews.map((review) => (
        <div key={review._id} className={`border-b pb-4 ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-start space-x-3">
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
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StarDisplay rating={review.rating} />
              </div>

              {review.comment && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{review.comment}"
                </p>
              )}

              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                theme === 'dark' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-green-100 text-green-800'
              }`}>
                ✓ Verified Order
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
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
  );
}

export default SimpleReview;

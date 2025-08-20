'use client';
import React, { useState, useEffect } from 'react';

function KitchenReviews({ kitchenId, theme }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [kitchenId, currentPage]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?kitchenId=${kitchenId}&page=${currentPage}&limit=5`);
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

  const StarDisplay = ({ rating, size = 'small' }) => {
    const sizeClasses = {
      small: 'h-4 w-4',
      medium: 'h-5 w-5'
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="text-4xl mb-2">💬</div>
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className={`border-b pb-6 ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {review.customerId?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {review.customerId?.name || 'Anonymous'}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {review.kitchenReview && (
                  <StarDisplay rating={review.kitchenReview.rating} />
                )}
              </div>

              {/* Kitchen Review */}
              {review.kitchenReview && (
                <div className="mb-4">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {review.kitchenReview.comment}
                  </p>
                  
                  {/* Category Ratings */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {Object.entries(review.kitchenReview.categories || {}).map(([category, rating]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className={`text-xs capitalize ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {category.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <StarDisplay rating={rating} size="small" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Reviews */}
              {review.itemReviews && review.itemReviews.length > 0 && (
                <div className="space-y-2">
                  <h5 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Item Reviews:
                  </h5>
                  {review.itemReviews.map((itemReview, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{itemReview.itemName}</span>
                        <StarDisplay rating={itemReview.rating} size="small" />
                      </div>
                      {itemReview.comment && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {itemReview.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
            Previous
          </button>
          
          <span className={`px-3 py-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Page {pagination.currentPage} of {pagination.totalPages}
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
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default KitchenReviews;

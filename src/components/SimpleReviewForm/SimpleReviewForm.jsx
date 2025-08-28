'use client';
import React, { useState } from 'react';

function SimpleReviewForm({ orderId, onSubmit, onCancel, theme }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="text-center mb-6">
        <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📝 Rate Your Order
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          How was your experience?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Your Rating
          </label>
          <div className="flex justify-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-3xl transition-colors hover:scale-110 transform"
              >
                <span className={`${
                  star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  ⭐
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {rating === 1 && "Poor - Not satisfied"}
              {rating === 2 && "Fair - Below expectations"} 
              {rating === 3 && "Good - Met expectations"}
              {rating === 4 && "Very Good - Above expectations"}
              {rating === 5 && "Excellent - Outstanding!"}
            </p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Your Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg resize-none ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
          />
          <p className={`text-xs mt-1 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {comment.length}/500 characters
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 px-4 py-2 rounded-lg border font-medium ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SimpleReviewForm;
